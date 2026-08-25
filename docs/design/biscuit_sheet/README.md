---
title: "Biscuit character reference sheet"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [biscuit_reference_sheet]
requires: []
---

# Biscuit character reference sheet

A generated draft of
[item 0.2 of the Biscuit image backlog](../biscuit-image-backlog.md#tier-0-before-anything-is-drawn),
drawn to [the model sheet section](../biscuit-character-bible.md#model-sheet) of the
character bible on 2026-08-24. It is **not accepted**: nothing here closes an open
question, ticks the backlog item or changes a decision in the bible, and the item's
_Done when_ requires an approval only the owner can give.

Two earlier drafts were generated on 2026-08-22 and deleted on 2026-08-24. This is the
third attempt, and [How it was made](#how-it-was-made) says what was done differently and
why, because the same wall was hit twice before.

## What is here

| File | What it is |
| --- | --- |
| `biscuit-reference-sheet.jpg` | The composed sheet on the dark page: turnaround, head studies, the fixed face at hero size and at the 180 × 135 minimum, the marking map, the colour table, the line at three sizes, the stage, the posture vocabulary and the provisional list. |
| `biscuit-reference-sheet-light.jpg` | The same sheet on the light page, derived by script: the ground and the ink line swapped, every enclosed dark kept dark, and no fill touched at all. It is the demonstration of the bible's rule that one drawing serves every palette. |
| `biscuit-reference-sheet.html` | The composition itself. The sheet is a screenshot of this file, so every label on it can be corrected without regenerating a drawing. |
| `panels/` | The chosen drawing for each panel, snapped to the colour table. `panels/stage/` is the same drawing fitted to the 240 × 180 stage; `panels/light/` is the light-page swap of both. |
| `prompts/` | The exact text every drawing was generated from, the panel-by-panel compositions, and which candidate was chosen for each panel. The four passes that snapped, staged, swapped and composed the drawings are described below rather than committed: they are working tooling, not part of the change. |
| `armature/` | The two construction diagrams that were fed to the generator as authoritative geometry. See below. |

There is **no master vector**, and the backlog asks for one. A raster generator cannot
produce one, so what this draft settles is the reading of the brief and not the artwork.
The fills in the drawings are exact — every pixel was snapped to the bible's colour table —
but the drawing itself is a raster and the shipped SVGs of tier 1 and tier 2 cannot be cut
from it.

## How it was made

Every drawing was generated with OpenAI's image model through the Codex CLI, driven
non-interactively with the reference photographs attached, exactly as the two deleted
drafts were. What changed is the three things that made those two fail.

1. **The genre was named.** Both deleted drafts, and the first nine candidates of this one,
   came back as a cute flat-sticker cartoon poodle — scalloped all over like a sheep, with a
   white die-cut rim around the silhouette, and adorable. That is precisely the dog
   [the bible rules out](../biscuit-character-bible.md#who-she-is). Neither better prose nor
   a construction diagram moved the model off it. Naming the genre did: asking for a
   mid-century modern screen-printed poster animal — flat, geometric, reduced, calm, adult —
   broke the sticker prior in one round of three candidates. That paragraph is the top of
   `prompts/00-identity-and-rendering-block.txt` and it is the single most load-bearing thing
   in this folder.
2. **Geometry was given, not asked for.** `armature/front.svg` and `armature/profile.svg`
   are crude schematics, authored by hand to the bible's stated bounds, that fix the
   proportions, the marking placement, the ear set and the colours. They were attached to
   the generator as authoritative, with the instruction that where a photograph and the
   diagram disagree the diagram wins. The profile armature exists because the first four
   profile candidates were all unusable: three drew the long tapering show-poodle wedge the
   bible names as the second most common failure, and the fourth drew a front view instead
   of a profile at all. With the armature attached, showing the skull as a circle and the
   muzzle as a stub three tenths of its diameter, the wedge disappeared in one round.
3. **One canon, then everything from it.** The front view was generated first and gated on
   its own before anything else was drawn — the deleted drafts each built a whole sheet and
   judged it at the end. The accepted front view was then attached as the first reference to
   every one of the thirty-five later generations, so the sheet is one dog rather than
   thirteen readings of a brief.

Forty-seven images were generated: twelve candidates for the front view before one was
accepted as canon, and thirty-five after it. One of the forty-seven is not a drawing at all
— the tool returned one of the attached photographs — and it was discarded like the rest.
The chosen drawing for each panel is named in `prompts/chosen-panels.txt`.

Three passes then ran over the chosen panels, and they are the reason the colour table on
the sheet is not decorative:

- **Snapped.** The model lands within about eight units of every token and never on one, and
  it leaves faint gradients and noise behind. Every pixel was mapped to its nearest token and
  the result resampled, so **the fills are exactly the bible's values**. The edges are not:
  resampling blends adjacent tokens, so between five and thirteen per cent of each panel is
  an anti-aliased mix of two of them. That is what makes the edges smooth rather than
  stepped, and it is the reason the claim is about the fills and not about every pixel.
- **De-glinted.** The model puts a white catchlight in the pupil whatever the prompt says,
  and the bible forbids white anywhere inside the eye. A small closed blob of unsaturated
  light sitting inside pupil-dark is a catchlight and nothing else, so those were filled with
  the pupil token. Only the hard core of each glint clears that test; see below.
- **Staged.** The generator cannot be told a `viewBox`, so each drawing was measured, scaled
  to sit inside the eight-unit margin and placed so that whatever touches the ground sits on
  the floor line at `y = 160`. The run and the back roll are centred in the field instead,
  because she is airborne in one and on her back in the other.
- **Swapped.** The light-page set was derived by exchanging the ground and the ink line only.

## What the sheet does not settle

Everything the bible marks provisional is flagged on the sheet itself and repeated here, so
that nobody reads a drawing as a measurement:

- **The proportions.** No frame in the corpus can measure leg length or body depth, and
  [the age the sheet is anchored to has no whole-body frame at all](../biscuit_pics/raw/README.md#the-age-the-sheet-is-anchored-to-has-no-whole-body-frame).
  The armature's ratios are inference from the breed's structure, not measurements of her.
- **The adolescent foot's shape**, and **a measured head profile**. Both wait on
  [the closing shoot](../biscuit-image-backlog.md#tier-0-before-anything-is-drawn).
- **The iris value.** Whether `--biscuit-5` reads as amber. On these drawings it reads warm
  rather than orange, but no full frame corroborates her iris, so the question stays open.
- **Whether the anchor age survives.** Every whole animal in the folder is a grown dog whose
  build is heavier and shorter-legged than the adolescent the sheet is drawn to.

Two things the bible once listed here are settled and are drawn as settled: the tail is
carried up and curved over the back standing and laid out behind her when she is settled,
and nothing above the elbow and the hock is cream.

## Reviewing it

Hold the sheet against
[the bible's review list](../biscuit-character-bible.md#reviewing-a-delivered-image). Two
lines of that list are where this draft is weakest and are worth looking at first:

- **One stroke weight.** The generator will not hold a single weight: the outer contour is
  consistently heavier and softer than the interior lines, and on some panels it reads as a
  faint rim rather than a drawn line. No pass fixed this.
- **The proportions are the sheet's, adolescent.** She reads a little young and a little
  short in the leg on several panels, which is the pull of the same prior that made her
  cute.
- **A catchlight survives in the eye.** The de-glinting pass removes the white core, but the
  soft warm halo around it is a blend rather than a highlight and is left alone. At full
  magnification the profile panels still show a glint. The bible's rule is that no white
  appears inside the eye at all, so this is a failure and not a tolerance.
- **The eye rim reads near-black on some panels.** The bible says the rim is liver, never
  black. On `turn-profile` and `head-profile` the ring around the iris is dark enough to
  fail that line.
- **The iris does not separate from the pupil at the minimum size.** The bible asks for a
  dark pupil that separates from the amber _at every size the page permits_, and the minimum
  it permits is 180 × 135. Reduced to that, the eyes on the front view close up into two
  small dark dots and the amber is gone. Everything else survives the reduction — the ears
  stay the darkest thing on her, the five cream places all still read, and the plume still
  tells — so this is one line failing rather than the size failing.
- **The sit, looking up, does not look up.** Four candidates were drawn and none tilted the
  muzzle above the horizontal; the panel's caption on the sheet was corrected to say what the
  drawing shows rather than what the brief asked for. The pose needs redrawing.

Beyond the list, the register itself is the question the owner should answer before any of
this is built on, because it is what the two deleted drafts got wrong: is this the flat,
reduced, deadpan animal the direction wants, or is it still a cartoon?

## Related pages

- [Biscuit character bible](../biscuit-character-bible.md) — how she is drawn, and the
  list this sheet is reviewed against.
- [Biscuit image backlog](../biscuit-image-backlog.md) — the item this sheet answers, and
  everything drawn after it.
- [Biscuit reference photography](../biscuit_pics/raw/README.md) — the frames every panel
  was drawn from.
- [Design direction](../direction.md) — why she exists and where she is allowed to be.
