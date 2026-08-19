# Run of show, 30 minutes

This is a rough outline, not a script. Hit the bold ideas and explain the gaps
in your own words. The deck is deliberately light enough to leave room for the
room.

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
| 0:00-0:02 | 1-2 | Name the promise: by the end, the room will watch a real MCP tool call succeed and fail. |
| 0:02-0:07 | 3-5 | MCP is the plug shape. The host owns the model loop, the client speaks MCP, and the server exposes capabilities. Tools act, resources inform, prompts start. |
| 0:07-0:12 | 6-8 | Walk one tool call from discovery to result. Spend the time on descriptions. The boundary sentence is what stops misrouting. Resources are the map; tools are the hands. |
| 0:12-0:15 | 9-10 | stdio is a local process; HTTP is a hosted endpoint. For the exam, team setup means `.mcp.json`; personal setup means `~/.claude.json`. Secrets stay in environment variables. |
| 0:15-0:18 | 11-12 | A tool error stays readable by the model. It needs category, retryability, attempted input, and recovery guidance. Hammer the difference between zero matches and a failed search. |
| 0:18-0:23 | 13-14 | Land on slide 14 and click **Run live** immediately. The room plays the host. Read the discovery result, then narrate each `tools/call`. Click events to expose their payloads. |
| 0:23-0:24 | 15 | Debrief: schemas and JSON crossed the wire. The model supplies judgment; MCP supplies the contract. |
| 0:24-0:26 | 16 | Prefer an existing maintained server for a standard integration. Build only the unique team-specific gap. Disconnect servers you do not need. |
| 0:26-0:30 | 17-20 | Close with exam reasoning. Primitive matches job; scope matches owner; structured errors make recovery possible. Leave slide 20 on screen for questions. |

## Improvisation openings

- On slide 3, ask what integrations people have configured by hand before.
- On slide 4, ask whether a database schema should be a tool or resource.
- On slide 7, ask the room which description they would trust with a refund.
- On slide 10, ask where they would put an experimental personal browser server.
- On slide 14, let the room choose whether to inspect discovery, the successful
  call, the empty result, or the failed call first.

## Live demo recovery

- If **Run live** fails, click **Stop**, check the error event, then run it once
  more.
- If it fails again, use **Rehearse** and say clearly that the UI is replaying
  the same event shapes. Do not debug package installation on stage.
- The demo does not call a model or external API. A failure is local process or
  dependency setup, not API quota.

## Questions worth leaving open

- When does a resource beat a discovery tool for your data?
- Which server would you share at project scope today?
- Which error in your current system is indistinguishable from zero results?
