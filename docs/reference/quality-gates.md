---
title: "Quality gates"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [quality_gate_reference]
requires: []
---

# Quality gates

`just check` runs the gates in the order below and snapshots the worktree between each
one. A recipe that modifies a file fails the run, because checks are read-only.

| Order | Gate | Proves |
| --- | --- | --- |
| 1 | `lock-check` | Both manifests agree with both lockfiles. |
| 2 | `lint` | The whole hook gate passes over every file. |
| 3 | `frontend-static` | ESLint, Prettier and `svelte-check --fail-on-warnings` are clean. |
| 4 | `frontend-coverage` | Every test passes and coverage is at or above the floor. |
| 5 | `frontend-build` | The site actually builds, with every route prerenderable. |
| 6 | `check-docs` | The documentation contract holds. |
| 7 | `check-agents` | The agent contract holds. |
| 8 | `check-clean` | The run changed nothing. |

## What the hook gate contains

`just lint` runs `.pre-commit-config.yaml` over every file. This is the read-only
configuration, and it is the one installed as the pre-commit hook.

| Hook | Checks |
| --- | --- |
| `ruff-check`, `ruff-format-check` | The four Python scripts under `scripts/`. |
| `editorconfig-checker` | Whitespace, line endings, final newlines. |
| `eslint` | ESLint and `prettier --check` across the application. |
| `validate-docs`, `validate-agents` | The two contracts, so a hook catches them before the aggregate does. |
| `markdownlint-cli2` | Markdown structure. Prettier does not touch Markdown, so they cannot disagree. |
| `typos` | Spelling, excluding the lockfiles and the word lists. |
| `lychee` | Link targets, offline. |
| `shellcheck` | `scripts/initialize.sh`. |
| `actionlint` | Both GitHub Actions workflows. |
| `ripsecrets` | Credential material, with its output suppressed so a match is never logged. |
| Builtin `check-*` | Large files, case conflicts, merge markers, JSON, TOML, YAML, private keys, shebangs. |

Third-party hooks are pinned to commit SHAs with a version comment beside each.

## The mutating counterpart

`.pre-commit-fix.yaml` holds the hooks that write: Ruff autofix and format,
end-of-file and trailing-whitespace repair, and `markdownlint --fix`. It is never
installed as a hook and runs only from `just fix`.

## In continuous integration

`.github/workflows/ci.yml` runs the same recipes in two jobs. `frontend` runs the install,
the lockfile dry run, `frontend-static`, `frontend-coverage` and `frontend-build`;
`documents` runs `sync`, `lint`, `check-docs` and `check-agents`. Nothing in CI runs a
command that does not exist in the `Justfile`.

## Related pages

- [Commands](commands.md)
- [Quality philosophy](../explanation/quality-philosophy.md)
- [Documentation contract](documentation-contract.md)
- [Agent contract](agent-contract.md)
