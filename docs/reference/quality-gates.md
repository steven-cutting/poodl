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
| 6 | `storybook-build` | The workshop builds, documentation pages included. |
| 7 | `storybook-test` | Every story renders in Chromium, passes axe, and its play function completes. |
| 8 | `check-docs` | The documentation contract holds. |
| 9 | `check-agents` | The agent contract holds. |
| 10 | `check-clean` | The run changed nothing. |

Storybook writes a cache and a static build, and Vitest's browser mode can write failure
screenshots. All of them are ignored by Git, because a gate that changes one byte of the
worktree fails before its own exit code is read. Gate 7 needs a browser that no lockfile
accounts for; see [Work in the component workshop](../how-to/work-in-the-component-workshop.md).

## What the hook gate contains

`just lint` runs `.pre-commit-config.yaml` over every file. This is the read-only
configuration, and it is the one installed as the pre-commit hook.

| Hook | Checks |
| --- | --- |
| `ruff-check`, `ruff-format-check` | The four Python scripts under `scripts/`. |
| `editorconfig-checker` | Whitespace, line endings, final newlines. |
| `eslint` | ESLint and `prettier --check` across the application, the stories, and the workshop configuration. |
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

`.github/workflows/ci.yml` runs the same recipes in three jobs. `frontend` runs the
install, the lockfile dry run, `frontend-static`, `frontend-coverage` and `frontend-build`;
`documents` runs `sync`, `lint`, `check-docs` and `check-agents`; `stories` restores the
Playwright cache, installs the browser, then runs `storybook-build` and `storybook-test`.
Nothing in CI runs a command that does not exist in the `Justfile`. The workshop build is
proved and then discarded: it is uploaded nowhere and published nowhere.

## On `main`

`main` is protected, and `frontend`, `documents` and `stories` must all pass before a
branch merges into it. Those three names are the CI jobs, and they are the only required
checks: the Pages workflow's own jobs never run on a pull request, so requiring them would
block every merge.

The branch is not required to be up to date with `main` first, and no review is required —
neither earns its cost on a repository with one author. Force pushes and deletion are
refused. Administrators are not bound by the rule, so the direct push remains available
when it is genuinely wanted; the protection is there to stop an unproved merge, not to stop
the author.

The gate is on the merge, not on the deployment. `.github/workflows/pages.yml` deploys on
every push to `main`, in parallel with CI rather than behind it, so what the protection
buys is narrower than it sounds: an unproved branch cannot become `main` through a pull
request. Two paths still publish ahead of a green run. One is the administrator pushing
directly. The other is an ordinary merge, because the branch is not required to be up to
date first — three green checks are green for the branch, not for the `main` the merge
produces. In both cases the deployment and the CI run start together, so watch the run and
roll back if it is red.

## Related pages

- [Commands](commands.md)
- [Quality philosophy](../explanation/quality-philosophy.md)
- [Documentation contract](documentation-contract.md)
- [Agent contract](agent-contract.md)
