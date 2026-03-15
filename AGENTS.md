# Hareru UI — Agent Guide

Semantic CSS design system. pnpm monorepo. This file is the primary reference for AI agents working on this codebase.

## Project Overview

Hareru UI provides design tokens and React components using BEM CSS methodology with CSS custom properties. No Tailwind utility classes are used in components — all styling goes through `--hui-*` CSS variables generated from design tokens.

**Key principle**: Every style value must reference a `var(--hui-*)` token. Hardcoding colors, spacing, or other design values is always wrong.

## Project Structure

```
hareru-ui/
├── packages/
│   ├── tokens/              # @hareru/tokens
│   │   ├── src/
│   │   │   ├── tokens/      # Source token definitions (DTCG JSON)
│   │   │   ├── formats/     # Output formatters (CSS, Pencil)
│   │   │   └── index.ts     # Package entry: TokenGenerator, types
│   │   └── dist/            # Generated: CSS, JS, types
│   ├── ui/                  # @hareru/ui
│   │   ├── src/
│   │   │   ├── components/  # One directory per component
│   │   │   ├── lib/         # Utilities: cn(), etc.
│   │   │   └── index.ts     # Re-exports all components
│   │   └── dist/            # Generated: JS bundle, styles.css, types
│   ├── registry/            # @hareru/registry — shared types, loaders, CSS mode logic
│   │   └── src/
│   │       ├── types.ts     # Shared types (ComponentEntry, StateDef, A11yDef, etc.)
│   │       ├── loader.ts    # Artifact loaders (loadRegistry, loadTokens, etc.)
│   │       └── css-mode.ts  # CSS mode recommendation logic
│   ├── mcp/                 # @hareru/mcp
│   │   └── src/
│   │       ├── server.ts    # MCP server factory (createServer)
│   │       ├── resources.ts # 6 resources (tokens, schema, components, bundles, rules)
│   │       ├── tools.ts     # 5 tools
│   │       └── prompts.ts   # 3 prompts
│   └── cli/                 # @hareru/cli
│       └── src/
│           ├── index.ts     # CLI entry (commander)
│           └── utils/       # format, css-detector, css-writer, pkg-detector
├── apps/
│   ├── docs/                # Fumadocs documentation site (Next.js)
│   └── playground/          # Vite + React dev preview
├── biome.json               # Lint + format config
├── turbo.json               # Turborepo pipeline
└── pnpm-workspace.yaml
```

## Stack

- pnpm workspaces + Turborepo
- TypeScript ^5.7 (strict mode, no `any`)
- React 19
- tsup (library builds), Vite (playground)
- Biome (lint + format — not ESLint, not Prettier)
- Vitest + @testing-library/react
- Changesets (versioning)
- class-variance-authority (CVA), clsx
- Base UI (headless primitives)
- Commander (CLI)

## Executable Commands

```bash
pnpm build        # Build all packages via Turborepo
pnpm dev          # Start playground dev server
pnpm test         # Run all tests (vitest)
pnpm test:e2e     # Run Playwright E2E tests
pnpm lint         # biome check .
pnpm format       # biome format --write .
pnpm changeset    # Create a changeset for versioning
```

## Code Style & Patterns

### TypeScript

- Strict mode required. `any` is forbidden.
- Export all public types explicitly with names matching `ComponentNameProps`.
- No implicit returns in complex functions.

```typescript
// Good
export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  asChild?: boolean;
};

// Bad — no explicit type export, uses any
const handler = (e: any) => { ... };
```

### React Components

Every exported component must follow this exact pattern:

```typescript
import * as React from "react";

export type AccordionProps = React.HTMLAttributes<HTMLDivElement>;

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("hui-accordion", className)} {...props} />
  )
);
Accordion.displayName = "Accordion";

export { Accordion };
```

Rules:
- `forwardRef` on every exported component — no exceptions
- `displayName` must be set explicitly
- Props type exported as `ComponentNameProps`
- Use `cn()` from `../../lib/cn` for class merging
- No default exports — named exports only

### CSS

All CSS lives in a per-component `.css` file alongside the component source.

