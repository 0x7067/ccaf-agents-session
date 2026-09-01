# CCAF Crash Course @ Ravn

Teaching kit for the Ravn CCAF study group: short, interactive sessions that
fill in knowledge gaps for the Claude Certified Architect exam: simple
explanations, analogies a kid could understand, and demos that are **real
running code**, never pseudocode.

**Start here:** open `index.html`, the course landing page linking to
every part.

## Parts

| Part | Topic | Status |
|---|---|---|
| [Part 1](part-1/) | Agentic Architecture and Orchestration: the Claude API request body, the agent loop, multi-agent hub-and-spoke (live demo), and a full exam summary | ✅ ready |
| [Part 2](part-2/) | Model Context Protocol and Tool Calling: a restaurant-themed path through hosts, clients, servers, tools/resources/prompts, tool descriptions and `tool_choice`, project vs personal configuration, structured errors, and a live protocol trace | ✅ ready |
| [Part 3](part-3/) | Claude Code configuration and workflows: the CLAUDE.md hierarchy as knife roll / staff handbook / station card, ask-vs-enforce with hooks, `@path` imports, path-scoped `.claude/rules/`, skills and slash commands, planning mode, session hygiene, and the headless `claude -p` CI pattern with `--output-format json` + `--json-schema` | ✅ ready |
| Part 4+ | yours to add | |

Each part is a self-contained folder:

```
part-1/
├── slides.html          # the deck (self-contained HTML)
├── PRESENTER-NOTES.md   # minute-by-minute run of show
├── notes/               # source study notes for this part
└── demo/                # runnable demo (Claude Agent SDK, TypeScript)
```

Part 2 follows the same structure. Its deterministic, token-free restaurant
demo launches a real local MCP server, reads the menu resource, places one
order, performs a successful search with no matches, and returns one structured
tool error. Part 3 keeps the structure: its demo classifies a whole fixture
repo's Claude Code configuration (what loads always, conditionally, and on
demand), then runs the real `claude -p` unattended inside it.

## Running Part 1 (5 minutes)

```bash
cd part-1/demo
npm install
npm run demo        # → open http://localhost:4747
```

Requirements: **Node 18+** and the **Claude Code CLI installed and logged in**
(the live demo uses your local Claude auth; no API key needed).

The server serves the whole course: the index at `/`, the deck at
`/part-1/slides.html`. On slide 13, click **Rehearse (mock)** for a 20-second
token-free replay, or **▶ Run live** for the real multi-agent audit. By
default it audits a repo at `~/dev/web/przsend`. Point it at **any repo you
have locally** instead:

```bash
AUDIT_REPO=/path/to/your/project npm run demo
```

Try it on your own project, watching three agents find real issues in *your*
code is the fastest way to make the material stick.

## Running Part 2 (3 minutes)

```bash
cd part-2/demo
npm install
npm run demo        # → open http://127.0.0.1:4848/part-2/slides.html
```

On slide 13, click **Run live** to trace MCP discovery, a resource read, a
successful tool call, a valid zero-result call, and a structured tool error.
Run `npm run protocol` for the same trace as newline-delimited JSON.

## Running Part 3 (3 minutes)

```bash
cd part-3/demo
npm install
npm run demo        # → open http://127.0.0.1:4949/part-3/slides.html
```

On slide 13, click **Run live** for the night shift: the demo classifies the
fixture repo's whole configuration, then the real `claude -p` runs the
close-of-day check unattended and returns schema-validated JSON findings.
**Run live** needs the Claude Code CLI installed and logged in (as in Part 1);
**Rehearse** replays the same event shapes without spawning anything. Run
`npm run nightshift` for the same trace as newline-delimited JSON.

## Adding a part

1. Copy the `part-1/` structure into `part-N/` (deck + notes + demo, or
   deck-only if your topic doesn't need one).
2. Add a card for it in `index.html`.
3. Keep the house rules: simple and straight to the point, kid-friendly
   analogies, facts verified against the current Anthropic docs, and if
   there's a demo, it must be real.

## Studying for the CCAF?

This course maps to the exam guide at
https://ravnhq.github.io/claude-certified-architect/. The code is
annotated with the exam-relevant reasoning: start with
`part-1/demo/src/audit.ts`.
