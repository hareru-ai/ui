---
"@hareru/cli": minor
"@hareru/mcp": patch
"@hareru/ui": patch
---

Breaking change: restrict CLI CSS and configuration paths to the nearest package boundary, including explicit `--css-file` paths and forced writes. Cross-package CSS writes are no longer supported. Run the command from the package directory that owns the CSS file, or omit `--write` and paste the generated snippets manually. `--force` cannot override this boundary.

Validate both init destination paths before writing and reject dangling symlinks. Before changing CSS, init and update preflight file types and hard-link counts for all files they will write, excluding an existing config that init will skip without `--force`. All writes still check the opened file before truncation and reject non-regular files and hard links. Preserve normalized user-selected symlink paths in `hareru.json` and command output while resolving paths for validation and writes. Report invalid config modes separately from missing fields.

Update the MCP SDK and Zod to security-patched versions and limit tool argument collections to 256 elements before schema validation.

Refresh UI runtime dependencies within their supported major versions.
