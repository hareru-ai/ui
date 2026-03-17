import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  loadComponentSchema,
  loadConsumerRules,
  loadRegistry,
  loadSchema,
  loadTokens,
} from './utils.js';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function resourceError(uri: URL, err: unknown) {
  return {
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify({ error: errorMessage(err) }),
      },
    ],
  };
}

export function registerResources(server: McpServer): void {
  // Pre-fetch description values (failures don't block server startup)
  let tokenCount: number | undefined;
  let componentCount: number | undefined;
  let bundleCount: number | undefined;
  try {
    tokenCount = loadSchema().properties.tokenCount.const;
  } catch {
    /* fallback description */
  }
  try {
    const reg = loadRegistry();
    componentCount = reg.componentCount;
    bundleCount = reg.taskBundles?.length ?? 0;
  } catch {
    /* fallback description */
  }

  server.resource(
    'tokens',
    'hareru-ui://tokens',
    {
      description:
        tokenCount !== undefined
          ? `DTCG design tokens (light/dark themes, ${tokenCount} CSS custom properties)`
          : 'DTCG design tokens (light/dark themes)',
      mimeType: 'application/json',
    },
    async (uri) => {
      try {
        return { contents: [{ uri: uri.href, text: JSON.stringify(loadTokens(), null, 2) }] };
      } catch (err) {
        return resourceError(uri, err);
      }
    },
  );

  server.resource(
    'tokens-schema',
    'hareru-ui://tokens/schema',
    {
      description: 'JSON Schema for design tokens — CSS variable enums and type constraints',
      mimeType: 'application/json',
    },
    async (uri) => {
      try {
        return { contents: [{ uri: uri.href, text: JSON.stringify(loadSchema(), null, 2) }] };
      } catch (err) {
        return resourceError(uri, err);
      }
    },
  );

  server.resource(
    'components',
    'hareru-ui://components',
    {
      description:
        componentCount !== undefined
          ? `Component registry — ${componentCount} components with CVA variants, Props interfaces, and slot contracts`
          : 'Component registry — components with CVA variants, Props interfaces, and slot contracts',
      mimeType: 'application/json',
    },
    async (uri) => {
      try {
        return { contents: [{ uri: uri.href, text: JSON.stringify(loadRegistry(), null, 2) }] };
      } catch (err) {
        return resourceError(uri, err);
      }
    },
  );

  server.resource(
    'bundles',
    'hareru-ui://bundles',
    {
      description:
        bundleCount !== undefined
          ? `Task bundles — ${bundleCount} curated component sets for common UI patterns`
          : 'Task bundles — curated component sets for common UI patterns',
      mimeType: 'application/json',
    },
    async (uri) => {
      try {
        const registry = loadRegistry();
        return {
          contents: [{ uri: uri.href, text: JSON.stringify(registry.taskBundles ?? [], null, 2) }],
        };
      } catch (err) {
        return resourceError(uri, err);
      }
    },
  );

  server.resource(
    'components-schema',
    'hareru-ui://components/schema',
    {
      description: 'JSON Schema for the component registry',
      mimeType: 'application/json',
    },
    async (uri) => {
      try {
        return {
          contents: [{ uri: uri.href, text: JSON.stringify(loadComponentSchema(), null, 2) }],
        };
      } catch (err) {
        return resourceError(uri, err);
      }
    },
  );

  server.resource(
    'consumer-rules',
    'hareru-ui://rules/consumer',
    {
      description:
        'Consumer rules for AI agents — import patterns, styling rules, and token reference',
      mimeType: 'application/json',
    },
    async (uri) => {
      try {
        return {
          contents: [{ uri: uri.href, text: JSON.stringify(loadConsumerRules(), null, 2) }],
        };
      } catch (err) {
        return resourceError(uri, err);
      }
    },
  );
}