```css
/* Good */
.hui-button {
  background-color: var(--hui-color-primary);
  padding: var(--hui-spacing-2) var(--hui-spacing-4);
  border-radius: var(--hui-radius-md);
  font-size: var(--hui-font-size-sm);
  transition: background-color var(--hui-duration-fast) var(--hui-easing-out);
}

/* Bad — hardcoded values */
.hui-button {
  background-color: #3b82f6;
  padding: 8px 16px;
}
```

BEM naming rules:
- Block: `hui-{component}` (e.g., `hui-button`)
- Element: `hui-{component}__{element}` (e.g., `hui-card__header`)
- Modifier: `hui-{component}--{modifier}` (e.g., `hui-button--destructive`)

### CVA (class-variance-authority)

Use CVA for components with multiple variants:

```typescript
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva("hui-button", {
  variants: {
    variant: {
      default: "hui-button--default",
      destructive: "hui-button--destructive",
      outline: "hui-button--outline",
      secondary: "hui-button--secondary",
      ghost: "hui-button--ghost",
      link: "hui-button--link",
    },
    size: {
      sm: "hui-button--sm",
      md: "hui-button--md",
      lg: "hui-button--lg",
      icon: "hui-button--icon",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };
```

## Component Development Workflow

When adding a new component (e.g., `Accordion`):

1. Create `packages/ui/src/components/Accordion/Accordion.tsx`
2. Create `packages/ui/src/components/Accordion/Accordion.css`
3. Export from `packages/ui/src/index.ts`
4. Create `packages/ui/src/components/Accordion/Accordion.test.tsx`

### Component file structure

```typescript
// Accordion.tsx
import * as React from "react";
import { cn } from "../../lib/cn";
import "./Accordion.css";

export type AccordionProps = React.HTMLAttributes<HTMLDivElement>;

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("hui-accordion", className)} {...props} />
  )
);
Accordion.displayName = "Accordion";

export { Accordion };
```

## Token System

### CSS Variable Pattern

All tokens follow `--hui-{category}-{name}`:

| Category | Example |
|----------|---------|
| color | `--hui-color-primary`, `--hui-color-destructive-foreground` |
| spacing | `--hui-spacing-4` (= 1rem) |
| radius | `--hui-radius-md` |
| font | `--hui-font-size-sm`, `--hui-font-weight-semibold` |
| typography | `--hui-typography-h1-font-size` |
| shadow | `--hui-shadow-md` |
| duration | `--hui-duration-fast` (= 100ms) |
| easing | `--hui-easing-out` |
| z-index | `--hui-z-index-modal` |

### DEFAULT Key Rule

The `DEFAULT` key in token source expands to the parent name:

```
color.primary.DEFAULT → --hui-color-primary
shadow.DEFAULT        → --hui-shadow
```

### Package Exports (@hareru/tokens)

```typescript
import { TokenGenerator, defaultTheme } from "@hareru/tokens";   // JS/TS
// CSS:
// @import "@hareru/tokens/css";    → theme.css with all --hui-* variables
// @import "@hareru/tokens/presets"; → preset themes
```

## Design System

### Theme

Light/dark switching via `data-theme` attribute on `<html>`:

```css
:root { /* light (default) */ }
[data-theme="dark"] { /* dark override — color and shadow only */ }
```

Spacing, font, radius, duration, easing, and z-index are shared across themes.

To change theme programmatically, always use `useTheme()` from `@hareru/ui` — never set `data-theme` directly on the DOM.

### Color

All color values use OKLCH format: `oklch(L C H)`.

Semantic color set: `primary`, `secondary`, `destructive`, `warning`, `success`, `info`, `muted`, `accent`.

Each semantic color has sub-tokens: `DEFAULT` (omitted in variable name), `foreground`, `hover`.

For alpha colors: `color-mix(in oklch, var(--hui-color-primary) 50%, transparent)`.

### Typography

Composite tokens combine multiple font properties into named variants:

