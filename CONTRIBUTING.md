# Contributing to Hareru UI

Thank you for your interest in Hareru UI!

## Current Contribution Policy

Hareru UI is in its early stage. We are solidifying the design direction and API surface before opening up to broad contributions.

**What we welcome now:**
- Bug reports via [Issues](https://github.com/hareru-ai/ui/issues)
- Feature requests and suggestions via Issues
- Documentation fixes (typos, broken links, clarifications)
- Accessibility improvements

**What we are not accepting yet:**
- New component proposals (please open an Issue to discuss first)
- API changes or refactors
- Token system modifications

This policy will evolve as the project matures. Watch the repository for updates.

## Reporting Bugs

Please open an Issue with:
1. A clear title describing the problem
2. Steps to reproduce
3. Expected vs actual behavior
4. Browser / OS / Node.js version

## Development Setup

If you're working on an accepted contribution:

### Prerequisites

- Node.js >= 20
- pnpm >= 9

### Getting Started

```bash
git clone https://github.com/hareru-ai/ui.git
cd ui
pnpm install
pnpm build
pnpm dev        # Start playground
```

### Commands

```bash
pnpm build        # Build all packages
pnpm test         # Run tests
pnpm lint         # Check lint
pnpm format       # Auto-format
pnpm changeset    # Create a changeset
```

## Code Style

This project uses [Biome](https://biomejs.dev/) for formatting and linting — not ESLint or Prettier. Run `pnpm format` before committing.

### Component Guidelines

- All components must use `React.forwardRef` with `displayName`
- Export Props types as `ComponentNameProps`
- BEM naming: `hui-{component}`, `hui-{component}__{element}`, `hui-{component}--{modifier}`
- All style values must use CSS variables (`var(--hui-*)`) — no hardcoded values
- No Tailwind utility classes in component CSS

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(ui): add Accordion component
fix(tokens): correct primary-hover oklch value
docs: update installation guide
```

### Changesets

Every change to package source requires a changeset:

```bash
pnpm changeset    # Select package(s), bump type, and description
```

Commit the generated `.changeset/*.md` file along with your code changes.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
