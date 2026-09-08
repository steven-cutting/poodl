---
title: "The platform upstream"
kind: "project"
audience: [contributor, maintainer, agent]
canonical_for: [platform_upstream]
requires: []
---

# The platform upstream

Poodl is one game on a platform, and the platform is a repository of its own:
[Biscuit Games](https://github.com/steven-cutting/biscuit_games). Everything two games would
share is decided there and installed here. This page says what that covers, which version of
it is installed, what holds the two repositories to the same words, and where to read the
rest.

## What is decided there, and what is Poodl's

The platform decides how a Biscuit Games surface looks, how it is worked, and what it owes
when it is played on: the aesthetic, the Biscuit character, the design tokens and the two
typefaces, the shared components, the cell and the key a play surface is built from, the
preferences and keys ports, the design research, and the specifications for all of it.

Poodl decides its own rules and the specifications that state them; how its play surface is
arranged, which is six rows of five; what a mark means and the words it says about one; its
word lists; and its address. `Board` and `DistributionChart` stay here for that reason — an
arrangement encodes a rule, and a distribution draws a game's own data.

The question the boundary turns on is whether a second game would need the thing unchanged.
A cell is a cell in any game; six rows of five is Poodl.

## What is installed

`@steven-cutting/biscuit-games` at **1.0.0**, pinned exactly, from GitHub Packages. Reading
it needs a token — [Develop locally](../how-to/develop-locally.md) has the line, and
[Maintain dependencies](../how-to/maintain-dependencies.md) covers moving to a later version.

The package carries the token stylesheet, the two typefaces, the icon set, the shared
components, the two ports with their fakes, the appearance derivations, three Allium modules
and its own changelog. All of it is readable offline once installed, under
`node_modules/@steven-cutting/biscuit-games/`, which is where the stylesheet
`tests/contrast.test.ts` measures and the specifications `tests/platformSpecs.test.ts` reads
actually live.

## What holds the two together

Allium cannot import across repositories, and putting a module inside `node_modules` does not
give it one. So Poodl restates the clauses it needs and a test holds the restatements to the
platform's text: the six `Appearance` guarantees in `docs/specs/settings.allium`, the four
`DirectManipulation` invariants in `docs/specs/game.allium`, and the six figures both
declare. `tests/platformSpecs.test.ts` is that test, and it is deliberately over-sensitive —
a reworded comma fails it, which is the one moment somebody is required to say whether the
platform's meaning moved. When it did, the clause is amended upstream and taken here as a
version.

Everything else the platform decides arrives as code, so a change to it arrives as a version
bump that `just check` can see.

## Where to read it

The platform's handbook is published nowhere, so these are repository links. They resolve to
whole pages, never to a heading: nothing on either side checks a fragment across the
boundary.

| Page | What it decides |
| --- | --- |
| [What the hub owns](https://github.com/steven-cutting/biscuit_games/blob/main/docs/project/what-the-hub-owns.md) | The boundary itself, and the question a new fact is put to. |
| [Design direction](https://github.com/steven-cutting/biscuit_games/blob/main/docs/design/direction.md) | The aesthetic: dark first, the type, the density, the motion, the voice. |
| [The Biscuit character](https://github.com/steven-cutting/biscuit_games/blob/main/docs/design/character.md) | Biscuit herself, and how sparingly she is used. |
| [Design tokens](https://github.com/steven-cutting/biscuit_games/blob/main/docs/design/tokens.md) | What is in the stylesheet Poodl wears. |
| [Design resource index](https://github.com/steven-cutting/biscuit_games/blob/main/docs/design/resource-index.md) | The reading behind the vocabulary. |
| [Mobile and game design research](https://github.com/steven-cutting/biscuit_games/blob/main/docs/design/research-report.md) | The research report itself. |
| [Port a design system component](https://github.com/steven-cutting/biscuit_games/blob/main/docs/how-to/port-a-design-system-component.md) | How a component gets built there, and the ledger of what is left. |
| [Consume the hub](https://github.com/steven-cutting/biscuit_games/blob/main/docs/how-to/consume-the-hub.md) | The procedure this repository followed. |
| [Published artefacts](https://github.com/steven-cutting/biscuit_games/blob/main/docs/reference/published-artefacts.md) | What the package contains, and what a version number promises. |
| [Poodl handover](https://github.com/steven-cutting/biscuit_games/blob/main/docs/operations/poodl-handover.md) | The ledger this repository worked through, and what it still records. |
| [Architecture decisions](https://github.com/steven-cutting/biscuit_games/blob/main/docs/decisions/README.md) | Every decision made there, including the four below. |
| [Their decision 0012](https://github.com/steven-cutting/biscuit_games/blob/main/docs/decisions/0012-the-domain-root-stays-with-poodl.md) | Why the domain root is still Poodl's. |
| [Their decision 0013](https://github.com/steven-cutting/biscuit_games/blob/main/docs/decisions/0013-shared-material-travels-as-a-package.md) | Why shared material travels as a package. |
| [Their decision 0014](https://github.com/steven-cutting/biscuit_games/blob/main/docs/decisions/0014-the-hub-holds-the-design-system.md) | Why the design system's implementation moved there. |
| [Their decision 0015](https://github.com/steven-cutting/biscuit_games/blob/main/docs/decisions/0015-operation-and-play-are-specified-here.md) | Why operation and play are specified there. |
| [Their decision 0016](https://github.com/steven-cutting/biscuit_games/blob/main/docs/decisions/0016-the-play-surface-is-the-platforms.md) | Why the cell and the key are the platform's. |

Two of those are numbered 0013 and two 0012 — the platform's and this repository's records
are numbered independently, so a bare number means nothing without the repository. The ones
above are all the platform's; Poodl's are in
[Architecture decisions](../decisions/README.md).

## What nothing here checks

Every link above is an `https://` URL, and the documentation contract skips those: the
exact-case, must-resolve rule that governs an internal link does not apply, and the offline
link checker passes `--offline`. Only `just check-links-online` resolves them, and it is run
by hand — monthly, per [Maintenance](../operations/maintenance.md).

So a page renamed upstream rots here until somebody runs it. That is permanent rather than a
gap somebody will close, and it is why these are whole-page links: a heading fragment across
the boundary is checked by nothing at all, on either side.

## Related pages

- [Decision 0013: The design system arrives as a package](../decisions/0013-design-system-as-a-package.md)
- [Decision 0010: The Biscuit Games design system](../decisions/0010-biscuit-games-design-system.md)
- [Maintain dependencies](../how-to/maintain-dependencies.md)
- [Specifications](../explanation/specifications.md)
- [Quality gates](../reference/quality-gates.md)
