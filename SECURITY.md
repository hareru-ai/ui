# Security and Maintenance

## Repository Controls

The `main` branch requires a pull request, resolved conversations, and up-to-date `ci` and `e2e` checks from GitHub Actions. Administrators are subject to these rules. Force pushes and deletion are disabled. No additional reviewer is required while the repository has a single human maintainer.

Secret scanning, push protection, and Dependabot security updates are enabled. Actions default to read-only repository access. The combined setting allowing Actions to create and approve pull requests remains enabled because Changesets needs to create release PRs; workflows do not approve them.

These settings live in GitHub, separately from this repository. Review them when changing maintainers or repository visibility.

## Release Workflow

1. CI builds and tests a push to `main`, including dependency auditing and browser tests.
2. Release accepts only a successful CI run for a push to this repository's `main`. PR and manually dispatched runs cannot trigger publishing. Every job checks out the validated SHA and rejects an obsolete main head.
3. Changesets creates a version PR in a separate job without npm credentials. It dispatches CI explicitly because a PR created with `GITHUB_TOKEN` does not trigger another workflow automatically.
4. The pack job builds public packages with read-only repository access. The publish job consumes tarballs from that same workflow run, uses no dependency cache, and installs tooling with lifecycle scripts disabled.
5. Publishing requires approval in the `npm-publish` environment, restricted to `main`. Administrator bypass is disabled. Self-review remains available for the sole maintainer. Review the SHA and package versions before approving.

Third-party Actions are pinned to commit SHAs. The npm credential is exposed only to the credential check and final publish step. Publishing disables package lifecycle scripts. No package is published just by opening the maintenance PR.

### npm Credentials

The workflow retains token authentication for compatibility with the existing registry setup. Before the next release, verify or rotate `NPM_TOKEN` and store it in the protected `npm-publish` environment. Remove the repository-level copy after the environment secret is configured. GitHub does not expose existing secret values, so they cannot be copied out through its API. Do not paste a token into an issue or a chat.

Prefer [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) when the npm account owner can configure each public package. Use owner `hareru-ai`, repository `ui`, workflow `release.yml`, and environment `npm-publish`; then grant `id-token: write` only to the publish job and remove token authentication. Trusted publishing is not yet configured by this change. Never enable OIDC permissions in the build job.

## Dependency Maintenance

Use Node.js 24 from `.node-version` and the pinned pnpm version. The lockfile is committed and CI uses frozen installs. Newly published packages wait 24 hours before resolution. Install scripts are allowed only for `esbuild` and `sharp`; new permissions require review. Biome's optional-binary probe is explicitly skipped; its CLI resolves the installed platform binary directly.

Dependabot checks npm and Actions weekly. CI blocks high/critical dependency advisories; the weekly audit reports every severity. CodeQL scans JavaScript/TypeScript and dependency review checks pull requests. Audit results identify known vulnerable versions, not proof that each issue is exploitable in this application.

Run `pnpm audit`, `pnpm lint`, `pnpm build`, `pnpm test`, and `pnpm test:e2e` before merging dependency changes. Update `.node-version` and `packageManager` deliberately. Avoid unconstrained overrides that can force incompatible major versions.

## CLI and MCP Boundaries

CLI writes resolve paths and existing symlink targets against the nearest package root. Both init destinations are checked before a write; `--force` cannot bypass containment. This protects against static project paths and symlinks, not a hostile process concurrently replacing filesystem ancestors.

The MCP executable uses stdio and does not expose a network listener. Tool calls have a 256-element collection limit before schema validation. This is not a byte limit. Custom network transports need separate authentication, origin checks, and body-size limits.
