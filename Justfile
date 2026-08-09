set positional-arguments := true
set shell := ["sh", "-eu", "-c"]

# Storybook phones home unless told not to, and `just check` runs it. The core
# preset in .storybook/main.ts is the primary lever; this is the belt.
export STORYBOOK_DISABLE_TELEMETRY := "1"

default:
    @just --list

# ------------------------------------------------------------------ setup ---

# One explicit first-run command. Never stages, commits, tags, or pushes.
initialize:
    sh scripts/initialize.sh

sync:
    uv sync --frozen
    test -f package-lock.json || { printf '%s\n' 'package-lock.json is missing; run just initialize first' >&2; exit 2; }
    npm ci --no-audit

lock:
    uv lock
    npm install --package-lock-only --ignore-scripts --no-audit

lock-upgrade:
    uv lock --upgrade
    npm update --package-lock-only --ignore-scripts --no-audit

lock-check:
    uv lock --check
    npm ci --ignore-scripts --dry-run --no-audit

install-hooks:
    git rev-parse --is-inside-work-tree >/dev/null
    test -f uv.lock || { printf '%s\n' 'uv.lock is missing; run just initialize first' >&2; exit 2; }
    uv run --frozen prek install --overwrite --hook-type=pre-commit

# The Chromium build the story tests render in. Downloads over the network into
# a per-user cache outside the repository, so the worktree never sees it.
# `just initialize` runs this; `just sync` deliberately does not, because sync
# installs exactly what the lockfiles say and no lockfile names a browser.
storybook-browsers:
    npm run storybook:browsers

# Linux only: an apt front end for the libraries Chromium links against. CI runs
# it; macOS has nothing to add.
storybook-browsers-deps:
    npm run storybook:browsers:deps

# ---------------------------------------------------------------- develop ---

dev:
    npm run dev

# Serves the build in build/. BASE_PATH applies at build time, so preview the
# same output the Pages workflow would publish by building with it set.
preview:
    npm run preview

# The component workshop on port 6006. Local only: it is served and built, and
# never published.
storybook:
    npm run storybook

# ----------------------------------------------------------------- format ---

format:
    uv run --frozen ruff check --fix-only .
    uv run --frozen ruff format .
    npm run format

fix:
    -uv run --frozen prek run --all-files --config .pre-commit-fix.yaml
    uv run --frozen prek run --all-files --config .pre-commit-fix.yaml
    npm run lint:fix
    just lint

# ------------------------------------------------------------------ check ---

lint:
    uv run --frozen prek run --all-files

frontend-static:
    npm run lint
    npm run check

frontend-unit:
    npm run test

frontend-coverage:
    npm run coverage

frontend-build:
    npm run build

# Builds the workshop, autodocs included, into the gitignored storybook-static/.
# This is the only gate that renders the documentation pages.
storybook-build:
    npm run storybook:build

# Every story in real Chromium: axe over each render, play functions executed as
# interaction tests. It checks for the browser first, so a missing download
# reports itself as a missing download rather than as a failing story. Never
# measured for coverage — the floor over src/lib/** stays a claim about tests/.
storybook-test:
    npm run storybook:test

# --------------------------------------------------------------- documents ---

check-docs:
    uv run --frozen prek run --all-files markdownlint-cli2 typos lychee
    uv run --frozen python scripts/validate_docs.py

check-agents:
    uv run --frozen python scripts/validate_agents.py

check-links-online:
    uv run --frozen prek run --all-files --hook-stage manual lychee-online

# ---------------------------------------------------------------- aggregate ---

check-clean baseline="":
    uv run --frozen python scripts/run_project_check.py clean "$1"

# The complete gate.
check:
    uv run --frozen python scripts/run_project_check.py run
