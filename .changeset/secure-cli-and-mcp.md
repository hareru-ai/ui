---
"@hareru/cli": patch
"@hareru/mcp": patch
"@hareru/ui": patch
---

Restrict CLI CSS and configuration paths to the project boundary after resolving symlinks. Validate both init destinations before writing, reject dangling links, and apply the same protection to explicit CSS paths and forced writes.

Update the MCP SDK and Zod to security-patched versions and limit tool argument collections to 256 elements before schema validation.

Refresh UI runtime dependencies within their supported major versions.
