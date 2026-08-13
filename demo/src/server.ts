/**
 * Demo server: serves the slide deck and streams audit events to it.
 *
 *   npm run demo          → http://localhost:4747  (deck + live visualizer)
 *
 * The browser connects to ws://localhost:4747/ws and sends:
 *   { cmd: "start" }  → run the REAL audit with the Claude Agent SDK
 *   { cmd: "mock" }   → replay a canned run (rehearsal, zero tokens)
 *   { cmd: "stop" }   → interrupt the current run
 *
 * The repo under audit defaults to ../przsend relative to this project's
 * parent, override with:  AUDIT_REPO=/path/to/repo npm run demo
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";
import { PORT, type DemoEvent } from "./events.js";
import { runAudit, type AuditHandle } from "./audit.js";
import { playMock } from "./mock.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLIDES = path.resolve(__dirname, "../..", "slides.html");
const REPO = process.env.AUDIT_REPO ?? path.resolve(process.env.HOME ?? "~", "dev/web/przsend");

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html" || req.url === "/slides.html") {
    try {
      const html = fs.readFileSync(SLIDES);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch {
      res.writeHead(500);
      res.end(`Could not read slides at ${SLIDES}`);
    }
    return;
  }
  res.writeHead(404);
  res.end("Not found");
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

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ t: "status", msg: `connected · repo: ${REPO}` } satisfies DemoEvent));

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
      broadcast({ t: "error", msg: `Repo not found: ${REPO} — set AUDIT_REPO` });
      return;
    }

    broadcast({ t: "status", msg: `LIVE RUN starting on ${REPO}` });
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
