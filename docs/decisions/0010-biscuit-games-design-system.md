---
title: "Decision 0010: The Biscuit Games design system"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_design_system]
requires: []
---

# Decision 0010: The Biscuit Games design system

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
  survive, so `tests/directManipulation.test.ts` and the pressed ring needed no edit. The
  warm family is spent in exactly one place, and it is the design system's own: `::selection`
  paints `--brand-warm-ink` on `--brand-warm`. A token measured and never rendered is a
  figure that cannot regress where anyone would see it, so the gate asserts the rule exists.
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
- **Typed tiles are drawn in `--rule`, not `--rule-strong`.** The design system firms the
  border the moment a letter lands. Here the whole grid stays on the faintest rule and a
  typed cell separates by weight alone — `--rule-w-strong` against `--rule-w` — so the
  board is lighter than the system draws it, which is the point: the grid recedes and the
  letters carry it. No guarantee reads the step, because a typed tile carries its letter
  at 19.68 and an accessible name of its own.
- **An unavailable control is exempt from the legibility floor, and the specification says
  so.** The design system's `Button` paints a disabled control in `--text-disabled` on
  nothing, bounded by `--rule`, and this port keeps that shape. What it had not kept was
  the ink: `--text-disabled` had drifted lighter than the system on three of the four
  palettes — neutral-9 where `tokens/theme-light.css` says neutral-8, neutral-9 again in
  light high contrast where it says neutral-7, neutral-6 in dark high contrast where
  `tokens/theme-dark.css` says neutral-7 — and no bullet here claimed it, so it was drift
  rather than a decision. The system's own values are restored, which lifts the ink from
  1.36–2.48 to 2.31–4.62 against the page and the raised surface.
  That still does not clear 4.5 in either standard palette, the `--rule` boundary measures
  1.19–4.62 against 3.0, and the on-screen keyboard dims itself at `opacity: 0.5` when a
  game ends — Poodl's own doing, since the system's `Key` has no disabled state at all —
  which halves every key's figures again. So the remaining choice was to repaint past what
  the design asks for or to say what the design already meant, and `settings.allium` gained
  `Appearance.@guarantee AnUnavailableControlIsExempt` beside
  `EveryCombinationMeetsTheLegibilityFloor`: WCAG 2.2 exempts an inactive component from
  1.4.3 and 1.4.11 for the reason that applies here too — dimming is *how* unavailability
  reads, and a dim held to a live control's bar would not read as one. The exemption is
  only from the figures. A dimmed control still reports its state to the accessibility tree
  and still keeps every non-colour indication its live form carried, which is why a
  switched-off scored key keeps its marker bar and its description. See
  [Accessibility](../explanation/accessibility.md) for the model, and
  `tests/components.test.ts` for the half of it that is not a ratio.
- **A control with no drawn edge owes no edge contrast.** `ghost` is `transparent` on
  transparent in the design system too, and the boundary clause used to read as though it
  owed 3.0 anyway. `EveryCombinationMeetsTheLegibilityFloor` now says a control is
  identifiable by the boundary it draws or, where it draws none, by its own words — which
  `ghost` pays in `--text-2`, already measured on both grounds. No pixel moved; the clause
  stopped being ambiguous about a variant the app ships in `Notice`.
- **No destructive button variant.** "Clear everything" is a secondary button;
  `ResettingIsDeliberate` puts the weight on the two-step confirmation and the sentence
  naming what will go, not on a colour a colour-blind reader would miss.
- **The warm pair is one pinned pair, not four.** The brand ink is biscuit-1, not
  biscuit-2, which measures 4.25 on biscuit-6 against the 4.5 text floor; and
  `--brand-warm`/`--brand-warm-ink` are declared once on bare `:root` rather than answered
  per theme the way the design system answers them. Two of its four pairs measure under
  that floor — biscuit-2 on biscuit-6 at 4.25 in dark, biscuit-7 on biscuit-3 at 4.40 in
  light — where the pinned pair measures 6.93 in every palette. The lockup itself stays
  neutral, as the design system's own `Mark` does at its default tone: `::selection` is the
  one place the pair is spent, what makes the wordmark the wordmark is the name and the
  face it is set in rather than a colour — see
  [the design direction](../design/direction.md) — and the mark's one break is the fourth
  corner.
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

The board is drawn in `--rule` throughout — 1.30 against the dark page and 1.48 against
the light one, the figure the old file called "a grid that had to be inferred". The design
system draws its empty cell there and firms the typed one; this board keeps both on the
faint rule, so the grid recedes further than the system's own and the letters carry it.
No gate can settle whether that reads, because tiles sit outside the measured floors — it
is a thing to look at in Chromatic, and the way back is `--rule-strong`, which costs no
test churn for the same reason.

**The system reaches one surface no gate renders.** The landing page at the domain root
wears `src/app.css`, so it moved with everything else — the renamed tokens it used are
now `--rule` and `--text-2`, and it is set in the display face rather than in a system
sans. [Decision 0009](0009-poodl-lives-at-pnut-fans.md) already records that nothing
renders, measures or types at that page, and this decision makes the coupling wider than
colour: `scripts/stage_site.sh` now has to copy the fonts to the path the stylesheet
names, and a token renamed here can leave a rule there resolving to nothing without any
gate saying so. Until that page is inside a gate, renaming a token means grepping
`site-root/` as well as `src/`.

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
- [Decision 0009: Poodl lives at pnut.fans](0009-poodl-lives-at-pnut-fans.md)
