import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { loadConsumerRules, loadRegistry, loadSchema, loadTokens } from './utils.js';

export function registerResources(server: McpServer): void {
  const schema = loadSchema();
  const tokenCount = schema.properties.tokenCount.const;
  const registry = loadRegistry();

  server.resource(
    'tokens',
    'hareru-ui://tokens',
    {
      description: `DTCG design tokens (light/dark themes, ${tokenCount} CSS custom properties)`,
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: JSON.stringify(loadTokens(), null, 2) }],
    }),
  );

  server.resource(
    'tokens-schema',
    'hareru-ui://tokens/schema',
    {
      description: 'JSON Schema for design tokens — CSS variable enums and type constraints',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: JSON.stringify(loadSchema(), null, 2) }],
    }),
  );

  server.resource(
    'components',
    'hareru-ui://components',
    {
      description: `Component registry — ${registry.componentCount} components with CVA variants and Props interfaces`,
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: JSON.stringify(registry, null, 2) }],
    }),
  );

  server.resource(
    'consumer-rules',
    'hareru-ui://rules/consumer',
    {
      description:
        'Consumer rules for AI agents — import patterns, styling rules, and token reference',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: JSON.stringify(loadConsumerRules(), null, 2) }],
    }),
  );
}
