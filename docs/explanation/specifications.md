---
title: "Specifications"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [specification_model]
requires: []
---

# Specifications

Poodl's behaviour is written down, in a formal language, before it is built. The five
Allium modules under `docs/specs/` are the source of truth for what the game does. This
handbook, the code and the tests all answer to them.

The procedure is in [Work with the specifications](../how-to/work-with-the-specs.md).
This page is why.

## What a specification is for

A Wordle-like looks simple and is not. Scoring a guess against an answer has a well-known
trap — a guess that repeats a letter the answer holds once — and the difference between a
correct implementation and a plausible one is a couple of lines. Left to prose, that
detail gets lost. Stated as a contract with named invariants, it is testable:

> Pass one visits every position. Where the guess letter equals the answer letter at that
> position, the position is marked correct and claims one occurrence of that letter in
> the answer.

`src/lib/domain/scoring.ts` implements exactly that, and its comment says the two-pass
shape is the definition rather than a suggestion. The specification is quoted, not
paraphrased, because paraphrase is where the meaning goes.

## What the modules are

Five, with a one-way dependency graph rooted at the word lists:

```text
words  ←  game  ←  settings
   ↖       ↖   ←  statistics
       ←   ←   ←  sharing
```

`game.allium` deliberately does not depend on `settings.allium`. It declares an external
`PlaySettings` entity naming just the two settings that reach into play, and
`settings.allium` supplies them. One source of truth, named from two sides, so the
dependency runs one way only.

## Open questions are a feature

Each module ends with `open question` blocks — around twenty across the five. They are
product decisions nobody has made: whether a first visit should open onto a board or a
menu, whether five seconds is long enough to read an answer before the next game takes
over, whether an abandoned game should be shareable.

They are recorded rather than resolved on purpose. An unwritten gap gets filled in by
whoever writes the code first, silently and invisibly. A written one has to be answered
by someone entitled to answer it.

## What a specification is not

It is not a design document, and it does not choose a language, a framework, a storage
mechanism or a layout. `words.allium` states what any word list must satisfy and contains
no words. `sharing.allium` states what the obfuscation must guarantee and does not
describe a scheme. How is this repository's business; `AGENTS.md` decides that.

## Related pages

- [Work with the specifications](../how-to/work-with-the-specs.md)
- [Accessibility](accessibility.md)
- [Terminology](../project/terminology.md)
- [Decision 0003](../decisions/0003-specs-are-the-source-of-truth.md)
