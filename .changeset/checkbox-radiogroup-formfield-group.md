---
"@hareru/ui": minor
"@hareru/registry": patch
"@hareru/mcp": patch
"@hareru/cli": patch
---

feat(ui): add Checkbox, RadioGroup components and FormField group mode

- **Checkbox**: Binary selection control with checked, unchecked, and indeterminate states. Built on Base UI Checkbox primitives.
- **RadioGroup**: Single-select radio group with implicit label association via `<label>` + `aria-labelledby`. Built on Base UI RadioGroup/Radio primitives.
- **FormField group mode**: New `group` prop and `FormFieldGroupLabel` sub-component for accessible labelling of grouped controls (e.g., RadioGroup). Uses `role="group"` + `aria-labelledby` instead of `<label htmlFor>`.
- Component count: 49 → 51
- Registry, MCP, and CLI automatically expose the new components via existing artifact pipeline.
