import { loadConfig, ticket, type DemoEvent } from './loader.js';

/**
 * Server-side rehearsal: phase 1 is the real loader reading the real fixture
 * repo; phase 2 replays a canned claude -p run whose event and payload shapes
 * match the live path exactly. The deck's client-side Rehearse button embeds
 * the same sequence for the statically served deck.
 */

type Emit = (event: DemoEvent) => void;

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

export async function runRehearsal(emit: Emit, signal?: AbortSignal, delayMs = 420): Promise<void> {
  emit({ t: 'status', msg: 'rehearsal replay, no process spawned' });
  for await (const event of loadConfig()) {
    emit(event as DemoEvent);
    await sleep(delayMs, signal);
  }

  await sleep(delayMs, signal);
  emit({
    t: 'spawn',
    bin: 'claude',
    cwd: 'fixtures/basil-bistro',
    args: ['-p', 'Close-of-day check…', '--output-format', 'json', '--json-schema', '{ maxPrepBatch, findings[] }']
  });
  await sleep(delayMs * 3, signal);
  emit({ t: 'exit', code: 0, ms: 38_000 });
  emit({
    t: 'envelope',
    type: 'result',
    subtype: 'success',
    is_error: false,
    result: {
      maxPrepBatch: 24,
      findings: [
        { area: 'kitchen/prep.ts', severity: 'high', detail: 'pizza-dough batch is 36 portions; the handbook maximum is 24. Split it.' },
        { area: 'kitchen/prep.ts', severity: 'medium', detail: 'The fridge log ends at 21:15; prep standards require a final reading before close.' }
      ]
    },
    session_id: 'sess-rehearsal-01',
    total_cost_usd: 0.05,
    duration_ms: 37_400,
    num_turns: 4
  });
  emit({ t: 'finding', index: 1, area: 'kitchen/prep.ts', severity: 'high', detail: 'pizza-dough batch is 36 portions; the handbook maximum is 24. Split it.' });
  await sleep(delayMs, signal);
  emit({ t: 'finding', index: 2, area: 'kitchen/prep.ts', severity: 'medium', detail: 'The fridge log ends at 21:15; prep standards require a final reading before close.' });
  emit({ t: 'done', msg: `rehearsal complete · ticket was ${ticket}` });
}
