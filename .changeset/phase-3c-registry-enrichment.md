---
"@hareru/ui": minor
"@hareru/registry": minor
"@hareru/mcp": minor
"@hareru/cli": minor
---

feat: add states, a11y, and examples to component registry (Phase 3C)

- `StateDef`, `A11yDef`, `ExampleDef` types added to `@hareru/registry`
- `ComponentEntry` extended with `states`, `a11y`, `examples` optional fields
- Component registry schema updated with new `$defs`
- Auto-extraction of boolean states and a11y attributes from TSX sources
- All 49 components enriched with hand-written a11y, states, and examples data
- MCP `get-component-usage` output includes States, Accessibility, and Example sections
- CLI `hareru info` output includes States, Accessibility, and Example sections
