/**
 * The actual multi-agent audit, built on the Claude Agent SDK.
 *
 * Architecture (hub-and-spoke):
 *
 *                    ┌─────────────┐
 *                    │ Coordinator │   ← the main query() loop
 *                    └──┬────┬───┬─┘
 *          Agent tool ▼    ▼      ▼   (context passed EXPLICITLY in each prompt)
 *         ┌──────────┐ ┌──────────┐ ┌──────────┐
 *         │   a11y   │ │   copy   │ │   code   │   ← isolated contexts,
 *         │  auditor │ │  auditor │ │  auditor │     read-only tools
 *         └──────────┘ └──────────┘ └──────────┘
 *
 * Subagents NEVER talk to each other. Each returns ONE final report to the
 * coordinator, which merges them. That is the entire trick.
 */

import { query, type SDKMessage, type Options } from "@anthropic-ai/claude-agent-sdk";
import type { DemoEvent } from "./events.js";

/** Tools the subagents may use. Read-only, on purpose. */
const READ_ONLY_TOOLS = ["Read", "Grep", "Glob"];

/** The spawn tool is called "Agent" in current SDK versions ("Task" in older ones / the CCAF guide). */
const SPAWN_TOOL_NAMES = new Set(["Agent", "Task"]);

export const SUBAGENTS: NonNullable<Options["agents"]> = {
  "a11y-auditor": {
    description:
      "Accessibility specialist. Reviews UI components and pages for WCAG issues: semantics, keyboard access, contrast, screen-reader friendliness.",
    prompt: [
      "You are an accessibility auditor reviewing a Next.js app.",
      "Look for concrete, verifiable issues: misused headings, interactive elements with wrong semantics (e.g. buttons inside links), missing labels, keyboard traps, contrast risks.",
      "Only report what you can point to in a specific file and line. No speculation.",
      "Be fast: read only the files you need. Return AT MOST your 4 strongest findings.",
      "Format each finding as: [severity] file:line | issue | why it matters | suggested fix (one line each).",
    ].join("\n"),
    tools: READ_ONLY_TOOLS,
    // Read-and-report work: the balanced model is the right default.
    model: "sonnet",
  },
  "copy-auditor": {
    description:
      "UX writing specialist. Reviews user-facing copy for typos, tone, clarity, consistency, and translation parity.",
    prompt: [
      "You are a UX copy auditor reviewing a Next.js app that uses next-intl (messages/*.json hold the user-facing strings).",
      "Look for: spelling errors, grammar issues, inconsistent capitalization or terminology, unclear microcopy, and en/es translation mismatches.",
      "Only report what you can point to in a specific file and key. No speculation.",
      "Be fast: start from the messages/ directory. Return AT MOST your 4 strongest findings.",
      "Format each finding as: [severity] file (key) | issue | suggested rewrite (one line each).",
    ].join("\n"),
    tools: READ_ONLY_TOOLS,
    // Mechanical string checks: the cheap, fast model earns its keep here.
    model: "haiku",
  },
  "code-auditor": {
    description:
      "Code quality and security specialist. Reviews server code for security flaws, race conditions, and correctness bugs.",
    prompt: [
      "You are a code auditor reviewing a Next.js (T3 stack) app. Focus on src/server, src/app/api, and prisma/schema.prisma.",
      "Look for: plaintext secrets/passwords, injection risks, race conditions, dead or no-op code, and framework misuse.",
      "Only report what you can point to in a specific file and line. No speculation.",
      "Be fast: read only the files you need. Return AT MOST your 4 strongest findings.",
      "Format each finding as: [severity] file:line | issue | why it matters | suggested fix (one line each).",
    ].join("\n"),
    tools: READ_ONLY_TOOLS,
    // Read-and-report work: the balanced model is the right default.
    model: "sonnet",
  },
};

export const COORDINATOR_SYSTEM_PROMPT =
  "You are a software audit coordinator. You delegate to subagents and synthesize their findings. You never modify files.";

export const COORDINATOR_ALLOWED_TOOLS = ["Agent", "Task", ...READ_ONLY_TOOLS];

