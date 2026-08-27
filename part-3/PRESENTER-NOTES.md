# Run of show, 40 minutes

The staff area of Basil Bistro is the teaching thread. Part 1 gave Claude
hands; Part 2 gave it an order counter; Part 3 trains the staff and then
leaves one of them to run the place overnight. The handbook is CLAUDE.md. The
knife roll is user scope. The station card is directory scope. The laminated
cards are `.claude/rules/` with `paths`. The recipe drawer is skills and
commands. Mise en place is planning mode. The night shift is `claude -p` in
CI.

The deck has 18 slides. It opens with the statelessness callback — nobody
teaches Claude your kitchen — then builds the handbook and its three shelves,
separates asking from enforcing, adds the on-demand layer (rules, skills),
covers planning and session hygiene, and proves the whole story with the
demo: a real configuration load followed by a real unattended `claude -p` run.
The two night-shift slides after the demo are the exam's CI pattern.

## Register

The room is mixed. Some people configure Claude Code daily. Others have never
written a CLAUDE.md. Start with the second group.

- Say "the handbook asks; the lock enforces" whenever guidance and
  configuration start to blur.
- Use the restaurant before the file tree. Once the room can picture the
  shelf, show the path that implements it.
- Keep Part 2's distinction alive: `~/.claude.json` holds MCP servers.
  `~/.claude/CLAUDE.md` holds instructions. Same shelf in your home, different
  job. The dialog on slide 4 exists for exactly this confusion.
- Treat every scope question as an ownership question: whose rule is this,
  and who should receive it?

## Before class

```bash
cd part-3/demo
npm install
npm run demo
```

Open http://127.0.0.1:4949/part-3/slides.html, press `F`, and run
**Rehearse** once. Then run `npm run nightshift` in a terminal. It must print
the loader events, the `claude -p` envelope, and finish with a `done` event.
**Run live** needs the Claude Code CLI installed and logged in (like the
Part 1 demo). Use **Rehearse** from the published static link.

## Timing

| Time | Slides | Must-hit beat |
|---|---|---|
| 0:00-0:02 | 1 | Promise one complete shift: the rules that load, the cards you pull, and the 3 a.m. run. Call back to Parts 1 and 2: hands, then the counter — today, training. |
| 0:02-0:05 | 2 | The model has no memory of your project. Files are how rules reach the model. Show the four loading moments; the whole deck hangs on that pre block. |
| 0:05-0:08 | 3 | CLAUDE.md = the staff handbook: always loaded, instruction not configuration, lean on purpose. Open the lean-rules dialog if the room writes handbooks. |
| 0:08-0:11 | 4 | Three shelves, three owners. Hammer the exam trap: the new teammate who never sees the standards because they lived on one knife roll. |
| 0:11-0:13 | 5 | Ask vs enforce. Call back Part 1's >90% / 100% table. Money, legal, safety → hooks. |
| 0:13-0:15 | 6 | `@path` organizes the binder but expands inline at launch. Organization, not savings — the nuance the exam tests. |
| 0:15-0:18 | 7 | Laminated cards load only on matching tickets. Kind (glob) vs place (station card). |
| 0:18-0:21 | 8-9 | The recipe drawer: `/name` cards, project vs personal, then the frontmatter. `context: fork` keeps verbose output out; `allowed-tools` is the security boundary. |
| 0:21-0:24 | 10 | Mise en place: plan before big or ambiguous work; direct execution for a clear small ticket. Explore subagent = one line back. |
| 0:24-0:26 | 11 | Shift log: `/memory` writes the lesson down; `/compact` frees the window but blurs numbers; resume vs fork vs fresh. |
| 0:26-0:28 | 12 | Stop before the demo. Ask the room to predict which files load tonight and which stay out. |
| 0:28-0:33 | 13-14 | Run the trace. Read the loader sequence, then debrief: the answer "24" could only come from the imported standards — proof the handbook loaded. |
| 0:33-0:36 | 15 | The night shift pattern: `-p` is the only correct CI mode; JSON + schema makes findings postable. Open the envelope dialog. |
| 0:36-0:38 | 16 | Fresh eyes: the session that wrote the code defends it; an independent instance reviews it. Re-reviews report only new or unresolved issues. |
| 0:38-0:40 | 17-18 | Close on exam reasoning: who owns the rule, when it loads, whether a human is in the room. Leave slide 18 on screen for questions. |

