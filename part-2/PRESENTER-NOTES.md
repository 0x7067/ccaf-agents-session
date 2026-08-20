# Run of show, 40 minutes

This is a rough outline, not a script. Hit the bold ideas and explain the gaps
in your own words. The deck is deliberately light enough to leave room for the
room.

Part 1 ran about 38 minutes of content inside a 57-minute slot, and this one is
budgeted about the same. The two check-in stops below are part of the plan, not
padding: both of Part 1's best moments came out of a stop.

## Register

The room is mixed. Some people build agents every day and some have never
called a tool. Assume the second group and the first group still learns
something.

- Slide 3 does the puncturing, the way Part 1 did it with agents. Do not skip
  it because it looks basic. For half the room, "how does a thing that only
  writes text edit my files?" is the actual unanswered question, and every
  schema after it floats without the answer.
- Reach for the analogy before the schema. Every band tagged **Analogy** is there
  to be narrated for thirty seconds, not read out.
- Say "last session" out loud whenever the deck calls back to Part 1. The
  callbacks only work if you name them: hands and map, the while loop, your code
  runs the tool, "refund unsuccessful".
- Trade-offs, not commandments. Part 1's closing line applies here too: find the
  simplest solution possible and only increase complexity when it is needed.

## Before class

```bash
cd part-2/demo
npm install
npm run demo
```

Open http://127.0.0.1:4848/part-2/slides.html, press `F`, and run **Rehearse**
once. Then run `npm run protocol` in a terminal. It must finish with a `done`
event and exit without leaving the MCP server alive.

## Timing

| Time | Slides | Must-hit beat |
|---|---|---|
| 0:00-0:02 | 1-2 | Name the promise: by the end, the room will watch a real MCP tool call succeed and fail. Open on the callback, we gave Claude hands last time, today we find out where the hands come from. |
| 0:02-0:05 | 3 | The question underneath everything. Claude chooses a tool but does not execute it. It emits a structured request; your application invokes the MCP server and puts the result back. Use the `checkout-api` lookup to make the loop concrete. |
| 0:05-0:10 | 4-6 | MCP is like USB-C for tools. Host, client, server. Land slide 6 on the callback: the loop has not changed since last session, only where the tools come from. |
| 0:10-0:17 | 7-10 | Walk one tool call from discovery to result. On slide 7, remind them your code runs the tool, not Claude. Spend the time on descriptions: the boundary sentence stops misrouting. On slide 9, say plainly that Part 1 deferred `tool_choice` and this is it. Close on hands and map. |
| 0:17-0:19 | — | **Stop. Ask the room.** "Any questions before we talk about where these servers live?" Wait through the silence. |
| 0:19-0:23 | 11 | Team setup means `.mcp.json`; personal setup means `~/.claude.json`. Secrets stay in environment variables. The room meets this as a binary choice on the test, so make the van and the garage stick. |
| 0:23-0:27 | 12-13 | A tool error stays readable by the model: category, retryability, attempted input, recovery guidance. Slide 12 is last session's "refund unsuccessful", so say so. Then slide 13: no toilet paper is an answer, a locked door is not. |
| 0:27-0:29 | — | **Stop. Ask the room.** Best place to catch anyone the schemas lost. |
| 0:29-0:34 | 14-15 | Land on slide 15 and click **Run live** immediately. The room plays the host. Read the discovery result, then narrate each `tools/call`. Click events to expose their payloads. |
| 0:34-0:35 | 16 | Debrief: schemas and JSON crossed the wire. The model supplies judgment; MCP supplies the contract. |
| 0:35-0:37 | 17 | Prefer an existing maintained server for a standard integration. Build only the unique team-specific gap. Disconnect what you do not need. Quote it the way Part 1 did: simplest solution first, complexity only when it is needed. |
| 0:37-0:40 | 18-21 | Close with exam reasoning. Primitive matches job; scope matches owner; structured errors make recovery possible. Leave slide 21 on screen for questions. |

## Improvisation openings

- On slide 1, ask who was here last time, so you know how hard to lean on the
  callbacks.
- On slide 3, ask whether anyone has wondered how Claude actually edits a file.
  Somebody always has. Most people have never heard the answer.
- On slide 3, click the tool call and the result to show what crosses the boundary.
- On slide 4, ask what integrations people have configured by hand before.
- On slide 5, ask whether a database schema should be a tool or a resource.
- On slide 8, ask the room which description they would trust with a refund,
  then ask which of their MCP tools an agent would skip in favor of `Grep`.
- On slide 9, ask who has forced a first tool call, and what broke without it.
- On slide 11, ask which of their team's servers belong in `.mcp.json` and which
  are personal enough to stay in `~/.claude.json`.
- On slide 15, let the room choose whether to inspect discovery, the successful
  call, the empty result, or the failed call first.

## Live demo recovery

- If **Run live** fails, click **Stop**, check the error event, then run it once
  more.
- If it fails again, use **Rehearse** and say clearly that the UI is replaying
  the same event shapes. Do not debug package installation on stage.
- The demo does not call a model or external API. A failure is local process or
  dependency setup, not API quota.

## Debts from Part 1

Part 1 deferred three topics on the record. Slide 9 pays back the first one, so
name it out loud: *"last session I said we would come back to `tool_choice`
later. This is later."*

Hooks and context management are still owed. Hooks are the sharper debt: the
Part 1 deck has the material (slide 12, the hooks dialog, and the `canUseTool`
callback in the demo code) but it was never walked on stage. Say when it is
coming rather than letting it lapse a second time.

## Questions worth leaving open

- When does a resource beat a discovery tool for your data?
- Which server would you share at project scope today?
- Which error in your current system is indistinguishable from zero results?
