# Run of show, 30 minutes

**Before class (10 min, once):** `cd part-1/demo && npm install && npm run demo`,
open http://localhost:4747/part-1/slides.html, press `F` for fullscreen, click **Rehearse (mock)**
once to check the projector. Confirm `claude` is logged in (`claude -p "hi"`).

**Golden rule for timing:** click **▶ Run live** the moment you land on
slide 13, and narrate *while* it runs. The run takes ~2-4 min, which is exactly
the time you need to explain what's on screen. Never wait silently.

| Time | Slides | Beat |
|---|---|---|
| 0:00-0:02 | 1-2 | Title, then the Foundations divider: name the three topics so the room knows where this is going. |
| 0:02-0:08 | 3-5 | Foundations. Hammer the big one: every request is independent and the whole conversation goes up every time (slide 4). Then `stop_reason` (slide 5): the two cards on the top row are the segue to agents. |
| 0:08-0:09 | 6 | Agents divider: eight topics, ending on the takeaways. |
| 0:09-0:12 | 7 | The loop code. Click the highlighted arguments for the real payloads; the `is_error` bullet opens error handling. |
| 0:12-0:13 | 8 | Workflows vs agents: *who decides the steps?* |
| 0:13-0:14 | 9 | The Task tool: spawning a subagent is just another tool call. Click "subagent" for AgentDefinition. |
| 0:14-0:15 | 10 | Why subagents exist: context isolation is the headline. |
| 0:15-0:16 | 11 | Hub-and-spoke rules: isolated context, explicit passing, specialists never talk to each other. |
| 0:16-0:17 | 12 | What to watch for: map the demo to API terms. Mention the hidden hook so they hunt for it. |
| 0:17-0:22 | 13 | **Click ▶ Run live immediately.** While it runs: point at spawn arrows, click a spawn row and read the prompt aloud, then the results flying back. Finish on the Final report tab. |
| 0:22-0:24 | 14 | Takeaways: were subagents necessary (no, and say why they were still worth it), model per agent, the trade-offs card. Open the demo-code dialog if the room is engineer-heavy. |
| 0:24-0:29 | 15-18 | Summary divider, then one slide per chapter: the API, tools, agents. The material the deck didn't cover elsewhere hides in the dialogs (the context window, tool_choice, schema design rules): open the ones your room needs. |
| 0:29-0:30 | 19 | Recap: seven sentences. Leave it on screen for questions. |

**If the live run misbehaves:** don't debug on stage. Hit Stop, click
▶ Run live once more. (The mock button exists for rehearsal; using it in class
undermines the "it's real" promise; your call.)