## Spoken segues

Use these as handoffs, not as lines to memorize.

- Slide 1 to 2: "Part 1 gave Claude hands. Part 2 gave it a counter. Today we
  train the staff — and then leave one of them alone with the keys."
- Slide 2 to 3: "The answer is not typing harder. It's a file."
- Slide 3 to 4: "One handbook isn't the whole story. Three shelves, three
  owners."
- Slide 4 to 5: "Now the question every exam loves: is a handbook rule a real
  rule?"
- Slide 5 to 6: "Handbooks grow. Two ways to keep them organized — and only
  one of them saves context."
- Slide 6 to 7: "Imports organize by reference. Rules organize by relevance."
- Slide 7 to 8: "So far everything loads by itself. Some things should wait
  until you ask for them."
- Slide 8 to 9: "A card in a drawer can permit things. Read the frontmatter."
- Slide 9 to 10: "Cards are how you repeat work. The next choice is how you
  start work."
- Slide 10 to 11: "Long sessions need a shift log."
- Slide 11 to 12: "Time to watch the whole kitchen run with nobody in it."
- Slide 14 to 15: "What you just watched is the CI pattern, one flag at a
  time."
- Slide 15 to 16: "One more night-shift rule: who checks the cooking?"
- Slide 16 to 17: "Implementation choices change. The exam rules stay small."

## Interaction openings

- Slide 2: ask who has retyped the same instructions to Claude this week.
- Slide 4: ask where "our team's test command" belongs — knife roll or
  handbook — and why the new hire makes the answer obvious.
- Slide 5: ask which is paper and which is steel: "always run tests before
  deploy" as a handbook line vs a CI gate.
- Slide 7: ask where a convention for tests scattered across the repo goes —
  laminated card or station card.
- Slide 8: ask what procedure the room has typed to an agent more than twice.
- Slide 10: ask about their last big refactor — planned or dived in?
- Slide 12: let the room predict tonight's load list before running.
- Slide 15: ask what breaks if CI runs interactive Claude.

## Live demo recovery

- If **Run live** fails, click **Stop**, read the error event — the demo
  surfaces the real reason (CLI missing, auth, quota) — and try once more.
- Use **Rehearse** from the start on a static link. It replays the same event
  shapes without spawning anything.
- Do not remove **Rehearse**. It is the stage fallback.
- The loader phase never fails: it reads only files inside the demo folder.
  A live failure is CLI setup or account state, not the course material.

## Debts and deferrals

- Part 1's hook lesson (prompts ask, hooks enforce) is paid its Claude Code
  callback on slide 5. Not re-taught — named.
- **Deferred to a later part:** extended thinking and the Message Batches
  API. They appear in the guide's CI scenario (batch for overnight reports,
  real-time for blocking checks; thinking as a last-resort accuracy lever),
  but they are Domain 4 API material, not Claude Code configuration. The
  prompt-engineering part owes them. Say so if asked.
- **Deferred to a later part:** context degradation signals and scratchpad
  files (Domain 5). Slide 11 only names the `/compact` summarization risk.
- MCP configuration is Part 2 material; slide 4 only separates
  `~/.claude.json` from `~/.claude/CLAUDE.md`.

## Questions worth leaving open

- Which rule in your team's CLAUDE.md is actually a hook wearing a costume?
- Which convention in your repo spans directories and deserves a `paths`
  rule today?
- What would your team's first shared `/command` be?
