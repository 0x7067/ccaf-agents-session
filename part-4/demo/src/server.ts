import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, type WebSocket } from 'ws';
import { runScenario } from './run.js';
import { runRehearsal } from './mock.js';
import type { Scenario } from './events.js';
import { PORT } from './events.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const port = Number(process.env.PORT ?? PORT);

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const httpServer = createServer((request, response) => {
  let requestPath: string;
  try {
    requestPath = decodeURIComponent(new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`).pathname);
  } catch {
    response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Bad request');
    return;
  }
  const relative = requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, '');
  const candidate = path.resolve(repoRoot, relative);
  if (!candidate.startsWith(`${repoRoot}${path.sep}`) || !existsSync(candidate) || !statSync(candidate).isFile()) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  response.writeHead(200, { 'content-type': contentTypes[path.extname(candidate)] ?? 'application/octet-stream' });
  createReadStream(candidate).pipe(response);
});

const sockets = new Set<WebSocket>();
const webSockets = new WebSocketServer({ server: httpServer, path: '/ws' });
let controller: AbortController | undefined;
let activeRun: Promise<void> | undefined;

function broadcast(event: unknown): void {
  const payload = JSON.stringify(event);
  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) socket.send(payload);
  }
}

async function stopCurrent(): Promise<void> {
  const run = activeRun;
  controller?.abort();
  await run;
  if (activeRun === run) {
    activeRun = undefined;
    controller = undefined;
  }
}

webSockets.on('connection', socket => {
  sockets.add(socket);
  socket.send(JSON.stringify({ t: 'status', msg: 'connected, ready' }));

  socket.on('message', async raw => {
    let message: { cmd?: string; scenario?: string };
    try {
      message = JSON.parse(raw.toString()) as { cmd?: string; scenario?: string };
    } catch {
      return;
    }
    if (message.cmd === 'stop') {
      await stopCurrent();
      broadcast({ t: 'status', msg: 'stopped' });
      return;
    }
    if (message.cmd !== 'start' && message.cmd !== 'mock') return;
    await stopCurrent();
    const scenario = message.scenario === 'support' ? 'support' : 'research';
    const runController = new AbortController();
    controller = runController;
    const run = (async () => {
      try {
        if (message.cmd === 'mock') await runRehearsal(scenario, broadcast, runController.signal);
        else await runScenario(scenario as Scenario, broadcast, runController.signal);
      } catch (error) {
        const text = error instanceof Error ? error.message : String(error);
        if (text !== 'stopped') broadcast({ t: 'error', scenario, msg: text });
      }
    })();
    activeRun = run;
    try {
      await run;
    } finally {
      if (activeRun === run) {
        activeRun = undefined;
        controller = undefined;
      }
    }
  });

  socket.on('close', () => sockets.delete(socket));
});

httpServer.listen(port, '127.0.0.1', () => {
  console.log(`CCAF Part 4 demo: http://127.0.0.1:${port}/part-4/slides.html`);
});
