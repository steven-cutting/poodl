---
title: "Biscuit image backlog"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [biscuit_image_backlog]
requires: []
---

# Biscuit image backlog

Every image the game needs of Biscuit, in the order it needs them, each written as a brief
that stands on its own once [Biscuit character bible](biscuit-character-bible.md) has been
read. The bible says how she is drawn; this page says what to draw, where it goes and when
it is done. As of 2026-08-22 none of it exists: the header wears a typographic placeholder
mark, `app.html` carries an empty favicon, and decision 0010 deferred the mascot on
purpose rather than leave a hollow slot for her.

The list is tiered, and the tiers are an order, not a priority label. Nothing in a tier is
drawn before the tier above it is accepted, because every pose is drawn from the sheet and
the sheet is drawn from the photographs.

| Tier | What | Why it comes here |
| --- | --- | --- |
| 0 | The shoot, the sheet, the mark candidates | Evidence and anatomy before any pose; the direction says the sheet fixes her "before any pose is drawn". |
| 1 | The reduced mark and its exports | Does most of the work by volume — tab, header, loading, motion off — and is the first thing a stranger sees. |
| 2 | The first pose set | The direction's budget: outcomes, bookends, ambient and stateful. |
| 3 | Later purchases | Named so nobody draws them early. |

## How to read an item

