---
"@hareru/cli": minor
---

Add `init` and `update` commands, colored output with picocolors

**New commands:**
- `hareru init` — Initialize project with managed CSS block, `hareru.json` config, and framework auto-detection (Next.js, Vite, Remix, Astro)
- `hareru update` — Change CSS mode by rewriting the managed block (`standalone` ↔ `portable` ↔ `tailwind`)

**Colored output:**
- All CLI output now uses semantic colors via picocolors (success, error, warning, heading, etc.)
- Colors are automatically disabled in non-TTY environments and when `NO_COLOR` is set

**Managed block:**
- CSS imports are wrapped in `/* hareru:start managed */` ... `/* hareru:end */` markers
- `@import 'tailwindcss'` is app-managed and kept outside the block
- `init --force` adopts unmanaged `@hareru/` imports into the managed block
- `update` only modifies content inside the managed block

**Security:**
- Path traversal prevention on `cssFile` in `hareru.json` (segment-boundary validation)
- ENOENT/EACCES errors handled gracefully for all file write operations
