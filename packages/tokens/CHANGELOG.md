# @hareru/tokens

## 0.1.3

### Patch Changes

- 6550c08: Security: `TokenGenerator.toPencilDocument` now converts HSL and OKLCH colors in linear time. Before this fix, a color value with a long run of whitespace and no closing parenthesis took quadratic time (ReDoS). Accepted formats are unchanged.

## 0.1.2

### Patch Changes

- 0ff6178: Security: `parseOKLCH` now runs in linear time. Before this fix, input with a long run of whitespace and no closing parenthesis took quadratic time (ReDoS). Accepted formats are unchanged.

## 0.1.1

### Patch Changes

- 59e6905: Republish with updated package metadata (homepage, LICENSE in files)

## 0.1.1

### Patch Changes

- Initial publish to npm
