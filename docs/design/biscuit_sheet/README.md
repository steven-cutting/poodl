---
title: "Biscuit character reference sheet"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [biscuit_reference_sheet]
requires: []
---

# Biscuit character reference sheet

This directory holds the character reference sheet that
[item 0.2 of the image backlog](../biscuit-image-backlog.md#tier-0-before-anything-is-drawn)
asks for, drawn on 2026-08-22 to
[the model sheet section of the character bible](../biscuit-character-bible.md#model-sheet).
It is a **generated draft**: every picture on it was produced with Google's Nano Banana
image model through the `agy` command line, briefed from the bible and from
[the reference photography](../biscuit_pics/raw/README.md), and it has not been accepted.
Nothing here is a shipped asset, and the backlog item stays unticked until the owner has
held the sheet against [the bible's review list](../biscuit-character-bible.md#reviewing-a-delivered-image).

## What is here

| File | What it is |
| --- | --- |
| `biscuit-sheet.html` | The sheet itself, and the master: the layout, the labels, the swatches, the line-weight rule and the provisional flags are HTML and CSS; the pictures it lays out are the panels below. Open it from the repository so the fonts resolve. |
| `biscuit-sheet.jpg` | The sheet rendered at 1× on the dark page ground, for review without opening anything. A JPEG, not the PNG the backlog names, because a PNG of the whole sheet is over the repository's 768 KB file gate; the HTML re-renders at any size. |
| `panels/` | The generated pictures, one JPEG per panel, as delivered by the model. |
| `prompts/` | `style.txt`, the style block every panel was briefed with, and `panels.txt`, each panel's pose paragraph, aspect ratio and reference frames, so a panel can be redrawn or a missing one drawn. |

The sheet covers what the backlog item lists: the turnaround (front, three-quarter,
profile, rear) at adolescent proportions and medium coat; head studies front and profile;
the fixed face at hero size and at the 180 × 135 minimum; the marking map as a flat
diagram; swatches naming every token in the bible's colour table; a line-weight specimen at
three sizes; and the posture vocabulary as thumbnails — loaf, sphinx, sit looking up,
reared bipedal, run, back roll, chin down. Every provisional item in the bible —
proportions, the adolescent foot's shape, a measured head profile — is tagged provisional on
the sheet. Tail carriage and the hindquarter markings were provisional when this sheet was
drawn and are not any more, so the sheet's flags on those two are stale.

**The seven posture thumbnails are not drawn.** The image model's weekly quota ran out
after the five panels above were made (reset 2026-08-29); their slots on the sheet carry
the brief, and their prompts are in `prompts/panels.txt` ready to run. The sheet is
incomplete until they exist.

## How the panels were made

One style block was written once from the bible's fixed traits, colour table and rendering
rules, and sent unchanged with every panel: a single uniform white line, flat fills from the
biscuit ramp by hex value, no shading or texture, near-black ground, nothing worn, no text.
The canonical front view was drawn first, from the sphinx, puppy-forepaws and ball-walk
frames, and every later panel took that drawing as its first reference so the sheet stays
one dog; the second and third references for each panel are the frames the photo index
picks for that moment. Each panel was generated one to three times and the best kept; the
rejects are not in the repository.

| Panel | Drawn from |
| --- | --- |
| `front.jpg` | The canonical view; photographs: sphinx, puppy forepaws and pads, walk with ball. |
| `turnaround.jpg` | Canonical; the red-filter profile head; overhead rear 2. |
| `head-studies.jpg` | Canonical; sphinx; the red-filter profile head. |
| `fixed-face.jpg` | Canonical; sphinx; loaf flat stare 2. |
| `marking-map.jpg` | Canonical; puppy forepaws and pads; puppy lying overhead pale floor. |
| `posture-*.jpg` | Canonical, plus the frames the index lists under the matching moment. |

## What generation cannot deliver

The bible's Production row chooses an illustrator and rules out generated images; this
draft was made at the owner's direction despite that row, and the row is not yet amended.
Four items of the review list follow from the method and no retry fixes them: the fills
approximate the tokens rather than being them (item 10), the line approximates one weight
(item 11), nothing is `currentColor` so the panels do not theme (item 14), and there is no
editable vector master — the HTML is the vector part of the sheet and the panels are raster.
What the sheet can still settle is what the shipped vectors draw: the proportions, the
face, the marking map, the postures, and which open questions the bible can now close.

Two deviations the model drew and the quota stopped being redrawn, held here so review
does not have to rediscover them: the marking map's front view shows brown toe pads on feet
whose soles do not face the viewer (review item 9), and the profile muzzle on the turnaround
and the head studies runs longer toward the wedge than the bible's circle-with-a-stub allows
(item 6) — the profile is provisional in any case until the shoot.

## Related pages

- [Biscuit image backlog](../biscuit-image-backlog.md) — the item this sheet delivers, and
  what done means.
- [Biscuit character bible](../biscuit-character-bible.md) — what the sheet had to fix and
  the list it is reviewed against.
- [Biscuit reference photography](../biscuit_pics/raw/README.md) — the frames each panel
  was drawn from.
