# @hareru/cli

CLI for [Hareru UI](https://github.com/hareru-ai/ui) — list components, inspect details, and generate CSS imports.

[![npm](https://img.shields.io/npm/v/@hareru/cli)](https://www.npmjs.com/package/@hareru/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)

## Quick Start

```bash
# List all components
npx @hareru/cli list

# Get component details
npx @hareru/cli info Button

# Generate CSS imports for a component
npx @hareru/cli add Button

# Auto-append CSS imports to your stylesheet
npx @hareru/cli add Button --write
```

Or install globally:

```bash
npm install -g @hareru/cli
hareru list
```

## Commands

### `hareru list`

List all components grouped by category.

```bash
hareru list
hareru list --group form    # Filter by group
hareru list --json          # JSON output
```

### `hareru info <name>`

Show details for a component or task bundle. Output includes variants, props, states, accessibility notes, and usage examples when available.

```bash
hareru info Button          # Component details
hareru info agent-chat-shell  # Bundle details
```

### `hareru add <name>`

Generate CSS import statements for a component or bundle.

```bash
hareru add Dialog
hareru add Dialog --mode tailwind
hareru add Dialog --mode per-component
hareru add agent-chat-shell --write
```

**CSS Modes:**

| Mode | Description |
|------|-------------|
| `standalone` | All-in-one bundle (`styles.css`) |
| `portable` | Tokens + component bundle, no reset |
| `tailwind` | Cascade Layers for Tailwind v4 coexistence |
| `per-component` | Individual CSS files for minimal bundle |

**Options:**

| Flag | Description |
|------|-------------|
| `--mode <mode>` | CSS mode (defaults to `per-component` if omitted) |
| `--write` | Append imports to your CSS entry file |
| `--css-file <path>` | Target CSS file (auto-detected if omitted) |
| `--layer` | Use `@layer` wrapped variants |
| `--scope` | Include `.hui-root` scope helper |
| `--baseline` | Include minimal CSS reset |
| `--force` | Skip safety checks |
| `--json` | JSON output |

## Auto-Detection

The CLI automatically detects:

- **CSS entry file** — Searches 7 common paths (`globals.css`, `index.css`, etc.)
- **Package manager** — pnpm, npm, yarn, bun (monorepo-aware)

CSS mode defaults to `per-component` when `--mode` is not specified.

## Links

- [Documentation](https://ui.hareru.ai/docs/cli)
- [Getting Started](https://ui.hareru.ai/docs/getting-started)
- [GitHub](https://github.com/hareru-ai/ui)

## License

[MIT](../../LICENSE) — Copyright (c) 2026 MUSUBI Inc.
