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
| Hard mode | Revealed letters must be reused. Judged at submission against the live setting, not the setting the game began with. Turning it off part way through a game bars turning it back on until the next one. |
| Welcome screen | What opening Poodl lands on: an introduction on a first visit, and afterwards Continue — labelled with the previous mode — alongside the four startable modes. Can be turned off, though it still appears when there is nothing to continue. |

## The modes

| Term | Meaning |
| --- | --- |
| Daily | One word a day, the same for everyone, playable once. The day turns at local midnight on the Pacific coast. Set aside rather than abandoned when another mode is chosen, and brought back by choosing Daily. Counts towards its own daily record, never the primary statistics. |
| Random | A single game, drawn from the pool of answers not yet used. Counts towards statistics. |
| Endless | The same, but the next game starts by itself after a ten-second countdown unless the player stops it. Stopping is final: the countdown does not resume. Counts towards statistics. |
| Practice | Draws directly from the answer list, repeats allowed. Records nothing at all. |
| Custom | The answer came from a link someone made. Records nothing, and is never remembered as the previous mode. |
| Startable mode | Daily, random, endless or practice — the four a player can ask for. A separate type from the mode a game has, so that asking for a custom game cannot be expressed. |
| Abandoned | A game replaced while in progress after at least one guess. Counts as a loss. A game replaced with no guesses in it leaves no trace. A daily game is never abandoned: it is set aside. |
| Set aside | A daily game off the board but kept, with its guesses, while another mode is played. Nothing is counted, and choosing Daily brings it back. |
| Day | A number, counted from 1 on the epoch date, that turns at local midnight in `America/Los_Angeles`. The daily word is indexed by it, and a shared daily grid carries it. |
| Schedule | The answer list in a fixed, append-only order, shipped as data. Day n plays entry n. |

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
