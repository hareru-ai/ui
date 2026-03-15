# @hareru/ui

## 0.2.0

### Minor Changes

- 4630a84: feat: add states, a11y, and examples to component registry (Phase 3C)

  - `StateDef`, `A11yDef`, `ExampleDef` types added to `@hareru/registry`
  - `ComponentEntry` extended with `states`, `a11y`, `examples` optional fields
  - Component registry schema updated with new `$defs`
  - Auto-extraction of boolean states and a11y attributes from TSX sources
  - All 49 components enriched with hand-written a11y, states, and examples data
  - MCP `get-component-usage` output includes States, Accessibility, and Example sections
  - CLI `hareru info` output includes States, Accessibility, and Example sections

## 0.1.1

### Patch Changes

- 59e6905: Replace Japanese UI strings with English in AsyncComboboxField
- Updated dependencies [59e6905]
  - @hareru/tokens@0.1.1

## 0.1.1

### Patch Changes

- Initial publish to npm
- Updated dependencies
  - @hareru/tokens@0.1.1
