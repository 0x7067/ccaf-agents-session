# Run of show, 30 minutes

**Before class (10 min, once):** `cd part-1/demo && npm install && npm run demo`,
open http://localhost:4747/part-1/slides.html, press `F` for fullscreen, click **Rehearse (mock)**
once to check the projector. Confirm `claude` is logged in (`claude -p "hi"`).

**Golden rule for timing:** click **▶ Run live** the moment you land on
slide 11, and narrate *while* it runs. The run takes ~2-4 min, which is exactly
the time you need to explain what's on screen. Never wait silently.

| Time | Slides | Beat |
|---|---|---|
| 0:00-0:02 | 1-2 | Title, then the Foundations divider: name the three topics so the room knows where this is going. |
| 0:02-0:08 | 3-5 | Foundations. Hammer the big one: every request is independent and the whole conversation goes up every time (slide 4). Then `stop_reason` (slide 5), the field the whole agent loop hangs on. |
| 0:08-0:09 | 6 | Agents divider: five topics, ending on the live demo. Builds anticipation. |
| 0:09-0:13 | 7-8 | The loop code. Let them read it, it's 25 lines of real JavaScript. Click the highlighted `res.tool_call` and `messages.push` arguments to open the real payloads. Then workflows vs agents: *who decides the steps?* |
| 0:13-0:15 | 9 | Hub-and-spoke rules: isolated context, explicit passing, specialists never talk to each other. |
| 0:15-0:17 | 10 | What to watch for: spawn = tool call, the prompt is the subagent's whole universe, parallel spawns, tool_result back. Mention the hidden hook so they hunt for it. |
| 0:17-0:23 | 11 | **Click ▶ Run live immediately.** While it runs: point at the spawn arrows, click one spawn row and read the actual prompt aloud, point at tool calls under each node, then the results flying back. Finish on the Final report tab: real findings in real code. |
| 0:23-0:24 | 12 | CI/CD divider. |
| 0:24-0:28 | 13 | CI: run `npm run audit:headless` in a visible terminal if time allows, otherwise walk the yml. Punchline: "same agent, nobody at the keyboard." |
| 0:28-0:30 | 14 | Recap: seven sentences. Leave it on screen for questions. |

**If the live run misbehaves:** don't debug on stage. Hit Stop, click
▶ Run live once more. (The mock button exists for rehearsal; using it in class
undermines the "it's real" promise; your call.)
