---
title: "Layering and dependency direction"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [dependency_boundaries]
requires: []
---

# Layering and dependency direction

Four layers, and imports only ever run downwards.

| Layer | May import | Must not |
| --- | --- | --- |
| `src/routes/` | components, domain, ports | be imported by anything below it |
| `src/lib/components/` | components, domain, types | import a port adapter, or reach for a browser global |
| `src/lib/domain/` | domain, config, types | import a component, a port, or anything with a side effect |
| `src/lib/ports/` | types, config, data | import a component or a route |

`src/lib/config.ts` and `src/lib/domain/types.ts` sit below everything and import nothing.

## Why the direction matters

The rule is not tidiness. It is what makes the two claims below true, and each of them is
load-bearing:

**The domain is testable without a browser.** `scoreGuess` and `keyboardKnowledge` take
values and return values. They have no clock, no storage and no randomness, so a test is
a table of inputs and expected outputs and nothing else.

**Components are testable without the platform.** A component that read `localStorage`
directly could only be tested where `localStorage` exists. Under Node 26 and jsdom it does
not — Node's own experimental global shadows jsdom's and stays undefined. Because the
storage adapter takes its backing store as an argument, that costs nothing: the test
passes a store in, and the real code path still runs.

## Where a side effect goes

If something new needs the outside world, it needs a port. A port is three things in one
file:

1. An interface naming what the application needs, in the application's vocabulary.
2. A real adapter, with the platform object as a defaulted argument rather than a global
   read.
3. An in-memory fake with the same interface.

The rule that follows: **tests inject fakes, they never stub globals.** A stubbed global
leaks between tests and hides the fact that the code reached outside its layer.

## Enforcement

There is no import-boundary checker here — the template this repository draws from uses
one for its Python layers, but a four-directory frontend does not earn the machinery. The
direction is enforced by review, by the `svelte-change` and `code-review` skills, and by
the shape of the tests: code in the wrong layer is usually code that is hard to test.

## Related pages

- [Architecture](architecture.md)
- [Testing](../reference/testing.md)
- [Decision 0002](../decisions/0002-ports-and-fakes.md)
