import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

const menu = {
  'margherita-pizza': {
    name: 'Margherita pizza',
    description: 'Tomato, mozzarella, and basil',
    price: 14,
    tags: ['vegetarian', 'pizza']
  },
  'mushroom-risotto': {
    name: 'Mushroom risotto',
    description: 'Arborio rice, mushrooms, parmesan, and herbs',
    price: 17,
    tags: ['vegetarian', 'gluten-free']
  },
  'chocolate-cake': {
    name: 'Chocolate cake',
    description: 'Dark chocolate cake with vanilla cream',
    price: 8,
    tags: ['dessert', 'vegetarian']
  }
} as const;

type MenuItemId = keyof typeof menu;

export function createServer(): McpServer {
  const server = new McpServer({ name: 'basil-bistro', version: '1.0.0' });

  server.registerResource(
    'menu',
    'restaurant://menu',
    {
      title: 'Basil Bistro menu',
      description: 'A read-only menu with item IDs, names, descriptions, prices, and dietary tags.',
      mimeType: 'application/json'
    },
    async uri => ({
      contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(menu, null, 2) }]
    })
  );

  server.registerTool(
    'place-order',
    {
      title: 'Place one restaurant order',
      description:
        'Place one restaurant order by exact item ID from restaurant://menu. Returns the order ID, accepted items, total, and ETA. Read the menu first when the item ID is uncertain. Do not use this tool to browse or search the menu.',
      inputSchema: z.object({
        itemId: z.string().min(1).describe('Exact item ID, for example margherita-pizza'),
        quantity: z.number().int().min(1).max(12).describe('Number of this item to order, from 1 to 12')
      })
    },
    async ({ itemId, quantity }) => {
      const item = menu[itemId as MenuItemId];
      if (!item) {
        return {
          isError: true,
          content: [{
            type: 'text',
            text: JSON.stringify({
              errorCategory: 'validation',
              isRetryable: true,
              message: `Unknown item "${itemId}". Read restaurant://menu and retry with an exact item ID.`,
              attemptedInput: { itemId, quantity },
              partialResults: null
            }, null, 2)
          }]
        };
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            orderId: 'ord-1042',
            status: 'accepted',
            items: [{ itemId, name: item.name, quantity }],
            total: item.price * quantity,
            etaMinutes: 18
          }, null, 2)
        }]
      };
    }
  );

  server.registerTool(
    'search-menu',
    {
      title: 'Search the menu',
      description:
        'Search menu names, descriptions, and dietary tags by a short food keyword. Returns zero or more matching item IDs. A zero-result response is a successful search, not an error. Use place-order when the exact item ID is already known.',
      inputSchema: z.object({
        query: z.string().min(2).describe('Food or dietary keyword, for example pizza or vegetarian')
      })
    },
    async ({ query }) => {
      const normalized = query.toLowerCase();
      const matches = Object.entries(menu)
        .filter(([itemId, item]) =>
          `${itemId} ${item.name} ${item.description} ${item.tags.join(' ')}`.toLowerCase().includes(normalized))
        .map(([itemId, item]) => ({ itemId, name: item.name, price: item.price, tags: item.tags }));

      return {
        content: [{ type: 'text', text: JSON.stringify({ resultCount: matches.length, matches }, null, 2) }]
      };
    }
  );

  server.registerPrompt(
    'plan-lunch',
    {
      title: 'Plan lunch for a group',
      description: 'Start a lunch plan for a group with dietary needs.',
      argsSchema: z.object({
        partySize: z.string().describe('Number of people'),
        dietaryNeeds: z.string().describe('Dietary needs or none')
      })
    },
    ({ partySize, dietaryNeeds }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Plan lunch for ${partySize} people. Dietary needs: ${dietaryNeeds}. Read restaurant://menu before suggesting items.`
        }
      }]
    })
  );

  return server;
}

void serveStdio(createServer);
console.error('basil-bistro MCP server running on stdio');
