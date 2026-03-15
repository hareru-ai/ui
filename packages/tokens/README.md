# @hareru/tokens

Design tokens and CSS custom properties for [Hareru UI](https://github.com/hareru-ai/ui).

[![npm](https://img.shields.io/npm/v/@hareru/tokens)](https://www.npmjs.com/package/@hareru/tokens)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

## Features

- **DTCG format** — Tokens follow the [W3C Design Token Community Group](https://design-tokens.github.io/community-group/format/) specification
- **OKLCH colors** — Perceptually uniform color space with automatic dark theme generation
- **150+ CSS variables** — All prefixed with `--hui-*` for collision avoidance
- **Light & dark themes** — Zero-runtime switching via `data-theme` attribute
- **Multiple output formats** — CSS, DTCG JSON, and JSON Schema
- **Zero runtime** — Pure CSS, no JavaScript overhead

## Installation

```bash
# npm
npm install @hareru/tokens

# pnpm
pnpm add @hareru/tokens

# yarn
yarn add @hareru/tokens
```

## Usage

### Import the CSS theme

Add to your global CSS file:

```css
@import "@hareru/tokens/css";
```

This provides all `--hui-*` CSS custom properties with light and dark theme support.

### Use CSS variables

```css
.my-component {
  color: var(--hui-color-foreground);
  background-color: var(--hui-color-background);
  padding: var(--hui-spacing-4);
  border-radius: var(--hui-radius-md);
  font-family: var(--hui-font-family-sans);
  box-shadow: var(--hui-shadow-md);
}
```

### Access tokens programmatically

```ts
import { defaultTheme } from "@hareru/tokens/presets";
```

## Token Categories

| Category | Prefix | Examples |
|----------|--------|----------|
| Color | `--hui-color-*` | `primary`, `background`, `foreground`, `muted` |
| Spacing | `--hui-spacing-*` | `1` (0.25rem) through `16` (4rem) |
| Radius | `--hui-radius-*` | `sm`, `md`, `lg`, `full` |
| Font | `--hui-font-*` | `family-sans`, `size-base`, `weight-bold` |
| Typography | `--hui-typography-*` | `h1-font-size`, `body-line-height` |
| Shadow | `--hui-shadow-*` | `sm`, `md`, `lg`, `xl` |
| Duration | `--hui-duration-*` | `fast`, `normal`, `slow` |
| Easing | `--hui-easing-*` | `in`, `out`, `in-out` |
| Z-Index | `--hui-z-index-*` | `dropdown`, `modal`, `toast` |

## Output Formats

| Export | Path | Description |
|--------|------|-------------|
| CSS | `@hareru/tokens/css` | Theme stylesheet with all CSS custom properties |
| DTCG JSON | `@hareru/tokens/tokens.json` | W3C DTCG format token definitions |
| JSON Schema | `@hareru/tokens/tokens.schema.json` | Schema for token validation |
| Presets | `@hareru/tokens/presets` | TypeScript token objects (light/dark) |

## Customization

Override any token in your CSS:

```css
:root {
  --hui-color-primary: oklch(0.6 0.25 260);
  --hui-font-family-sans: 'Your Brand Font', system-ui, sans-serif;
  --hui-radius-md: 0.5rem;
}
```

## Links

- [Documentation](https://ui.hareru.ai/docs/tokens)
- [GitHub](https://github.com/hareru-ai/ui/tree/main/packages/tokens)

## License

[MIT](../../LICENSE) — Copyright (c) 2026 MUSUBI Inc.