Each item carries the same fields. **She is** states the pose. **Face** says what the fixed
face permits in that moment. **Draw from** links the frames the photo index picked for it —
the index, not this page, owns which frames and why. **Mounts** names the surface, from
the `MascotSlot` row of
[Port a design system component](../how-to/port-a-design-system-component.md): outcomes
at `GameConclusion`, bookends at the page, and with motion off only the mark. **Deliverable**
is the file set; **Done when** is what acceptance adds to the bible's
[review list](biscuit-character-bible.md#reviewing-a-delivered-image), which applies to
every item without being repeated.

Tick an item only once it has passed that review, and put the date beside it. An item
drawn but not yet accepted stays unticked.

## Tier 0: before anything is drawn

- [ ] **0.1 The closing shoot.** Not a drawing: the photographs the corpus lacks, which
  the photo index specifies under
  [What this corpus cannot answer](biscuit_pics/raw/README.md#what-this-corpus-cannot-answer)
  — a level, evenly lit set at her own height, square side-on, head profile and walking away,
  all four feet and the whole tail in frame, nothing worn, something of known size on the
  floor, and a grey card in the first exposure. The sheet can start without it and must be
  revised against it; the provisional items in the bible are the list of what it closes.
  **Done when** the frames are added to the photography index with grades and tags like the
  rest. _Partly overtaken on 2026-08-22: twenty full camera frames were added to the index
  and closed five of the gaps this item existed to close — tail carriage, the hindquarter
  markings, low affect, sleep, and a clean outline for the mark. See
  [what the twenty full frames closed](biscuit_pics/raw/README.md#what-the-twenty-full-frames-closed).
  They are not the shoot: nothing in them is level, measured or unclothed, and they show a
  grown dog rather than the adolescent the sheet is anchored to, so this item stays open and
  is shorter than it was._
- [ ] **0.2 The character reference sheet.** The first deliverable and the last word on her
  anatomy, drawn to [the model sheet section](biscuit-character-bible.md#model-sheet):
  a turnaround — front, three-quarter, profile, rear — at adolescent proportions and medium
  coat; head studies front and profile; the fixed face at hero size and at the 180 × 135
  minimum; the marking map as a flat diagram; swatches naming every token in the colour
  table; a line-weight specimen at three sizes; and the posture vocabulary as thumbnails —
  loaf, sphinx, sit looking up, reared bipedal, run, back roll, chin down. Every provisional
  item (proportions, the adolescent foot's shape, a measured head profile) is marked
  provisional on the sheet itself; tail carriage and the hindquarter markings were on that
  list until the twenty full frames settled them. **Draw from** the fixed-trait sections and
  [The fixed face](biscuit_pics/raw/README.md#the-fixed-face). **Deliverable:** the master
  vector and a PDF or PNG of the sheet, under the proposed `docs/design/biscuit_sheet/`.
  **Done when** the owner has approved it against the bible and every open question it
  can close has been closed in the bible's decisions table.
- [ ] **0.3 The mark candidates.** The illustrator's brief the direction reserves for the
  mark: at least three constructions, each abstract and geometric — one from a curl, one
  from an ear, one from a letterform — and each with its single wrong element named, per
  [The mark](direction.md#the-mark). Monochrome, `currentColor` only, shown at 16, 20, 32
  and 180 pixels, beside the wordmark set in Bricolage Grotesque and alone in a browser
  tab, on the dark page and the light one. **Draw from**
  [The reduced mark](biscuit_pics/raw/README.md#the-reduced-mark), for outline only, and
  from none of the sticker-bordered frames. **Deliverable:** one sheet of candidates.
  **Done when** one candidate is chosen and the choice and its wrong element are recorded
  in the bible's decisions table.

## Tier 1: the reduced mark

The same drawing, exported three ways. It stands in the header, in the tab, in any loading
state, and wherever she would have been when motion is off.

- [ ] **1.1 The mark, master SVG.** The chosen candidate, drawn on a small integer grid so
  it pixel-fits at 16 and at 20; `currentColor`, no fill but its own ink, no fixed colour
  anywhere in the file. **Mounts** in `Wordmark.svelte`, replacing the typographic `b` in
  its ruled box — the box's softened fourth corner was the placeholder's one break, and it
  retires when the mark brings its own. Also the motion-off state of every tier 2 item.
  **Deliverable:** one optimised SVG for `src/lib/assets/`, inlined the way the icons are.
  **Done when** it reads as the same mark at 16 and at 180, sits beside the wordmark
  without softening it, and the header shows exactly one break.
- [ ] **1.2 The favicon.** The mark as `favicon.svg`, carrying a `prefers-color-scheme`
  rule inside the file so the ink answers the tab's theme. **Mounts** at
  `<link rel="icon">` in `src/app.html`, replacing the empty `data:` placeholder that
  decision 0010 left there, and on the landing page at the root, which `scripts/stage_site.sh`
  will have to carry the way it carries the stylesheet. **Deliverable:** the SVG.
  **Done when** the tab shows the mark in both themes and nothing else in the file is
  fixed-colour.
- [ ] **1.3 The touch icon.** A 180 × 180 PNG for `<link rel="apple-touch-icon">`: the
  mark in the page's ink on the near-black page, no transparency, no rounding — the
  platform rounds it. Dark is home, so the icon is the dark one. **Deliverable:** the PNG.
  **Done when** it matches the SVG mark exactly at that size. No other raster sizes: the
  site has no app manifest and no reason to invent one.

## Tier 2: the first pose set

The direction's budget, in its own order: two outcomes that have to be very good, two
bookends, three ambient and stateful states. Every item is a still SVG on the shared stage,
with the named groups and nothing animated in the file; the narrator line beside each is
written when the pose is mounted, in the direction's [voice](direction.md#voice), and is
never drawn. Per-guess reactions are excluded from this set by the direction and appear
under tier 3 only to say so.

- [ ] **2.1 Win.** The first of the two poses that must be very good. **She is** on her
  back mid-roll, limbs in the air, having flung herself there — disproportionate, held, not
  a leap frame. **Face:** the eyes are level on the viewer as the fixed face requires; the
  mouth may be open because a rolling dog's is, and that is posture, not expression.
  **Draw from** [Outcome: win](biscuit_pics/raw/README.md#outcome-win): face from the two
  prime frontal frames, body from the cutout roll and the grown back-roll on the carpet,
  which are posture evidence only. **Mounts** at `GameConclusion`, the won outcome, inside the 4:3 stage at
  no less than the minimum; the mark when motion is off. **Deliverable:** SVG plus the two
  review PNG files. **Done when** the roll reads as a decision she made, and the face is the same
  face as the loss.
- [ ] **2.2 Loss.** The second. **She is** lying chin down, forelegs forward, ears back and
  slack, looking up without moving — reproach by posture. **Face:** the eyes are open,
  level, on the viewer; nothing narrows. **Draw from**
  [Outcome: loss](biscuit_pics/raw/README.md#outcome-loss), which the full frames turned from
  the thinnest moment into one of the best served: the grown chin-down frame is the register
  itself, with the ears back, the eyes level and nothing worn, and the ear carriage and eye
  shape come from it. The party hat and the underexposed curl stay as second readings. **Mounts** at `GameConclusion`, the lost outcome.
  **Deliverable:** SVG plus review PNG files. **Done when** it is unmistakably the same animal
  as the win with the eyes unchanged, and the word for it is deadpan, never sad.
- [ ] **2.3 Arrival.** The opening bookend. **She is** coming straight at the viewer — a
  trot or a run with both ears lifted clear of the skull — or, if the run does not fit the
  stage, reared on her hind legs looking up; the sheet's thumbnails decide which. **Face:**
  fixed; the mouth may be open at a run. **Draw from**
  [Bookend: arrival](biscuit_pics/raw/README.md#bookend-arrival), the best covered moment in
  the corpus; stride from the two running frames, the front assembly and head carriage from
  the grown frontal stand, and leg length from none of them.
  **Mounts** at the page's opening bookend, per the `MascotSlot` row. **Deliverable:** SVG
  plus review PNG files. **Done when** the whole front of the dog reads at the minimum size and
  the ears are unmistakably airborne.
- [ ] **2.4 Sign-off.** The closing bookend. **She is** walking directly away from the
  viewer at her own height, whole body, hind feet and tail plume in frame. **Face:** not
  visible; the back view is the point. **Draw from**
  [Bookend: sign-off](biscuit_pics/raw/README.md#bookend-sign-off), which the index still
  calls insufficient — there are four rear views now and not one of them is a dog departing:
  the two grown frames have her lying down and the two cutouts are shot from above and behind
  — so this pose is the one most dependent on item 0.1's walking-away frame and is drawn last
  in this tier. **Mounts** at the page's closing bookend. **Deliverable:** SVG plus review PNG files.
  **Done when** the plume and the drop ears carry the identity with no face in frame.
- [ ] **2.5 Idle after a long pause.** Ambient; the clock is read through the existing
  port. **She is** loafed — legs tucked, head up, looking flat at the viewer from slightly
  below their eye line — the direction's own example of the register, _Biscuit has stopped
  watching._ **Face:** fixed; this is the face at rest, and the pose that proves it.
  **Draw from**
  [Ambient: idle after a long pause](biscuit_pics/raw/README.md#ambient-idle-after-a-long-pause),
  the loaf first, the sphinx for the forelegs. **Mounts** at the page once the player has
  stopped. **Deliverable:** SVG plus review PNG files. **Done when** it reads as patience that
  has become a comment.
- [ ] **2.6 Sleepier late at night.** Ambient, clock-read. **She is** the loaf tightened
  into a curl, chin on the paws, ears slack, tail over the nose if the sheet's carriage
  allows it. **Face:** the eyes stay open and level — sleepy is a posture, and the bible
  says so; the photo index's closed-eye frames are evidence for the fold and not for the
  eyes. **Draw from**
  [Ambient: sleepier late at night](biscuit_pics/raw/README.md#ambient-sleepier-late-at-night)
  for the body — the grown dog asleep in her bed now shows how she folds and where the head
  goes, which the puppy head could not. **Mounts** at the
  page, as 2.5. **Deliverable:** SVG plus review PNG files. **Done when** it reads as later
  than 2.5 by posture alone.
- [ ] **2.7 Different after a long absence.** Stateful, clock-read. **She is** either the
  escalated greeting — up on her hind legs, head thrown back — or the reproach, chin down
  and withholding; the corpus cannot distinguish this from an ordinary arrival, so the
  difference is made by degree, and the sheet's thumbnails settle which reading. **Face:**
  fixed in either reading. **Draw from**
  [Stateful: different after a long absence](biscuit_pics/raw/README.md#stateful-different-after-a-long-absence).
  **Mounts** at the page's opening bookend in place of 2.3 when the port says the player
  has been away. **Deliverable:** SVG plus review PNG files. **Done when** a returning player
  can tell it from 2.3 at a glance and it is still the same dog.

## Tier 3: later purchases

Not for drawing now. Each is named so it is not drawn early, and so the reason it waits
is written down.

- **Per-guess reactions.** Explicitly excluded from the first set by
  [the direction](direction.md#the-first-pose-set); bought only once the character has
  proved it lands.
- **The face break.** One image, a change to the eyes, with a trigger no specification
  states yet. Drawn after every tier 2 item is mounted and seen, and only once the trigger
  is an answered question in the bible.
- **A held prop.** The ball and the plush toy in the photographs are not hers to hold
  until a moment needs one.
- **A social preview image.** No `og:image` exists today. If one is ever wanted it is the
  wordmark and the mark, not her: a stranger's first five seconds are carried by craft and
  the name, and she is the reason to come back.
- **Manifest icons.** No web app manifest exists, so no 192, 512 or maskable exports.
  They appear here only if a manifest ever does.
- **Her relationship to a second board.** The direction buys differentiation between games
  with the board's geometry and Biscuit's relationship to it; that relationship is drawn
  when Pawjong exists.
- **A not-found page, a repository avatar, a workshop cover.** None of these exists as a
  surface yet. When one does, it takes the mark first and earns her only if it is a
  boundary.

## Related pages

- [Biscuit character bible](biscuit-character-bible.md) — how every image above is drawn
  and reviewed.
- [Design direction](direction.md) — the pose set as a budget, and where she may be.
- [Biscuit reference photography](biscuit_pics/raw/README.md) — the frames each item is
  drawn from.
- [Port a design system component](../how-to/port-a-design-system-component.md) — where
  each image mounts.
