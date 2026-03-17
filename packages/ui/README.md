# @hareru/ui

Semantic CSS component library for [Hareru UI](https://github.com/hareru-ai/ui).

[![npm](https://img.shields.io/npm/v/@hareru/ui)](https://www.npmjs.com/package/@hareru/ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

## Features

- **53 components** — Buttons, forms, overlays, navigation, data display, and AI chat UI
- **Semantic CSS** — BEM naming (`hui-*`) with CSS custom properties (`--hui-*`)
- **CVA variants** — Type-safe variant management with [class-variance-authority](https://cva.style/)
- **Accessible** — Built on [Base UI](https://base-ui.com/) primitives, WAI-ARIA compliant
- **forwardRef** — All components support ref forwarding
- **Theming** — Light and dark themes via `data-theme` attribute, zero-runtime CSS

## Installation

```bash
# npm
npm install @hareru/ui @hareru/tokens

# pnpm
pnpm add @hareru/ui @hareru/tokens

# yarn
yarn add @hareru/ui @hareru/tokens
```

Peer dependencies: `react` >= 19, `react-dom` >= 19

> **Note:** `@hareru/tokens` provides the CSS custom properties that `@hareru/ui` components reference.

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
        <CardTitle>Hello</CardTitle>
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

## Components

> This is a guide to the main components. All components, subcomponents, variant functions, and type exports are available from `@hareru/ui`. For the full public API, see [src/index.ts](https://github.com/hareru-ai/ui/blob/main/packages/ui/src/index.ts).

### Layout

| Component | Description |
|-----------|-------------|
| Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter | Semantic card container |
| BentoGrid, BentoGridItem | Drag-and-drop grid layout with presets |
| Separator | Horizontal or vertical divider |
| ScrollArea | Custom scrollbar container |
| Collapsible | Expandable content section |
| AspectRatio | Fixed aspect ratio container |

### Form

| Component | Description |
|-----------|-------------|
| Button | Primary action element with variants |
| Input | Text input field |
| Textarea | Multi-line text input |
| Select | Dropdown selection |
| Combobox | Searchable select with autocomplete |
| Switch | Toggle switch |
| Toggle | Toggle button with variants |
| Label | Form field label |
| FormField, FormFieldLabel, FormFieldControl, FormFieldMessage | Form field validation wrapper |

### Overlay

| Component | Description |
|-----------|-------------|
| Dialog | Modal dialog |
| AlertDialog | Confirmation dialog |
| Sheet | Slide-out panel |
| Popover | Floating content panel |
| Tooltip | Hover information |
| DropdownMenu | Context menu |
| Command | Command palette (cmdk) |

### Navigation

| Component | Description |
|-----------|-------------|
| Tabs | Tab navigation |
| NavigationMenu | Site navigation |

### Feedback

| Component | Description |
|-----------|-------------|
| Alert | Status message |
| Badge | Status indicator |
| Toast, Toaster | Notification system |
| Progress | Progress indicator |
| Skeleton | Loading placeholder |
| EmptyState | Empty content placeholder |

### Data Display

| Component | Description |
|-----------|-------------|
| Avatar | User avatar |
| Table | Data table with header, body, row, head, and cell |
| ReadonlyField | Non-editable field display |
| KeyValueList | Key-value pair list for metadata |
| FieldDiff | Side-by-side field comparison |
| AsyncComboboxField | Combobox with debounced async search |

### DI Domain

| Component | Description |
|-----------|-------------|
| MetricCard | Metric value display with freshness indicator |
| DefinitionBrowser | Tabbed browser for semantic models, metrics, and dimensions |
| DataQualityIndicator | Quality dimension scores with alert display |
| ConfidenceBadge | Confidence level badge |
| QueryFeedback | User feedback collector for query results |
| SemanticSuggest | Semantic suggestion list with evidence |

### AI / Chat

| Component | Description |
|-----------|-------------|
| ChatContainer | Chat UI wrapper |
| ChatMessage | Individual message bubble |
| ChatComposer | Message input with send button |
| StreamingText | Animated streaming text |
| ToolCallCard | Tool invocation display |
| ApprovalCard | Human-in-the-loop approval card |
| ReasoningPanel | AI reasoning step display |

### Hooks

| Hook | Description |
|------|-------------|
| useAGUIState | AG-UI protocol state manager with JSON Patch support |

## Links

- [Documentation](https://ui.hareru.ai/docs/components)
- [GitHub](https://github.com/hareru-ai/ui/tree/main/packages/ui)

## License

[MIT](../../LICENSE) — Copyright (c) 2026 MUSUBI Inc.
