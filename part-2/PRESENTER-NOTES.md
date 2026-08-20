# Run of show, 40 minutes

The restaurant is the teaching thread. Stay with it until the live demo ends.
The menu is a resource. Ordering and searching are tools. Planning lunch is a
prompt. Claude writes the ticket, Claude Code carries it, and the restaurant
MCP server does the work.

The deck now has 18 slides. It opens on the unanswered question from Part 1,
walks one restaurant order through MCP, covers configuration and recovery, and
then proves the whole story with the real server. `tool_choice` comes after
the demo as a short exam aside because it is easier to understand once the room
has seen an actual call.

## Register

The room is mixed. Some people build agents every day. Others have never called
a tool. Start with the second group.

- Say "Claude writes the ticket; your application sends it" every time the
  model and host start to blur together.
- Use the restaurant before the schema. Once the room can picture the order,
  show the JSON that carries it.
- Keep Claude Code and the MCP client distinct. Claude Code is the host. Its MCP
  client is the part that connects to the server.
- Treat trade-offs as choices. Match the primitive to the job, the scope to the
  owner, and the error to the next safe action.

## Before class

```bash
cd part-2/demo
npm install
npm run demo
```

Open http://127.0.0.1:4848/part-2/slides.html, press `F`, and run
**Rehearse** once. Then run `npm run protocol` in a terminal. It must finish
with a `done` event and exit without leaving the MCP server alive.

Use **Rehearse** from the published static link. **Run live** needs the local
demo server.

## Timing

| Time | Slides | Must-hit beat |
|---|---|---|
| 0:00-0:02 | 1 | Promise one complete trip: menu, order ticket, kitchen, receipt. Call back to Part 1: last time we gave Claude hands; today we find where those hands come from. |
| 0:02-0:05 | 2 | Ask who places the order if Claude only writes text. Click the tool request and result. Claude writes structured intent. Claude Code sends it. The MCP server runs it. |
| 0:05-0:08 | 3 | Define MCP through the standard order counter. Different systems expose different work, but discovery, requests, and results follow one protocol. |
| 0:08-0:11 | 4 | Resolve the naming problem. Claude Code is the host. The MCP client lives inside it. The restaurant MCP server is outside and runs the integration code. |
| 0:11-0:14 | 5 | Open the server. Tools act, resources inform, prompts start. Ask the room which primitive the menu should be before revealing it. |
| 0:14-0:17 | 6 | Follow discovery into `tools/call`. The model sees name, description, and schema, then writes the order ticket. It does not send the request itself. |
| 0:17-0:20 | 7 | Compare "Orders food" with the specific `place-order` description. The boundary sentence tells Claude when to read or search instead. |
| 0:20-0:22 | 8 | Land resources with the cleanest restaurant distinction: reading the menu does not create an order. |
| 0:22-0:24 | 9 | Show scope as containment. Your personal setup spans projects. A project config lives inside one shared project. Secrets stay in environment variables. |
| 0:24-0:28 | 10-11 | Make recovery concrete. Unknown item means read the menu and retry. No sushi means the search worked. Menu access denied means it did not. |
| 0:28-0:30 | 12 | Stop before the demo. Ask the room to predict the event order: discovery, menu read, successful order, empty search, failed order. |
| 0:30-0:35 | 13-14 | Run the trace. Read the sequence, then debrief it. Inspect one request, the successful receipt, and the structured error. |
| 0:35-0:37 | 15 | Pay back Part 1's `tool_choice` debt in one pass. `auto` allows text or a call, `any` requires some call, and a named tool requires that tool. |
| 0:37-0:38 | 16 | Prefer an existing maintained server for standard integrations. Build the narrow team-specific gap. Disconnect tools that no longer earn their place. |
| 0:38-0:40 | 17-18 | Close on exam reasoning. Primitive matches job. Scope matches owner. Structured errors support recovery. Leave slide 18 on screen for questions. |

## Spoken segues

Use these as handoffs, not as lines to memorize.

- Slide 2 to 3: "We know who does the work. Now we need a standard way to hand
  that work over."
- Slide 3 to 4: "The protocol is the counter. Who is standing on each side of
  it?"
- Slide 4 to 5: "Now open the restaurant server and look at what it can expose."
- Slide 5 to 6: "Having a menu of capabilities is useful only if Claude can
  discover it."
- Slide 6 to 7: "Claude can see every tool. The description is what gets the
  order to the right station."
- Slide 7 to 8: "Before we place an order, Claude may need to know what the
  restaurant serves."
- Slide 8 to 9: "The server makes sense. The exam now asks who should receive
  its configuration."
- Slide 9 to 10: "Once the server is connected, the next design question is
  what happens when the kitchen says no."
- Slide 11 to 12: "We have the pieces. Let's watch the real protocol carry
  them."
- Slide 14 to 15: "The demo let Claude choose the calls. The API can also
  require one."
- Slide 16 to 17: "Implementation choices change. The exam rules stay small."

## Interaction openings

- Slide 2: ask who thought Claude itself executed tools.
- Slide 5: ask whether a menu should be a tool or a resource.
- Slide 7: ask which description they would trust with a real payment.
- Slide 9: ask which team MCP belongs in `.mcp.json` and which personal
  experiment belongs in `~/.claude.json`.
- Slide 11: ask whether "no sushi" should trigger a retry.
- Slide 13: let the room choose which event payload to inspect first.

## Live demo recovery

- If **Run live** fails locally, click **Stop**, read the error event, and try
  once more.
- Use **Rehearse** from the start on a static link. It replays the same event
  shapes without starting a process.
- Do not remove **Rehearse**. It is the stage fallback.
- The demo does not call a model or external API. A failure is local process or
  dependency setup, not API quota.

## Debts from Part 1

Slide 15 pays back `tool_choice`. Say this out loud: "Last session I said we
would come back to `tool_choice`. This is it."

Hooks and context management remain separate topics. Name when they are coming
instead of squeezing them into this session.

## Questions worth leaving open

- When does a resource beat a discovery tool for your data?
- Which server would your team share at project scope today?
- Which error in your current system looks exactly like an empty result?
