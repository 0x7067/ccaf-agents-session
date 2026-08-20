# Part 2 live MCP demo

This demo starts a real local MCP server over stdio, connects a real MCP client,
discovers the server's tools, resources, and prompts, and then performs three
tool calls:

1. a successful `place-order` call for a margherita pizza;
2. a successful `search-menu` call with zero results for sushi;
3. a failed order for an unknown item, returned as structured `isError: true`
   content.

No model or API key is involved. During the presentation, the room plays the
host and follows an order through the restaurant MCP. The client/server
protocol exchange is real and uses the official MCP TypeScript SDK.

## Run the deck

```bash
cd part-2/demo
npm install
npm run demo
```

Open http://127.0.0.1:4848/part-2/slides.html. On the demo slide, click **Run
live**. Use **Rehearse** for a canned replay before the session.

## Run the protocol in the terminal

```bash
npm run protocol
```

This prints every event as newline-delimited JSON and exits after the client
closes the spawned MCP server.

## Connect the server to Claude Code

The deck does not change your Claude configuration. To try the same server in
Claude Code, copy `.mcp.json.example` to the repository root as `.mcp.json`,
review it, then start Claude Code and approve the project server.

Never put credentials in `.mcp.json`. Reference environment variables instead.
