import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export type DemoEvent = {
  t: string;
  [key: string]: unknown;
};

type Emit = (event: DemoEvent) => void;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('stopped'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('stopped'));
    }, { once: true });
  });
}

function textFromContent(content: unknown): string {
  if (!Array.isArray(content)) return '';
  return content
    .filter((block): block is { type: 'text'; text: string } =>
      Boolean(block && typeof block === 'object' && 'type' in block && block.type === 'text' && 'text' in block))
    .map(block => block.text)
    .join('\n');
}

export async function runProtocol(emit: Emit, signal?: AbortSignal, delayMs = 650): Promise<void> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const demoDir = path.resolve(here, '..');
  const serverPath = path.join(here, 'mcp-server.ts');
  const client = new Client({ name: 'ccaf-live-demo', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', serverPath],
    cwd: demoDir,
    stderr: 'pipe'
  });

  try {
    emit({ t: 'status', msg: 'launching a real stdio MCP server...' });
    emit({ t: 'connect', transport: 'stdio', command: `npx tsx ${path.relative(demoDir, serverPath)}` });
    await client.connect(transport);
    await sleep(delayMs, signal);
    emit({ t: 'initialized', client: 'ccaf-live-demo', server: 'ravn-service-catalog', protocol: 'negotiated by SDK' });

    const [{ tools }, { resources }, { prompts }] = await Promise.all([
      client.listTools(),
      client.listResources(),
      client.listPrompts()
    ]);
    await sleep(delayMs, signal);
    emit({
      t: 'discovery',
      tools: tools.map(tool => ({ name: tool.name, description: tool.description, inputSchema: tool.inputSchema })),
      resources: resources.map(resource => ({ name: resource.name, uri: resource.uri, description: resource.description })),
      prompts: prompts.map(prompt => ({ name: prompt.name, description: prompt.description, arguments: prompt.arguments }))
    });

    await sleep(delayMs, signal);
    emit({ t: 'resource_request', method: 'resources/read', uri: 'ravn://services/catalog' });
    const catalog = await client.readResource({ uri: 'ravn://services/catalog' });
    emit({ t: 'resource_result', uri: 'ravn://services/catalog', contents: catalog.contents });

    await sleep(delayMs, signal);
    const successCall = { name: 'lookup-service', arguments: { service: 'checkout-api' } };
    emit({ t: 'tool_request', method: 'tools/call', call: successCall, note: 'valid call' });
    const success = await client.callTool(successCall);
    emit({
      t: 'tool_result',
      name: successCall.name,
      isError: Boolean(success.isError),
      text: textFromContent(success.content)
    });

    await sleep(delayMs, signal);
    const emptyCall = { name: 'search-runbooks', arguments: { query: 'fax' } };
    emit({ t: 'tool_request', method: 'tools/call', call: emptyCall, note: 'valid empty result' });
    const empty = await client.callTool(emptyCall);
    emit({
      t: 'tool_result',
      name: emptyCall.name,
      isError: Boolean(empty.isError),
      text: textFromContent(empty.content)
    });

    await sleep(delayMs, signal);
    const failureCall = { name: 'lookup-service', arguments: { service: 'ghost-api' } };
    emit({ t: 'tool_request', method: 'tools/call', call: failureCall, note: 'recoverable tool error' });
    const failure = await client.callTool(failureCall);
    emit({
      t: 'tool_result',
      name: failureCall.name,
      isError: Boolean(failure.isError),
      text: textFromContent(failure.content)
    });

    await sleep(delayMs, signal);
    const prompt = await client.getPrompt({
      name: 'triage-incident',
      arguments: { service: 'checkout-api', symptom: 'payment authorization rate dropped below 90%' }
    });
    emit({ t: 'prompt_result', name: 'triage-incident', messages: prompt.messages });
    emit({ t: 'done', msg: 'connection closed cleanly' });
  } finally {
    await client.close().catch(() => undefined);
  }
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) {
  await runProtocol(event => console.log(JSON.stringify(event)), undefined, 0);
}
