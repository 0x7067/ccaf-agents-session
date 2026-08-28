# Run of show, 40 minutes

The staff area of Basil Bistro is the teaching thread. Part 1 gave Claude
hands; Part 2 gave it an order counter; Part 3 trains the staff that works
behind that counter and then leaves one of them to run the place overnight.
The handbook is CLAUDE.md. The knife roll is user scope. The station card is
directory scope. The laminated cards are `.claude/rules/` with `paths`. The
procedure drawer is skills and commands. Mise en place, prep before you cook,
is planning mode. The night shift is `claude -p` in CI, and a fresh instance
reviews the code it never saw being written.

The deck has 17 slides. It opens with the statelessness callback, how do
your rules reach Claude, then builds the handbook and its three shelves,
motivates cross-directory rules with chicken safety, organizes with imports,
and teaches the laminated-card mechanism. Only then does it separate asking
from enforcing. The on-demand layer (skills, commands) follows. After the demo the
two workflow slides, mise en place and the shift log, cover how you start a
job and what survives the night. The two night-shift slides are the exam's CI
pattern: unattended execution and independent review.

## Register

The room is mixed. Some people configure Claude Code daily. Others have never
written a CLAUDE.md. Start with the second group.

- Say "the handbook asks; the sprinkler doesn't care" whenever guidance
  and configuration start to blur.
- Use the restaurant before the file tree. Once the room can picture the
  shelf, show the path that implements it.
- Keep Part 2's distinction alive: `~/.claude.json` holds MCP servers.
  `~/.claude/CLAUDE.md` holds instructions. Same shelf in your home, different
  job. The dialog on slide 4 exists for exactly this confusion.
- Treat every scope question as an ownership question: whose rule is this,
  and who should receive it?

## Before class

Open `part-3/slides.html` in the browser, press `F` for fullscreen, navigate
to the demo slide (15), and click **Run** once. The demo is fully
self-contained — no server, no CLI, no credentials needed. It replays
simulated events with the same shapes and data the real loader and
`claude -p` would produce.

## Timing

| Time | Slides | Must-hit beat |
|---|---|---|
| 0:00–0:02 | 1 | Promise one complete shift: the rules that load, the cards you pull, and the 3 a.m. run. Call back to Parts 1 and 2: hands, then the counter. Today, training. |
| 0:02–0:05 | 2 | The model has no memory of your project. Files are how rules reach the model. Show the three loading conditions; the whole deck hangs on that three-row map. |
| 0:05–0:08 | 3 | CLAUDE.md = the staff handbook: always loaded, instruction not configuration, lean on purpose. Open the lean-rules dialog if the room writes handbooks. |
| 0:08–0:11 | 4 | Three shelves, three owners. Hammer the exam trap: the new teammate who never sees the standards because they lived on one knife roll. Use the inline check if the room needs a beat. |
| 0:11–0:13 | 5 | Chicken safety motivates cross-directory rules. One file in `.claude/rules/` loads in two stations. A station card can't do that. Click the chicken-safety dialog for the detailed rules. |
| 0:13–0:15 | 6 | `@path` organizes the handbook but expands inline at launch. Organization, not savings. That nuance is what the exam tests. |
| 0:15–0:17 | 7 | Laminated cards load only on matching tickets. Kind (glob) vs place (station card). Use the inline check after showing the rule files. |
| 0:17–0:19 | 8 | Now draw the boundary: those files are instructions. Call back Part 1's >90% / 100% table. Money, legal, safety → hooks. |
| 0:19–0:22 | 9–10 | The procedure drawer: `/name` cards, project vs personal, then the frontmatter. Start with the consequence: `context: fork` keeps verbose output out. Then name the subagent mechanism and the `allowed-tools` security boundary. |
| 0:22–0:25 | 11 | Mise en place means prep before you cook: plan before big or ambiguous work; direct execution for a clear small ticket. Name Explore as Part 1's subagent returning here, with one line back. |
| 0:25–0:27 | 12 | Shift log: `/compact` frees the current window but blurs numbers; `/memory` persists a lesson; resume reloads a session; fork branches one. Keep those four mechanisms distinct. |
| 0:27–0:30 | 13 | The night shift pattern: `-p` is the only correct CI mode; JSON + schema makes findings postable. Open the envelope dialog. |
| 0:30–0:32 | 14 | Fresh eyes: the session that wrote the code defends it; an independent instance reviews it. Feed prior findings back to avoid duplicate comments on re-review. |
| 0:32–0:36 | 15 | Run the demo. Click **Run** and walk through the 5 events: inventory, spawn, envelope (maxPrepBatch 24), finding, done. Debrief: the answer "24" could only come from the imported standards, proof the handbook loaded. |
| 0:36–0:38 | 16 | Exam reasoning: who owns the rule, when it loads, whether a human is in the room. |
| 0:38–0:40 | 17 | Seven sentences. Leave slide 17 on screen for questions. |

