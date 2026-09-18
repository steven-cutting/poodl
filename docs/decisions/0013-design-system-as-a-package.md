---
title: "Decision 0013: The design system arrives as a package"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_design_system_as_a_package]
requires: []
---

# Decision 0013: The design system arrives as a package

## Context

[Decision 0010](0010-biscuit-games-design-system.md) ported a design system into this
repository and, with it, three pages about a platform: how Biscuit Games looks, the research
behind that, and how to port the next component. Poodl was the only game, so owning the
platform's opinions here cost nothing visible.

Biscuit Games is now a repository of its own, and it decides all of that. It publishes
`@steven-cutting/biscuit-games`, and its handover ledger names what this repository owes.

Every copy here was correct on the day it was made and unverifiable from the next. Two of
them had already drifted: `docs/specs/settings.allium` and `docs/specs/game.allium` restated
ten clauses the platform states, and the platform reworded one of them three times after the
port — its `EveryControlIsAComfortableTarget` names two shapes that cannot meet the touch
figure and counts the gaps between controls, where Poodl's copy still said the on-screen
keyboard was the only one. Nothing anywhere compared the two, and nothing would have.

## Decision

Install the package at an exact version, and delete every copy it makes redundant.

- **Installed exactly.** `1.0.0`, no caret, matching invariant 4. GitHub Packages
  authenticates every read, so a committed `.npmrc` names the registry for the scope and
  holds no token; the token is a contributor's own in `~/.npmrc`, and in CI it is the one
  GitHub mints for the run.
- **Deleted here.** `src/app.css` and the two typefaces; the icon set and its map; `Icon`,
  `IconButton`, `Button`, `Modal`, `Notice`, `Announcer`, `HeaderBar`, `Tile`, `Keyboard`
  and `PhysicalKeyboard`; the preferences port and the appearance derivations. `ThemeChoice`
  is re-exported from the package rather than declared.
- **Kept here.** `Board` and `DistributionChart`, because an arrangement encodes a rule and a
  distribution draws a game's own data. `HowToPlay` and its dialog wrapper, which are Poodl's
  words over the platform's frame rather than copies of anything. `Lockup`, because the
  platform's wordmark says "biscuit games" and a page needs to name itself. `src/lib/config.ts`
  and every test that measures a figure Poodl's own specifications state.
- **The mark vocabulary stays Poodl's.** The engine says `correct`; the platform paints
  `exact`. `markFor` translates at the one boundary where a mark reaches something rendered,
  and `describeResults` is untouched, so row labels and announcements are unchanged.
- **The restated clauses take the platform's words**, and `tests/platformSpecs.test.ts` holds
  them there. Poodl keeps its own `Appearance` surface and its own `config` entries: the
  package makes the two comparable, not merged, and deleting the entries would fail
  `check-specs`, because Poodl's own clauses cite them.
- **The workshop composes the platform's**, opt-in behind a flag so gate 6 stays offline
  by default; see [Quality gates](../reference/quality-gates.md).
- **Three pages leave.** The design direction, the design resource index and the porting
  guide are decided upstream. [The platform upstream](../project/platform.md) is the one page
  that replaces them, and it is the only thing here that points outward.

## Consequences

**A first run needs a credential.** There is no anonymous install, and the registry answers
an unauthenticated read by naming the package rather than the missing token — a 404 that
sends a reader to look for the wrong fault. That is the honest price of the mechanism and it
is written down in three places, including the troubleshooting page.

**A build here can now fail because of something that happened there.** That is the point:
drift becomes a version number in a lockfile rather than a difference nobody can see. What
it costs is that a platform release nobody has read can break this repository's gate, and
the gate is the only thing that will ever say Poodl is behind.

**Some things look different.** Every keyboard baseline in Chromatic diffs — the platform
draws one marker bar for cells and keys alike where Poodl drew two sizes, and pads a key on
the spacing scale. `SettingsPanel`'s rows needed their layout scoped to win back an
arrangement the platform's new label rule would otherwise have taken, and the notices and
the header may move. The board's reveal survives, in `Board`, because the platform's cell is
still and how a row of them arrives is an arrangement.

**Some things behave differently, and better.** The dialog's focus trap computes real tab
stops rather than trusting a selector, which repairs a latent defect Poodl's copy carried.
A key surrenders Space as well as Enter to a focused control. The long s is no longer
mistaken for a letter. A mark handed no words is drawn as no mark at all, which is a refusal
Poodl inherits and has to keep feeding real sentences.

**Ten clauses are no longer Poodl's to word.** Amending one means a change upstream and a
version bump here. That is a real loss of local authority, taken deliberately: the
alternative was two specifications with the same clause names and different meanings, which
is what this repository had.

**The cross-repository links rot silently.** Nothing offline checks them, and
`just check-links-online` is monthly and manual.

## What would reopen this

A contributor the token scheme cannot serve. A component, a token or a clause Poodl needs
and the platform will not take. The platform publishing its handbook, which would turn the
citations into something a package carries. Or a second game, which would make the boundary
something two consumers negotiate rather than one.

## Related pages

- [The platform upstream](../project/platform.md)
- [Decision 0010: The Biscuit Games design system](0010-biscuit-games-design-system.md)
- [Decision 0009: Poodl lives at pnut.fans](0009-poodl-lives-at-pnut-fans.md)
- [Maintain dependencies](../how-to/maintain-dependencies.md)
- [Quality gates](../reference/quality-gates.md)
- [Testing](../reference/testing.md)
