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
- **Accessible components** — 53 components built on [Base UI](https://base-ui.com/) primitives. WAI-ARIA compliant.
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

**A. Standalone** (Hareru-only app — one import, everything included):

```css
@import "@hareru/ui/styles.css";
```

**B. Portable** (alongside other frameworks — no global reset):

```css
@import "@hareru/tokens/css";
@import "@hareru/ui/styles/components.css";
@import "@hareru/ui/styles/scope.css"; /* opt-in: .hui-root subtree typography */
```

**C. Tailwind v4 coexistence** (recommended for Tailwind projects):

```css
@layer theme, base, hui, components, utilities;
@import "tailwindcss";
@import "@hareru/tokens/css";
@import "@hareru/ui/styles/components.layer.css";
@import "@hareru/ui/styles/scope.css"; /* opt-in */
```

**D. Per-component** (minimal bundle):

```css
@import "@hareru/tokens/css";
@import "@hareru/ui/styles/components/Button.css";
@import "@hareru/ui/styles/components/Card.css";
/* Add @hareru/ui/styles/animations.css when using StreamingText, ReasoningPanel, or ToolCallCard */
```

> `styles.css` already bundles tokens, so `@hareru/tokens/css` is not needed when using it.
>
> If your host app has no CSS reset, optionally add `@import "@hareru/ui/styles/baseline.css"` for `box-sizing: border-box` and form element font inheritance.

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

## CLI

```bash
# Initialize project (auto-detects framework + CSS mode)
npx @hareru/cli init --write

# Switch CSS mode
npx @hareru/cli update --mode portable --write

# List all components
npx @hareru/cli list

# Inspect a component
npx @hareru/cli info Button

# Generate CSS imports and append to your stylesheet
npx @hareru/cli add Button --write

# Specify CSS mode explicitly
npx @hareru/cli add Button --write --mode tailwind
```

## Packages

| Package | Description |
|---------|-------------|
| [`@hareru/tokens`](./packages/tokens) | Design tokens and CSS custom properties (DTCG format) |
| [`@hareru/ui`](./packages/ui) | 53 React components with semantic CSS styling |
| [`@hareru/registry`](./packages/registry) | Shared registry types, loaders, and CSS mode recommendation |
| [`@hareru/cli`](./packages/cli) | CLI for component management — init, update, list, info, add |
| [`@hareru/mcp`](./packages/mcp) | MCP server for AI agent integration (6 resources, 5 tools, 3 prompts) |

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
