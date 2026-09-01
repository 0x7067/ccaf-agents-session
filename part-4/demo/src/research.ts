import { query, type Options, type SDKMessage } from '@anthropic-ai/claude-agent-sdk';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DemoEvent } from './events.js';

type Emit = (event: DemoEvent) => void;

const READ_ONLY_TOOLS = ['Read', 'Glob'];
const SPAWN_TOOLS = new Set(['Agent', 'Task']);

const here = path.dirname(fileURLToPath(import.meta.url));
export const researchFixture = path.resolve(here, '..', 'fixtures', 'research');

const ASSIGNED_SOURCE_BY_AGENT: Record<string, string> = {
  'visual-art-researcher': 'sources/visual-art.md',
  'music-researcher': 'sources/music.md',
  'literature-film-researcher': 'sources/literature-film.md',
} as const;
const RESEARCH_SOURCE_PATHS = new Set(Object.values(ASSIGNED_SOURCE_BY_AGENT));

function requestedPath(toolName: string, input: unknown): string | undefined {
  if (!READ_ONLY_TOOLS.includes(toolName) || typeof input !== 'object' || input === null) return undefined;
  const field = toolName === 'Read' ? 'file_path' : 'pattern';
  const value = (input as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : undefined;
}

function isExactSourceRequest(toolName: string, input: unknown, sourcePath: string): boolean {
  const candidate = requestedPath(toolName, input);
  return candidate !== undefined && path.resolve(researchFixture, candidate) === path.resolve(researchFixture, sourcePath);
}

function isKnownSourceRequest(toolName: string, input: unknown): boolean {
  return [...RESEARCH_SOURCE_PATHS].some(sourcePath => isExactSourceRequest(toolName, input, sourcePath));
}

const RESEARCH_HOOKS: NonNullable<Options['hooks']> = {
  PreToolUse: [{
    matcher: '^(Read|Glob)$',
    hooks: [async input => {
      if (input.hook_event_name !== 'PreToolUse') return { continue: true };
      const assignedSource = input.agent_id ? ASSIGNED_SOURCE_BY_AGENT[input.agent_type ?? ''] : undefined;
      const allowed = input.agent_id
        ? assignedSource !== undefined && isExactSourceRequest(input.tool_name, input.tool_input, assignedSource)
        : isKnownSourceRequest(input.tool_name, input.tool_input);
      if (allowed) return { continue: true };
      const reason = assignedSource
        ? `${input.agent_type} may read only ${assignedSource}`
        : 'Only assigned research source packets may be read';
      return {
        continue: true,
        hookSpecificOutput: {
          hookEventName: 'PreToolUse' as const,
          permissionDecision: 'deny' as const,
          permissionDecisionReason: reason,
        },
      };
    }],
  }],
};

/**
 * The three reporters have separate notebooks. The editor receives their
 * reports later through the coordinator, not through direct reporter calls.
 */
export const RESEARCH_AGENTS: NonNullable<Options['agents']> = {
  'visual-art-researcher': {
    description: 'Researches the visual-art part of the question from the assigned local source packet.',
    prompt: [
      'You are the visual-art beat reporter.',
      'Read only sources/visual-art.md in the current research packet.',
      'Return a compact structured report with status, source_id, source_date, key_findings, and limits.',
      'Keep the source date and do not claim that the packet proves more than it says.',
      'Do not read another beat reporter\'s packet. Do not return the full document.',
    ].join('\n'),
    tools: READ_ONLY_TOOLS,
    model: 'haiku',
  },
  'music-researcher': {
    description: 'Checks the music part of the question and reports missing coverage honestly.',
    prompt: [
      'You are the music beat reporter.',
      'Read only sources/music.md in the current research packet.',
      'If SOURCE_STATUS says unavailable, return status partial_failure, failure_type, attempted_query, partial_results, and coverage_impact.',
      'An unavailable source is not a successful empty result. Do not invent music findings.',
      'Do not read another beat reporter\'s packet. Keep the report compact.',
    ].join('\n'),
    tools: READ_ONLY_TOOLS,
    model: 'haiku',
  },
  'literature-film-researcher': {
    description: 'Researches the literature and film part of the question from the assigned local source packet.',
    prompt: [
      'You are the literature-and-film beat reporter.',
      'Read only sources/literature-film.md in the current research packet.',
      'Return a compact structured report with status, source_id, source_date, key_findings, and limits.',
      'Name literature and film separately in coverage, and keep the source date.',
      'Do not read another beat reporter\'s packet. Do not return the full document.',
    ].join('\n'),
    tools: READ_ONLY_TOOLS,
    model: 'haiku',
  },
  'synthesis-editor': {
    description: 'Turns the reporter packets into a coverage-annotated research brief.',
    prompt: [
      'You are the synthesis editor.',
      'Use only the complete reporter packets in your prompt.',
      'Return a short research brief with a key-findings block first, one section per requested area, source IDs and dates, and a coverage label for each section.',
      'Preserve partial failures. Never turn a timeout into an empty result or fill a gap from memory.',
      'Keep claims narrower than the evidence and name limits.',
    ].join('\n'),
    tools: [],
    model: 'sonnet',
  },
};

export const COORDINATOR_PROMPT = [
  'Research question: "How is AI changing creative industries?"',
  '',
  'You are the coordinator. Your job is to make a truthful, coverage-annotated brief.',
  'The requested coverage is visual art, music, literature, and film.',
  '',
  'First, spawn these three reporters in parallel in one response:',
  '- visual-art-researcher: sources/visual-art.md',
  '- music-researcher: sources/music.md',
  '- literature-film-researcher: sources/literature-film.md',
  'Pass each reporter its source path, the research question, its exact output fields, and the rule that it must not read another packet.',
  '',
  'When all three reports return, check coverage. Then spawn synthesis-editor with the full reporter reports, including any structured failure context.',
  'Keep all communication through you. Reporters never call one another.',
  'If a report is partial, keep the completed work and mark the affected section PARTIAL COVERAGE in the final brief.',
  'Do not invent a claim, silently drop a missing source, or return raw source dumps.',
].join('\n');

export const COORDINATOR_ALLOWED_TOOLS = ['Agent', 'Task', ...READ_ONLY_TOOLS];

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('stopped'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('stopped'));
    }, { once: true });
  });
}

