#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${GITHUB_SHA:-}" || "$GITHUB_SHA" != "${RELEASE_SHA:-}" ]]; then
  echo 'Release stopped: the workflow SHA does not match the validated release SHA.' >&2
  exit 1
fi

# Delayed approval or a CI rerun must not publish an obsolete main commit.
current_head=$(git ls-remote "https://github.com/${GITHUB_REPOSITORY}.git" refs/heads/main | cut -f1)
if [[ -z "$current_head" || "$current_head" != "$RELEASE_SHA" ]]; then
  echo 'Release stopped: the validated commit is no longer the main branch head.' >&2
  exit 1
fi
