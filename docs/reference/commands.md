---
title: "Commands"
kind: "reference"
audience: [contributor, maintainer, operator, agent]
canonical_for: [command_reference]
requires: []
---

# Commands

`just --list` prints the live set. This page says what each recipe is for. The `Justfile`
is the only supported interface: if something is worth running twice, it belongs here
rather than in a shell history.

## Setup

| Recipe | Purpose |
| --- | --- |
| `just initialize` | One explicit first run. Creates both lockfiles, installs both toolchains, normalises formatting, installs the hook. Never stages, commits, tags or pushes. |
| `just sync` | Install exactly what the lockfiles say. Run after pulling. |
| `just install-hooks` | Install the read-only pre-commit gate. |

## Dependencies

| Recipe | Purpose |
| --- | --- |
| `just lock` | Relock at the versions the manifests state. |
| `just lock-upgrade` | Move within the manifests' constraints. |
| `just lock-check` | Fail if a manifest and its lockfile disagree. |

## Develop

| Recipe | Purpose |
| --- | --- |
| `just dev` | Vite development server with hot module replacement. |
| `just preview` | Serve the built output in `build/`. Build first. |

## Format and repair

| Recipe | Purpose |
| --- | --- |
| `just format` | Ruff and Prettier, writing. |
| `just fix` | The mutating hook set, then ESLint autofix, then `just lint`. The only command that modifies files. |

## Check

| Recipe | Purpose |
| --- | --- |
| `just lint` | The whole read-only hook gate over every file. |
| `just frontend-static` | ESLint, `prettier --check`, and `svelte-check --fail-on-warnings`. |
| `just frontend-unit` | Vitest, once. |
| `just frontend-coverage` | Vitest with the 90% floor enforced. |
| `just frontend-build` | Production build. Honours `BASE_PATH`. |

## Documents and agents

| Recipe | Purpose |
| --- | --- |
| `just check-docs` | markdownlint, `typos`, offline link check, then the documentation contract. |
| `just check-agents` | The agent contract: inventory, adapters, and skill bridges. |
| `just check-links-online` | Follow external links. Manual; needs the network. |

## Aggregate

| Recipe | Purpose |
| --- | --- |
| `just check` | Every gate in order, proving the worktree is unchanged between each. |
| `just check-clean` | Assert the worktree is clean, or matches a supplied baseline. |

## Related pages

- [Quality gates](quality-gates.md)
- [Develop locally](../how-to/develop-locally.md)
- [Configuration](configuration.md)
