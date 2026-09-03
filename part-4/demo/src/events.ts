/**
 * The small event protocol shared by the terminal runner, the WebSocket server,
 * and the self-contained slide deck. The browser receives teaching events,
 * not raw SDK messages.
 */

export type Scenario = 'research' | 'support';

export type DemoEvent =
  | { t: 'status'; scenario?: Scenario | 'all'; msg: string }
  | { t: 'phase'; scenario: Scenario; name: string; detail: string }
  | { t: 'init'; scenario: 'research'; model: string; tools: string[] }
  | { t: 'coord_prompt'; scenario: 'research'; prompt: string }
  | { t: 'coord_text'; scenario: 'research'; text: string }
  | {
      t: 'spawn';
      scenario: 'research';
      id: string;
      agent: string;
      description: string;
      prompt: string;
      tools?: string[];
    }
  | { t: 'sub_tool'; scenario: 'research'; parentId: string; agent: string; tool: string; detail: string }
  | { t: 'sub_text'; scenario: 'research'; parentId: string; agent: string; text: string }
  | {
      t: 'sub_done';
      scenario: 'research';
      parentId: string;
      agent: string;
      status: 'completed' | 'partial_failure' | 'failed';
      result: string;
      tokens?: number;
    }
  | {
      t: 'final';
      scenario: 'research';
      summary: string;
      report: string;
      coverage: 'full' | 'partial';
      costUsd?: number | null;
      durationMs?: number;
      numTurns?: number;
      coordTokens?: number;
    }
  | { t: 'support_request'; scenario: 'support'; message: string }
  | { t: 'decompose'; scenario: 'support'; issues: string[] }
  | { t: 'case_facts'; scenario: 'support'; facts: Record<string, string>; update: string }
  | { t: 'tool_attempt'; scenario: 'support'; tool: string; args: Record<string, unknown> }
  | { t: 'guard'; scenario: 'support'; tool: string; allowed: boolean; reason: string }
  | {
      t: 'tool_result';
      scenario: 'support';
      tool: string;
      ok: boolean;
      data: unknown;
      fieldsTrimmed?: string[];
    }
  | { t: 'handoff'; scenario: 'support'; handoff: Record<string, unknown> }
  | { t: 'final'; scenario: 'support'; summary: string; outcome: Record<string, unknown> }
  | { t: 'done'; scenario: Scenario | 'all'; msg: string }
  | { t: 'error'; scenario?: Scenario | 'all'; msg: string };

export const PORT = 5049;
