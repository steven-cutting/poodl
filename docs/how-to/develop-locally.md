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

This creates `uv.lock` and `package-lock.json`, installs both toolchains, normalises
formatting, and installs the pre-commit hook. Run it once per clone. It never stages,
commits, tags or pushes.

## Every day

```console
just dev
```

Vite serves the app with hot module replacement. There is no backend to start, no
database to bring up and no proxy to configure; the browser talks to Vite and to nothing
else.

To see what a deployment would actually serve, build first and then preview:

```console
just frontend-build
just preview
```

To reproduce the published site exactly, build with the base path the project site uses:

```console
BASE_PATH=/poodl just frontend-build
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
- [Troubleshooting](../operations/troubleshooting.md)
