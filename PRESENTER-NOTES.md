# Run of show — 30 minutes

**Before class (10 min, once):** `cd demo && npm install && npm run demo`,
open http://localhost:4747, press `F` for fullscreen, click **Rehearse (mock)**
once to check the projector. Confirm `claude` is logged in (`claude -p "hi"`).

**Golden rule for timing:** click **▶ Run live** the moment you land on
slide 9, and narrate *while* it runs. The run takes ~2–4 min — exactly the
time you need to explain what's on screen. Never wait silently.

| Time | Slides | Beat |
|---|---|---|
| 0:00–0:02 | 1 | Frame it: "not black magic — a loop. You'll watch a real one work on my real app." |
| 0:02–0:09 | 2–5 | Foundations. Hammer two things: **stateless** (slide 4) and **no tool role** (slide 3). These are the two facts that unlock everything else. |
| 0:09–0:13 | 6–7 | The loop code. Let them read it — it's 10 lines. Then workflow vs agent: *who decides the steps?* |
| 0:13–0:15 | 8 | Hub-and-spoke rules: isolated context, explicit passing, specialists never talk to each other. "Remember this diagram — you're about to see it move." |
| 0:15–0:21 | 9 | **Click ▶ Run live immediately.** While it runs: point at the spawn arrows, click one spawn row and read the actual prompt aloud ("this is the subagent's ENTIRE universe"), point at tool calls appearing under each node, then the green results flying back. Finish on the Final report tab — real findings in their colleagues' code. |
| 0:21–0:24 | 10 | Debrief: map what they saw to API terms. Reveal the hidden hook (`canUseTool` read-only guard). "Prompts ask. Hooks enforce." |
| 0:24–0:28 | 11 | CI: run `npm run audit:headless` in a visible terminal if time allows, otherwise walk the yml. Punchline: "same agent, nobody at the keyboard." |
| 0:28–0:30 | 12 | Recap — seven sentences. Leave it on screen for questions. |

**If the live run misbehaves:** don't debug on stage. Say "the loop is also
subject to the real world", hit Stop, click ▶ Run live once more. (The mock
button exists for rehearsal; using it in class undermines the "it's real"
promise — your call.)

**Two traps to avoid saying** (you said them in prep, the deck corrects them):
- ~~"child agents communicate between them"~~ → they **never** do; everything
  relays through the coordinator.
- ~~"a message can be from a tool call"~~ → there is **no tool role**; tool
  results ride inside a *user* message as `tool_result` blocks.
