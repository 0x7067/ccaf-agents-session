# Part 2 source notes

## Communication job

- Audience: Ravn engineers studying for the Claude Certified Architect
  Foundations exam, plus colleagues who do not build agents every day.
- Job: make MCP concrete enough that the audience can reason through exam
  scenarios and recognize the protocol in a real tool call.
- Form: 30-minute browser-native deck with one deterministic local demo.
- Register: the same direct, conversational style as Part 1, pitched at the
  half of the room that does not build agents daily. Puncture the buzzword
  first, reach for the everyday analogy before the schema, and let the payloads
  follow. Slang stays in the delivery, not on the slides: the deck gets shared
  as a link afterwards.
- Continuity: the deck names its callbacks to Part 1 rather than assuming them.
  Tools gave Claude hands, so a resource gives it a map. The loop is the same
  while loop. Your code runs the tool, not Claude. A dead-end `isError` is last
  session's "refund unsuccessful". The empty-versus-failed search extends the
  fridge the chef was already sent to.

## Sources

### Ravn study guide

https://ravnhq.github.io/claude-certified-architect/guides/en.html

Chapter 4 and Domain 2 supply the scope, and the deck stays inside it:

- MCP exposes tools, resources, and prompts.
- Project configuration belongs in `.mcp.json`; personal or experimental
  configuration belongs in `~/.claude.json`. The guide knows those two scopes
  and no others.
- Secrets are referenced through environment variables.
- Tool failures use `isError: true`; useful failures include enough context for
  retry, correction, or escalation.
- A resource can provide a catalog or schema without exploratory tool calls.
- Chapter 2.3 and Domain 2.3 supply slide 8: `tool_choice` is `auto`, `any`, or
  a forced named tool. Part 1 deferred this on the record, so Part 2 owes it.
- Chapter 2.2 adds the point slide 7 carries: an agent will prefer a built-in
  tool such as `Grep` over an MCP tool that sounds the same, so an MCP
  description has to name the data the built-in tool cannot reach. Domain 2.4
  states the same skill.

### Deliberate exclusions

Two topics that an MCP session would normally cover are left out on purpose,
because the exam guide does not carry them and the session exists to close exam
gaps:

- **Transports.** stdio versus HTTP is real and useful, but the guide never
  poses the trade-off, and its out-of-scope list rules out deploying or hosting
  MCP servers. The deck still says the demo runs over stdio, because it does.
- **Claude Code's `local` scope.** Current Claude Code has local, user, and
  project scopes. The guide has two, and the exam answer is binary:
  `.mcp.json` for the team, `~/.claude.json` for you. A third row taught on the
  day is a third option in the room's head on test day.

If this material is ever wanted, it belongs in a separate practitioner session,
not in the exam crash course.

### Official MCP TypeScript SDK

https://github.com/modelcontextprotocol/typescript-sdk

The demo runs on the v2 packages implementing the 2026-07-28 MCP
specification. This is provenance for the code, not material taught on the
day:

- `@modelcontextprotocol/server`
- `@modelcontextprotocol/client`
- `StdioServerTransport` and `StdioClientTransport`
- `registerTool`, `registerResource`, and `registerPrompt`
- `listTools`, `callTool`, `listResources`, `readResource`, `listPrompts`, and
  `getPrompt`

### MCP errors

https://ts.sdk.modelcontextprotocol.io/v2/servers/errors.html

- A tool error is a successful JSON-RPC result with `isError: true`. The model
  reads it and can recover.
- Resource and prompt failures are protocol errors handled by the MCP client.
- Returning `isError: true` explicitly gives the server control over the
  recovery message.

## Demo design

The room plays the host so the protocol stays visible. The demo deliberately
does not call a model. A real MCP client launches a real stdio server, performs
capability discovery, reads one resource, and makes three real tool calls:

1. `lookup-service` succeeds for `checkout-api`.
2. `search-runbooks` succeeds with zero results for `fax`.
3. `lookup-service` returns `isError: true` for `ghost-api` with a structured
   recovery hint.

This isolates the part under study. Model selection would sit between discovery
and `tools/call`, but every MCP operation shown is real.
