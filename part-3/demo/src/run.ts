import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadConfig, fixtureRepo, ticket, type DemoEvent } from './loader.js';

/**
 * The night shift, in two phases:
 *
 * 1. The loader pass (always real): walk the fixture repo and classify every
 *    configuration file — what loads always, what loads conditionally on
 *    tonight's ticket, and what waits on demand.
 * 2. The headless pass (live): run the real `claude -p` CLI inside the
 *    fixture repo with --output-format json and --json-schema, then map the
 *    schema-validated result to findings. The prompt is only answerable from
 *    the project's own CLAUDE.md, so a correct maxPrepBatch proves the
 *    handbook actually loaded.
 */

type Emit = (event: DemoEvent) => void;

const closeOfDayPrompt =
  'Close-of-day check for this restaurant repo. Read this project\'s own CLAUDE.md rules (and anything they import) plus kitchen/prep.ts. ' +
  'Report maxPrepBatch exactly as the project rules define it, and list close-of-day risks you can verify in kitchen/prep.ts. Do not modify any file.';

const findingsSchema = {
  type: 'object',
  properties: {
    maxPrepBatch: { type: 'number', description: 'Maximum prep batch in portions, as defined by this repo\'s own rules' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          area: { type: 'string', description: 'File or station the finding is about' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          detail: { type: 'string' }
        },
        required: ['area', 'severity', 'detail']
      }
    }
  },
  required: ['maxPrepBatch', 'findings']
};

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

type Envelope = {
  type?: string;
  subtype?: string;
  is_error?: boolean;
  result?: unknown;
  session_id?: string;
  total_cost_usd?: number;
  duration_ms?: number;
  num_turns?: number;
};

function truncate(id: string | undefined, keep = 18): string | undefined {
  return id ? id.slice(0, keep) : undefined;
}

function runClaudePrint(emit: Emit, signal?: AbortSignal): Promise<{ stdout: string; stderr: string; code: number | null; ms: number }> {
  const bin = process.env.CLAUDE_BIN ?? 'claude';
  const args = ['-p', closeOfDayPrompt, '--output-format', 'json', '--json-schema', JSON.stringify(findingsSchema)];
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    emit({ t: 'spawn', bin, cwd: 'fixtures/basil-bistro', args: ['-p', 'Close-of-day check…', '--output-format', 'json', '--json-schema', '{ maxPrepBatch, findings[] }'] });

    const child = spawn(bin, args, { cwd: fixtureRepo, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const timeout = setTimeout(() => child.kill('SIGTERM'), 240_000);
    const onAbort = () => child.kill('SIGTERM');
    signal?.addEventListener('abort', onAbort, { once: true });

    const finish = (code: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
      if (signal?.aborted) {
        reject(new Error('stopped'));
        return;
      }
      resolve({ stdout, stderr, code, ms: Date.now() - startedAt });
    };

    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('error', error => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on('close', code => finish(code));
  });
}

export async function runNightShift(emit: Emit, signal?: AbortSignal, delayMs = 650): Promise<void> {
  // Phase 1 — the configuration, classified. Always real, no model involved.
  emit({ t: 'status', msg: `reading the repo's configuration (tonight's ticket: ${ticket})…` });
  for await (const event of loadConfig()) {
    emit(event as DemoEvent);
    if (delayMs > 0) await sleep(delayMs, signal);
  }

  // Phase 2 — the night shift: one unattended claude -p run.
  await sleep(delayMs, signal);
  let result: { stdout: string; stderr: string; code: number | null; ms: number };
  try {
    result = await runClaudePrint(emit, signal);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === 'stopped') throw error;
    emit({ t: 'error', msg: `claude CLI not found or failed to start (${message}). Install Claude Code and log in, or use Rehearse.` });
    emit({ t: 'done', msg: 'night shift ended without the live run' });
    return;
  }

  emit({ t: 'exit', code: result.code, ms: result.ms });

  let envelope: Envelope;
  try {
    envelope = JSON.parse(result.stdout) as Envelope;
  } catch {
    emit({ t: 'error', msg: `claude -p did not print JSON (exit ${result.code}). stderr: ${result.stderr.slice(0, 200) || 'empty'}` });
    emit({ t: 'done', msg: 'night shift ended without a valid envelope' });
    return;
  }

  const structured = envelope.result as { maxPrepBatch?: number; findings?: Array<{ area: string; severity: string; detail: string }> } | undefined;
  emit({
    t: 'envelope',
    type: envelope.type,
    subtype: envelope.subtype,
    is_error: envelope.is_error ?? false,
    result: structured,
    session_id: truncate(envelope.session_id),
    total_cost_usd: envelope.total_cost_usd,
    duration_ms: envelope.duration_ms,
    num_turns: envelope.num_turns
  });

  if (envelope.is_error) {
    const message = typeof envelope.result === 'string' ? envelope.result : 'claude -p returned an error envelope';
    emit({ t: 'error', msg: message });
    emit({ t: 'done', msg: 'night shift ended with an error envelope' });
    return;
  }

  const findings = Array.isArray(structured?.findings) ? structured!.findings : [];
  let index = 0;
  for (const finding of findings) {
    await sleep(delayMs, signal);
    index += 1;
    emit({ t: 'finding', index, area: finding.area, severity: finding.severity, detail: finding.detail });
  }
  emit({ t: 'done', msg: `night shift complete · ${findings.length} finding${findings.length === 1 ? '' : 's'} posted` });
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) {
  await runNightShift(event => console.log(JSON.stringify(event)), undefined, 0);
}
