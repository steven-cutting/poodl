---
title: "Layering and dependency direction"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [dependency_boundaries]
requires: []
---

# Layering and dependency direction

Five layers, and imports only ever run downwards.

| Layer | May import | Must not |
| --- | --- | --- |
| `src/routes/` | app, components, domain, ports | be imported by anything below it |
| `src/lib/components/` | components, app types, domain, types | import a port adapter, an engine, or reach for a browser global |
| `src/lib/app/` | domain, ports, config, types | import a component or a route |
| `src/lib/domain/` | domain, config, types | import a component, a port, or anything with a side effect |
| `src/lib/ports/` | types, config, data | import a component or a route |

`src/lib/config.ts` and `src/lib/domain/types.ts` sit below everything and import nothing.

`src/lib/app/` is the rules. `engine.ts` is one pure function over the whole state, with the
clock, the randomness and the word lists arriving as an argument rather than as imports, and
`store.svelte.ts` is the only rune-bearing file that is not a component or a route — the one
place the application's state lives. Components and the route take `$props` throughout and
keep a little view state of their own, but a fact the reducer owns is never among it. The
reasoning is in [Decision 0007](../decisions/0007-rules-as-a-reducer.md); the consequence for
this page is the row above and the sentence below it.

A component may name a type from `app/` — `GameState`, `Notice` — because that is the
vocabulary it renders. It may not call `reduce`, construct a store, or import a port: what a
component does when a key is pressed is call the callback it was handed.

## Why the direction matters

The rule is not tidiness. It is what makes the two claims below true, and each of them is
load-bearing:

**The domain is testable without a browser.** `scoreGuess` and `keyboardKnowledge` take
values and return values. They have no clock, no storage and no randomness, so a test is
a table of inputs and expected outputs and nothing else.

**The rules are testable without a component.** `reduce` is the same claim one layer up: a
state, a command, an environment of fakes, and a new state. Four suites drive it directly,
which is why the specification's harder obligations are held where they can be read rather
than inferred from a rendered screen.

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

There are seven: storage, randomness, the clock, the clipboard, the word lists, the device's
preferences and a repeating timer. The last two arrived with the settings and the endless
countdown, and both take their platform object as an argument for the usual reason — jsdom
supplies a `window` without `matchMedia`, so the adapter has to answer for its absence
itself rather than being stubbed around.

The rule that follows: **tests inject fakes, they never stub globals.** A stubbed global
leaks between tests and hides the fact that the code reached outside its layer.

## Enforcement

There is no import-boundary checker here — the template this repository draws from uses
one for its Python layers, but a five-directory frontend does not earn the machinery. The
direction is enforced by review, by the `svelte-change` and `code-review` skills, and by
the shape of the tests: code in the wrong layer is usually code that is hard to test.

## Related pages

- [Architecture](architecture.md)
- [Testing](../reference/testing.md)
- [Decision 0002](../decisions/0002-ports-and-fakes.md)
- [Decision 0007](../decisions/0007-rules-as-a-reducer.md)
