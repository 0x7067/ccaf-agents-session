# CCAF crash course, live multi-agent demo

One Node server that (a) serves the slide deck and (b) runs a real
coordinator + 3-subagent audit with the **Claude Agent SDK**, streaming every
event to the visualizer embedded in slide 9.

## Prerequisites

- Node 18+ and the **Claude Code CLI installed and logged in** (the SDK uses
  your local Claude auth, no API key needed for the live demo)
- The repo under audit cloned at `~/dev/web/przsend` (or set `AUDIT_REPO`)

## Run

```bash
cd part-1/demo
npm install
npm run demo          # → open http://localhost:4747 (course index; deck at /part-1/slides.html)
```

Arrow keys move through the deck. **Slide 13** is the live visualizer:

| Button | What it does |
|---|---|
| ▶ Run live | Real run: SDK spawns the three auditors against przsend (~2–4 min, costs tokens) |
| Rehearse (mock) | Replays a canned run in ~20 s. Zero tokens. For practicing narration + projector checks. **Don't use in class**: the class deserves the real thing. |
| Stop | Interrupts the current run |

Click any **spawn** row in the log (or any agent node) to show the class the
EXACT prompt the coordinator passed. That is the context-isolation teaching
moment.

Audit a different repo:

```bash
AUDIT_REPO=/path/to/any/repo npm run demo
```

## Where the teaching lives in the code

- `src/audit.ts`: subagent definitions, coordinator prompt, and the
  `canUseTool` read-only guard (the "hooks enforce, prompts ask" lesson)
- `src/events.ts`: the tiny event protocol; each event maps 1:1 to an API
  concept (spawn = Task/Agent tool_use, sub_done = tool_result, …)