function extractText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map(block => {
      if (typeof block === 'object' && block !== null && 'type' in block && block.type === 'text' && 'text' in block) {
        return String(block.text);
      }
      return '';
    })
    .join('\n')
    .trim();
}

function summarizeInput(tool: string, input: Record<string, unknown>): string {
  if (tool === 'Read') return String(input.file_path ?? '');
  if (tool === 'Glob') return String(input.pattern ?? '');
  return JSON.stringify(input).slice(0, 100);
}

function statusForReport(result: string, failed = false): 'completed' | 'partial_failure' | 'failed' {
  if (failed) return 'failed';
  return /partial_failure|unavailable|not covered|timeout/i.test(result) ? 'partial_failure' : 'completed';
}

function agentFor(id: string, spawned: Map<string, string>): string {
  return spawned.get(id) ?? 'subagent';
}

type ReporterStatus = 'completed' | 'partial_failure' | 'failed';

function coverageFromReporterStatuses(statuses: ReadonlyMap<string, ReporterStatus>): 'full' | 'partial' {
  return Object.keys(ASSIGNED_SOURCE_BY_AGENT).every(agent => statuses.get(agent) === 'completed') ? 'full' : 'partial';
}

function translate(
  message: SDKMessage,
  spawned: Map<string, string>,
  lastText: Map<string, string>,
  reporterStatuses: Map<string, ReporterStatus>,
): DemoEvent[] {
  const events: DemoEvent[] = [];
  switch (message.type) {
    case 'system': {
      if (message.subtype === 'init') {
        events.push({ t: 'init', scenario: 'research', model: message.model, tools: message.tools });
      } else if (message.subtype === 'task_notification') {
        const id = message.tool_use_id;
        if (id && spawned.has(id)) {
          const result = message.status === 'completed'
            ? (lastText.get(id) ?? message.summary)
            : `Subagent ${message.status}: ${message.summary}`;
          const status = statusForReport(result, message.status !== 'completed');
          reporterStatuses.set(agentFor(id, spawned), status);
          events.push({
            t: 'sub_done',
            scenario: 'research',
            parentId: id,
            agent: agentFor(id, spawned),
            status,
            result,
            tokens: message.usage?.total_tokens,
          });
        }
      }
      break;
    }
    case 'assistant': {
      const blocks = Array.isArray(message.message.content) ? message.message.content : [];
      const fromSubagent = message.parent_tool_use_id !== null;
      for (const block of blocks) {
        if (block.type === 'text' && block.text.trim()) {
          if (fromSubagent) {
            const parentId = message.parent_tool_use_id!;
            lastText.set(parentId, block.text);
            events.push({ t: 'sub_text', scenario: 'research', parentId, agent: agentFor(parentId, spawned), text: block.text });
          } else {
            events.push({ t: 'coord_text', scenario: 'research', text: block.text });
          }
        } else if (block.type === 'tool_use') {
          if (!fromSubagent && SPAWN_TOOLS.has(block.name)) {
            const input = block.input as { description?: string; prompt?: string; subagent_type?: string };
            const agent = input.subagent_type ?? 'subagent';
            spawned.set(block.id, agent);
            events.push({
              t: 'spawn',
              scenario: 'research',
              id: block.id,
              agent,
              description: input.description ?? '',
              prompt: input.prompt ?? '',
              tools: RESEARCH_AGENTS[agent]?.tools,
            });
          } else if (fromSubagent) {
            const parentId = message.parent_tool_use_id!;
            events.push({
              t: 'sub_tool',
              scenario: 'research',
              parentId,
              agent: agentFor(parentId, spawned),
              tool: block.name,
              detail: summarizeInput(block.name, block.input as Record<string, unknown>),
            });
          }
        }
      }
      break;
    }
    case 'user': {
      if (message.parent_tool_use_id !== null) break;
      const blocks = Array.isArray(message.message.content) ? message.message.content : [];
      for (const block of blocks) {
        if (
          typeof block === 'object' && block !== null &&
          'type' in block && block.type === 'tool_result' &&
          'tool_use_id' in block && spawned.has(block.tool_use_id as string)
        ) {
          const id = block.tool_use_id as string;
          const result = extractText(block.content);
          const launchStub = result.includes('Async agent launched successfully') || result.includes('background');
          if (!launchStub) {
            const status = statusForReport(result, Boolean('is_error' in block && block.is_error));
            reporterStatuses.set(agentFor(id, spawned), status);
            events.push({
              t: 'sub_done',
              scenario: 'research',
              parentId: id,
              agent: agentFor(id, spawned),
              status,
              result,
            });
          }
        }
      }
      break;
    }
    case 'result': {
      if (message.subtype === 'success') {
        if (message.is_error) {
          events.push({ t: 'error', scenario: 'research', msg: `Research run ended: ${message.result}` });
          break;
        }
        const report = String(message.result ?? '');
        events.push({
          t: 'final',
          scenario: 'research',
          summary: 'The coordinator returned a coverage-annotated brief.',
          report,
          coverage: coverageFromReporterStatuses(reporterStatuses),
          costUsd: message.total_cost_usd ?? null,
          durationMs: message.duration_ms,
          numTurns: message.num_turns,
        });
      } else {
        events.push({ t: 'error', scenario: 'research', msg: `Research run ended: ${message.subtype}` });
      }
      break;
    }
    default:
      break;
  }
  return events;
}

