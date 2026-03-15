# @hareru/registry

## 0.3.0

### Minor Changes

- 4630a84: feat: add states, a11y, and examples to component registry (Phase 3C)

  - `StateDef`, `A11yDef`, `ExampleDef` types added to `@hareru/registry`
  - `ComponentEntry` extended with `states`, `a11y`, `examples` optional fields
  - Component registry schema updated with new `$defs`
  - Auto-extraction of boolean states and a11y attributes from TSX sources
  - All 49 components enriched with hand-written a11y, states, and examples data
  - MCP `get-component-usage` output includes States, Accessibility, and Example sections
  - CLI `hareru info` output includes States, Accessibility, and Example sections

## 0.2.0

### Minor Changes

- 59e6905: Add CSS mode recommendation shared function and new MCP tools/prompts

  - `@hareru/registry`: Add `CssMode` type, `CSS_MODES`, `CSS_MODE_DESCRIPTIONS`, and `recommendCssMode()` shared function
  - `@hareru/mcp`: Add `recommend-css-mode` tool, `list-components-by-group` tool, and `create-ui-tailwind` prompt (5 tools, 3 prompts total)
  - `@hareru/cli`: Re-export `CssMode`/`CSS_MODES` from `@hareru/registry` (no public API change)
