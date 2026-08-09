---
title: "Test and debug"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [test_workflow]
requires: []
---

# Test and debug

## Run the suites

```console
just frontend-unit        # Vitest, once
just frontend-coverage    # Vitest with the coverage floor enforced
just frontend-static      # ESLint, Prettier check, svelte-check
just storybook-test       # every story in Chromium, with axe over each
```

To iterate on one file, call Vitest directly:

```console
npx vitest tests/scoring.test.ts
npx vitest --watch tests/components.test.ts
```

Framework configuration and conventions are described in
[Testing](../reference/testing.md); this page is about narrowing down a failure.

## Narrow down a failing test

1. Run the single file first. A failure that only appears in the whole suite is usually
   shared state, and there is very little of it here — the ports are constructed per
   test.
2. If a component assertion fails, read the DOM that Testing Library prints. It shows the
   accessible names, which is what the queries match on.
3. If the expectation is about marks, work the two passes through by hand against
   `docs/specs/game.allium`. The specification is the arbiter, not the current code.
4. Do not weaken an assertion to make it pass. If the specification is wrong, change the
   specification — see [Work with the specifications](work-with-the-specs.md).

## Debug a coverage failure

`just frontend-coverage` prints the uncovered lines per file. Two cases look alike and are
not:

- **Untested behaviour.** Add the test. This is the common case.
- **Unreachable code.** A defensive branch no input can reach, or a Svelte-compiled
  update branch for a value that never changes. Remove the branch rather than inventing
  a test that reaches it artificially.

Never lower the threshold in `vite.config.ts`.

## Debug a browser problem

There is no server, so the browser and the build output are the whole system.

```console
BASE_PATH=/poodl just frontend-build
BASE_PATH=/poodl just preview
```

The base path goes on both commands: the preview server reads it too, and mounts the site
at `/poodl/` the way Pages does.

If something works under `just dev` but not under `just preview`, suspect prerendering:
module-scope work runs once at build time, and anything per-visitor must happen in the
browser.

## Related pages

- [Testing](../reference/testing.md)
- [Quality gates](../reference/quality-gates.md)
- [Work in the component workshop](work-in-the-component-workshop.md)
- [Troubleshooting](../operations/troubleshooting.md)
