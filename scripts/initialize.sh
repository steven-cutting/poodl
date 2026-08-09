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
# repository. This is the one network download in the first-run path that no
# lockfile accounts for.
npm run storybook:browsers

# Formatting is normalised once here rather than leaving the first `just check`
# to fail on it.
uv run --frozen ruff check --fix-only .
uv run --frozen ruff format .
npm run lint:fix

just install-hooks

printf '\n%s\n' 'Ready. Next: just check.'
printf '%s\n' 'Nothing has been staged, committed, tagged, or pushed.'
