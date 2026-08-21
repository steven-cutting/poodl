---
title: "Decision 0009: The Biscuit Games design system"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_design_system]
requires: []
---

# Decision 0009: The Biscuit Games design system

## Context

[Design direction](../design/direction.md) decided how Biscuit Games looks — dark is home,
thin rules rather than heavy fills, one rationed warm family, a face with fingerprints —
and the interface still wore the walking skeleton's styling: system fonts, filled marks,
a centred "POODL" heading. A complete design system was generated from that page in a
Claude Design project ("Copy of Biscuit Games Design"), as React reference components over
a token vocabulary, with restroked Lucide icons and the two typefaces the direction page
had shortlisted. The project's own readme flagged its colour values as unverified
proposals.

Adopting it wholesale was not on offer. The reference components are React; this
repository is Svelte 5 with its own accessibility contracts; and the mechanics the old
palette carried — the ■▲× glyphs, the ground-to-ground separation figures — are pinned by
`docs/specs/game.allium`, so the indication scheme had to move in the specification first.
That spec change landed on its own, ahead of this one: marker bars replace the glyphs, the
untried key hugs the page, and the mark separation rides the drawn borders.

## Decision

Port the design system into `src/app.css` and the Svelte components — only as much of it
as the app consumes, with the rest recorded in
[Port a design system component](../how-to/port-a-design-system-component.md).

- **Tokens.** `src/app.css` holds the raw palette (pure neutrals, the biscuit ramp, the
  result hues chosen dark-first), the semantic vocabulary (`--surface*`, `--rule*`,
  `--text*`, `--result-*`, the key grounds), and the type, space, form and motion scales.
  The legacy names the pinned rules depend on — `--background`, `--text`, `--focus` —
  survive, so `tests/directManipulation.test.ts` and the pressed ring needed no edit.
- **Fonts.** Bricolage Grotesque for display and the board, Instrument Sans for the
  interface: committed latin-subset variable woff2 files under `src/lib/assets/fonts/`,
  extracted from the pinned fontsource 5.3.0 packages (provenance, URLs and checksums in
  the `app.css` header), with the OFL texts beside them. Both files carry the `tnum`
  feature the statistics figures ask for — verified from the files, not the foundry page.
- **Icons.** All 22 restroked Lucide SVGs under `src/lib/assets/icons/` with the ISC
  licence; the ten the app consumes are inlined through `?raw` imports in
  `src/lib/components/icons.ts` and rendered by `Icon.svelte`, always `aria-hidden`.
- **Primitives.** `Icon`, `IconButton`, `Button`, `Wordmark`, `HeaderBar` and `HowToPlay`
  are new; `Modal` takes the design system's dialog shape (title row with Close first, an
  optional footer for actions) and `Notice` its toast shape. The brand mark is folded into
  `Wordmark` rather than a component of its own, because nothing else consumes one.
- **The header owns navigation.** The page renders `HeaderBar`; `GameNavigation` keeps its
  file, its surface and its tests, and becomes the dialog the header's mode chip opens.
  The header is the page's rather than the layout's, forced by callbacks-as-props: the
  controls need the page's panel state and the store's callbacks, and a layout with no
  context has no way to receive either.
- **Mascot deferred.** No `MascotSlot`, and no placeholder where one would go: the
  direction page rations Biscuit hard, and a reserved hollow slot is a second break. The
  porting guide records where she eventually mounts.

## Deviations from the design system as shipped

Recorded here because the design project stays readable and someone will diff them. The
readme called its hues proposals; these are the corrections verification forced, each one
computed by `tests/contrast.test.ts` against the floors `game.allium` states.

- **The dark absent letter is `#8e8e8e`, not neutral-7.** `#767676` measures 3.75 on the
  scored ground against a 4.5 floor. The replacement sits in the only window that clears
  4.5 there while holding `minimum_state_separation` under the untried letter — 3.28
  against 3.0, one of the tightest pairs in the palette.
- **The light absent borders are dark — neutral-5, and neutral-2 in high contrast.** The
  design system drew them in light greys that measure under 1.5 against the white page,
  and an absent key is a control whose boundary owes 3.0. No light value satisfies both
  that and `minimum_mark_separation` against exact, so the border crosses to the dark side
  of exact and the separation is a distance with no direction — which is how the amended
  guarantee words it.
- **Scored keys sit on the neutral raised ground in every theme.** The design system gave
  light-theme exact and present keys tinted fills; the tint moves the ink's measured
  ground per state and buys nothing the border, letter and bar do not already carry, so
  the tiles keep the light-only fills and the keys do not.
- **The untried key's border is neutral-7, not `--rule`.** Same reason as the absent
  border: a control's boundary, not a decoration, and the design system's `--rule` is 1.30
  against the dark page.
- **No destructive button variant.** "Clear everything" is a secondary button;
  `ResettingIsDeliberate` puts the weight on the two-step confirmation and the sentence
  naming what will go, not on a colour a colour-blind reader would miss.
- **The brand mark's ink is biscuit-1, not biscuit-2**, which measures 4.25 on biscuit-6
  against the 4.5 text floor.
- **The shell is 34rem, not 480px.** The bottom keyboard row is ten flex shares and eight
  gaps plus the gutters; a 480px shell caps a letter key at about 40px on a screen with
  room for 44, and `EveryControlIsAComfortableTarget` lets only the screen take that away.
- **Tiles are 48px, not the reference 56px.** Five 56px tiles and their four gaps come to
  300px, and the narrowest supported viewport leaves the shell a 288px content box — the
  reference was drawn for a wider column than the specification permits. 48px keeps the
  board inside every supported screen, and the letter scales with the cell.
- **The favicon waits.** `app.html` keeps its empty data-URI until the reduced icon-mark
  exists; the typographic placeholder in `Wordmark` is a header lockup, not an icon.

## Consequences

The game finally looks like the direction page reads, and the whole visual surface moved
in one change: every Chromatic snapshot diffs, and the `/chromatic` review of that pull
request is the design review before the merge re-baselines.

The committed fonts are ~240KB of repository weight and the one asset class the lockfiles
do not govern; the provenance comment in `app.css` (package, version, tarball sha256) is
what stands in for a lockfile there. The icons are bundle-inlined strings, so an icon
added carelessly ships even if never rendered — the map in `icons.ts` imports only what
the app draws.

`Button` grew a bindable `element` prop for the one caller that moves focus by hand.
That is a contract widening accepted knowingly; the alternative was `StatisticsPanel`
keeping a hand-styled native button forever.

The empty dark board is drawn in `--rule` at 1.30 against the page — the figure the old
file called "a grid that had to be inferred". It follows the design system deliberately
and is a thing to look at in Chromatic; the escape hatch, promoting empty tiles to
`--rule-strong`, costs no test churn because tiles sit outside the measured floors.

## What would reopen this

The mascot arriving, which brings `MascotSlot` and the favicon in from the porting guide.
A second game, which would pull the board primitives out into shared components and test
the "same instrument, different attachment" claim for real. Or the design project moving
ahead of this repository — the sync is manual, and the porting guide is the procedure.

## Related pages

- [Design direction](../design/direction.md)
- [Port a design system component](../how-to/port-a-design-system-component.md)
- [Accessibility](../explanation/accessibility.md)
- [Decision 0008: Visual review in Chromatic](0008-visual-review-in-chromatic.md)