export const COORDINATOR_PROMPT = [
  "Audit the web application in the current working directory.",
  "",
  "You are the COORDINATOR. Do not read any project files yourself.",
  "1. Spawn ALL THREE subagents (a11y-auditor, copy-auditor, code-auditor) IN PARALLEL, all in your very first response. Wait for all of them before doing anything else.",
  "2. Give each one the context it needs in its prompt: what the app is (temporary file sharing, Next.js + next-intl + Prisma), where to look, and the exact output format you expect back.",
  "3. When all three reports are back, merge them into ONE final report in markdown:",
  "   - Start with a 2-sentence executive summary.",
  "   - Then a prioritized list (most severe first, across all three dimensions).",
  "   - Keep every finding to 2 lines max. Credit which auditor found it.",
  "Do not invent findings the subagents did not report.",
].join("\n");

export interface AuditHandle {
  interrupt: () => Promise<unknown>;
  done: Promise<void>;
}

/**
 * Run the audit and translate every SDK message into a DemoEvent.
 * `emit` is called for each event, in order.
 */
export function runAudit(repoPath: string, emit: (e: DemoEvent) => void): AuditHandle {
  /** tool_use_id → subagent name, so results can be routed back to a lane. */
  const spawned = new Map<string, string>();
  /** tool_use_id → the subagent's most recent text (its report, in background mode). */
  const lastText = new Map<string, string>();
  /** Guard against double completion (sync tool_result + async task_notification). */
  const doneIds = new Set<string>();

  // Stop must kill EVERYTHING, including background subagents; an interrupt
  // alone only stops the main loop. Aborting tears down the whole CLI process.
  const abort = new AbortController();

  // The coordinator sets no model: it inherits the session default, so the
  // judgment-heavy merge runs on the strongest model you are logged in with.
  const q = query({
    prompt: COORDINATOR_PROMPT,
    options: {
      abortController: abort,
      cwd: repoPath,
      systemPrompt: COORDINATOR_SYSTEM_PROMPT,
      agents: SUBAGENTS,
      // The coordinator may only spawn subagents; the read-only tools are for the subagents.
      allowedTools: COORDINATOR_ALLOWED_TOOLS,
      // Deterministic guardrail (the "hooks, not prompts" lesson): even if a
      // prompt goes wrong, no write/execute tool can ever run in this demo.
      canUseTool: async (toolName) => {
        if (SPAWN_TOOL_NAMES.has(toolName) || READ_ONLY_TOOLS.includes(toolName)) {
          return { behavior: "allow" };
        }
        return {
          behavior: "deny",
          message: `Tool ${toolName} is blocked: this audit is read-only.`,
        };
      },
      // Forward the subagents' own messages (with parent_tool_use_id set) so
      // the visualizer can show life inside each lane.
      forwardSubagentText: true,
      settingSources: [], // isolation: don't load CLAUDE.md / user settings into the demo
      maxTurns: 30,
    },
  });

  let initSent = false;
  const done = (async () => {
    try {
      for await (const message of q) {
        for (const event of translate(message, spawned, lastText)) {
          // Subagent sessions emit their own init events in live runs;
          // only the first one describes the run the class is watching.
          if (event.t === "init") {
            if (initSent) continue;
            initSent = true;
          }
          if (event.t === "sub_done") {
            if (doneIds.has(event.parentId)) continue;
            doneIds.add(event.parentId);
          }
          emit(event);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // A user-initiated stop is not an error worth alarming the class with.
      if (!abort.signal.aborted) emit({ t: "error", msg });
    }
  })();

  return {
    interrupt: async () => {
      abort.abort();
      try {
        q.close();
      } catch {
        // already closed
      }
    },
    done,
  };
}

/** Turn one SDKMessage into zero or more DemoEvents. */
function translate(
  message: SDKMessage,
  spawned: Map<string, string>,
  lastText: Map<string, string>,
): DemoEvent[] {
  const events: DemoEvent[] = [];

  switch (message.type) {
    case "system": {
      if (message.subtype === "init") {
        events.push({ t: "init", model: message.model, tools: message.tools });
      } else if (message.subtype === "task_notification") {
        // Background subagents finish HERE, not in their launch tool_result.
        const id = message.tool_use_id;
        if (id && spawned.has(id)) {
          const result =
            message.status === "completed"
              ? (lastText.get(id) ?? message.summary)
              : `Subagent ${message.status}: ${message.summary}`;
          events.push({ t: "sub_done", parentId: id, result, tokens: message.usage?.total_tokens });
        }
      }
      break;
    }

    case "assistant": {
      const content = message.message.content;
      const blocks = Array.isArray(content) ? content : [];
      const fromSubagent = message.parent_tool_use_id !== null;

      for (const block of blocks) {
        if (block.type === "text" && block.text.trim()) {
          if (fromSubagent) {
            lastText.set(message.parent_tool_use_id!, block.text);
            events.push({ t: "sub_text", parentId: message.parent_tool_use_id!, text: block.text });
          } else {
            events.push({ t: "coord_text", text: block.text });
          }
        } else if (block.type === "tool_use") {
          if (!fromSubagent && SPAWN_TOOL_NAMES.has(block.name)) {
            const input = block.input as {
              description?: string;
              prompt?: string;
              subagent_type?: string;
            };
            const agent = input.subagent_type ?? "subagent";
            spawned.set(block.id, agent);
            events.push({
              t: "spawn",
              id: block.id,
              agent,
              description: input.description ?? "",
              prompt: input.prompt ?? "",
            });
          } else if (fromSubagent) {
            events.push({
              t: "sub_tool",
              parentId: message.parent_tool_use_id!,
              tool: block.name,
              detail: summarizeToolInput(block.name, block.input as Record<string, unknown>),
            });
          }
        }
      }
      break;
    }

    case "user": {
      // Tool results come back as USER-role messages containing tool_result
      // blocks (there is no "tool" role, teach this!). A tool_result whose
      // tool_use_id matches a spawn is a subagent's final report landing back
      // at the coordinator.
      if (message.parent_tool_use_id !== null) break; // a subagent's internal tool result
      const content = message.message.content;
      const blocks = Array.isArray(content) ? content : [];
      for (const block of blocks) {
        if (
          typeof block === "object" &&
          block !== null &&
          "type" in block &&
          block.type === "tool_result" &&
          "tool_use_id" in block &&
          spawned.has(block.tool_use_id as string)
        ) {
          const text = extractResultText(block.content);
          // A background launch acknowledgment is a receipt, not the report.
          const isLaunchStub =
            text.includes("Async agent launched successfully") ||
            (text.includes("agentId:") && text.includes("background"));
          if (!isLaunchStub) {
            events.push({
              t: "sub_done",
              parentId: block.tool_use_id as string,
              result: text,
            });
          }
        }
      }
      break;
    }

    case "result": {
      if (message.subtype === "success") {
        // usage covers the MAIN loop only (the coordinator), per the SDK docs.
        const u = message.usage;
        const coordTokens =
          (u?.input_tokens ?? 0) +
          (u?.output_tokens ?? 0) +
          (u?.cache_read_input_tokens ?? 0) +
          (u?.cache_creation_input_tokens ?? 0);
        events.push({
          t: "result",
          report: message.result,
          costUsd: message.total_cost_usd ?? null,
          durationMs: message.duration_ms,
          numTurns: message.num_turns,
          coordTokens,
        });
      } else {
        events.push({ t: "error", msg: `Run ended: ${message.subtype}` });
      }
      break;
    }

    default:
      break; // partials, hooks, notifications, not part of the lesson
  }

  return events;
}

function summarizeToolInput(tool: string, input: Record<string, unknown>): string {
  const val = (k: string) => (typeof input[k] === "string" ? (input[k] as string) : undefined);
  switch (tool) {
    case "Read":
      return shortenPath(val("file_path") ?? "");
    case "Grep":
      return `/${val("pattern") ?? ""}/ in ${shortenPath(val("path") ?? ".")}`;
    case "Glob":
      return val("pattern") ?? "";
    default:
      return JSON.stringify(input).slice(0, 80);
  }
}

function shortenPath(p: string): string {
  const parts = p.split("/");
  return parts.length <= 3 ? p : parts.slice(-3).join("/");
}

function extractResultText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((c) =>
        typeof c === "object" && c !== null && "type" in c && c.type === "text" && "text" in c
          ? String(c.text)
          : "",
      )
      .join("\n")
      .trim();
  }
  return "";
}
