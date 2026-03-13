# Hareru UI

A semantic design system built for agents.

![Hareru UI cover](./.github/assets/README_COVER.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## Features

- **Semantic CSS** — BEM naming (`hui-*`) and CSS custom properties (`--hui-*`). No Tailwind dependency.
- **Layered architecture** — Tokens, styles, and component behavior live in independent packages. Each layer is consumable on its own by both humans and AI agents.
- **DTCG tokens** — 150+ tokens in [W3C Design Token Community Group](https://design-tokens.github.io/community-group/format/) format with JSON Schema validation. A typed contract between designers, developers, and AI agents.
- **Zero-runtime theming** — Light and dark themes via `data-theme` attribute. Pure CSS, no JS runtime cost.
- **OKLCH colors** — Perceptually uniform color space with automatic dark theme generation.
- **Accessible components** — 40+ components built on [Base UI](https://base-ui.com/) primitives. WAI-ARIA compliant.
- **MCP server** — `@hareru/mcp` exposes design rules directly where AI agents operate via [Model Context Protocol](https://modelcontextprotocol.io/). Tokens, schema, and component registry are all queryable.
- **AG-UI chat components** — ChatContainer, StreamingText, ToolCallCard, and `useAGUIState` hook for building agent UIs with the [AG-UI protocol](https://ag-ui.com/).

## Installation

```bash
# npm
npm install @hareru/tokens @hareru/ui

# pnpm
pnpm add @hareru/tokens @hareru/ui

# yarn
yarn add @hareru/tokens @hareru/ui
```

Peer dependencies: `react` >= 19, `react-dom` >= 19

## Quick Start

### 1. Import CSS

Add the following two imports to your global CSS file:

```css
@import "@hareru/tokens/css";
@import "@hareru/ui/styles.css";
```

### 2. Set up the provider

```tsx
"use client"; // Required for Next.js App Router

import { ThemeProvider, Toaster } from "@hareru/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system">
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
```

### 3. Use components

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from "@hareru/ui";

function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hareru UI</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
        <Button variant="destructive">Delete</Button>
      </CardContent>
    </Card>
  );
}
```

All components are exported from `@hareru/ui`. There are no subpath imports.

## Packages

| Package | Description |
|---------|-------------|
| [`@hareru/tokens`](./packages/tokens) | Design tokens and CSS custom properties (DTCG format) |
| [`@hareru/ui`](./packages/ui) | 40+ React components with semantic CSS styling |
| [`@hareru/mcp`](./packages/mcp) | MCP server for AI agent integration |

## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

```bash
pnpm install    # Install dependencies
pnpm build      # Build all packages
pnpm test       # Run tests
pnpm lint       # Lint with Biome
```

## License

[MIT](./LICENSE) — Copyright (c) 2026 MUSUBI Inc.
