---
"@hareru/registry": patch
"@hareru/mcp": patch
"@hareru/cli": patch
---

fix: harden error handling across registry loader, MCP server, and CLI

**Registry loader** (`packages/registry/src/loader.ts`):
- Split monolithic try/catch into per-step (read/parse/resolve) with `{ cause }` chain preservation
- Descriptive error messages include filename, path, and root cause

**MCP server** (`packages/mcp/src/`):
- Server no longer crashes when registry artifacts are missing at startup
- Resources return JSON error objects (preserving `mimeType: 'application/json'` contract)
- Tools return `{ isError: true }` with descriptive messages
- Prompts return error text instead of throwing

**CLI** (`packages/cli/src/`):
- Shared `printRegistryError()` helper with contextual hints (not-found → build, parse → corrupted, read → permissions)
- Consistent `c.error()` styling across add/list/info commands
