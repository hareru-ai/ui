---
"@hareru/tokens": patch
---

Security: `parseOKLCH` now runs in linear time. Before this fix, input with a long run of whitespace and no closing parenthesis took quadratic time (ReDoS). Accepted formats are unchanged.
