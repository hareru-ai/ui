# Security and Maintenance

## Repository Controls

The `main` branch requires a pull request, resolved conversations, and up-to-date `ci` and `e2e` checks from GitHub Actions. Administrators are subject to these rules. Force pushes and deletion are disabled. No additional reviewer is required while the repository has a single human maintainer.

Secret scanning, push protection, and Dependabot security updates are enabled. Actions default to read-only repository access. The combined setting allowing Actions to create and approve pull requests remains enabled because Changesets needs to create release PRs; workflows do not approve them.

These settings live in GitHub, separately from this repository. Review them when changing maintainers or repository visibility.

## Release Workflow

1. CI builds and tests a push to `main`, including browser tests. Dependency auditing runs separately in the non-required Security workflow.
2. Release accepts only a successful CI run for a push to this repository's `main`. PR and manually dispatched runs cannot trigger publishing. Every job checks out the validated SHA, verifies it matches `GITHUB_SHA` used by Changesets for tags, and rejects an obsolete main head.
3. Changesets creates a version PR in a separate job without npm credentials. It dispatches CI explicitly because a PR created with `GITHUB_TOKEN` does not trigger another workflow automatically.
4. The pack job builds public packages with read-only repository access. The publish job consumes tarballs from that same workflow run, uses no dependency cache, and installs tooling with lifecycle scripts disabled.
5. Publishing requires approval in the `npm-publish` environment, restricted to `main`. Administrator bypass is disabled. Self-review remains available for the sole maintainer. Review the SHA and package versions before approving.

Version PR updates and publishing use separate job-level concurrency groups, so an approval wait does not block version PR updates. After a new push to `main`, a publish job awaiting approval will fail the HEAD check when resumed; reject obsolete pending approvals.

Third-party Actions are pinned to commit SHAs. Do not store npm tokens; only the publish job may request an OIDC token. Publishing disables package lifecycle scripts. No package is published just by opening the maintenance PR. Do not publish from a local machine; use the approved Release workflow so CI, SHA checks, and environment approval are enforced.

### npm Credentials

Publish through [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC) without storing npm tokens in GitHub. On npmjs.com, configure a GitHub Actions trusted publisher for each public package with these exact, case-sensitive values:

- Owner: `hareru-ai`
- Repository: `ui`
- Workflow: `release.yml`
- Environment: `npm-publish`

Register the configuration on the day of release. A new registration expires unless its first successful publish completes within two days.

Use a GitHub-hosted runner. Provenance is attached automatically, and each package's `repository.url` must match `https://github.com/hareru-ai/ui`.

After the first successful publish:

1. Set each package's Publishing access to **Require two-factor authentication and disallow tokens**.
2. Delete the `NPM_TOKEN` secret from GitHub, including any repository-level or environment-level copies.
3. Revoke unused npm tokens.

Grant `id-token: write` only to the publish job. Never grant it to the `select-mode`, `version`, or `pack` jobs; the pack job runs repository build scripts. Do not paste a token into an issue or a chat.

## Dependency Maintenance

Use Node.js 24 from `.node-version` and the pinned pnpm version. The lockfile is committed and CI uses frozen installs. Newly published packages wait 24 hours before resolution. Install scripts are allowed only for `esbuild` and `sharp`; new permissions require review. Biome's optional-binary probe is explicitly skipped; its CLI resolves the installed platform binary directly.

Dependabot checks npm and Actions weekly. Version updates for both ecosystems wait at least 24 hours after release through `cooldown.default-days: 1`; cooldown does not apply to security updates. The non-required Security workflow audits every severity on pushes to `main`, weekly, and on manual dispatch. Audit findings do not block the required CI workflow or release eligibility. CodeQL scans JavaScript/TypeScript and dependency review checks pull requests. Audit results identify known vulnerable versions, not proof that each issue is exploitable in this application.

Run `pnpm audit`, `pnpm lint`, `pnpm build`, `pnpm test`, and `pnpm test:e2e` before merging dependency changes. Update `.node-version` and `packageManager` deliberately. Avoid unconstrained overrides that can force incompatible major versions.

## CLI and MCP Boundaries

CLI writes resolve paths and existing symlink targets against the nearest package root. Both init destination paths are checked before a write; `--force` cannot bypass containment. Before changing CSS, init and update also preflight file types and hard-link counts for the CSS and config files they will write. Init excludes an existing config it will skip without `--force` from these write checks. All writers share a helper that opens without truncation, rejects non-regular files and hard links, then truncates and writes using the checked file descriptor. This protects against static project paths and links, not a hostile process concurrently replacing filesystem ancestors. Platforms with `O_NOFOLLOW` also reject a leaf symlink introduced between resolution and open; this flag is unavailable on Windows.

Configuration and output retain normalized user-selected paths, including internal symlinks. The package boundary is a breaking change for cross-package `--css-file` writes: run the command from the package that owns the CSS file, or omit `--write` and paste the generated snippets manually.

The MCP executable uses stdio and does not expose a network listener. Tool calls have a 256-element collection limit before schema validation. This is not a byte limit. Custom network transports need separate authentication, origin checks, and body-size limits.
