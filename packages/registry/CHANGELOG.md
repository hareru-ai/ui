# @hareru/registry

## 0.2.0

### Minor Changes

- b57a355: Add CSS mode recommendation shared function and new MCP tools/prompts

  - `@hareru/registry`: Add `CssMode` type, `CSS_MODES`, `CSS_MODE_DESCRIPTIONS`, and `recommendCssMode()` shared function
  - `@hareru/mcp`: Add `recommend-css-mode` tool, `list-components-by-group` tool, and `create-ui-tailwind` prompt (5 tools, 3 prompts total)
  - `@hareru/cli`: Re-export `CssMode`/`CSS_MODES` from `@hareru/registry` (no public API change)
