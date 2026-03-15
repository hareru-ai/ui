---
"@hareru/registry": minor
"@hareru/ui": minor
"@hareru/mcp": minor
"@hareru/cli": minor
---

feat: add slot contracts to component registry (Phase 3D)

- Add `SlotDef` and `SlotRole` types to `@hareru/registry` for describing JSX nesting contracts of compound components
- Add `buildSlotTree()` shared helper that renders slot trees as formatted ASCII text
- Add `slots` data to 25 compound components in component manifest (117 slot definitions)
- Add `## Structure` section to MCP `get-component-usage` output (code-fenced tree)
- Add `Structure:` section to CLI `info` command output
- Add `validateSlotTree()` with 7 integrity checks in `generate-registry.mjs`
- Add Phase 3D verification checks in `verify-css-bundle.mjs`
