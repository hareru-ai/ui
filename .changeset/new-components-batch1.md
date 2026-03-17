---
"@hareru/ui": minor
---

feat(ui): add Accordion and Slider components

**Accordion** — Vertically stacked set of interactive headings that each reveal a section of content. Built on Base UI Accordion primitives. Supports single/multiple mode, controlled/uncontrolled value, disabled items, and keyboard navigation.

- Subcomponents: `Accordion`, `AccordionItem`, `AccordionHeader`, `AccordionTrigger`, `AccordionContent`
- CSS animations for expand/collapse with chevron rotation
- `AccordionItem.value` is required for reliable controlled/uncontrolled usage

**Slider** — Input control for selecting a numeric value or range by dragging a thumb. Built on Base UI Slider primitives. Supports single value, range (multiple thumbs), size variants, vertical orientation, and full keyboard/a11y support.

- Subcomponents: `Slider`, `SliderTrack`, `SliderRange`, `SliderThumb`, `SliderOutput`
- CVA size variants: `sm`, `md`, `lg`
- `SliderThumb` exposes `index`, `getAriaLabel`, `getAriaValueText` for range slider a11y
- `SliderOutput` can be placed freely inside Slider root (outside SliderTrack)

Component count: 51 → 53
