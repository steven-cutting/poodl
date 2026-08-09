---
title: "Make your first change"
kind: "tutorial"
audience: [contributor, agent]
canonical_for: [first_change_tutorial]
requires: []
---

# Make your first change

About half an hour, from a fresh clone to a green gate — the first run downloads a browser.
The change is small on purpose; what matters is that it passes through every layer the
repository has.

## 1. Get the workspace running

```console
just initialize
just check
```

`just initialize` creates the lockfiles, installs both toolchains, downloads the Chromium
build the story gate renders in, normalises formatting and installs the pre-commit hook. It
never stages, commits, tags or pushes. If it complains about a missing tool, read
[Develop locally](../how-to/develop-locally.md).

## 2. See the app

```console
just dev
```

Open the address it prints. You will see a board with two scored guesses and a keyboard.
The marks on the board came from real scoring code, not from fixtures.

## 3. Read what decides the behaviour

Open `docs/specs/game.allium` and find the `GuessScoring` contract. It states the two
passes that turn a guess into marks, and it is deliberately explicit that the two-pass
shape is the definition rather than a suggestion. `src/lib/domain/scoring.ts` implements
exactly that, and says so.

## 4. Change something

Add a case to `tests/scoring.test.ts` for a guess and answer pair that repeats a letter.
Work out by hand what the two passes should produce, then assert it.

```console
just frontend-unit
```

If your expectation and the code disagree, one of them is wrong — decide which by reading
the contract again, not by adjusting until it passes.

## 5. Add the behaviour and its test together

Now change something a player would notice. Give `Tile.svelte` a title attribute, or add
a mark description. Whatever you pick, the rule is the same: the component change and its
Testing Library assertion land in the same commit, and the assertion queries by
accessible role and name.

## 6. Run the whole gate

```console
just check
```

It runs every recipe in order and proves the run did not modify the worktree. Read only
the first failure; the later ones are often consequences. If a gate fails, do not work
around it — [Troubleshooting](../operations/troubleshooting.md) covers the common causes.

## 7. Commit

The pre-commit hook runs the read-only gate again. Nothing is pushed until you ask for it.

## What you just touched

A specification, a pure domain function, a component, two tests, and the gate. That is
the whole loop; every change after this one is the same shape.

## Related pages

- [Develop locally](../how-to/develop-locally.md)
- [Test and debug](../how-to/test-and-debug.md)
- [Work with the specifications](../how-to/work-with-the-specs.md)
