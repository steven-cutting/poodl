---
title: "Biscuit image backlog"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [biscuit_image_backlog]
requires: []
---

# Biscuit image backlog

Every image of Biscuit the game needs, in the order it needs them, each with a brief. The
page sits between three others and owns none of their questions:
[Design direction](direction.md#biscuit) says what she is for and where she may appear, the
[Biscuit character bible](biscuit-character-bible.md) says what every drawing of her holds to,
and [Biscuit reference photography](biscuit_pics/raw/README.md) says what each is drawn from.
This page draws nothing and decides nothing those three leave open; it says what to make,
where it goes, whether the specifications can show it yet, and when it is done.

As of 2026-08-24 none of it exists. The header wears a typographic placeholder — a lowercase
`b` in a ruled square — in `src/lib/components/Wordmark.svelte`; `src/app.html` and
`site-root/index.html` carry an empty favicon; and
[decision 0010](../decisions/0010-biscuit-games-design-system.md#decision) deferred the
mascot rather than leave a hollow slot for her.

## How to read an item

Each item is a task with the same fields.

- **Register** — the reduced icon-mark or the full illustrated Biscuit, the pair
  [Two registers](direction.md#two-registers) names. Stated once per group where every item
  shares it.
- **Mounts** — the surface or file it appears on, named from the specifications or from the
  porting guide's [ledger](../how-to/port-a-design-system-component.md#the-ledger).
- **Spec support today** — *exists* means the specifications already describe the moment and
  the image needs no clause of its own, because she carries no state; *needs a spec change*
  names what has to be specified first, through the `spec-change` skill, before anything is
  built to show it; *not applicable* means the item never mounts on a surface. The
  specifications are the source of truth for behaviour, and none of them mentions her.
- **Draw from** — the section of the photo index the drawing is taken from. The link is the
  brief; this page does not repeat it.
- **Done when** — a checkable acceptance. Every item also passes the bible's
  [review checklist](biscuit-character-bible.md#review-checklist), which is not repeated here.

Tick an item only once it has passed that review, and put the date beside it.

## Open questions this list does not settle

The bible's [open questions](biscuit-character-bible.md#open-questions) — who or what makes
the images, the rendering register, the age the sheet anchors to, and every choice the
photographs leave — are closed by the owner there, never by an item here. The direction's
first pose set was written as a commission; the route — commissioned, or generated in-house —
is open, so every brief below names what a drawing must contain and never who or what makes
it. Where this page says "the producer", read whichever route is chosen.

## Before anything is drawn

The sheet precedes any pose ([The first pose set](direction.md#the-first-pose-set)); the
icon-mark is built from traits the sheet fixes; and the shoot is the cheapest thing on the
list and closes what is still answerable, without blocking the sheet.

- [ ] **The closing photo shoot.** Not a drawing: the one session the photo index still asks
  for.
  - **Register** — none; source material, kept in `biscuit_pics/raw/full/`, never shipped.
  - **Mounts** — nothing; it feeds the sheet and the sign-off pose.
  - **Spec support today** — not applicable.
  - **Draw from** —
    [What this corpus cannot answer](biscuit_pics/raw/README.md#what-this-corpus-cannot-answer),
    whose shot list is one session: level and evenly lit at her own height, square
    side-on, head profile and walking away, all four feet and the whole tail inside the frame,
    nothing worn, something of known size on the floor, and a grey card in the first exposure.
  - **Done when** — the frames are in `full/`, indexed and graded like the rest, and each gap
    under that heading says what it closed. It does not block the sheet; it blocks measured
    proportions and the sign-off. Two gaps under that heading say a session cannot close them
    now — [The age the sheet is anchored to has no whole-body frame](biscuit_pics/raw/README.md#the-age-the-sheet-is-anchored-to-has-no-whole-body-frame)
    and [There is no clear view of an adolescent foot](biscuit_pics/raw/README.md#there-is-no-clear-view-of-an-adolescent-foot)
    — and the first says what closes it instead: accepting the inference or moving the anchor,
    which is the bible's row 3.
- [ ] **The character reference sheet.** Her proportions, colouring, face, ears, tail and
  paws, fixed once so the character cannot drift between illustrations.
  - **Register** — both; it is what both registers are held to.
  - **Mounts** — nothing; kept beside the photographs, not under `src/lib/assets/`, because
    source material never ships.
  - **Spec support today** — not applicable.
  - **Draw from** — [The fixed face](biscuit_pics/raw/README.md#the-fixed-face) and
    [What is fixed](biscuit_pics/raw/README.md#what-is-fixed) for what it locks;
    [What varies, and must be chosen](biscuit_pics/raw/README.md#what-varies-and-must-be-chosen)
    for the choices it has to make, with
    [the range she has to stay inside](biscuit_pics/raw/README.md#the-range-she-has-to-stay-inside)
    as the limit on one of them. What the sheet
    [must fix](biscuit-character-bible.md#what-the-reference-sheet-must-fix) is listed in the
    bible.
  - **Done when** — every choice the index says must be chosen is proposed on the sheet, once,
    with the frame it was taken from, and its row in the bible's open questions has been closed
    by the owner, so nothing on the sheet still reads provisional; the age the sheet anchors to
    is settled in row 3 and not before; the fixed face is on it frontal and in profile; and the
    bible's checklist has been applied to it before any pose is drawn.
- [ ] **The icon-mark construction.** A curl, an ear or a letterform, geometric, with exactly
  one element knowingly wrong ([The mark](direction.md#the-mark)); which element, the direction
  leaves "to the illustrator's brief" rather than deciding, and this list carries that choice to
  whichever producer is chosen.
  - **Register** — icon-mark.
  - **Mounts** — every item in the next group; nothing until it exists.
  - **Spec support today** — not applicable.
  - **Draw from** — [The reduced mark](biscuit_pics/raw/README.md#the-reduced-mark): frames
    chosen for their outline rather than their colour; never one with a sticker border; and an
    outline traced from a grown frame carries a grown dog's proportions, which the sheet may not
    be drawing.
  - **Done when** — the same shape reads at sixteen pixels and at header size; the wrong
    element is exactly one, and named; it sits beside the wordmark without softening it; the ink
    it is drawn in is a ramp stop or a declared neutral, settled in the bible's row 9, with
    decision 0010's neutral lockup as what it must sit beside without changing; and it holds in
    all four theme and high-contrast combinations.

## The reduced icon-mark

One asset, three mounts, all in the icon-mark register. It stands in the header, in the tab,
and wherever a pose would have been when motion is off.

- [ ] **Header.** Replace the typographic placeholder in `src/lib/components/Wordmark.svelte`.
  - **Mounts** — `HeaderBar`'s heading, through `Wordmark`; below about 26rem the words drop
    and the icon-mark stands alone.
  - **Spec support today** — exists; no surface names the lockup and none needs to.
  - **Draw from** — the construction above; nothing new is drawn.
  - **Done when** — it stays `aria-hidden`, so the lockup test in `tests/primitives.test.ts`
    passes unchanged; the `Wordmark` and `HeaderBar` stories are re-baselined through the
    Chromatic review; and the ledger's `brand/Mark` row says whether it was extracted.
- [ ] **Favicon.** The icon-mark in the tab, at the root and at `/poodl/`.
  - **Mounts** — `src/app.html` and `site-root/index.html`, which both carry
    `<link rel="icon" href="data:," />`. If it ships as a file it has to reach `build/` through
    `static/`, and `site/` through `site-root/` or a new copy in `scripts/stage_site.sh`, which
    today copies only `site-root/`, `src/app.css` and the fonts.
  - **Spec support today** — exists; nothing to specify.
  - **Draw from** — the construction above.
  - **Done when** — both empty data URIs are gone; `just stage-preview` shows the icon at `/`
    and at `/poodl/`; decision 0010's "The favicon waits" bullet and
    [the deploy page's](../how-to/deploy-to-github-pages.md) list of what `site/` contains are
    updated; and, if it ships as a file, it passes the large-file check in
    [the quality gates](../reference/quality-gates.md). Format and sizes are the implementer's
    call within the bible's criteria; the direction asks only that it work at sixteen pixels.
- [ ] **The motion-off state.** What stands where a pose would be when animations are off or
  reduced motion is requested ([When motion is off](direction.md#when-motion-is-off)).
  - **Mounts** — `brand/MascotSlot` when it is ported; it reads `animations_active` from
    `settings.allium`, which the store already derives.
  - **Spec support today** — exists for the reading
    (`ReducedMotionOverridesTheAnimationSetting`); whether the reduction itself deserves a
    guarantee is settled in the spec change for the first pose, not here.
  - **Draw from** — the construction above; the same asset, not a third drawing.
  - **Done when** — with animations off or reduced motion on, every pose mount shows the
    icon-mark and nothing else moves, driven by the preferences fake in the slot's test and
    story.

Two things that need no item of their own, one the direction lists and one it does not.
*Loading:* nothing loads today — the build is prerendered and fetches nothing — and the header
carries the icon-mark before hydration, so the header item covers it. *Touch and manifest
icons:* nothing in the repository asks for one — there is no web-app manifest and no
`apple-touch-icon` link — and adding one is a decision to be a home-screen app, not an image.

## The first pose set

The direction's budget, in its own order, which is also the order the specifications can show
them: the outcomes and the arrival have a surface today; the rest do not. Every item is the
full register. Nothing here mounts until `brand/MascotSlot` is ported, and the slot is code,
listed in the ledger, not an image.

- [ ] **Win.** The outcome pose for a won game.
  - **Mounts** — `GameConclusion` (`game.allium`), when `game.status` is won; the ledger names
    it as her outcome mount.
  - **Spec support today** — exists. She carries no state, so
    `OutcomeAnswerAndAttemptsAreAllShown` and `ConclusionIsAnnounced` are unaffected by her.
  - **Draw from** — [Outcome: win](biscuit_pics/raw/README.md#outcome-win): the face from the
    first two frames, the body attitude from the last two, as the index splits them.
  - **Done when** — the conclusion's content and announcement are unchanged with her present;
    the face is the sheet's face; the bible's checklist.
- [ ] **Loss.** The outcome pose for a lost game.
  - **Mounts** — `GameConclusion`, when `game.status` is lost.
  - **Spec support today** — exists, as for the win.
  - **Draw from** — [Outcome: loss](biscuit_pics/raw/README.md#outcome-loss): ear carriage
    and eye shape from the chin-down frame it names, with the standing walk-in as the other
    reading.
  - **Done when** — as the win; it reads as a loss beside the answer without carrying it.
- [ ] **Arrival.** The opening bookend.
  - **Mounts** — `Welcome` (`game.allium`). `ShownOnEveryArrivalUntilTurnedOff` lets a player
    switch that screen off, so a player who has done so meets this pose only when there is
    nothing to continue; that is the specification's choice, not this page's.
  - **Spec support today** — exists.
  - **Draw from** — [Bookend: arrival](biscuit_pics/raw/README.md#bookend-arrival): stride
    from the running pair, front assembly and head carriage from the standing frames, leg
    length from none of them.
  - **Done when** — Continue and the three modes stay one action away with her in frame
    (`ContinueAndTheThreeModesAreEqualChoices`); she is not in the header and not over the
    board.
- [ ] **Sign-off.** The closing bookend.
  - **Mounts** — no surface. What sign-off is — the conclusion closed, an endless run stopped,
    the tab left — is unspecified.
  - **Spec support today** — needs a spec change: a surface or trigger naming the moment, in
    the module the spec change chooses. It reads no port until the moment is named.
  - **Draw from** — [Bookend: sign-off](biscuit_pics/raw/README.md#bookend-sign-off) and
    [Nothing shows her leaving at ground level](biscuit_pics/raw/README.md#nothing-shows-her-leaving-at-ground-level):
    the level walking-away frame does not exist, so this item waits on the shoot.
  - **Done when** — the moment is specified; the frame exists; the pose reads as departing
    rather than settled, the distinction the index draws.
- [ ] **Idle after a long pause.** Ambient: she appears once the player has stopped.
  - **Mounts** — no surface. She would sit at the board once play has stopped, never
    obscuring state ([Where she is allowed to be](direction.md#where-she-is-allowed-to-be)).
  - **Spec support today** — needs a spec change: what a pause is and how long, where she
    appears, and a guarantee that she never covers the board or the keyboard. It would read
    `ClockPort` and `TimerPort`, both of which exist, plus whatever the specification says
    counts as activity.
  - **Draw from** —
    [Ambient: idle after a long pause](biscuit_pics/raw/README.md#ambient-idle-after-a-long-pause),
    the best-attested ambient moment in the set.
  - **Done when** — specified; she appears only after the specified pause and leaves on the
    next input; with motion off the icon-mark stands instead.
- [ ] **Sleepier late at night.** Ambient, by the clock.
  - **Mounts** — no surface, and no time-of-day concept in any specification.
  - **Spec support today** — needs a spec change: what late is, and in whose clock. The
    direction says these moments read the clock through the existing port; `ClockPort` gives
    milliseconds since the epoch and no local hour, and whether it gains a local-hour reading,
    with its fake, is settled in that spec change.
  - **Draw from** —
    [Ambient: sleepier late at night](biscuit_pics/raw/README.md#ambient-sleepier-late-at-night):
    the sleeping frame it names settles how she folds.
  - **Done when** — specified; it replaces idle inside the specified hours; the fake clock
    drives it in a test.
- [ ] **Different after a long absence.** Stateful: the arrival changed by how long the player
  has been away.
  - **Mounts** — no surface, and nothing records when the player was last here: `Player` in
    `game.allium` holds the current game, the last mode and whether the welcome is showing,
    nothing dated.
  - **Spec support today** — needs a spec change: a last-visit fact on `Player`, what long is,
    and which bookend it alters. The index reads it as arrival by degree — an escalated
    greeting or a reproach — and which is a product decision. It would read the storage and
    clock ports.
  - **Draw from** —
    [Stateful: different after a long absence](biscuit_pics/raw/README.md#stateful-different-after-a-long-absence).
  - **Done when** — specified; a returning player can tell it from the arrival at the welcome;
    the stored fact survives a reload; it never touches play or statistics.

## Not in this set

Named so nobody draws one early, each with the page that owns the exclusion.

- **Per-guess reactions** — excluded from the first set outright
  ([The first pose set](direction.md#the-first-pose-set)); "a later purchase, made only once the
  character has proved it lands" ([Where she is allowed to be](direction.md#where-she-is-allowed-to-be)).
- **The face break** — a rule about frequency
  ([A fixed face, broken rarely](direction.md#a-fixed-face-broken-rarely)), not a pose;
  nothing triggers it and nothing is drawn for it until the fixed face has been seen in the
  game.
- **Props and clothing** — the hat, the harness, the collars and the toys in the photographs
  are posture evidence; the index discards the prop each time, and no image on this list
  includes one.
- **A loading image, touch icons and manifest icons** — see the notes above.
- **The landing-page lockup** — `site-root/index.html` says the icon-mark is deliberately not
  drawn there, because [decision 0009](../decisions/0009-poodl-lives-at-pnut-fans.md) keeps
  that page to a name, a sentence and a link, and a second rendering of a placeholder lockup is
  exactly the growth that would reopen it; only its favicon changes.
- **A game-switcher tile** — `navigation/GameCard` waits for a second game (the ledger).
- **`brand/MascotSlot` itself** — code, listed in the ledger, not an image.
- Anything under [Where she does not go](direction.md#where-she-does-not-go).

## Related pages

- [Design direction](direction.md) — what she is for, where she may be, and the pose set as a
  budget.
- [Biscuit character bible](biscuit-character-bible.md) — what every image above holds to, and
  the checklist each is accepted against.
- [Biscuit reference photography](biscuit_pics/raw/README.md) — the frames each item is drawn
  from.
- [Port a design system component](../how-to/port-a-design-system-component.md) — where each
  image mounts.
- [Decision 0010: The Biscuit Games design system](../decisions/0010-biscuit-games-design-system.md)
  — the deferred mascot and favicon this list brings in.
