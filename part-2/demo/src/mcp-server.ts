import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const services = {
  'checkout-api': {
    owner: 'Payments team',
    tier: 1,
    runbook: 'https://runbooks.ravn.example/checkout-api',
    signals: ['payment_authorization_rate', 'checkout_latency_p95']
  },
  'catalog-worker': {
    owner: 'Commerce team',
    tier: 2,
    runbook: 'https://runbooks.ravn.example/catalog-worker',
    signals: ['catalog_queue_depth', 'catalog_job_age']
  },
  'identity-gateway': {
    owner: 'Platform team',
    tier: 1,
    runbook: 'https://runbooks.ravn.example/identity-gateway',
    signals: ['login_success_rate', 'token_refresh_errors']
  }
} as const;

type ServiceName = keyof typeof services;

export function createServer(): McpServer {
  const server = new McpServer({ name: 'ravn-service-catalog', version: '1.0.0' });

  server.registerResource(
    'service-catalog',
    'ravn://services/catalog',
    {
      title: 'Ravn service catalog',
      description: 'A read-only map of service names, owners, tiers, runbooks, and key signals.',
      mimeType: 'application/json'
    },
    async uri => ({
      contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(services, null, 2) }]
    })
  );

  server.registerTool(
    'lookup-service',
    {
      title: 'Look up one service',
      description:
        'Look up one Ravn service by its exact catalog name. Returns the owning team, service tier, runbook URL, and key health signals. Use this when the service name is already known. Do not use it to search vague incident text; read the service catalog resource first when the name is uncertain.',
      inputSchema: z.object({
        service: z.string().min(1).describe('Exact service name, for example checkout-api')
      })
    },
    async ({ service }) => {
      const record = services[service as ServiceName];
      if (!record) {
        return {
          isError: true,
          content: [{
            type: 'text',
            text: JSON.stringify({
              errorCategory: 'validation',
              isRetryable: true,
              message: `Unknown service "${service}". Read ravn://services/catalog and retry with an exact name.`,
              attemptedInput: { service },
              partialResults: null
            }, null, 2)
          }]
        };
      }

      return {
        content: [{ type: 'text', text: JSON.stringify({ service, ...record }, null, 2) }]
      };
    }
  );

  server.registerTool(
    'search-runbooks',
    {
      title: 'Search runbook titles',
      description:
        'Search the runbook catalog by a short incident keyword. Returns zero or more matching service names and runbook URLs. A zero-result response is a successful search, not an error. Use lookup-service when you already know the exact service name.',
      inputSchema: z.object({
        query: z.string().min(2).describe('Incident or service keyword, for example checkout or login')
      })
    },
    async ({ query }) => {
      const normalized = query.toLowerCase();
      const matches = Object.entries(services)
        .filter(([name, record]) => `${name} ${record.owner} ${record.signals.join(' ')}`.toLowerCase().includes(normalized))
        .map(([service, record]) => ({ service, runbook: record.runbook }));

      return {
        content: [{ type: 'text', text: JSON.stringify({ resultCount: matches.length, matches }, null, 2) }]
      };
    }
  );

  server.registerPrompt(
    'triage-incident',
    {
      title: 'Triage an incident',
      description: 'Start an incident triage with a known service and symptom.',
      argsSchema: z.object({
        service: z.string().describe('Exact service name'),
        symptom: z.string().describe('Observed failure or degraded signal')
      })
    },
    ({ service, symptom }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Triage this incident. First look up the service, then use its runbook and signals.\n\nService: ${service}\nSymptom: ${symptom}`
        }
      }]
    })
  );

  return server;
}

void serveStdio(createServer);
console.error('ravn-service-catalog MCP server running on stdio');
