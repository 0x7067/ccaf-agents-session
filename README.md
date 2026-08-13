# CCAF Crash Course — Agents, Demystified

Teaching kit for the Ravn CCAF study group: a 30-minute interactive session
that demystifies agents using a real multi-agent audit running live on a real
codebase, built on the **Claude Agent SDK**.

## What's in here

| Path | What it is |
|---|---|
| `slides.html` | The full deck (self-contained HTML — arrow keys, `F` for fullscreen). Slide 9 is a **live visualizer** of a coordinator + 3 subagents. |
| `demo/` | TypeScript project that runs the real audit and streams events into the deck. See `demo/README.md`. |
| `demo/ci/` | The same audit, headless (`claude -p`), plus a drop-in GitHub Actions workflow. |
| `PRESENTER-NOTES.md` | Minute-by-minute run of show for whoever presents. |

## Quick start (5 minutes)

```bash
git clone <this-repo>
cd <this-repo>/demo
npm install
npm run demo        # → open http://localhost:4747
```

Requirements: **Node 18+** and the **Claude Code CLI installed and logged in**
(the live demo uses your local Claude auth — no API key needed).

On slide 9, click **Rehearse (mock)** for a 20-second token-free replay, or
**▶ Run live** for the real thing. By default it audits a repo at
`~/dev/web/przsend` — point it at **any repo you have locally** instead:

```bash
AUDIT_REPO=/path/to/your/project npm run demo
```

Try it on your own project — watching three agents find real issues in *your*
code is the fastest way to make the CCAF material stick.

## Studying for the CCAF?

The deck maps to the exam guide's foundations + agents + CI/CD topics
(see https://github.com/paullarionov/claude-certified-architect). The code is
annotated with the exam-relevant reasoning: start with `demo/src/audit.ts`
and `demo/ci/run-audit.sh`.
