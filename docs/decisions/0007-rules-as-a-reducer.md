---
title: "Decision 0007: The rules are a reducer"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_rules_as_a_reducer]
requires: []
---

# Decision 0007: The rules are a reducer

## Context

`docs/specs/` states behaviour as rules: a trigger, a set of guards, and the changes that
follow. Roughly forty of them, spread across four modules, and many of them chained —
`NewGameRequested` reaches `DrawPooledAnswer`, which reaches `BeginGame`, which reaches
`RetireGame`, which may reach `RecordAbandonmentAsLoss`.

The obvious place to put that in a Svelte application is inside the components: a click
handler that draws an answer, sets some `$state`, and writes to storage. It is the shortest
path from a specification to a working screen, and it makes every rule untestable except
through a rendered component and unreadable except by tracing handlers across files.

## Decision

A fifth layer, `src/lib/app/`, holding the rules as one pure function and one rune shell:

- `commands.ts` — one command per trigger the specifications name.
- `state.ts` — the entities, as one value.
- `engine.ts` — `reduce(state, command, env) -> { state, effects }`. Every rule lives here,
  in a handler named after it.
- `persistence.ts` — that value to storage and back.
- `store.svelte.ts` — the only rune-bearing file that is not a component or a route, and the
  only place the application's state lives. It wires the ports in and does the two things a
  pure reducer cannot: write to the clipboard and watch a clock.

The clock, the randomness and the word lists arrive in `env` rather than being imported, so
the engine reaches nothing. The one effect that cannot be a value — the clipboard, which is
asynchronous and can fail — is handed back for the shell to perform, and its outcome comes
back as another command.

A rule whose guards do not hold returns the state by identity. That is not an optimisation:
it is how a caller, and a test, can tell that nothing happened.

## Consequences

Every rule is testable as a table of inputs and expected outputs, with no browser and no
component. Four suites drive the engine directly, split by the part of the specification
they cover, and they are where the specification's harder obligations are actually held —
that abandonment is recorded from the emission's parameters rather than from a game that is
about to be discarded, that hard mode is read live at submission, that the endless countdown
is armed at the win-or-lose transition and nowhere else.

Components became simple enough to be dull. They take values and callbacks and render; none
of them knows a port exists, and none decides anything a specification states.

The cost is indirection. Following a click to its effect means reading a command, a handler
and the store, where a handler that did the work inline would be one file. It also means a
component cannot reach for a shortcut: adding behaviour means adding a command, which means
naming the rule it comes from, which is the discipline the split exists to impose.

The layering page gains a layer, and with it the rule that `app/` may import `domain/` and
`ports/`, that a component may name a type from `app/` because that is the vocabulary it
renders, and that only a route reaches the runtime — `reduce`, the store, the ports. The
page states it; this records that it had to.

## What would reopen this

A second application on the same rules — a different front end, or a headless runner. That
would not so much reopen the decision as vindicate it: the engine already has no Svelte in
it, and the shell is the only thing that would need replacing.

Or the opposite: if Poodl stopped being specified, and the rules became whatever the
components happened to do, the reducer would be ceremony around nothing. That is a change to
[Decision 0003](0003-specs-are-the-source-of-truth.md) rather than to this one.

## Related pages

- [Layering and dependency direction](../explanation/layering.md)
- [Architecture](../explanation/architecture.md)
- [Decision 0002](0002-ports-and-fakes.md)
- [Decision 0003](0003-specs-are-the-source-of-truth.md)
