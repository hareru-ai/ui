# @hareru/registry

Shared registry types, loaders, and CSS mode recommendation for [Hareru UI](https://github.com/hareru-ai/ui).

[![npm](https://img.shields.io/npm/v/@hareru/registry)](https://www.npmjs.com/package/@hareru/registry)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

## Overview

`@hareru/registry` is the shared contract layer used by `@hareru/mcp` and `@hareru/cli`. It provides:

- **Type definitions** — `ComponentEntry`, `TaskBundle`, `CssMode`, `ConsumerRulesJSON`, `StateDef`, `A11yDef`, `ExampleDef`, and 10+ other types
- **Artifact loaders** — `loadRegistry()`, `loadTokens()`, `loadSchema()`, `loadConsumerRules()`, `loadComponentSchema()`
- **CSS mode recommendation** — `recommendCssMode()` shared function with `CSS_MODES` and `CSS_MODE_DESCRIPTIONS`

## Installation

```bash
npm install @hareru/registry
```

> Most users do not need to install this package directly. It is a dependency of `@hareru/mcp` and `@hareru/cli`.

## Usage

```ts
import {
  loadRegistry,
  recommendCssMode,
  CSS_MODES,
  type ComponentEntry,
  type CssMode,
} from "@hareru/registry";

// Load the component registry
const registry = loadRegistry();
console.log(registry.components.length); // 49

// Recommend a CSS mode
const { mode, reason } = recommendCssMode({
  hasTailwind: true,
  componentCount: 10,
});
console.log(mode); // 'tailwind'
```

## CSS Mode Recommendation

The `recommendCssMode()` function suggests the best CSS import strategy based on project context:

| Context | Recommended Mode |
|---------|-----------------|
| Tailwind CSS detected | `tailwind` |
| 1–3 components used | `per-component` |
| Existing CSS reset/framework | `portable` |
| Default | `standalone` |

## Links

- [Documentation](https://ui.hareru.ai/docs)
- [MCP Server](../mcp)
- [CLI](../cli)

## License

[MIT](../../LICENSE) — Copyright (c) 2026 MUSUBI Inc.
