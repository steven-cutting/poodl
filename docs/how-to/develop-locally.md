---
title: "Develop locally"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [local_development]
requires: []
---

# Develop locally

## Prerequisites

| Tool | Why |
| --- | --- |
| Node 26 | Runs the application, Vite and Vitest. |
| npm 11 | The package manager. Nothing else is supported. |
| `uv` | Provides the pinned Python tooling the hook gate runs on. |
| `just` | The task runner, and the only supported interface to the checks. |

Exact versions live in `package.json` (`engines`, `volta`) and in `.python-version`. A
`volta` block is present, so a Volta user gets the right Node automatically.

## First run

```console
just initialize
```

This creates `uv.lock` and `package-lock.json`, installs both toolchains and the Chromium
build the story tests need, normalises formatting, and installs the pre-commit hook. Run it
once per clone. It never stages, commits, tags or pushes.

## Every day

```console
just dev
```

Vite serves the app with hot module replacement. There is no backend to start, no
database to bring up and no proxy to configure; the browser talks to Vite and to nothing
else.

To build a component on its own, rather than by playing until the game produces the state
you want, run the workshop instead:

```console
just storybook
```

See [Work in the component workshop](work-in-the-component-workshop.md).

To see what a deployment would actually serve, build first and then preview:

```console
just frontend-build
just preview
```

To reproduce the published site exactly, use the base path the project site is served
from — on both commands, because the preview server reads it too and is what mounts the
site at `/poodl/`:

```console
BASE_PATH=/poodl just frontend-build
BASE_PATH=/poodl just preview
```

## Before handing work back

```console
just fix       # formats and applies the safe automatic repairs
just check     # the whole gate, read-only
```

`just fix` is the only command that is allowed to modify files. Every check is read-only,
and `just check` proves it by comparing the worktree before and after each recipe.

## Keeping the workspace current

After pulling, re-sync so the installed dependencies match the lockfiles:

```console
just sync
```

## Related pages

- [Commands](../reference/commands.md)
- [Test and debug](test-and-debug.md)
- [Work in the component workshop](work-in-the-component-workshop.md)
- [Troubleshooting](../operations/troubleshooting.md)
