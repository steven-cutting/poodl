#!/bin/sh
set -eu

project_root=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd -P)
cd "$project_root"

git rev-parse --is-inside-work-tree >/dev/null

uv lock
uv sync --frozen

npm install --package-lock-only --ignore-scripts --no-audit
npm ci --no-audit

# `just check` runs the story tests, so a first run has to leave the workspace
# able to reach a green gate. The browser lands in a per-user cache outside the
# repository. This is one of the two network downloads in the first-run path
# that no lockfile accounts for.
npm run storybook:browsers

# The other one. The Allium checker for docs/specs/, pinned and checksummed in
# the script, landing in the gitignored .tools/bin. `just check-specs` and
# `just analyse-specs` run it, and both the hook gate and `just check` run those,
# so a worktree without it cannot reach a green gate.
uv run --frozen python scripts/install_allium.py

# Formatting is normalised once here rather than leaving the first `just check`
# to fail on it.
uv run --frozen ruff check --fix-only .
uv run --frozen ruff format .
npm run lint:fix

just install-hooks

printf '\n%s\n' 'Ready. Next: just check.'
printf '%s\n' 'Nothing has been staged, committed, tagged, or pushed.'
