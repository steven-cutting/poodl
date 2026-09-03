---
title: "Specifications"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [specification_model]
requires: []
---

# Specifications

Poodl's behaviour is written down, in a formal language, before it is built. The six
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

Six, with a one-way dependency graph rooted at the word lists:

```text
words  ←  game  ←  settings
   ↖       ↖   ←  statistics  ←  daily
       ←   ←   ←  sharing
```

`daily.allium` sits furthest from the root. It depends on `statistics.allium` for the
reset it chains from, and reaches `game.allium` and `words.allium` directly for the game
it keeps and the schedule it reads. Nothing depends on it: the other modules name it only
in prose, where a guarantee has to say whose terms apply.

`game.allium` deliberately does not depend on `settings.allium`. It declares an external
`PlaySettings` entity naming just the settings that reach into playing and arriving, and
`settings.allium` supplies them. One source of truth, named from two sides, so the
dependency runs one way only.

## Open questions are a feature

An `open question` block records a product decision nobody has made yet. They are
recorded rather than resolved on purpose: an unwritten gap gets filled in by whoever
writes the code first, silently and invisibly, while a written one has to be answered by
someone entitled to answer it.

The first five modules carried twenty of them when they were first written — whether a
first visit should open onto a board or a menu, how long the endless countdown should
run, whether an abandoned game should be shareable. All twenty have since been answered,
and each answer is now stated as a rule, a guarantee or a config value with its question
deleted. Two are open now: whether a player may turn high contrast off while the device
asks for more, in `settings.allium`, and whether the day's word should be withheld from
the random pool, in `daily.allium`.

A low count is the normal state of a settled module, not a reason to stop using the
construct. A change that reaches a decision nobody has taken should add one rather than
guess.

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
