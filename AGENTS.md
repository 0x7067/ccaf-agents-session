# AGENTS.md

## Course contract

This repository is a teaching kit for the Ravn CCAF study group. Optimize for
exam reasoning and a mixed room, including people who do not build agents every
day.

Treat each part as one instructional unit. Before changing a part, read its
source notes, slides, presenter notes, demo README, and demo code. A content
change is complete only when those artifacts use the same terms, examples,
order, and claims. If a part's topic or readiness changes, update both the root
`README.md` and `index.html`.

Teach the course's stated scope, not everything that is true about the product.
Map claims to the official study guide in the part's source notes. Record
deliberate exclusions there so a later edit does not quietly add them back. If
you remove a topic, remove stale notes and promises that imply the course still
covers it. Track a deferred promise in presenter notes until a later part pays
it back.

## Teaching voice

Start with the mechanism a newcomer needs, then show its schema or protocol
payload. Use direct, conversational copy and one running analogy that does real
explanatory work. Keep slang in presenter notes because the deck is shared as a
standalone link.

Name callbacks to earlier parts. Do not assume the audience remembers them. In
Part 2, keep this boundary explicit:

1. Claude writes a tool name and arguments.
2. Claude Code, the host, sends the request through its MCP client.
3. The SDK adds the JSON-RPC envelope.
4. The MCP server runs the integration code and returns the result.

Do not say or imply that Claude executes tools, touches external systems, or
constructs the full JSON-RPC request.

## Part 2 restaurant model

Part 2 uses one restaurant MCP from first explanation through live demo. Keep
the Basil Bistro vocabulary and data aligned across every artifact:

- `restaurant://menu` is a resource. The host adds its read-only,
  informational contents to context. Reading it does not place an order.
- `place-order` and `search-menu` are tools. Their descriptions must state the
  boundary between acting, searching, and reading the known menu.
- `plan-lunch` is a reusable message template exposed by the server and chosen
  by a person through the host.
- `margherita-pizza` is the successful order, `sushi` is the successful empty
  search, and `truffle-pizza` is the recoverable failed order.

Preserve the difference between an empty result and a failure. The sushi search
returns zero matches with `isError: false`. The unknown item returns
`isError: true` with structured context that tells the model whether and how to
retry. A permission or protocol failure is not an empty business result.

Keep `tool_choice` separate from MCP configuration. The host sets `auto`,
`any`, or a forced named tool on the model API request. The MCP server does not
see that setting.

Keep the exam's two configuration scopes in this session. Team configuration
lives in `.mcp.json`; personal configuration lives in `~/.claude.json`. Mention
stdio only when describing how the demo actually runs. Leave transport
tradeoffs and Claude Code's additional local scope to a separate practitioner
session unless the source notes deliberately rescope Part 2.

## Narrative and deck layout

Introduce the protocol counter and the tools, resources, and prompts before the
host/client/server cast. Once the cast is clear, follow the order ticket through
discovery and execution. Show the real trace before the `tool_choice` exam
aside. This order prevents later payloads from depending on unexplained nouns.

When slide order changes, update the run-of-show timing, spoken segues,
interaction openings, slide count, and any navigation copy in the same change.
Use relative segues instead of hardcoded page numbers where possible.

Let cards, comparison panels, chat panels, and code blocks hug their content.
Use top alignment inside grids and center the group when the slide needs visual
balance. Equal-height stretching creates large empty boxes and can push content
into headings or footers.

Render every changed slide at 1600x1000, 1440x900, 1280x800, and 480px wide.
Check headings, footers, code, and the deepest visible text elements for
clipping or overflow. Container bounds alone missed wrapped and clipped content
on this branch. A deck change is complete when every slide remains readable at
all four sizes.

## Demo contract

The Part 2 demo must remain deterministic, local, and token-free. It uses a real
MCP client and server but no model, API key, or external service. Preserve
**Rehearse** as the stage fallback.

The event story has several copies. Update all of them when payloads, names, or
ordering change:

- `part-2/demo/src/mcp-server.ts` defines the real capabilities and results.
- `part-2/demo/src/run.ts` drives the real protocol trace.
- `part-2/demo/src/server.ts` contains the local mock replay.
- `part-2/slides.html` contains the static-link rehearsal data and visible
  payload examples.
- `part-2/demo/README.md`, `part-2/PRESENTER-NOTES.md`, and
  `part-2/notes/source-notes.md` describe the same sequence.

The stdio MCP server must reserve stdout for protocol traffic and send
diagnostics to stderr. Keep `.mcp.json.example` free of credentials and refer to
environment variables for secrets.

For a Part 2 demo change, run `npm run typecheck` and `npm run protocol` from
`part-2/demo`. The protocol run must emit discovery, the menu read, the three
tool outcomes, the prompt result, and a final `done` event, then exit without a
server process left behind. Exercise both **Rehearse** and **Run live** when the
deck or WebSocket event handling changes.