| Variant | Class |
|---------|-------|
| h1–h4 | `.hui-typography-h1` … `.hui-typography-h4` |
| body | `.hui-typography-body` |
| body-sm | `.hui-typography-body-sm` |
| caption | `.hui-typography-caption` |

Individual properties also available: `--hui-typography-h1-font-size`, `--hui-typography-h1-font-weight`, etc.

## CSS Import Patterns

Four modes are supported for consuming `@hareru/ui` styles:

| Mode | When to use |
|------|-------------|
| **Standalone** | Single CSS import — simplest, all styles bundled |
| **Portable** | Tokens + components split — useful when tokens are already loaded globally |
| **Tailwind v4** | Tailwind coexistence — cascade layer ordering avoids specificity conflicts |
| **Per-component** | Tokens + individual component CSS — minimal footprint, tree-shakeable |

```css
/* Standalone */
@import "@hareru/ui/styles.css";

/* Portable */
@import "@hareru/tokens/css";
@import "@hareru/ui/styles/components.css";

/* Tailwind v4 */
@layer hareru, tailwind;
@import "@hareru/tokens/css";
@import "@hareru/ui/components.layer.css";

/* Per-component */
@import "@hareru/tokens/css";
@import "@hareru/ui/components/Button/Button.css";
```

The CLI (`npx hareru add <component>`) automates this and writes the correct imports based on the detected project setup.

## Testing

Framework: Vitest + @testing-library/react

```typescript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./index";

describe("Button", () => {
  it("renders with default variant", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies destructive variant class", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    expect(container.firstChild).toHaveClass("hui-button--destructive");
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Click</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

Test coverage required for each component:
- Default rendering with correct BEM class
- Each variant / modifier class
- `className` prop merging (custom classes do not replace base classes)
- `disabled` state behavior
- `forwardRef` works
- User interaction (click, keyboard) where applicable

Prefer semantic queries: `getByRole`, `getByLabelText`, `getByText`. Avoid `container.querySelector`.

## Git Workflow

Conventional Commits format. All commit messages, code comments, and documentation must be written in English.

```
feat(ui): add Accordion component
fix(tokens): correct primary-hover oklch value
docs: update getting-started guide
chore: upgrade biome to 2.x
```

Every code change requires a changeset:

```bash
pnpm changeset        # Select package(s) and bump type (patch/minor/major)
# Commit the generated .changeset/*.md file along with your changes
```

### Sync Targets for Public Contract Changes

When modifying public API, registry fields, or generated artifacts, also update:

- `AGENTS.md` — this file (project structure, MCP/CLI/Registry sections)
- `.cursorrules` — AI agent rules
- `README.md` (root + affected packages) — feature lists, counts
- `apps/docs/content/docs/` — relevant documentation pages
- `packages/ui/data/consumer-rules.json` — if import/styling rules change

Verify hardcoded counts: `rg '\b\d+\+? components\b' -g '!**/dist/**' -g '!**/node_modules/**'`

## Token Validation

The MCP server exposes a `validate-token-value` tool. Use token type names from the schema:

```
color   → oklch(...) or color-mix(...)
spacing → <number>px or <number>rem
radius  → <number>px or <number>rem or 9999px
```

## Never Do

- Hardcode color, spacing, radius, or other design values in CSS — always use `var(--hui-*)`
- Use Tailwind utility classes inside component CSS or JSX
- Import across packages via file paths — use package exports only
- Skip `forwardRef` on any exported component
- Use `any` type in TypeScript
- Set `data-theme` on the DOM directly — use `setTheme()` from `useTheme()`
- Import from Base UI directly in application code — use Hareru UI wrappers
- Add a component without a corresponding test file
- Commit without a changeset when changing package source

## MCP Server (@hareru/mcp)

The MCP server exposes Hareru UI design rules to AI agents via stdio transport.

**Resources:**

| URI | Content |
|-----|---------|
| `hareru-ui://tokens` | DTCG design tokens (light/dark themes, 150+ CSS custom properties) |
| `hareru-ui://tokens/schema` | JSON Schema — CSS variable enums and type constraints |
| `hareru-ui://components` | Component registry — 49 components with variants, props, states, a11y, examples, and slot contracts |
| `hareru-ui://components/schema` | JSON Schema for component registry |
| `hareru-ui://bundles` | Task bundles — curated component sets for common UI patterns |
| `hareru-ui://rules/consumer` | Consumer rules — import patterns, styling rules, token reference |

