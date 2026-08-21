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
| `just initialize` | One explicit first run. Creates both lockfiles, installs both toolchains and the browser the story tests need, normalises formatting, installs the hook. Never stages, commits, tags or pushes. |
| `just sync` | Install exactly what the lockfiles say. Run after pulling. |
| `just install-hooks` | Install the read-only pre-commit gate. |
| `just storybook-browsers` | Download the Chromium the story tests render in. Over the network, into a cache outside the repository. |
| `just storybook-browsers-deps` | The system libraries Chromium links against. Linux only; CI runs it first. |

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
| `just preview` | Serve the built output in `build/`. Build first, and set the same `BASE_PATH` — see [Configuration](configuration.md). |
| `just stage` | Assemble `site/`: the domain root from `site-root/`, with the build moved in beneath it at `BASE_PATH`. This is what Pages is given. |
| `just stage-preview` | Serve the staged tree in `site/` on port 4174 — the whole domain, landing page included, which `just preview` cannot show. |
| `just storybook` | The component workshop on port 6006, with hot module replacement. |

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
| `just storybook-build` | Build the workshop into `storybook-static/`. Ignored by Git; this build is discarded, and `just chromatic` is what publishes one. |
| `just storybook-test` | Every story in real Chromium: axe over each render, play functions as interaction tests. |

## Documents and agents

| Recipe | Purpose |
| --- | --- |
| `just check-docs` | markdownlint, `typos`, offline link check, then the documentation contract. |
| `just check-agents` | The agent contract: inventory, adapters, and skill bridges. |
| `just check-links-online` | Follow external links. Manual; needs the network. |

## Publish

| Recipe | Purpose |
| --- | --- |
| `just chromatic [branch]` | Build the workshop and publish it to Chromatic for visual review. Manual; needs the network and `CHROMATIC_PROJECT_TOKEN`. Never part of `just check`. The argument overrides the branch name, which only CI needs, because it checks a pull request out at a detached head. |

## Aggregate

| Recipe | Purpose |
| --- | --- |
| `just check` | Every gate in order, proving the worktree is unchanged between each. |
| `just check-clean` | Assert the worktree is clean, or matches a supplied baseline. |

## Related pages

- [Quality gates](quality-gates.md)
- [Develop locally](../how-to/develop-locally.md)
- [Configuration](configuration.md)
