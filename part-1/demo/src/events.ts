/**
 * The event protocol between the demo server and the visualizer in the slides.
 *
 * Every SDK message the coordinator produces is translated into one of these
 * small, purpose-built events so the browser only has to think about
 * "what should I draw", never about raw API shapes.
 */

export type AgentKey = "a11y" | "copy" | "code";

export type DemoEvent =
  /** The session booted: which model, which tools are on the table. */
  | { t: "init"; model: string; tools: string[] }
  /** The coordinator "thought out loud" (assistant text in the main loop). */
  | { t: "coord_text"; text: string }
  /** The prompt the RUN handed to the coordinator (its own starting context). */
  | { t: "coord_prompt"; prompt: string }
  /**
   * The coordinator spawned a subagent via the Agent/Task tool.
   * `prompt` is the ACTUAL context handed to the subagent, this is the
   * teaching moment: context passing is explicit, visible, and finite.
   */
  | {
      t: "spawn";
      id: string; // tool_use_id, the "return address" for the result
      agent: string; // subagent_type, e.g. "a11y-auditor"
      description: string;
      prompt: string;
    }
  /** A subagent used one of its tools (Read/Grep/Glob...). */
  | { t: "sub_tool"; parentId: string; tool: string; detail: string }
  /** A subagent produced some text (its own reasoning/notes). */
  | { t: "sub_text"; parentId: string; text: string }
  /** A subagent finished, its final report travels BACK to the coordinator. */
  | { t: "sub_done"; parentId: string; result: string; tokens?: number }
  /** The whole run finished: merged report + honest numbers. */
  | {
      t: "result";
      report: string;
      costUsd: number | null;
      durationMs: number;
      numTurns: number;
      /** Tokens processed by the COORDINATOR itself (main loop only). */
      coordTokens?: number;
    }
  /**
   * The real agent definitions behind the demo, sent once on connection so the
   * UI can show an honest "quick overview" of each agent in its inspector.
   */
  | {
      t: "defs";
      coordinator: { systemPrompt: string; allowedTools: string[] };
      agents: Record<
        string,
        { description: string; systemPrompt: string; tools: string[]; model: string }
      >;
    }
  /** Operational messages for the status line (never part of the lesson). */
  | { t: "status"; msg: string }
  | { t: "error"; msg: string };

export const PORT = 4747;
