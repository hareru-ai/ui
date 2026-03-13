# Hareru UI

Semantic CSS design system. pnpm monorepo.

## Monorepo Structure

```
hareru-ui/
├── packages/
│   ├── tokens/       # @hareru/tokens — Design tokens + CSS variable generation (DTCG format)
│   ├── ui/           # @hareru/ui — React components (40+ components)
│   └── mcp/          # @hareru/mcp — MCP server for AI agent integration
├── apps/
│   ├── docs/         # Fumadocs documentation site (Next.js)
│   └── playground/   # Vite + React preview app
├── turbo.json
├── biome.json
└── pnpm-workspace.yaml
```

## Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| CSS variable prefix | `--hui-` | Short, unique abbreviation of hareru-ui |
| BEM naming | `hui-button--variant` | Semantic + collision avoidance |
| tailwind-merge | Not used | BEM classes do not conflict |
| Theme switching | `data-theme` attribute | Clear CSS variable scoping |
| Color format | OKLCH | Perceptually uniform + gamut mapping (same direction as shadcn/ui v2) |
| forwardRef | All components | Guarantees external ref access |
| Semantic HTML | Card uses article/header/footer | a11y + SEO |
| Pencil format support | Token conversion utilities via `formats/pencil.ts` | Interop with Pencil-based design workflows |

## Token Naming

```
--hui-{category}-{name}
Examples: --hui-color-primary, --hui-spacing-4, --hui-radius-md, --hui-easing-out, --hui-z-index-dropdown
Categories: color, spacing, radius, font, shadow, duration, easing, z-index (zIndex)

DEFAULT key expands to the parent name:
  color.primary.DEFAULT → --hui-color-primary
  shadow.DEFAULT        → --hui-shadow
```

## Commands

```bash
pnpm build        # Build all packages (Turborepo)
pnpm dev          # Start playground dev server
pnpm test         # Run tests (vitest)
pnpm test:e2e     # Run E2E tests (Playwright, Chromium)
pnpm lint         # Lint (biome check .)
pnpm format       # Format (biome format --write .)
pnpm changeset    # Create a changeset
```

## Documentation

- Documentation site: `apps/docs/` (Fumadocs, `pnpm --filter @hareru/docs dev`)
- AI agents: use `@hareru/mcp` for token/component information