/** Run the real Agent SDK research path. Use the rehearsal for a token-free class run. */
export async function runResearch(emit: Emit, signal?: AbortSignal, delayMs = 0): Promise<void> {
  const abort = new AbortController();
  const stop = () => abort.abort();
  if (signal?.aborted) throw new Error('stopped');
  signal?.addEventListener('abort', stop, { once: true });
  const spawned = new Map<string, string>();
  const lastText = new Map<string, string>();
  const reporterStatuses = new Map<string, ReporterStatus>();
  const completed = new Set<string>();
  let initSent = false;
  let completedSuccessfully = false;

  emit({ t: 'status', scenario: 'research', msg: 'live research run · coordinator is preparing three beat assignments' });
  emit({ t: 'phase', scenario: 'research', name: 'decompose', detail: 'three independent coverage areas will run in parallel' });
  emit({ t: 'coord_prompt', scenario: 'research', prompt: COORDINATOR_PROMPT });

  try {
    const messages = query({
      prompt: COORDINATOR_PROMPT,
      options: {
        abortController: abort,
        cwd: researchFixture,
        systemPrompt: 'You are a careful research coordinator. Preserve source dates, gaps, and provenance. Never fill an unavailable source from memory.',
        agents: RESEARCH_AGENTS,
        allowedTools: COORDINATOR_ALLOWED_TOOLS,
        hooks: RESEARCH_HOOKS,
        canUseTool: async (toolName, input) => {
          if (SPAWN_TOOLS.has(toolName)) return { behavior: 'allow' };
          if (READ_ONLY_TOOLS.includes(toolName) && isKnownSourceRequest(toolName, input)) return { behavior: 'allow' };
          return { behavior: 'deny', message: `Tool ${toolName} is blocked: the research packet is read-only.` };
        },
        forwardSubagentText: true,
        settingSources: [],
        maxTurns: 30,
      },
    });

    for await (const message of messages) {
      for (const event of translate(message, spawned, lastText, reporterStatuses)) {
        if (event.t === 'init') {
          if (initSent) continue;
          initSent = true;
        }
        if (event.t === 'sub_done') {
          if (completed.has(event.parentId)) continue;
          completed.add(event.parentId);
        }
        if (event.t === 'error') throw new Error(event.msg);
        if (event.t === 'final') completedSuccessfully = true;
        emit(event);
        if (delayMs > 0) await sleep(delayMs, signal);
      }
    }
    if (!completedSuccessfully && !abort.signal.aborted) {
      throw new Error('Live research ended without a final brief');
    }
  } catch (error) {
    if (!abort.signal.aborted) throw error;
  } finally {
    signal?.removeEventListener('abort', stop);
    if (!abort.signal.aborted && completedSuccessfully) {
      emit({ t: 'done', scenario: 'research', msg: 'research run ended · inspect the final coverage label' });
    }
  }
}
