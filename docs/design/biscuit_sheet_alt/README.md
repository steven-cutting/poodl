---
title: "Biscuit character reference sheet, alternative draft"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [biscuit_reference_sheet_alt]
requires: []
---

# Biscuit character reference sheet, alternative draft

A second, independently generated draft of item 0.2 of the
[Biscuit image backlog](../biscuit-image-backlog.md), made on 2026-08-22 without
looking at [the first draft](../biscuit_sheet/README.md), so that the owner can compare
two readings of the same brief. It is drawn to
[the model sheet section](../biscuit-character-bible.md#model-sheet) of the character
bible and is **not yet accepted**: nothing here closes an open question, ticks the backlog
item or changes a decision. The first draft is untouched.

## What is here

| File | What it is |
| --- | --- |
| `biscuit-reference-sheet.jpg` | The composed sheet on the dark page: turnaround, colour table, head studies, the fixed face at hero size and at the 180 × 135 minimum, the line at three sizes, the marking map, the shared stage, the provisional list and the posture vocabulary. |
| `biscuit-reference-sheet-light.jpg` | The same sheet on the light page, derived by script — the outer ground and the white keyline swapped for the white page and the dark ink, every enclosed dark (a pupil, a nostril) kept dark, fills untouched — to show that one drawing serves both pages. A reading aid, not a second set of drawings. |
| `panels/` | Every chosen drawing at the size it was generated, one file per panel: `turnaround`, `head-studies`, `fixed-face`, `marking-map` and the seven `posture-*` files. These are the sources; the sheet is a composition of them. |
| `candidates/` | The four turnaround candidates the canon was chosen from, for comparison. |
| `prompts/` | The exact text each panel was generated from: the identity-and-rendering block shared by every prompt, the reference-image preambles, the task footer, and one composition paragraph per panel. |

There is **no master vector**. The backlog asks for one and a raster generator cannot
produce it; what this draft settles is the reading of the brief, and the vector is still
the illustrator's to draw. The fills in the drawings are the model's approximation of the
tokens — close, not exact — and only the swatch table on the sheet carries the true values.

## How it was made

Everything was generated with OpenAI's image model through the Codex CLI's built-in
`image_gen` tool, driven non-interactively (`codex exec`) with the reference photographs
attached as inputs. No image was drawn by hand or traced.

1. **Turnaround first.** Four candidates were generated from the same prompt — the identity
   block plus the turnaround composition — with seven photographs attached from
   [the photo index](../biscuit_pics/raw/README.md): the sphinx and the loaf for the
   adolescent head, ears and coat length; the two puppy frames for the marking map at full
   contrast and the dark pads; the red profile for the head's structure; the overhead rear
   for the crown, ears and plume from behind; and the run for the front of the dog and the
   ears in the air. The prompt told the model to take anatomy from the photographs and
   colour from the palette only.
2. **Three reviews, one canon.** Three independent reviews ranked the candidates, each with
   a different lens — anatomy and identity, rendering language, turnaround craft — against a
   checklist lifted from the bible's [review list](../biscuit-character-bible.md#reviewing-a-delivered-image).
   A candidate that two reviews hard-failed was excluded; the rest were ranked by summed
   position. Candidate 3 won that round and every later panel was drawn with it attached as
   the reference. Candidate 4 had been excluded — not for the drawing but because the file
   came back with a transparent ground instead of the near-black the brief asked for, which
   two reviews read as noise and a halo. When the finished sheet was reviewed as a whole,
   all three reviewers found candidate 3 the odd panel out — hairy contour, body a step
   darker and redder than its token, catchlights, a smile in profile, the plume hanging
   down in the rear view — while the panels drawn from it had landed in the flat register
   the bible asks for; a direct comparison then found candidate 4, flattened on to
   `#0b0b0b`, on-token for body, ears and cream, plume up, mouth flat, and with no halo
   once flattened. So `panels/turnaround.png` is **candidate 4** (flattened, the catchlights
   in its five visible pupils repainted by script as for the roll), and candidate 3 — the
   drawing the other panels were actually referenced from — sits in `candidates/` beside
   it. That is a known inconsistency in this draft's provenance and it is stated here so
   nobody reads the turnaround as the literal source of the poses; a redraw of the poses
   from candidate 4 with the same prompts would close it.
3. **Every other panel from the canon.** Head studies, the fixed face, the marking map and
   the seven posture thumbnails were each generated with the chosen turnaround attached as
   the first reference image, plus the photographs relevant to that panel, and the same
   identity block. Each was reviewed against the same checklist; a panel that failed was
   regenerated once with the review's corrections appended, and the better of the two kept.
   Two postures were regenerated again from a sharper composition paragraph (the sit was
   not looking up; the roll showed three legs), and the chin-down panel was generated
   outside the first run after a tooling refusal, not a drawing failure. The sit needed a
   third round: with a steeper camera written into the composition and the fixed face and
   the loaf attached beside the turnaround as register references
   (`prompts/06-references-panels-flat-register.txt`, `composition-pose-sit-up-v3.txt`),
   the upward tilt finally read, and that round's first candidate is the panel on the
   sheet.
4. **The model's habits, edited out.** The same three defects recurred across panels
   whatever the prompt said: a white catchlight in every pupil, a lighter band across the
   nose, and a near-black eye rim. Rather than re-roll whole drawings, the affected panels
   were put through the tool's edit mode with a change-only-this instruction — pupils to
   one flat disc, nose to one flat fill, rim to a thin liver line, a smile or frown to a
   flat stroke — and each edit was reviewed beside its original, the edit kept only where
   it left the drawing otherwise intact. `prompts/04-edit-pass.txt` is the form of words.
   One panel needed a hand beyond that: the back roll's edit left a two-pixel fleck in each
   pupil, and the reviewer's own advice was to repaint the two pupil discs locally rather
   than regenerate, so a script filled each pupil's fitted disc with `--biscuit-1`. The
   same fitted-disc fill was later applied to the five visible pupils of the turnaround that
   replaced the first one. Those pupils are the only pixels any script changed inside a
   drawing.
5. **Composed by script.** The sheet is laid out by a short script: the drawings are placed
   unchanged apart from snapping the model's near-black ground to the page's `#0b0b0b`; the
   labels, the swatch table with its exact hex values, the stage diagram, the 180 × 135
   minimum placed 1:1, the line-weight specimen (the fixed-face panel at 720 × 540,
   360 × 270 and 180 × 135, each beside a bare rule at the 2-unit weight that size implies:
   6, 3 and 1.5 px) and the provisional flags are the sheet's own annotation. The
   sheet is set in Helvetica because the project's Bricolage Grotesque is not installed as a
   system font; nothing in the drawings carries lettering.

The model cannot be told the viewBox, so no panel is literally on the 240 × 180 stage. The
posture thumbnails are fitted into 4:3 frames on the sheet with the floor line drawn, which
is the stage as a reading aid, not as geometry.

## What is provisional

Everything the bible marks provisional is flagged on the sheet and repeated here so that
nobody reads the drawing as a measurement: the proportions, the tail's carriage at rest,
the hindquarter markings (nothing above the hock is cream), the adolescent foot, the head
profile, and whether `--biscuit-5` reads as amber. The closing shoot — item 0.1 of the
backlog — is what closes them, and a sheet redrawn from it supersedes this one.

## Review against the bible

Every chosen panel was reviewed, as an image on its own, against the bible's
[review list](../biscuit-character-bible.md#reviewing-a-delivered-image) by an independent
reviewer that saw every candidate for that panel. "Holds" below is what that review found
in place; "does not" is what the owner will want to see before reading the drawing as
settled. Scores are the reviewer's, out of ten, for fitness as a reference-sheet panel.

| Panel | Score | Holds | Does not |
| --- | --- | --- | --- |
| Turnaround (candidate 4) | 7 | Body, ear and cream fills on token by sampling, ears the darkest thing on her, plume paler and carried up in every view including the rear, mouth a flat stroke, single white keyline, no halo, four views on one baseline, the same register and palette as the fixed face, the loaf and the roll. | Faint low-amplitude mottling in the body and ear fills and a few streak lines inside the ears; the plume drawn as pointed spikes rather than cloud scallops and a shade lighter than its token; stance leggier than "square, compact"; the front view a touch smaller than the other three; the front ear and the rear ear sit close to the frame; a tiny hook at the profile's lip corner. |
| Head studies | 7 | Liver nose, amber iris with a separate pupil, both pips, cream only in the band, pips and bib, ears darker than the body, two views on a common baseline. | Ears hang past the jawline; the side margins are tight; about seventeen loops where the bible wants a few; the profile eye is a frontal disc. Delivered with a transparent ground and flattened on to the page by script. |
| The fixed face | 7 | Fixed face held: round, level, on the viewer, no catchlight after the edit; mouth one flat stroke; palette near token-exact by sampling. | The eye rim is about twice the line weight; the topknot clips the top edge; the scalloped contour reads plush. |
| Marking map | 6.5 | Zones and placement correct, fills sampled within a step of the tokens, rump and hind legs above the hock body colour. | Front stockings start mid-forearm rather than at the elbow; a residual white stroke on the nose bridge and dark nostril fills; the front view is about seven percent larger than the profile; the plume is spiky. |
| Loaf | 6.5 | Face right in every particular; flat fills; cream only where it belongs. | Contour scalloped all round; the plume lies flat against the rump instead of up; head slightly large; the tucked forelegs do not read. |
| Sphinx | 7 | Only candidate with no hard fail after the colour-locked edit; ears darker, plume paler, pose as briefed. | The edit softened the eyes; scalloped contour; puppyish head and forefeet; hind legs hidden. |
| Sit looking up | 8 | The look-up reads at once: muzzle foreshortened, nose high between the eyes, chin showing, ears swung back; no catchlight, liver rims, flat mouth, flat fills and a clean keyline in the fixed-face register; ears clearly darker, plume paler and up, cream only in the five places, good margins. | Ears overlong, to chest level; brow pips slanted and uneven; the muzzle band and the bib fuse into one cream column under the tilt; nostrils drawn as small circles and the nose a little large; forelegs short, the rear paws reading as detached pads at the sides. |
| Reared bipedal | 8.5 | Regenerated after the sheet review with the tail written into the composition: plume up past the ears, no catchlight, liver rims, flat mouth with philtrum, nostrils as the fixed face's curled loops, open loops in the ears, body medium-dark with ears darker and plume paler — the closest match to the fixed-face panel. | The tail base is hidden so the plume seems to rise from behind the shoulder; top and bottom margins thin; the iris a thin ring round a dominant pupil; ears oversized, reaching toward the chest; forefeet large oval mitts, hind legs a touch short. |
| Run | 7 | Both ears airborne, mouth open as one dark fill, flat fills, no catchlight, liver nose, ears darkest. | The muzzle band split into two cheek patches with brown between nose and mouth; the plume is a spiky ball near the top edge; the stride reads weakly. |
| Back roll | 6 | Inverted face on the viewer, four legs up with the pads shown, cream in the five places, ears darkest, plume paler, loops thinned; pupils flat after the script repaint. | Eye rims thin near-black rather than liver; the mouth is an outlined lens; head slightly large; a faint dark fringe beside some keylines. |
| Chin down | 7 | Flat on the floor, chin between the forelegs, ears back, eyes open and level on the viewer, deadpan; only eyes and nose were edited. | Pale slivers at the eye corners; the mouth is a Y whose wings risk a sad read; the chin sits above the paw line so the pose can read as a crouch; puppyish head. |

Taken together: the identity holds — liver nose, amber eyes, brow pips, the ear set and
value, the five-place cream and the paler plume are right on every panel, and no hard fail
from the bible's list survives in the delivered set. What does not hold, everywhere, is the
bible's line language: the model scallops every contour and draws more loops than "a few",
so the drawings read a shade plusher and more puppyish than the brief's exacting adolescent.
That is the thing to judge this draft on, and the thing the first-draft comparison should
settle.

### The sheet as a whole

The composed sheet was then reviewed three times, each reviewer reading the full-size dark
sheet, the preview and the light variant with a different lens. The first pass returned
"revise" twice and "reject" once, for one reason above all: the turnaround then on the
sheet (candidate 3) was in a different, hairier register from the panels drawn after it,
and the light variant turned every neutral-black pupil white. Both were fixed — the
turnaround swapped for candidate 4 as described above, the light derivation rewritten to
keep enclosed darks dark, the sit regenerated, the line-weight rules and the posture
seating added — and the sheet was reviewed again from scratch:

| Lens | Verdict | Score | What it found |
| --- | --- | --- | --- |
| The bible's review list, item by item across all sixteen drawings | revise | 7 | Every identity item passes on every drawing — liver nose, amber iris with dark pupil, both pips, cream in the five places, ears low and darkest, circle-and-stub head, unclipped coat, paler plume up, dark pads only on turned soles, flat bodies on token, the fixed face wherever the face is on the viewer, nothing worn, no lettering; the face reads at 180 × 135; the light page reads with pupils dark. One hard miss: the reared bipedal's plume hung down at hip level. Partials: the turnaround's front-view plume rises behind the skull and can read as a crest; the sit's bib runs on to the belly; glint specks in the turnaround's pupils (since repainted by script, as for the roll) and a thin shine stroke on the marking map's nose (left as it is — a script pass wide enough to catch it also caught a brow pip, and was discarded); line weight differs between panels though each is single-weight; the marking map's profile reads older than the turnaround. |
| The backlog's content list for item 0.2, and readability | accept as draft | 8 | Nothing from the list is missing; every provisional item is flagged on its panel and in one list; hex values match the bible's table; the seven postures each read as named; the document is legible with nothing overlapping or clipped. Its fixes — seat the thumbnails on the floor line, draw the 1.5 px rule at 1.5 px, stop the subtitle assuming the dark page — were made before the copy here; its caution that the light variant's interior lines come out stippled up close stands. |
| Cross-panel identity — one dog, one register, deadpan | accept as draft | 6 | Palette, line and marking rules read as one system; the fixed face and its downscales match the turnaround; cover the eyes and the seven thumbnails are seven moments. It still sees two coat languages (the scalloped turnaround and face against the shaggier sphinx, bipedal and chin-down), a topknot on the head studies that the turnaround lacks, a marking-map profile at leaner proportions, a sit whose foreshortened muzzle crowds the eyes, and a posture row that leans cute beside a deadpan turnaround and face. |

The bible lens's one hard miss was acted on: the reared bipedal was regenerated from a
composition that names the tail's carriage, with the turnaround, the fixed face and the
loaf attached as register references (`prompts/composition-pose-bipedal-v2.txt`), and a
comparison of the two new candidates with the old panel chose the second at 8.5 — plume
up, no catchlight, the nostrils drawn as the fixed face draws them. The turnaround's glint
specks were repainted, the posture thumbnails were seated on the stage's floor line, and
the light derivation was corrected, all before the copies here; the rest of what the three
lenses list stands as disclosed.

What this adds up to: the sheet is fit to show as a generated draft, and its honest
weaknesses are the ones a generator has — the register drifts a little from panel to
panel, fills land near the tokens rather than on them, and the model's cuteness keeps
creeping back into the posture row. None of it is hidden: every panel's residual defects
are in the table above, every provisional item is flagged on the sheet, and the prompts
are here to regenerate any panel from.

## Regenerating a panel

Each panel's prompt is the concatenation, in this order, of the matching references
preamble, `00-identity-and-rendering-block.txt`, one `composition-*.txt` and `01-task.txt`;
the reference photographs named in the preamble are attached with `codex exec -i`. The
turnaround uses `02-references-turnaround.txt`; every other panel uses
`03-references-panels.txt` with `panels/turnaround.png` as its first attachment. The
second round of postures added `05-strict-addendum.txt` between the identity block and the
composition, and the sit and the roll used their `-v2` compositions. A correction in place
is `04-edit-pass.txt` with the panel attached as Image 1. The identity block is repeated in
full every time on purpose — invariants that are not restated drift.

## Related pages

- [Biscuit image backlog](../biscuit-image-backlog.md) — item 0.2, the brief this answers.
- [Biscuit character bible](../biscuit-character-bible.md) — what the sheet has to fix and
  the list it is reviewed against.
- [Biscuit character reference sheet](../biscuit_sheet/README.md) — the first draft, made
  separately.
- [Biscuit reference photography](../biscuit_pics/raw/README.md) — the frames attached to
  each prompt.
