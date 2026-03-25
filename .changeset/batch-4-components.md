---
"@hareru/ui": minor
---

feat(ui): add PreviewCard, Toolbar, and CheckboxGroup components

- **PreviewCard** — Hover-triggered floating preview card for links, built on Base UI PreviewCard. Follows Tooltip/Popover pattern with Portal + Positioner + Popup composition.
- **Toolbar** — Action control container with ToolbarButton (CVA variant/size), ToolbarGroup, ToolbarSeparator, and ToolbarLink. Built on Base UI Toolbar with roving tabindex keyboard navigation.
- **CheckboxGroup** — Group wrapper for multiple Checkbox components with shared `value`/`defaultValue`/`onValueChange` state management. Supports "select all" via `allValues` + `parent` prop.
