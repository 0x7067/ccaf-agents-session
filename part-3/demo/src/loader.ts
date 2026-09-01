import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Teaching model of the configuration loading the CCAF guide documents for
 * Claude Code (chapter 5): the CLAUDE.md hierarchy, @path import expansion,
 * path-scoped rules in .claude/rules/, and skills/commands that wait on
 * demand. The loader reads the real fixture repo on disk and classifies each
 * file exactly as the guide describes. It is not Claude Code itself — the
 * live `claude -p` step in run.ts is the real thing.
 */

export type DemoEvent = { t: string; [key: string]: unknown };

export type Scope = 'user' | 'project' | 'directory' | 'rules' | 'skills' | 'commands';

export type InventoryEntry = { path: string; note: string };

export type Inventory = {
  always: InventoryEntry[];
  conditional: InventoryEntry[];
  onDemand: InventoryEntry[];
  skipped: InventoryEntry[];
};

export type LoaderEvent =
  | { t: 'scan'; scope: Scope; path: string; label: string }
  | { t: 'load'; path: string; kind: 'always' | 'import' | 'conditional'; reason: string; content: string }
  | { t: 'skip'; path: string; reason: string }
  | { t: 'ondemand'; kind: 'skill' | 'command'; name: string; path: string; note: string }
  | { t: 'inventory'; inventory: Inventory };

const demoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const fixtureRepo = path.join(demoDir, 'fixtures', 'basil-bistro');
const fixtureHome = path.join(demoDir, 'fixtures', 'home');

/** The file tonight's session works on. It decides what loads conditionally. */
export const ticket = 'kitchen/prep.ts';

async function readIfExists(file: string): Promise<string | undefined> {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return undefined;
  }
}

