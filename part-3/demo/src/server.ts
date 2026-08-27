import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, type WebSocket } from 'ws';
import { runNightShift } from './run.js';
import { runRehearsal } from './mock.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const port = Number(process.env.PORT ?? 4949);

const contentTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

const httpServer = createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url ?? '/', `http://${request.headers.host}`).pathname);
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
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
let controller: AbortController | undefined;

function broadcast(event: unknown): void {
  const payload = JSON.stringify(event);
  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) socket.send(payload);
  }
}

wss.on('connection', socket => {
  sockets.add(socket);
  socket.send(JSON.stringify({ t: 'status', msg: 'connected, ready' }));

  socket.on('message', async raw => {
    let message: { cmd?: string };
    try {
      message = JSON.parse(raw.toString()) as { cmd?: string };
    } catch {
      return;
    }

    if (message.cmd === 'stop') {
      controller?.abort();
      broadcast({ t: 'status', msg: 'stopped' });
      return;
    }

    if (message.cmd !== 'start' && message.cmd !== 'mock') return;
    controller?.abort();
    controller = new AbortController();
    try {
      if (message.cmd === 'start') await runNightShift(broadcast, controller.signal);
      else await runRehearsal(broadcast, controller.signal);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg !== 'stopped') broadcast({ t: 'error', msg });
    }
  });

  socket.on('close', () => sockets.delete(socket));
});

httpServer.listen(port, '127.0.0.1', () => {
  console.log(`CCAF Claude Code demo: http://127.0.0.1:${port}/part-3/slides.html`);
});
