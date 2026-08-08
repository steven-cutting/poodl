---
title: "Terminology"
kind: "project"
audience: [contributor, maintainer, operator, agent]
canonical_for: [project_terminology]
requires: []
---

# Terminology

These words mean one thing here. Most of them come from the specifications, and using
them loosely is how a review ends up arguing about vocabulary instead of behaviour.

## The game

| Term | Meaning |
| --- | --- |
| Answer | The word the player is trying to find. Drawn from the answer list, or decoded from a custom link. |
| Guess | A submitted five-letter word, together with the marks it earned. Letters typed but not submitted are not a guess. |
| Attempt | One of the six chances. A rejected guess spends none. |
| Mark | What one position of one guess turned out to be worth: correct, present, or absent. |
| Correct | The letter is in the answer at that position. |
| Present | The letter is in the answer, but not at that position, and the answer still had an unclaimed occurrence of it. |
| Absent | Everything else, including the second copy of a letter the answer holds once. |
| Hard mode | Revealed letters must be reused. Judged at submission against the live setting, not the setting the game began with. |

## The modes

| Term | Meaning |
| --- | --- |
| Random | A single game, drawn from the pool of answers not yet used. Counts towards statistics. |
| Endless | The same, but the next game starts by itself after a countdown unless the player stops it. Counts towards statistics. |
| Practice | Draws directly from the answer list, repeats allowed. Records nothing at all. |
| Custom | The answer came from a link someone made. Records nothing. |
| Abandoned | A game replaced while in progress after at least one guess. Counts as a loss. A game replaced with no guesses in it leaves no trace. |

## The repository

| Term | Meaning |
| --- | --- |
| Specification | An `.allium` file under `docs/specs/`. Decides behaviour. |
| Surface | A boundary in a specification: what is exposed, what operations are provided, and what is guaranteed. |
| Guarantee | A named prose assertion on a surface. Acceptance criteria, not aspiration. |
| Port | An interface in `src/lib/ports/` standing in front of a side effect, with a real adapter and an in-memory fake. |
| Fake | The in-memory implementation of a port, used by tests. Not a mock: it behaves, rather than recording calls. |
| Gate | A check that can fail the build. Listed in [Quality gates](../reference/quality-gates.md). |
| Recipe | A `Justfile` target. The only supported way to run anything. |

## Related pages

- [Specifications](../explanation/specifications.md)
- [Repository map](repository-map.md)
