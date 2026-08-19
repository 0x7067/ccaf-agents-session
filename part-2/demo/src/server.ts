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
  { t: 'initialized', client: 'ccaf-live-demo', server: 'ravn-service-catalog', protocol: 'negotiated by SDK' },
  {
    t: 'discovery',
    tools: [
      { name: 'lookup-service', description: 'Look up one Ravn service by its exact catalog name.', inputSchema: { type: 'object', properties: { service: { type: 'string' } }, required: ['service'] } },
      { name: 'search-runbooks', description: 'Search the runbook catalog by a short incident keyword.', inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } }
    ],
    resources: [{ name: 'service-catalog', uri: 'ravn://services/catalog' }],
    prompts: [{ name: 'triage-incident', description: 'Start an incident triage with a known service and symptom.' }]
  },
  { t: 'resource_request', method: 'resources/read', uri: 'ravn://services/catalog' },
  { t: 'resource_result', uri: 'ravn://services/catalog', contents: [{ uri: 'ravn://services/catalog', text: '{ "checkout-api": { "owner": "Payments team", "tier": 1 } }' }] },
  { t: 'tool_request', method: 'tools/call', call: { name: 'lookup-service', arguments: { service: 'checkout-api' } }, note: 'valid call' },
  { t: 'tool_result', name: 'lookup-service', isError: false, text: '{ "service": "checkout-api", "owner": "Payments team", "tier": 1 }' },
  { t: 'tool_request', method: 'tools/call', call: { name: 'search-runbooks', arguments: { query: 'fax' } }, note: 'valid empty result' },
  { t: 'tool_result', name: 'search-runbooks', isError: false, text: '{ "resultCount": 0, "matches": [] }' },
  { t: 'tool_request', method: 'tools/call', call: { name: 'lookup-service', arguments: { service: 'ghost-api' } }, note: 'recoverable tool error' },
  { t: 'tool_result', name: 'lookup-service', isError: true, text: '{ "errorCategory": "validation", "isRetryable": true, "message": "Read the catalog and retry with an exact name." }' },
  { t: 'prompt_result', name: 'triage-incident', messages: [{ role: 'user', content: { type: 'text', text: 'Triage checkout-api. First look up the service, then use its runbook and signals.' } }] },
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