/** Parse the `paths:` list (glob patterns) out of YAML frontmatter. */
export function parsePaths(frontmatterSource: string): string[] {
  const match = frontmatterSource.match(/^paths:\s*\[(.*)\]\s*$/m);
  if (!match) return [];
  return match[1]
    .split(',')
    .map(entry => entry.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

function splitFrontmatter(source: string): { frontmatter: string; body: string } {
  if (!source.startsWith('---')) return { frontmatter: '', body: source };
  const end = source.indexOf('\n---', 3);
  if (end < 0) return { frontmatter: '', body: source };
  return { frontmatter: source.slice(3, end), body: source.slice(end + 4) };
}

/** Small glob → RegExp: ** crosses directory separators, * and ? do not. */
export function globToRegExp(pattern: string): RegExp {
  let source = '';
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    if (char === '*') {
      if (pattern[i + 1] === '*') {
        // '**' crosses directory separators; swallow a following '/' so
        // 'a/**' and 'a/**/b' both behave.
        source += '.*';
        i++;
        if (pattern[i + 1] === '/') i++;
      } else {
        source += '[^/]*';
      }
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${source}$`);
}

/** Find @./relative/path imports in a CLAUDE.md body, max depth 5. */
export function findImports(body: string): string[] {
  const matches = body.matchAll(/(?:^|\s)@(\.{1,2}\/[^\s,)"']+)/g);
  return [...matches].map(match => match[1]);
}

/**
 * Walk the fixture repo and yield one event per configuration file, in the
 * order the guide describes: user scope, project scope, expanded imports,
 * directory scope, path-scoped rules, then skills and commands at rest.
 */
export async function* loadConfig(): AsyncGenerator<LoaderEvent> {
  const userFile = path.join(fixtureHome, '.claude', 'CLAUDE.md');
  const projectFile = path.join(fixtureRepo, 'CLAUDE.md');

  // 1. User scope — the knife roll. Loads in every project on this machine.
  const userSource = await readIfExists(userFile);
  if (userSource !== undefined) {
    yield { t: 'scan', scope: 'user', path: '~/.claude/CLAUDE.md', label: 'knife roll · demo stand-in home' };
    yield {
      t: 'load',
      path: '~/.claude/CLAUDE.md',
      kind: 'always',
      reason: 'user scope — loads in every project on this machine',
      content: userSource.trim()
    };
  }

  // 2. Project scope — the staff handbook. Loads every session in this repo.
  const projectSource = await readIfExists(projectFile);
  if (projectSource === undefined) throw new Error('fixture repo is missing its CLAUDE.md');
  yield { t: 'scan', scope: 'project', path: 'CLAUDE.md', label: 'staff handbook · repo root' };
  yield {
    t: 'load',
    path: 'CLAUDE.md',
    kind: 'always',
    reason: 'project scope — loads every session in this repo',
    content: projectSource.trim()
  };

  // 3. @path imports — expanded inline at launch, nesting depth at most 5.
  const imports = findImports(projectSource);
  const expanded = new Set<string>();
  const expand = async function* (relativePath: string, depth: number): AsyncGenerator<LoaderEvent> {
    if (depth > 5 || expanded.has(relativePath)) return;
    const absolute = path.join(fixtureRepo, relativePath);
    const source = await readIfExists(absolute);
    if (source === undefined) return;
    expanded.add(relativePath);
    yield {
      t: 'load',
      path: relativePath.split(path.sep).join('/'),
      kind: 'import',
      reason: `@path import — expanded inline at launch (depth ${depth} of 5)`,
      content: source.trim()
    };
    for (const nested of findImports(source)) {
      const nestedRelative = path.posix.normalize(path.posix.join(path.posix.dirname(relativePath), nested));
      yield* expand(nestedRelative, depth + 1);
    }
  };
  for (const importPath of imports) {
    yield* expand(path.posix.normalize(path.posix.join('.', importPath)), 1);
  }

  // 4. Directory scope — the station card for the directory tonight's file lives in.
  const ticketDir = path.posix.dirname(ticket);
  if (ticketDir !== '.') {
    const stationCard = path.posix.join(ticketDir, 'CLAUDE.md');
    const source = await readIfExists(path.join(fixtureRepo, stationCard));
    if (source !== undefined) {
      yield { t: 'scan', scope: 'directory', path: stationCard, label: 'station card' };
      yield {
        t: 'load',
        path: stationCard,
        kind: 'conditional',
        reason: `tonight's ticket touches ${ticket}`,
        content: source.trim()
      };
    }
  }

  // 5. Path-scoped rules — laminated cards that load only on a matching ticket.
  const rulesDir = path.join(fixtureRepo, '.claude', 'rules');
  const inventoryConditional: InventoryEntry[] = [];
  const inventorySkipped: InventoryEntry[] = [];
  let rulesNames: string[] = [];
  try {
    rulesNames = (await readdir(rulesDir)).filter(name => name.endsWith('.md')).sort();
  } catch {
    rulesNames = [];
  }
  for (const name of rulesNames) {
    const relative = `.claude/rules/${name}`;
    const source = await readIfExists(path.join(rulesDir, name));
    if (source === undefined) continue;
    const { frontmatter, body } = splitFrontmatter(source);
    const patterns = parsePaths(frontmatter);
    const matched = patterns.some(pattern => globToRegExp(pattern).test(ticket));
    yield {
      t: 'scan',
      scope: 'rules',
      path: relative,
      label: `laminated card · paths: ${patterns.length ? patterns.join(', ') : 'none'}`
    };
    if (matched) {
      yield {
        t: 'load',
        path: relative,
        kind: 'conditional',
        reason: `paths ${patterns.join(', ')} matches ${ticket}`,
        content: body.trim()
      };
      inventoryConditional.push({ path: relative, note: `paths ${patterns.join(', ')} matched` });
    } else {
      yield {
        t: 'skip',
        path: relative,
        reason: `no match for ${ticket} — stays out of context`
      };
      inventorySkipped.push({ path: relative, note: `paths ${patterns.join(', ')} — no match tonight` });
    }
  }

  // 6. Skills — at rest only the name and description load.
  const skillFile = path.join(fixtureRepo, '.claude', 'skills', 'prepare-dough', 'SKILL.md');
  const skillSource = await readIfExists(skillFile);
  if (skillSource !== undefined) {
    const { frontmatter } = splitFrontmatter(skillSource);
    const description = (frontmatter.match(/^description:\s*(.+)$/m)?.[1] ?? '').trim();
    const short = description.length > 72 ? `${description.slice(0, 72)}…` : description;
    yield {
      t: 'ondemand',
      kind: 'skill',
      name: 'prepare-dough',
      path: '.claude/skills/prepare-dough/SKILL.md',
      note: `at rest — description only: "${short}"`
    };
  }

  // 7. Commands — the legacy format still creates a /name command.
  const commandsDir = path.join(fixtureRepo, '.claude', 'commands');
  let commandNames: string[] = [];
  try {
    commandNames = (await readdir(commandsDir)).filter(name => name.endsWith('.md')).sort();
  } catch {
    commandNames = [];
  }
  for (const name of commandNames) {
    yield {
      t: 'ondemand',
      kind: 'command',
      name: `/${name.replace(/\.md$/, '')}`,
      path: `.claude/commands/${name}`,
      note: 'legacy format — still a /name command'
    };
  }

  // 8. The whole configuration, classified.
  const inventory: Inventory = {
    always: [
      { path: '~/.claude/CLAUDE.md', note: 'knife roll — every project' },
      { path: 'CLAUDE.md', note: 'handbook — every session' },
      ...[...expanded].map(entry => ({ path: entry, note: '@path import, expanded inline' }))
    ],
    conditional: [
      ...inventoryConditional,
      { path: 'kitchen/CLAUDE.md', note: `station card — ticket touches ${ticketDir}/` }
    ].sort((a, b) => a.path.localeCompare(b.path)),
    onDemand: [
      { path: '.claude/skills/prepare-dough/SKILL.md', note: '/prepare-dough' },
      ...commandNames.map(name => ({ path: `.claude/commands/${name}`, note: `/${name.replace(/\.md$/, '')}` }))
    ],
    skipped: inventorySkipped
  };
  yield { t: 'inventory', inventory };
}
