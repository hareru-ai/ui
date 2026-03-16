# @hareru/mcp

MCP server for [Hareru UI](https://github.com/hareru-ai/ui) — exposes design tokens, component registry, and usage rules to AI agents via [Model Context Protocol](https://modelcontextprotocol.io/).

[![npm](https://img.shields.io/npm/v/@hareru/mcp)](https://www.npmjs.com/package/@hareru/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

## Features

- **6 resources** — Tokens, token schema, component registry, component schema, task bundles, and consumer rules
- **5 tools** — Component usage, bundle usage, token validation, CSS mode recommendation, and group filtering
- **3 prompts** — UI generation, Tailwind coexistence, and consumer rules
- **stdio transport** — Works with Claude Desktop, Cursor, and any MCP-compatible client

## Installation

```bash
# npm
npm install @hareru/mcp

# pnpm
pnpm add @hareru/mcp
```

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hareru-ui": {
      "command": "npx",
      "args": ["@hareru/mcp"]
    }
  }
}
```

## Resources

| URI | Description |
|-----|-------------|
| `hareru-ui://tokens` | DTCG design tokens (light/dark themes, 150+ CSS custom properties) |
| `hareru-ui://tokens/schema` | JSON Schema for design tokens — CSS variable enums and type constraints |
| `hareru-ui://components` | Component registry — 51 components with CVA variants, Props, states, a11y, examples, and slot contracts |
| `hareru-ui://components/schema` | JSON Schema for the component registry |
| `hareru-ui://bundles` | Task bundles — curated component sets for common UI patterns |
| `hareru-ui://rules/consumer` | Consumer rules for AI agents — import patterns, styling rules, and token reference |

## Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `get-component-usage` | Get usage docs for a component — import, variants, props, JSX example, states, accessibility, examples, and Structure (slot tree for compound components) when available | `componentName` (string) |
| `get-bundle-usage` | Get usage docs for a task bundle — components, CSS imports, and token categories | `bundleName` (string) |
| `validate-token-value` | Validate a CSS value against the token schema | `tokenType` (string), `value` (string) |
| `recommend-css-mode` | Recommend the best CSS import mode based on project context | `hasTailwind` (boolean), `componentCount` (number), `hasExistingReset?` (boolean) |
| `list-components-by-group` | List components filtered by group | `group` (enum: core, form, layout, overlay, navigation, feedback, data-display, agent, di-domain) |

## Prompts

| Prompt | Description | Parameters |
|--------|-------------|------------|
| `create-ui` | Generate a UI component using Hareru UI design system | `description` (string), `framework?` (string) |
| `create-ui-tailwind` | Generate a component mixing Hareru UI and Tailwind CSS with Cascade Layer guidance | `description` (string) |
| `consumer-rules` | Get the rules for using Hareru UI in your project | — |

## Programmatic Usage

```ts
import { createServer } from "@hareru/mcp";

const server = createServer();

// Connect with stdio transport
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Testing with InMemoryTransport

```ts
import { createServer } from "@hareru/mcp";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const client = new Client({ name: "test", version: "1.0.0" });
const server = createServer();
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

await Promise.all([
  client.connect(clientTransport),
  server.connect(serverTransport),
]);

const result = await client.callTool({
  name: "get-component-usage",
  arguments: { componentName: "Button" },
});
```

## Links

- [Documentation](https://ui.hareru.ai/docs/mcp-server)
- [GitHub](https://github.com/hareru-ai/ui/tree/main/packages/mcp)

## License

[MIT](../../LICENSE) — Copyright (c) 2026 MUSUBI Inc.
