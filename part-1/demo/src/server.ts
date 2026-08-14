/**
 * Demo server: serves the whole course (index + every part-N/) and streams
 * audit events to the visualizer in part-1's deck.
 *
 *   npm run demo          → http://localhost:4747  (course index)
 *                           http://localhost:4747/part-1/slides.html
 *
 * The deck connects to ws://localhost:4747/ws and sends:
 *   { cmd: "start" }  → run the REAL audit with the Claude Agent SDK
 *   { cmd: "mock" }   → replay a canned run (rehearsal, zero tokens)
 *   { cmd: "stop" }   → interrupt the current run
 *
 * The repo under audit defaults to ~/dev/web/przsend,
 * override with:  AUDIT_REPO=/path/to/repo npm run demo
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";
import { PORT, type DemoEvent } from "./events.js";
import {
  runAudit,
  COORDINATOR_PROMPT,
  COORDINATOR_SYSTEM_PROMPT,
  COORDINATOR_ALLOWED_TOOLS,
  SUBAGENTS,
  type AuditHandle,
} from "./audit.js";
import { playMock } from "./mock.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// src → demo → part-1 → repo root (where index.html lives)
const ROOT = path.resolve(__dirname, "../../..");
const REPO = process.env.AUDIT_REPO ?? path.resolve(process.env.HOME ?? "~", "dev/web/przsend");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".json": "application/json",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]!);
  let filePath = path.normalize(path.join(ROOT, urlPath));
  
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, "index.html");
    const body = fs.readFileSync(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath).toLowerCase()] ?? "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end(`Not found: ${urlPath}`);
  }
});

const wss = new WebSocketServer({ server, path: "/ws" });

let current: { kind: "real"; handle: AuditHandle } | { kind: "mock"; cancel: () => void } | null =
  null;

function broadcast(e: DemoEvent) {
  const json = JSON.stringify(e);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(json);
  }
  // Mirror to the terminal so the run is observable server-side too.
  const line =
    e.t === "sub_tool"
      ? `[${e.t}] ${e.tool}(${e.detail})`
      : e.t === "spawn"
        ? `[${e.t}] ${e.agent}`
        : `[${e.t}]`;
  console.log(new Date().toISOString(), line);
}

async function stopCurrent() {
  if (!current) return;
  if (current.kind === "real") await current.handle.interrupt().catch(() => undefined);
  else current.cancel();
  current = null;
}

const DEFS_EVENT: DemoEvent = {
  t: "defs",
  coordinator: { systemPrompt: COORDINATOR_SYSTEM_PROMPT, allowedTools: COORDINATOR_ALLOWED_TOOLS },
  agents: Object.fromEntries(
    Object.entries(SUBAGENTS).map(([name, def]) => [
      name,
      {
        description: def.description,
        systemPrompt: def.prompt,
        tools: def.tools ?? [],
        model: def.model ?? "inherit",
      },
    ]),
  ),
};

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ t: "status", msg: `connected · repo: ${REPO}` } satisfies DemoEvent));
  ws.send(JSON.stringify(DEFS_EVENT));

  ws.on("message", async (raw) => {
    let cmd = "";
    try {
      cmd = (JSON.parse(String(raw)) as { cmd?: string }).cmd ?? "";
    } catch {
      return;
    }

    if (cmd === "stop") {
      await stopCurrent();
      broadcast({ t: "status", msg: "run stopped" });
      return;
    }

    if (cmd !== "start" && cmd !== "mock") return;
    await stopCurrent();

    if (cmd === "mock") {
      const cancel = playMock(broadcast);
      current = { kind: "mock", cancel };
      return;
    }

    if (!fs.existsSync(REPO)) {
      broadcast({ t: "error", msg: `Repo not found: ${REPO}, set AUDIT_REPO` });
      return;
    }

    broadcast({ t: "status", msg: `LIVE RUN starting on ${REPO}` });
    broadcast({ t: "coord_prompt", prompt: COORDINATOR_PROMPT });
    const handle = runAudit(REPO, broadcast);
    current = { kind: "real", handle };
    void handle.done.then(() => {
      if (current?.kind === "real" && current.handle === handle) current = null;
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n  CCAF demo ready → http://localhost:${PORT}\n  Auditing repo   → ${REPO}\n`);
});
