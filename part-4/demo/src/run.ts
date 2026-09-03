import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { runResearch } from './research.js';
import { runRehearsal } from './mock.js';
import { runSupport } from './support.js';
import type { DemoEvent, Scenario } from './events.js';

export async function runScenario(
  scenario: Scenario,
  emit: (event: DemoEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  if (scenario === 'research') {
    await runResearch(emit, signal, 0);
  } else {
    await runSupport(emit, signal, 0);
  }
}

export async function runAll(
  emit: (event: DemoEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  await runResearch(emit, signal, 0);
  if (signal?.aborted) throw new Error('stopped');
  await runSupport(emit, signal, 0);
  emit({ t: 'done', scenario: 'all', msg: 'both scenarios complete' });
}

function isScenario(value: string | undefined): value is Scenario | 'all' {
  return value === 'research' || value === 'support' || value === 'all';
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) {
  const args = new Set(process.argv.slice(2));
  const requested = process.argv.slice(2).find(arg => isScenario(arg)) ?? 'support';
  const emit = (event: DemoEvent) => console.log(JSON.stringify(event));
  try {
    if (args.has('--rehearse')) {
      await runRehearsal(requested, emit, undefined, 0);
    } else if (requested === 'all') {
      await runAll(emit);
    } else {
      await runScenario(requested, emit);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message !== 'stopped') {
      emit({ t: 'error', scenario: requested, msg: message });
      process.exitCode = 1;
    }
  }
}
