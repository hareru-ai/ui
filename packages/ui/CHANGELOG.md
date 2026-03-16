# @hareru/ui

## 0.4.0

### Minor Changes

- 6bce77e: feat(ui): add Checkbox, RadioGroup components and FormField group mode

  - **Checkbox**: Binary selection control with checked, unchecked, and indeterminate states. Built on Base UI Checkbox primitives.
  - **RadioGroup**: Single-select radio group with implicit label association via `<label>` + `aria-labelledby`. Built on Base UI RadioGroup/Radio primitives.
  - **FormField group mode**: New `group` prop and `FormFieldGroupLabel` sub-component for accessible labelling of grouped controls (e.g., RadioGroup). Uses `role="group"` + `aria-labelledby` instead of `<label htmlFor>`.
  - Component count: 49 → 51
  - Registry, MCP, and CLI automatically expose the new components via existing artifact pipeline.

## 0.3.0

### Minor Changes

- 31b2295: feat: add slot contracts to component registry (Phase 3D)

  - Add `SlotDef` and `SlotRole` types to `@hareru/registry` for describing JSX nesting contracts of compound components
  - Add `buildSlotTree()` shared helper that renders slot trees as formatted ASCII text
  - Add `slots` data to 25 compound components in component manifest (117 slot definitions)
  - Add `## Structure` section to MCP `get-component-usage` output (code-fenced tree)
  - Add `Structure:` section to CLI `info` command output
  - Add `validateSlotTree()` with 7 integrity checks in `generate-registry.mjs`
  - Add Phase 3D verification checks in `verify-css-bundle.mjs`

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
