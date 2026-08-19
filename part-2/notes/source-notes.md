# Part 2 source notes

## Communication job

- Audience: Ravn engineers studying for the Claude Certified Architect
  Foundations exam, plus colleagues who do not build agents every day.
- Job: make MCP concrete enough that the audience can reason through exam
  scenarios and recognize the protocol in a real tool call.
- Form: 30-minute browser-native deck with one deterministic local demo.
- Register: the same direct, conversational style as Part 1. Use one simple
  analogy, real payloads, and enough open space for improvisation.

## Sources

### Ravn study guide

https://ravnhq.github.io/claude-certified-architect/guides/en.html

Chapter 4 supplies the exam-level scope:

- MCP exposes tools, resources, and prompts.
- Project configuration belongs in `.mcp.json`; personal or experimental
  configuration belongs in `~/.claude.json`.
- Secrets are referenced through environment variables.
- Tool failures use `isError: true`; useful failures include enough context for
  retry, correction, or escalation.
- A resource can provide a catalog or schema without exploratory tool calls.

### Claude Code MCP documentation

https://code.claude.com/docs/en/mcp

Current Claude Code adds three practical details beyond the exam guide:

- local scope is private to one user in one project;
- user scope is private to one user across projects;
- project scope writes `.mcp.json` and requires workspace trust and server
  approval after cloning.

The deck keeps the exam answer prominent and labels local scope as current
Claude Code behavior.

### Official MCP TypeScript SDK

https://github.com/modelcontextprotocol/typescript-sdk

The demo uses the v2 packages implementing the 2026-07-28 MCP specification:

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
