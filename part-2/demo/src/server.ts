import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, type WebSocket } from 'ws';
import { runProtocol, type DemoEvent } from './run.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const port = Number(process.env.PORT ?? 4848);

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

function broadcast(event: DemoEvent): void {
  const payload = JSON.stringify(event);
  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) socket.send(payload);
  }
}

const mockEvents: DemoEvent[] = [
  { t: 'status', msg: 'rehearsal replay, no process spawned' },
  { t: 'connect', transport: 'stdio', command: 'npx tsx src/mcp-server.ts' },
  { t: 'initialized', client: 'ccaf-live-demo', server: 'basil-bistro', protocol: 'negotiated by SDK' },
  {
    t: 'discovery',
    tools: [
      { name: 'place-order', description: 'Place one restaurant order by exact item ID from restaurant://menu.', inputSchema: { type: 'object', properties: { itemId: { type: 'string' }, quantity: { type: 'integer' } }, required: ['itemId', 'quantity'] } },
      { name: 'search-menu', description: 'Search menu names, descriptions, and dietary tags.', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } }
    ],
    resources: [{ name: 'menu', uri: 'restaurant://menu' }],
    prompts: [{ name: 'plan-lunch', description: 'Start a lunch plan for a group with dietary needs.' }]
  },
  { t: 'resource_request', method: 'resources/read', uri: 'restaurant://menu' },
  { t: 'resource_result', uri: 'restaurant://menu', contents: [{ uri: 'restaurant://menu', text: '{ "margherita-pizza": { "name": "Margherita pizza", "price": 14 } }' }] },
  { t: 'tool_request', method: 'tools/call', call: { name: 'place-order', arguments: { itemId: 'margherita-pizza', quantity: 1 } }, note: 'valid call' },
  { t: 'tool_result', name: 'place-order', isError: false, text: '{ "orderId": "ord-1042", "status": "accepted", "total": 14, "etaMinutes": 18 }' },
  { t: 'tool_request', method: 'tools/call', call: { name: 'search-menu', arguments: { query: 'sushi' } }, note: 'valid empty result' },
  { t: 'tool_result', name: 'search-menu', isError: false, text: '{ "resultCount": 0, "matches": [] }' },
  { t: 'tool_request', method: 'tools/call', call: { name: 'place-order', arguments: { itemId: 'truffle-pizza', quantity: 1 } }, note: 'recoverable tool error' },
  { t: 'tool_result', name: 'place-order', isError: true, text: '{ "errorCategory": "validation", "isRetryable": true, "message": "Read restaurant://menu and retry with an exact item ID." }' },
  { t: 'prompt_result', name: 'plan-lunch', messages: [{ role: 'user', content: { type: 'text', text: 'Plan lunch for 4 people. Dietary needs: one vegetarian. Read restaurant://menu before suggesting items.' } }] },
  { t: 'done', msg: 'rehearsal complete' }
];

async function replayMock(): Promise<void> {
  for (const event of mockEvents) {
    if (controller?.signal.aborted) return;
    broadcast(event);
    await new Promise(resolve => setTimeout(resolve, 420));
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
      if (message.cmd === 'start') await runProtocol(broadcast, controller.signal);
      else await replayMock();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg !== 'stopped') broadcast({ t: 'error', msg });
    }
  });

  socket.on('close', () => sockets.delete(socket));
});

httpServer.listen(port, '127.0.0.1', () => {
  console.log(`CCAF MCP demo: http://127.0.0.1:${port}/part-2/slides.html`);
});
