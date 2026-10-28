---
"@hareru/ui": patch
---

Security: `applyPatch`, which `useAGUIState().applyDelta` uses, now rejects JSON Pointer paths that contain `__proto__`. Before this fix, a JSON Patch such as `{ "op": "add", "path": "/__proto__/x" }` could add, replace, or delete properties of `Object.prototype` (prototype pollution).