## Spoken segues

Use these as handoffs, not as lines to memorize.

- Slide 1 to 2: "Part 1 gave Claude hands. Part 2 gave it a counter. Today we
  train the staff, and then leave one of them alone with the keys."
- Slide 2 to 3: "The answer is not typing harder. It's a file."
- Slide 3 to 4: "One handbook isn't the whole story. Three shelves, three
  owners."
- Slide 4 to 5: "Some rules belong to more than one station. How do you
  avoid copying the same rule twice?"
- Slide 5 to 6: "Handbooks grow. Imports keep them organized, but they
  don't save context."
- Slide 6 to 7: "That's organization. Here's the mechanism: laminated cards
  with a paths glob."
- Slide 7 to 8: "Those are all instructions. Now the question every exam
  loves: when does a rule need enforcement instead?"
- Slide 8 to 9: "Now we know what loads by itself. Some things should wait
  until you ask for them."
- Slide 9 to 10: "A card in a drawer can permit things. Read the frontmatter."
- Slide 10 to 11: "That's the whole load path. Before you start your own job,
  one choice: plan it or just cook it."
- Slide 11 to 12: "Long sessions need a shift log."
- Slide 12 to 13: "That's the day-to-day. Now the run that needs nobody
  there."
- Slide 13 to 14: "That delivery order goes to a fresh instance. The cook who
  made the dish should not be the one who checks it."
- Slide 14 to 15: "Let's watch the whole night shift play out."
- Slide 15 to 16: "Implementation choices change. The exam rules stay small."
- Slide 16 to 17: "Seven sentences, then I'm done."

## Interaction openings

- Slide 2: ask who has retyped the same instructions to Claude this week.
- Slide 4: ask where "our team's test command" belongs, knife roll or
  handbook, and why the new hire makes the answer obvious.
- Slide 8: ask which is the handbook and which is the sprinkler: "always
  run tests before deploy" as a handbook line vs a CI gate.
- Slide 7: ask where a convention for tests scattered across the repo goes,
  laminated card or station card.
- Slide 9: ask what procedure the room has typed to an agent more than twice.
- Slide 11: ask about their last big refactor, planned or dived in?
- Slide 13: ask what breaks if CI runs interactive Claude.
- Slide 4: after the scope tree, click **Try it: where does each rule belong?** to confirm ownership before moving on.
- Slide 7: click **Try it: will these rules load for kitchen/prep.ts?** after showing the rule files.

## Demo recovery

The demo is simulated — no server, no CLI, no credentials. If the events do
not play after clicking **Run**, reload the page. If the browser blocks local
file access (rare), serve the folder with any static server:
`npx serve part-3`.

## Debts and deferrals

- Part 1's hook lesson (prompts ask, hooks enforce) is paid its Claude Code
  callback on slide 8. Not re-taught, named.
- **Deferred to a later part:** extended thinking and the Message Batches
  API. They appear in the guide's CI scenario (batch for overnight reports,
  real-time for blocking checks; thinking as a last-resort accuracy lever),
  but they are Domain 4 API material, not Claude Code configuration. The
  prompt-engineering part owes them. Say so if asked.
- **Deferred to a later part:** context degradation signals and scratchpad
  files (Domain 5). Slide 12 only names the `/compact` summarization risk
  because the guide puts it under the `/compact` entry.
- MCP configuration is Part 2 material; slide 4 only separates
  `~/.claude.json` from `~/.claude/CLAUDE.md`.

## Questions worth leaving open

- Which rule in your team's CLAUDE.md is actually a hook wearing a costume?
- Which convention in your repo spans directories and deserves a `paths`
  rule today?
- What would your team's first shared `/command` be?
