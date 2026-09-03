---
title: "Biscuit character bible"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [biscuit_character_bible]
requires: []
---

# Biscuit character bible

Biscuit is a brown miniature poodle drawn from a real dog, and she behaves as "the platform's
host rather than its logo" ([Biscuit](direction.md#biscuit)). This page owns how she looks, how
she is rendered and how she is used as an image; the direction owns why she exists,
[her voice](direction.md#voice) and [where she may be](direction.md#where-she-is-allowed-to-be).
It proposes no default: every choice the photographs leave is a numbered row under
[Open questions](#open-questions), closed by the owner. "The sheet" is
the drawn reference deliverable; "this page" is the rules it is drawn to. Every rule's evidence
is a link into [Biscuit reference photography](biscuit_pics/raw/README.md) or the direction.

## Principles

### Drawn from the dog, not the breed

**Where a breed default and a photograph of her disagree, the photograph wins.**

- Ten traits are locked and tabled under Anatomy; [What is fixed](biscuit_pics/raw/README.md#what-is-fixed)
  names the mistake each prevents and states two of them twice: "**the nose is liver brown, not
  black**, and **the eyes are amber, not dark**".
- Take each feature only from the frames the index names for it, after reading that frame's line
  under [Read these with care](biscuit_pics/raw/README.md#read-these-with-care); the two cartoons
  in the folder "must not seed the style, the palette or the face".
- Proportion comes from one age only — the anchor age, row 3 — and the other ages "inform colour
  and behaviour alone" ([Head-to-body proportion by age](biscuit_pics/raw/README.md#head-to-body-proportion-by-age)).

### Recognisably brown

**"She stays recognisably brown; drifting toward cream or white is a defect, not a variation."**
— [The first pose set](direction.md#the-first-pose-set).

- Her body value sits inside
  [the range she has to stay inside](biscuit_pics/raw/README.md#the-range-she-has-to-stay-inside):
  puppy chocolate at one end, the café-au-lait loaf as "the lightest she may ever be drawn" at
  the other. Where inside is open (row 6).
- At any value the ear leathers stay
  ["the darkest thing on her"](biscuit_pics/raw/README.md#the-ear-leathers-are-the-darkest-thing-on-her),
  and the mask, bib and stockings must "still read as marks and not as shading" at sixteen pixels
  ([Contrast between body and markings](biscuit_pics/raw/README.md#contrast-between-body-and-markings)).
- Her fills are stops of the biscuit ramp, `--biscuit-1` to `--biscuit-7` in `src/app.css`, or
  a neutral the theme declares. The ramp is declared once for all four palettes and, until she
  arrives, spent in [one place](../decisions/0010-biscuit-games-design-system.md#decision) —
  "the mascot arriving" is what
  [decision 0010](../decisions/0010-biscuit-games-design-system.md#what-would-reopen-this) names
  as reopening it. Which part takes which stop, and whether the icon-mark takes one at all, is
  open (row 9). No value is sampled from a photograph.

### Comedy is posture

**"One face, learned by heart, and comedy that comes from what she is doing rather than from
her expression."** — [A fixed face, broken rarely](direction.md#a-fixed-face-broken-rarely).

- One face, learned from the sphinx cutout and completed feature by feature from the three full
  frames [The fixed face](biscuit_pics/raw/README.md#the-fixed-face) names, then held across every
  pose. Which features are invariant is open (row 7).
- Attitude lives in the body: the tail "follows what the rest of her is doing rather than her
  mood", a cowed carriage "is not attested anywhere in this folder", and each moment's posture is
  picked under [What to draw each moment from](biscuit_pics/raw/README.md#what-to-draw-each-moment-from).
- The eyes clear the topknot or are veiled, and one read is the face while the other is a
  deliberate state (row 12). The break is rare and an event — "Rarely means rarely" — and is not
  in the first set (row 11). She never speaks in the first person — "She is observed, not
  conversational" ([Voice](direction.md#voice)).

### Sits beside an instrument

**She has to "sit beside precision typography without softening it"** — the test
[The mark](direction.md#the-mark) sets, applied here to both registers and made checkable by the
criteria table below.

- Nothing from [Avoid](direction.md#avoid) — no glossy mobile-game character art, excessive
  gradients, 3D rendering, hyperrealism, visible hand-drawn texture, cartoon styling aimed at
  children or generative-AI artefacts — and no sticker rim, which is a
  [cutout hazard](biscuit_pics/raw/README.md#the-55-cutouts), not a style.
- One drawing serves the dark page, the light page and both high-contrast palettes, designed
  [dark first](direction.md#dark-is-home) and answered for light; nothing about her is re-themed.
- It reads at size — the reduced icon-mark works at [sixteen pixels](direction.md#the-mark), the
  full register at a minimum that is open (row 10) — and it is still: any movement is the
  interface animating her, since "movement means her" ([Motion](direction.md#motion)) and an asset
  that moved by itself could not obey [When motion is off](direction.md#when-motion-is-off). The
  rendering register that satisfies all this is open (row 2); the criteria table is the gate.

### Nothing else in the frame

**She is the only thing in the picture.**

- Nothing worn, nothing held: "nothing worn goes on the sheet"
  ([Read these with care](biscuit_pics/raw/README.md#read-these-with-care)), and no ball or toy.
- Nobody with her — no second animal, hand or person — and no lettering, ground line, cast shadow
  or scene: the interface is her [workshop](direction.md#north-star), and
  [where she does not go](direction.md#where-she-does-not-go) already excludes decoration.
- Never a result or a state: "Biscuit is decorative, carries no state, and never conveys a
  result" ([When motion is off](direction.md#when-motion-is-off)).

### As drawn or not at all

**The asset is used as delivered, or the icon-mark is used instead.**

- Never recoloured, tinted, flipped, cropped, rotated, outlined, shadowed or scaled below its
  minimum (row 10): a second treatment is a second operating-rule break, and "A decision with two
  is noise" ([The operating rule](direction.md#the-operating-rule)). The small slots — favicon,
  tab, header, loading and the motion-off state — belong to the reduced register
  ([Two registers](direction.md#two-registers)).
- One of her per screen — two would be the same noise —
  [at the boundaries](direction.md#where-she-is-allowed-to-be) the direction names, and, being
  decorative, `aria-hidden` with no accessible name.
- With motion off, "only the icon-mark and header remain"
  ([When motion is off](direction.md#when-motion-is-off)); per-guess reactions wait, per
  [The first pose set](direction.md#the-first-pose-set).

### Decided once, then held

**"Averaging them produces a dog that appears in no photograph, so each has to be decided once
and then held."** — [What varies, and must be chosen](biscuit_pics/raw/README.md#what-varies-and-must-be-chosen).

- The owner closes each open question on samples; its row records the answer; every pose then
  holds it. This page proposes no default.
- The sheet is drawn before any pose ([The first pose set](direction.md#the-first-pose-set)), and
  a delivered image is compared to the sheet, never to a photograph.
- Anything drawn before its row closes carries the word "provisional" on the sheet itself.

## Anatomy

| Part | Rule | Evidence |
| --- | --- | --- |
| Nose | Warm liver brown "a shade or two off her body colour" — mottled rather than flat in the photographs, and how a rendering register carries that is row 2; only the nostril openings black, "because they are holes rather than colour"; the hue is unresolved between a rose-mauve and a warm brown reading. | [Liver nose, never black](biscuit_pics/raw/README.md#liver-nose-never-black) |
| Eyes | Iris "light golden amber", round and set wide; rim "liver brown rather than black", "no black anywhere on the lid margin"; the amber "rests on the four cutouts", and no full frame corroborates it unambiguously. | [Amber eyes with brown rims](biscuit_pics/raw/README.md#amber-eyes-with-brown-rims) |
| Markings | Cream "in five fixed places and nowhere else": muzzle band, a pip above each eye, bib, stockings from elbow and hock, feet; plus the brown ring round each eye. On the grown face the pip "no longer separates from the crown at all" and the ring carries the brow. | [The phantom marking map and where it sits](biscuit_pics/raw/README.md#the-phantom-marking-map-and-where-it-sits) |
| Ear colour | "At every age the hair on the ears is darker and warmer than the body"; the widest separation between any two parts of her. | [The ear leathers are the darkest thing on her](biscuit_pics/raw/README.md#the-ear-leathers-are-the-darkest-thing-on-her) |
| Ear form | "set low, at roughly eye level", "two distinct lobes reaching about to the jawline", in "longer and looser waves than the tighter curl of the body". | [Low drop ears in longer, wavier hair](biscuit_pics/raw/README.md#low-drop-ears-in-longer-wavier-hair) |
| Head | Muzzle "short and blunt with a soft stop" on a domed skull: "a circle with a stub on the front rather than as a wedge". | [Short blunt muzzle on a domed skull](biscuit_pics/raw/README.md#short-blunt-muzzle-on-a-domed-skull) |
| Coat | "never groomed to a pattern": soft, open, irregular waves, longest as a shapeless topknot and on ears and legs; "no clipped line anywhere", no bracelets or rosettes; face and feet not shaved. | [Unclipped coat, soft irregular waves](biscuit_pics/raw/README.md#unclipped-coat-soft-irregular-waves) |
| Tail plume | "a plume, not a bare whip and not a shaved pom": longer, looser and more waved than the body, drawn "lighter at the tip than at the root". | [Tail carries a paler plume](biscuit_pics/raw/README.md#tail-carries-a-paler-plume) |
| Tail carriage | "long and feathered along its whole length"; standing "up and curved above the line of the back"; settled it "usually goes slack"; streaming at a run, still up at a walk; never tucked — a cowed carriage "is not attested anywhere in this folder". | [The tail is long, and its carriage follows the pose](biscuit_pics/raw/README.md#the-tail-is-long-and-its-carriage-follows-the-pose) |
| Feet | "a pale mop" from above and from the side; pads "dark slate to charcoal brown", seen only "when the sole turns to the camera"; black nails; never pink. | [Dark pads under cream foot feathering](biscuit_pics/raw/README.md#dark-pads-under-cream-foot-feathering) |

Proportion is deliberately absent from this table because it is not fixed: see rows 3 and 10,
and [Her proportions still cannot be measured](biscuit_pics/raw/README.md#her-proportions-still-cannot-be-measured).

## Rendering

The rendering register is open (row 2). The first table is what any rendering register has to
pass; the second lists candidates without choosing one.

### What any rendering register must satisfy

| Criterion | Test | Evidence |
| --- | --- | --- |
| Flat and calm | Every shape nameable as a fill or a line; no gradient, gloss, rendered light, 3D, texture fill, glow, grain or sticker rim. | [Avoid](direction.md#avoid), [Density](direction.md#density), [The 55 cutouts](biscuit_pics/raw/README.md#the-55-cutouts) |
| Adult | Beside the wordmark a stranger sees "craft before they see a dog"; no "cartoon styling aimed at children". | [Testing a decision](direction.md#testing-a-decision) item 2, [Avoid](direction.md#avoid) |
| One drawing, four grounds | Unchanged on dark, light and both high-contrast palettes she reads and stays brown — item 3's four combinations. The measured floors in [the obligations](../explanation/accessibility.md#the-obligations) cover text and control boundaries, and she is neither, so for her the check is by eye in the Chromatic review. | [Dark is home](direction.md#dark-is-home), [Testing a decision](direction.md#testing-a-decision) item 3, [Consequences](../decisions/0010-biscuit-games-design-system.md#consequences) |
| Edge holds on both grounds | The map puts cream at the extremities and the darkest value at the ears: on white do the feet still end, on near-black do the ears still show? A test, not a rule about body value. | [The phantom marking map and where it sits](biscuit_pics/raw/README.md#the-phantom-marking-map-and-where-it-sits), [The ear leathers are the darkest thing on her](biscuit_pics/raw/README.md#the-ear-leathers-are-the-darkest-thing-on-her) |
| Reads at size | At the full register's minimum (row 10) nose, eyes, ears, markings and plume are each distinguishable; the icon-mark works at sixteen pixels with its one animal tell still legible. | [The mark](direction.md#the-mark), [Contrast between body and markings](biscuit_pics/raw/README.md#contrast-between-body-and-markings) |
| Still | No animation or frame sequence baked into the asset; movement is the interface's to add — "movement means her" — and to switch off, when she reduces to the icon-mark. | [Motion](direction.md#motion), [When motion is off](direction.md#when-motion-is-off) |
| One dog, two registers | The icon-mark is built from a curl, an ear or a letterform of hers — geometric, with exactly one element knowingly wrong — so it shares a trait with the full figure rather than being the figure shrunk or an unrelated glyph. | [Two registers](direction.md#two-registers), [The mark](direction.md#the-mark), [The reduced mark](biscuit_pics/raw/README.md#the-reduced-mark) |
| Unclipped without texture | Coat reads as soft irregular wave, longer at topknot, ears, legs and plume, without being drawn as texture. | [Unclipped coat, soft irregular waves](biscuit_pics/raw/README.md#unclipped-coat-soft-irregular-waves), [Avoid](direction.md#avoid) |
| Colour from the ramp | Every fill a `--biscuit-*` stop or a neutral the theme declares, the ramp being declared once for all four palettes; no new hue unless row 9 adds one; nothing sampled from a photograph. "The mascot arriving" is what decision 0010 names as reopening the ramp's single spend. | `src/app.css` 126–137, [Deviations from the design system as shipped](../decisions/0010-biscuit-games-design-system.md#deviations-from-the-design-system-as-shipped), [What would reopen this](../decisions/0010-biscuit-games-design-system.md#what-would-reopen-this) |
| Artefact-free, line weight deliberate | No extra toes, merged limbs, mismatched eyes, fringes, halos or nonsense curls; any line weight stands in a stated relation to `--rule-w` 1px and `--rule-w-strong` 1.5px. | [Avoid](direction.md#avoid), [Read these with care](biscuit_pics/raw/README.md#read-these-with-care), `src/app.css` 277–278, [Density](direction.md#density) |

### Candidate rendering registers

| Rendering register | What it buys | What it costs |
| --- | --- | --- |
| Single-weight ink line with flat ramp fills | A line can hold the edge on both grounds and reduce to sixteen pixels; its weight can be a rule the interface already draws. | One line colour must work on near-black and on white; a heavy line reads as cartoon; the curl must be a few chosen waves or the line becomes texture. |
| Flat spot-colour figure, no outline (screen-print poster animal) | Can be calm and adult with nothing added; pure ramp fills. | The edge is carried by value alone, so cream extremities vanish on white and ears on near-black unless value and mapping are chosen for it; markings and curl built as fill shapes. |
| Reduced geometric construction (the icon-mark's grammar extended to the figure) | Continuity with the icon-mark; "precise everywhere, animal in one place" is native. | Risks reading as a logo; the unclipped wave and low drop ears resist geometry; every pose needs a construction system. |
| Anything else that passes every row above | The criteria table is the gate, not this list. | Sampled the same way as the rest: the fixed face at hero and at minimum, on dark and on light. |

## Open questions

Unresolved by design. Each is closed by the owner editing its row, never by a drawing that
quietly disagrees.

| # | Choice | What it must satisfy | Candidates the photographs support | What closes it |
| --- | --- | --- | --- | --- |
| 1 | Production route | The brief works unchanged for either; deliveries pass the review checklist; no generative artefacts either way. | A commissioned illustrator — what [The first pose set](direction.md#the-first-pose-set) says today, "Commissioned from an illustrator", and that sentence is what is amended when this closes; generated in-house to this page; a hybrid. | The owner, after costing the sheet. |
| 2 | Rendering register | Every row of the criteria table. | The candidate table, or anything defensible against the criteria. | Samples of the fixed face at hero and at minimum, on dark and on light, in two or three rendering registers. |
| 3 | Age anchor | Proportion from one age only: [Head-to-body proportion by age](biscuit_pics/raw/README.md#head-to-body-proportion-by-age). | Adolescent — leggy, longer muzzle, and [no whole-body frame](biscuit_pics/raw/README.md#the-age-the-sheet-is-anchored-to-has-no-whole-body-frame), so proportion is inferred; adult — photographed whole, "heavier, deeper, shorter-legged", still [not measurable](biscuit_pics/raw/README.md#her-proportions-still-cannot-be-measured). | The owner; the index's wording stands until then. |
| 4 | Coat length | Reads unclipped at every size; whichever end is chosen, the icon-mark's silhouette survives sixteen pixels. | The shaggy end, "funnier and reads more clearly as unclipped"; the shorter end, "freshly short, with the curl tight against the body", which "gives the icon-mark a silhouette it can survive at small size"; the clipped extreme excluded, and the index calls those frames "the argument for the shaggy end rather than against it": [Coat length and groom state](biscuit_pics/raw/README.md#coat-length-and-groom-state). | Silhouette samples at sixteen pixels in both. |
| 5 | Ear hair length | Low set, two lobes to about the jawline, looser wave: [Low drop ears in longer, wavier hair](biscuit_pics/raw/README.md#low-drop-ears-in-longer-wavier-hair). | Puppy-short against adolescent-long: [Ear hair length](biscuit_pics/raw/README.md#ear-hair-length). | With the icon-mark's construction — the ears are the trait it is most likely to be built from. |
| 6 | Body value inside the range, and marking contrast | Inside [the range she has to stay inside](biscuit_pics/raw/README.md#the-range-she-has-to-stay-inside), "a rule about the drawing and not a claim about the photographs"; ears darker; markings "still read as marks and not as shading" at sixteen pixels: [Contrast between body and markings](biscuit_pics/raw/README.md#contrast-between-body-and-markings). | The chocolate end, the index's own proposal under [Body coat value](biscuit_pics/raw/README.md#body-coat-value); any value up to the café-au-lait ceiling — both open until the swatch panel; the grown pale reading is a fact about the dog, not a drawing value, and at the pale end the brow is carried by the eye ring, not the pip. | A swatch panel on all four grounds. |
| 7 | What the fixed face consists of | One face, learned from the sphinx cutout and completed feature by feature from the three full frames [The fixed face](biscuit_pics/raw/README.md#the-fixed-face) names, then held across all poses; the break is a departure from it, so the invariant set defines the break. | Candidates for the invariant set, all from those frames: eye shape and spacing, brow ring, muzzle band, nose size and shape, ear set, mouth open or closed (the win frames are open-mouthed and in the set), ear carriage, head angle; which are held and which move with the pose is the question. | The owner, on the head-study panel. |
| 8 | The icon-mark's one wrong element | Exactly one; otherwise geometric; works at sixteen pixels. [The mark](direction.md#the-mark) leaves it "to the illustrator's brief". | An ear escaping the grid; a curl radius the rest forbids; the plume: [The reduced mark](biscuit_pics/raw/README.md#the-reduced-mark). | The icon-mark sample. It replaces the wordmark placeholder, so its one wrong element takes over from the placeholder's "the fourth corner" ([Deviations](../decisions/0010-biscuit-games-design-system.md#deviations-from-the-design-system-as-shipped)) as the header's only operating-rule break. |
| 9 | Part-to-token colour mapping | Every fill a ramp stop or a declared neutral; body darker than markings enough to read at sixteen pixels; ears darker than body; nose "a shade or two off" body, never black; rims liver; irises a lighter warm stop; pupils, nostril openings and nails black; pads dark. | The seven stops, `--biscuit-1` to `--biscuit-7`. The pinned pair, `--biscuit-1` on `--biscuit-6`, "measures 6.93 in every palette", and two of the design system's warm pairs "measure under that floor" ([Deviations](../decisions/0010-biscuit-games-design-system.md#deviations-from-the-design-system-as-shipped)); amber has no stop of its own, and a stop may be added if the swatch panel proves none reads as amber. | A swatch panel on all four grounds. |
| 10 | Minimum rendered size of the full register | Below it the icon-mark is used; every anatomy row distinguishable at it; which fine details survive, decided once. | None from the photographs; the slots she can occupy set it — `GameConclusion`'s outcomes and the page bookends, per `brand/MascotSlot` in [the ledger](../how-to/port-a-design-system-component.md#the-ledger). | A scale-test panel. |
| 11 | The face break, form and trigger | Rare; an event; a departure from the fixed face, not from markings or colour; not in the first set, which also excludes per-guess reactions. | Form: no frame shows one. Trigger: no specification states one — `docs/specs/*.allium` say nothing about her. | The owner, after the first set has shipped. |
| 12 | Whether the eyes clear the fringe | One read is the face, the other a deliberate state. | Clear: the sphinx cutout, and at the 2026-08-23 topknot length "the eyes do not veil, whatever she does with her head"; veiled: a juvenile with longer hair over the brow: [Whether the eyes clear the fringe](biscuit_pics/raw/README.md#whether-the-eyes-clear-the-fringe). | With topknot length on the head study; couples to row 4. |

## What the reference sheet must fix

- A turnaround at the anchor age (row 3) — front, three-quarter, profile, rear — and the
  construction and shape language it implies, provisional (rows 3 and 10). The profile rests on
  inference between two frames — one square-on with its colour destroyed, one colour-intact but
  turned — under [The head profile](biscuit_pics/raw/README.md#the-head-profile-has-one-square-on-frame-and-its-colour-is-destroyed);
  the rear on the frames under [Bookend: sign-off](biscuit_pics/raw/README.md#bookend-sign-off).
- Head studies and the fixed face, at hero size and at the minimum (row 7); the marking-map
  diagram, with the eye ring and the pip-or-ring brow at the chosen value (row 6).
- Colour swatches on all four grounds (row 9); a coat and curl specimen at hero and at minimum
  (rows 2 and 4); ear, tail and foot studies (row 5).
- A posture vocabulary that points at
  [What to draw each moment from](biscuit_pics/raw/README.md#what-to-draw-each-moment-from) rather
  than re-listing it; a scale test — the full register at its minimum, the icon-mark at sixteen
  pixels and at header size, on dark and on light (row 10); a do-and-don't panel with the ten
  breed-default mistakes as the don'ts.
- Every item drawn before its row closes carries the word "provisional". Until
  [the closing shoot](biscuit_pics/raw/README.md#what-this-corpus-cannot-answer) the sheet cannot
  fix a measured proportion, a measured head profile, a departing rear view or a colour anchored
  to a neutral reference.

## Review checklist

Hold every delivered image against these before accepting it. Each is a yes or a no.

1. The nose is liver; only the nostril openings are dark.
2. The irises are amber and separable from the pupil at the delivered size; the rims are liver.
3. Cream sits in the five places only; the eye ring is present; the rest is body colour.
4. The ear leathers are the darkest thing in the image.
5. The ears sit at eye level, two lobes to the jawline, in a looser wave (open: row 5).
6. The head is a circle with a stub.
7. The coat is unclipped: no clipped line, pom or bracelet (open: row 4).
8. The tail is long and feathered, the plume lighter at the tip, carriage matching the pose.
9. The feet are pale mops from above; dark pads show only from below.
10. Body value sits inside the range and matches the swatch; markings read at size (open: rows 6, 9).
11. Every fill is a ramp stop or a declared neutral; nothing is sampled (open: row 9).
12. The face matches the fixed-face panel, or the break was asked for in writing (open: rows 7, 11).
13. Nothing worn, held or accompanying; no lettering, ground line, shadow or scene.
14. Still, artefact-free and nothing from the direction's Avoid list; it passes every row of the
    criteria table (open: row 2).
15. Unchanged, it reads on all four grounds and at the minimum, and the proportions match the
    anchor-age panel (open: rows 3 and 10); for an icon-mark delivery, a curl, an ear or a
    letterform of hers, geometric, with exactly one wrong element (open: row 8).

Placement, one per screen, `aria-hidden` and the motion-off reduction are checked at mount,
against the sixth principle, not at delivery.

## Related pages

- [Design direction](direction.md) — why she exists, her voice, and where she may be.
- [Biscuit reference photography](biscuit_pics/raw/README.md) — the frames every rule cites.
- [Biscuit image backlog](biscuit-image-backlog.md) — the drawings, in order, each with a brief.
- [Decision 0010: The Biscuit Games design system](../decisions/0010-biscuit-games-design-system.md)
  — the ramp she is drawn in, and the deferred mascot she is.
- [Port a design system component](../how-to/port-a-design-system-component.md) — where she mounts.
