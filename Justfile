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

# The Allium checker for docs/specs/, pinned and checksummed in the script.
# Downloads over the network into .tools/bin, which Git ignores. It is not part
# of `just sync` for the same reason the browser below is not: sync installs
# exactly what the lockfiles say, and no lockfile can name a binary.
install-allium:
    uv run --frozen python scripts/install_allium.py

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

# Serves the build in build/. BASE_PATH decides the mount as well as the build,
# so pass the same value here that the build used.
preview:
    npm run preview

# Assembles what Pages serves: the domain root from site-root/, with the built
# app moved beneath it at BASE_PATH. Pass the same value the build used, or the
# app lands somewhere the landing page does not link to.
stage:
    npm run stage

# Serves the staged tree in site/, which is the whole domain and not just the
# app. `just preview` cannot show it: that one mounts build/ at BASE_PATH and
# knows nothing about the root around it. Python is already in the toolchain,
# so this needs no dependency; the port is not 4173 so the two can run at once.
stage-preview:
    uv run --frozen python -m http.server --bind 127.0.0.1 --directory site 4174

# The component workshop on port 6006. This serves it; `just chromatic` is what
# publishes a build of it for visual review.
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

# The specifications, checked mechanically rather than by review. Reports
# no diagnostics and exits 0 on a clean checkout: the old diagnostic baseline is
# fixed or waived in place, so anything reported is a regression. Still
# deliberately outside `just check` — the binary is a per-worktree install
# the gate cannot assume, and gating is the follow-up decision 0011 leaves
# open. Waiver terms: docs/how-to/work-with-the-specs.md.
check-specs:
    uv run --frozen python scripts/install_allium.py --check
    .tools/bin/allium check docs/specs/

# The same modules read for process completeness rather than structure: data
# flow, reachability, deadlocks, conflicts and invariants. It repeats everything
# `check-specs` reports and adds findings of its own. Reports no findings and
# exits 0 on a clean checkout; findings cannot be waived, so anything reported
# is a regression. Outside `just check` for the same reason as `check-specs`.
analyse-specs:
    uv run --frozen python scripts/install_allium.py --check
    .tools/bin/allium analyse docs/specs/

check-links-online:
    uv run --frozen prek run --all-files --hook-stage manual lychee-online

# ---------------------------------------------------------------- aggregate ---

check-clean baseline="":
    uv run --frozen python scripts/run_project_check.py clean "$1"

# The complete gate.
check:
    uv run --frozen python scripts/run_project_check.py run

# ---------------------------------------------------------------- publish ---

# Publishes the workshop to Chromatic for visual review, building it on the way.
# Needs the network and CHROMATIC_PROJECT_TOKEN, so it is deliberately outside
# `just check` — the same reason check-links-online sits outside it. Pass a
# branch name when HEAD is detached, which is how CI reaches a pull request.
chromatic branch="":
    npm run chromatic -- ${1:+--branch-name "$1"}
