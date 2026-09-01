# Part 3 Claude Code demo

This demo proves two mechanisms from the deck:

1. **Configuration loading.** The slide deck embeds a simulated trace of
   the loader classification: the user-level knife roll, the project
   handbook with its `@path` import, the `kitchen/CLAUDE.md` station card,
   the `.claude/rules/` laminated cards with `paths:` frontmatter, and the
   `.claude/skills/` and `.claude/commands/` procedure drawer. Tonight's
   ticket is `kitchen/prep.ts`: the station card and `fryer-safety.md`
   load, `tasting-rules.md` does not.

2. **The night shift.** The simulated trace shows a `claude -p` invocation
   with `--output-format json` and `--json-schema`. The result includes
   `maxPrepBatch: 24` (only answerable from the imported standards) and a
   high-severity finding (36 portions exceeds the 24-portion maximum).

## Present the deck

Open `part-3/slides.html` in a browser and navigate to the demo slide.
Click **Run**. No server, no CLI, no credentials needed — all events are
embedded in the HTML.

## Run the night shift in the terminal

For a live terminal demo (optional, not required for the presentation):

```bash
cd part-3/demo
npm install
npm run nightshift
```

Prints every event as newline-delimited JSON: the loader classification,
then the live `claude -p` envelope and findings. Exits after the run; no
child process is left behind. Set `CLAUDE_BIN` to point at a different
Claude Code binary. Needs the Claude Code CLI installed and logged in.

## Development server

The codebase includes a WebSocket-based dev server for testing live runs:

```bash
npm run demo
```

This is not needed for the presentation. The slide deck works standalone.

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
        ├── skills/prepare-dough/SKILL.md  # context: fork, allowed-tools
        └── commands/close-checklist.md  # legacy /close-checklist
```

The demo never writes to the fixture repo and never touches your real home
directory.
