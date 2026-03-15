## Summary
<!-- What does this PR do? -->

## Change Impact Checklist

<!-- Check items relevant to this PR. Skip items that don't apply. -->

- [ ] **Public contract changed** (types, schema, registry fields, MCP tools/resources, CLI commands)
- [ ] Changeset added (`pnpm changeset`)
- [ ] Generated artifacts up to date (`pnpm build` — CI runs build + `verify-css-bundle.mjs`)
- [ ] Sync targets updated:
  - [ ] AGENTS.md
  - [ ] .cursorrules
  - [ ] README.md (root + affected packages)
  - [ ] docs pages (apps/docs/content/)
  - [ ] consumer-rules.json
  - [ ] MCP tool/resource descriptions
  - [ ] CLI command descriptions
- [ ] Hardcoded counts verified (`rg '\b\d+\+? components\b' -g '!**/dist/**' -g '!**/node_modules/**'`)
- [ ] Tests added/updated for new behavior
