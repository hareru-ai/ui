---
"@hareru/tokens": patch
---

Security: `TokenGenerator.toPencilDocument` now converts HSL and OKLCH colors in linear time. Before this fix, a color value with a long run of whitespace and no closing parenthesis took quadratic time (ReDoS). Accepted formats are unchanged.