**Tools:**

| Tool | Description |
|------|-------------|
| `get-component-usage` | Component usage docs — import, variants, props, states, accessibility, examples, slot tree |
| `get-bundle-usage` | Task bundle usage docs — components, CSS imports, token categories |
| `validate-token-value` | Check if a value is valid for a given token type |
| `recommend-css-mode` | Recommend CSS import mode based on project context |
| `list-components-by-group` | List components filtered by group |

**Prompts:**

| Prompt | Description |
|--------|-------------|
| `create-ui` | Generate UI using Hareru UI conventions |
| `create-ui-tailwind` | Generate UI with Tailwind + Hareru CSS coexistence |
| `consumer-rules` | Consumer project rules for Hareru UI |

**Claude Desktop configuration:**

```json
{
  "mcpServers": {
    "hareru-ui": {
      "command": "npx",
      "args": ["-y", "@hareru/mcp"]
    }
  }
}
```

## Registry (@hareru/registry)

Shared types and runtime utilities used by both `@hareru/mcp` and `@hareru/cli`. Has no React dependency.

**Types:** `ComponentEntry`, `StateDef`, `A11yDef`, `ExampleDef`, `SlotDef`, `TaskBundle`, `ConsumerRulesJSON`, and more.

`SlotDef` describes a single slot in a component's composition contract: `{ name, role, parent, expected, multiple }`. `role` is one of `trigger | content | container | item | label | description | action | separator | indicator | viewport | close | icon | input | submenu | anchor | control`.

**Loaders:** `loadTokens`, `loadSchema`, `loadRegistry`, `loadComponentSchema`, `loadConsumerRules` — read artifact JSON from the package's `dist/` at runtime.

**CSS mode:** `recommendCssMode()`, `CSS_MODES`, `CSS_MODE_DESCRIPTIONS` — shared logic for recommending an import mode from project context.

**Slot utilities:** `buildSlotTree(rootName, slots, notes?)` — renders a `SlotDef[]` as a formatted ASCII tree string (used by `get-component-usage` in the MCP server).

## CLI (@hareru/cli)

```bash
npx hareru list                  # List all available components
npx hareru info <name>           # Show component details
npx hareru add <name>            # Print CSS/JS snippets for a component
npx hareru add <name> --write    # Write files and inject CSS imports automatically
```

`add` supports four CSS modes via `--baseline` / `--layer` flags: `standalone`, `portable`, `tailwind`, `per-component`.

Key options: `--write`, `--json`, `--force`, `--css-file <path>`, `--scope <selector>`, `--baseline`, `--layer`.

`--write` safety: fails fast on missing `package.json`, broken JSON, or missing peer dependencies. Override with `--force`.

## Documentation Site (apps/docs)

Fumadocs (Next.js) documentation site at `apps/docs/`.

**Registry-driven sections:** Component pages use Server Components (`RegistryStates`, `RegistryA11y`, `RegistrySlots`) that render data from `@hareru/ui/component-registry.json` at build time. These are registered as MDX components via `page.tsx`.

- `apps/docs/lib/registry.ts` — data access layer (`getComponentOrThrow`, content helpers)
- `apps/docs/app/components/registry/` — 3 React Server Components
- `apps/docs/scripts/verify-registry-docs.mjs` — post-build validation (tag existence, heading pairs, name consistency)

**Dev prerequisite:** `pnpm build` from monorepo root (or `pnpm dev`) before `next dev` — the registry JSON and types must be built first.

## Resources

- Documentation site: `apps/docs/` (run `pnpm --filter @hareru/docs dev`)
- MCP server: `@hareru/mcp` — exposes tokens, schema, and component info to AI agents
- [Token source](packages/tokens/src/tokens/) — Raw DTCG token JSON
- [Component source](packages/ui/src/components/) — Component implementations
