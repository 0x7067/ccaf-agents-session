# Part 3 Claude Code demo

This demo proves two mechanisms from the deck:

1. **Configuration loading.** A loader (`src/loader.ts`) walks the fixture
   repo `fixtures/basil-bistro/` and classifies every configuration file the
   way the CCAF guide documents: the user-level knife roll
   (`fixtures/home/.claude/CLAUDE.md`, a stand-in home so your real one is
   never touched), the project handbook (`CLAUDE.md` plus its `@path`
   import), the `kitchen/CLAUDE.md` station card, the `.claude/rules/`
   laminated cards with `paths:` frontmatter, and the `.claude/skills/` and
   `.claude/commands/` procedure drawer. Tonight's ticket is `kitchen/prep.ts`:
   the station card and `fryer-safety.md` load, `tasting-rules.md` does not.
   This phase is fully deterministic — no model is involved.

2. **The night shift.** The live run (`src/run.ts`) spawns the real
   `claude -p` CLI inside the fixture repo with `--output-format json` and
   `--json-schema`. The prompt is only answerable from the project's own
   rules, so a correct `maxPrepBatch` of 24 proves the handbook loaded. The
   schema-validated findings map to what a CI pipeline would post as inline
   PR comments.

The loader is a teaching model of documented behavior; the `claude -p` run is
the real thing. **Rehearse** replays the same event shapes without spawning
anything.

## Run the deck

```bash
cd part-3/demo
npm install
npm run demo
```

Open http://127.0.0.1:4949/part-3/slides.html. On the demo slide, click
**Run live** (needs the Claude Code CLI installed and logged in, like the
Part 1 demo) or **Rehearse** (needs nothing).

## Run the night shift in the terminal

```bash
npm run nightshift
```

Prints every event as newline-delimited JSON: the loader classification,
then the live `claude -p` envelope and findings. Exits after the run; no
child process is left behind. Set `CLAUDE_BIN` to point at a different
Claude Code binary.

## The fixture repo

```
fixtures/
├── home/.claude/CLAUDE.md          # knife roll (user scope, stand-in home)
└── basil-bistro/
    ├── CLAUDE.md                   # staff handbook (project scope)
    ├── docs/prep-standards.md      # @path import, expanded inline
    ├── kitchen/CLAUDE.md           # station card (directory scope)
    ├── kitchen/prep.ts             # tonight's ticket (36-portion batch!)
    ├── tests/taste.test.ts         # matches tasting-rules.md paths
    └── .claude/
        ├── rules/fryer-safety.md   # paths: kitchen/**/*  → loads tonight
        ├── rules/tasting-rules.md  # paths: **/*.test.ts → skipped tonight
        ├── skills/prep-check/SKILL.md   # context: fork, allowed-tools
        └── commands/close-checklist.md  # legacy /close-checklist
```

The demo never writes to the fixture repo and never touches your real home
directory.
