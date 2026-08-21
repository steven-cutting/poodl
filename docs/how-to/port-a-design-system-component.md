---
title: "Port a design system component"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [design_system_porting]
requires: []
---

# Port a design system component

The Biscuit Games design system lives in a Claude Design project ("Copy of Biscuit Games
Design"), as React reference components over the token vocabulary `src/app.css` now
carries. [Decision 0009](../decisions/0009-biscuit-games-design-system.md) ported what the
app consumes; this page is the procedure for porting the rest, one component at a time,
and the ledger of what remains.

## When to port, and when to restyle in place

Port a component when more than one consumer wants the same shape — that is what made
`Button` a component and left the settings switch a restyle of the native checkbox where
it stood. A design system component with one consumer is a file tax; take its styles into
the consumer and record the decision here instead.

## The recipe

1. **Read the reference component** in the design project (`components/**` there), and the
   spec surface that will consume it here. Where they disagree, the specification wins —
   that is AGENTS.md invariant 1, and it is why the ported keyboard has no tinted key
   fills.
2. **Map tokens, never hex.** Every colour in the port names a token from `src/app.css`.
   Two rules with teeth: a control's border is `--key-untried-rule` (or a result token),
   never `--rule` or `--rule-strong`, because a control's boundary owes
   `minimum_boundary_contrast` against the page and the decorative rules do not pay it in
   dark; and `--text-2`/`--text-3` are reading inks for the quiet grounds only. A new
   measured pair — any ink on any new ground — is added to `tests/contrast.test.ts`, which
   recomputes rather than trusts.
3. **Write the props contract in TypeScript**: `$props` with an explicit type,
   callbacks-as-props, no event dispatcher, no `...rest` spreading. Port the variants the
   app consumes and list the rest under "Unported variants" below.
4. **Land component, test and story in one change.** The test queries by role and name in
   `tests/`; the story covers the states the surface names, cites its guarantees, and
   pins dark and high contrast where the look inverts. Never set `box-shadow` on a
   pressable — the pressed ring in `app.css` is owed to every control.
5. **Run the gate**: the story run puts axe over every state at error level, then
   `just check`. Request `/chromatic` on the pull request — a port is a visual change, and
   that review is the design review.

## Add an icon

Drop the Lucide SVG in `src/lib/assets/icons/` (stroke 1.5, `stroke="currentColor"`,
covered by the ISC licence file already there), add one `?raw` import and one key in
`src/lib/components/icons.ts`, and the `IconName` union picks it up. Only imported icons
ship; the other twelve SVGs in the directory cost nothing until they are named.

## The ledger

What the design project holds that this repository has not ported, and what blocks each.

| Reference | What it is | Blocker or note |
| --- | --- | --- |
| `forms/Input`, `forms/Select` | Labelled field primitives | Fold `LinkReady`'s and `CustomGameForm`'s fields into `Input` when a third consumer appears. |
| `forms/SegmentedControl` | The theme picker's proper shape | Upgrade for `SettingsPanel`'s radios; keep the native inputs inside it. |
| `forms/SettingsRow` | The rule-separated preference row | Extract from `SettingsPanel` when a second panel wants rows. |
| `forms/Switch` | The 44×26 toggle | Ported as a restyle of the native checkbox inside `SettingsPanel`; extract on the same trigger as `SettingsRow`. |
| `core/Card`, `core/Badge` | Grouping chrome | No consumer yet. |
| `navigation/GameCard` | The platform's game-switcher tile | Waits for a second game. |
| `brand/MascotSlot` | Where Biscuit mounts | Waits for the illustrated poses. She lands at the boundaries — `GameConclusion`'s outcomes and the page bookends — and reduces to the mark when motion is off, per [Design direction](../design/direction.md). |
| `brand/Mark` as its own component | The reduced icon-mark | Folded into `Wordmark`; extract when the favicon or the mascot's motion-off state needs it standalone. |
| `feedback/Dialog`, `feedback/Toast` | The shell shapes | Ported as `Modal` and `Notice` restyles; extracting primitives buys nothing while each has one consumer. |
| `game/StatFigure`, `game/Distribution` | Statistics chrome | Ported as `StatisticsPanel`/`DistributionChart` restyles. The design system's current-attempt fill on the distribution needs last-game data no component receives — a spec change, not a restyle. |
| `game/Board`, `game/Tile`, `game/Key`, `game/Keyboard` | Reusable play primitives | This repository's own components carry the behaviour contracts; make them shared only when Pawjong exists to share them. |

Unported variants of ported components: `Button` `lg`/56px and its `warm` variant (the
one-per-screen accent — nothing has earned it yet), `IconButton`'s `outline` variant and
non-44 boxes, the twelve unimported icons.

## Related pages

- [Decision 0009: The Biscuit Games design system](../decisions/0009-biscuit-games-design-system.md)
- [Design direction](../design/direction.md)
- [Work in the component workshop](work-in-the-component-workshop.md)
- [Testing](../reference/testing.md)
