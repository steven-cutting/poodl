---
title: "Decision 0003: Specifications decide behaviour"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_spec_first]
requires: []
---

# Decision 0003: Specifications decide behaviour

## Context

Poodl's behaviour was written in Allium before any code existed: five modules under
`docs/specs/`, covering the word lists, one game, settings, statistics and sharing. The
question was whether they remain authoritative once implementation starts, or become a
design document that quietly falls behind.

A Wordle-like is a good argument for the former. Scoring a guess against an answer has a
well-known trap, and the difference between a correct implementation and a plausible one
is a few lines. Left in prose, that detail is lost in the first refactor.

## Decision

The specifications are the source of truth for behaviour. `AGENTS.md` states the split:
when deciding *what* the game should do, the specifications win; when deciding *how* to
build it, `AGENTS.md` wins.

In practice: behaviour changes in the specification first, then in the tests, then in the
code. No rule, guard or threshold the specifications state is re-decided in code. A test
is never weakened to make it pass — the specification is corrected and the tests are
re-derived.

## Consequences

Contracts become testable obligations rather than intentions. `GuessScoring` names six
invariants, and `tests/scoring.test.ts` asserts them directly, including the
duplicate-letter cases that a single-pass implementation gets wrong.

Unresolved product decisions stay visible. They are recorded as `open question` blocks and
answered by someone entitled to answer them rather than by whoever writes the code first.
The twenty the five modules started with were settled that way, in an interview, before a
single rule was built on top of them.

The costs are real. Every behaviour change is two edits, not one. The `allium`
command-line tool is not installed here, so the specifications are checked by review
rather than mechanically, which means drift is possible between reviews.

## What would reopen this

If the specifications stopped being maintained — if a behaviour change landed in code
without a matching edit and nobody noticed — the honest response would be to distil them
back from the implementation and restart, or to abandon the approach outright rather than
keep a document that lies.

## Related pages

- [Specifications](../explanation/specifications.md)
- [Work with the specifications](../how-to/work-with-the-specs.md)
