---
title: "Biscuit character bible"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [biscuit_character_bible]
requires: []
---

# Biscuit character bible

This page is the model sheet in words, and the rules for drawing and using Biscuit. It is
the brief an illustrator works from, the checklist a delivered image is held against, and
the record of the decisions that keep one drawing of her consistent with the next.

It owns how she looks and how she is rendered. It does not own why she exists, where she is
allowed to be or how she sounds — [Design direction](direction.md#biscuit) does, and
nothing here relaxes it — and it does not own the evidence:
[Biscuit reference photography](biscuit_pics/raw/README.md) holds eighty-six frames of
the real dog, each read and graded, and where this page states a rule the evidence for it
is a link into that index rather than a restatement. The images this page governs are
listed, each with its own brief, in [Biscuit image backlog](biscuit-image-backlog.md).

## Who she is

Biscuit is a brown miniature poodle, drawn from a real one, and she is the host of the place
rather than its logo. The direction states the joke once — a precision instrument with
exactly one soft thing living inside it, and the soft thing owns the workshop — and every
rule on this page serves it. She is exacting, proprietorial and entirely unbothered. The
comedy is in what she does: she flings herself onto her back, she rears up, she stops
watching. It is never in a face pulled for the camera, and it is never in anything she
says, because she says nothing; she is observed, in flat third-person prose, and never
speaks. An image that makes her cute, chatty or cartoonish has drawn a different dog.

## The decisions this page takes

The photo index lists the things that vary across the corpus and says each must be chosen
once and then held, because averaging them produces a dog that appears in no photograph.
These are the choices. Four were answered by the owner on 2026-08-22 — the age anchor, the
coat length, the rendering of the full register, and that the images are commissioned from
an illustrator rather than drawn in-house or generated; the rest are this page's proposals,
stated so they can be overturned. Overturn any of them by editing its row and redrawing the
sheet, not by drawing a pose that quietly disagrees.

| Decision | What is chosen | Why |
| --- | --- | --- |
| Age anchor | Proportions are **adolescent**; colour comes from the puppy frames alone. | A blend exists in no photograph ([the index](biscuit_pics/raw/README.md#head-to-body-proportion-by-age)). An adult keeps an exacting workshop; a puppy is the children's cartoon the direction rules out. |
| Coat length | **Medium**, the length of [the sphinx frame](biscuit_pics/raw/README.md#coat-length-and-groom-state). | The curl reads, the silhouette still holds at small sizes, and the ears hang clear of the cheek. |
| Production | **Commissioned from an illustrator**, briefed from this page and the backlog; not drawn in-house, not generated. | The direction assumes it, and a brief an illustrator can hold a delivery against is what this page is. |
| Rendering, full register | **A single-weight ink line with flat fills.** No shading, no texture, no gradient, no outline heavier than the line. | The interface is thin rules and tabular figures; a line drawing is the one illustration language that sits beside it without softening it, and it scales from a dialog to a hero without redrawing. |
| Rendering, reduced mark | **Geometric and monochrome**, as [the direction](direction.md#the-mark) already requires. The ink line governs the full register only. | The mark defends against the developer-tool reading; a miniature of the line drawing would not. |
| Palette | Her fills are the **biscuit ramp** in `src/app.css`, and nothing outside it. | The one warm family is already named after her. This amends the ration [decision 0010](../decisions/0010-biscuit-games-design-system.md#decision) records — spent in two places now, the brand pair once and her — and that decision's sentence is edited when the first asset lands. |
| The fixed face | **The eyes are the face.** Everything else — mouth, ears, head angle, body — is posture and free to vary. The break, when it comes, is a change to the eyes. | Wins are frequent and the break is rare, so nothing that varies on a win can be part of the face. It also matches the corpus, where the open mouth is what a running dog does, not what an expressive one does. |
| Fringe | The topknot is **held clear of the eyes**. | One face learned by heart cannot be veiled half the time ([the index](biscuit_pics/raw/README.md#whether-the-eyes-clear-the-fringe)). The veiled head is then available as a deliberate state, not a drawing variation. |
| Dress | She **wears nothing** — no collar, harness, clothing, bandana, hat or booties — and holds no prop. | The photographs are full of them and none of them is her. A prop is a later purchase, made once the character has landed. |
| Themes | **One drawing serves every palette.** The line is `currentColor`; the fills are tokens; nothing is redrawn per theme or for high contrast. | Dark is home and light is a first-class courtesy; two Biscuits would drift apart. |
| Minimum size | The full register is **never rendered smaller than 180 × 135 CSS pixels**. Below that, only the mark appears. | At that size the line is exactly the interface's strong rule and the face still reads; smaller than that she is a smudge, and the mark exists for the smudge. |
| The mark's wrong element | **Not decided here.** The direction leaves it to the illustrator's brief; the brief in the backlog names the candidates. | Deciding it on a page is how a mark ends up designed by committee. |

## Model sheet

The sheet is the first thing the illustrator delivers and the last word on her anatomy;
this section says what it has to fix and what each part must obey. Its deliverable is
specified as [the first item of the backlog](biscuit-image-backlog.md#tier-0-before-anything-is-drawn).

### Proportions

Nothing in the corpus can measure them. The full frames added whole uncut bodies, so
her outline is no longer in doubt, but every one is shot from a standing person's eye onto a
small dog and none has an object of known size beside her, so leg length and body depth are
still inferred —
[the index says so](biscuit_pics/raw/README.md#her-proportions-still-cannot-be-measured).
Worse for this page, every uncut body is a grown dog's and the sheet is anchored to the
adolescent, which
[has no whole-body frame at all](biscuit_pics/raw/README.md#the-age-the-sheet-is-anchored-to-has-no-whole-body-frame).
Until the closing shoot exists, the sheet works inside these bounds, which are inference
from the breed's structure corrected by her frames, not measurements of her:

- **A square, compact dog.** Height at the withers close to the length from sternum to
  rump. She is not long-bodied and not leggy in the way a show poodle is; the run frames
  read leggy partly because the hair on the legs is long.
- **A round head, carried close.** The skull is a circle, the muzzle a short blunt stub on
  the front of it, and the neck disappears into coat so the head sits near the shoulders.
- **Ears to the jaw.** Drop ears reach about the jawline; the topknot sits above the skull
  line without a clipped edge.
- **Adolescent, not puppy.** Legs and body at near-adult ratio; the oversized head and
  short legs of the puppy frames are colour evidence only.

Every figure above is provisional and flagged as such on the sheet. The shoot the photo
index asks for closes them, and a sheet redrawn from that shoot supersedes these bounds.

### Head and face

Each rule is one line; the evidence is the link.

| Part | Rule | Evidence |
| --- | --- | --- |
| Skull and muzzle | A circle with a stub: domed skull, short blunt muzzle, soft stop. Never the long tapering show-poodle wedge. | [Short blunt muzzle on a domed skull](biscuit_pics/raw/README.md#short-blunt-muzzle-on-a-domed-skull) |
| Eyes | Round, wide-set, open. Amber iris, dark pupil that separates from it at every size this page permits. The rim is liver, never black. | [Amber eyes with brown rims](biscuit_pics/raw/README.md#amber-eyes-with-brown-rims) |
| Nose | Liver brown, large for the muzzle. Never black — that single substitution breaks her more visibly than any proportion error. | [Liver nose, never black](biscuit_pics/raw/README.md#liver-nose-never-black) |
| Brow pips | Two cream pips directly above the eyes. Always drawn; they carry the expression, and they are the marking most often dropped. | [The phantom marking map](biscuit_pics/raw/README.md#the-phantom-marking-map-and-where-it-sits) |
| Ears | Set low, at eye level; two distinct lobes reaching the jawline; longer, looser waves than the body; the darkest value on her. They swing and lift with posture. | [Low drop ears in longer, wavier hair](biscuit_pics/raw/README.md#low-drop-ears-in-longer-wavier-hair), [The ear leathers are the darkest thing on her](biscuit_pics/raw/README.md#the-ear-leathers-are-the-darkest-thing-on-her) |
| Topknot | Shapeless, unclipped, held clear of the eyes. | [Whether the eyes clear the fringe](biscuit_pics/raw/README.md#whether-the-eyes-clear-the-fringe) |
| Mouth | Closed at rest, a short flat stroke. Open is posture — a running or rolling dog's mouth — and never an expression. | [Outcome: win](biscuit_pics/raw/README.md#outcome-win) |

The head profile rests on two frames that agree and neither of which is what the sheet wants:
[one square on with its colour destroyed, one in colour with the head turned](biscuit_pics/raw/README.md#the-head-profile-has-one-square-on-frame-and-its-colour-is-destroyed).
The sheet's profile is drawn from both for structure and flagged until the shoot confirms it.

### The fixed face

The direction asks for one face, learned by heart, broken so rarely that the break is an
event. This is that face, stated so an illustrator can hold it across every pose:

- **The eyes are the face.** When she faces the viewer both are visible, round, open,
  level — neither narrowed nor widened — and looking at the viewer. The brow pips sit level
  above them. This does not change from one image to the next.
- **Everything else is posture.** The mouth may open at a run or a roll. The ears may lift,
  fly, flatten or hang. The head may tilt, lower or throw back. The body may do anything
  the moment calls for. Cover the eyes in any two images and she should look like two
  different moments; cover everything but the eyes and she should look identical.
- **Deadpan is the resting state.** At rest the mouth is closed and the ears hang. A loss
  is chin down and ears back with the eyes still level on the viewer — reproach by posture.
  Sleepy is a tighter curl with the chin on the paws and the ears slack, and the eyes are
  still open. The photo index offers closed-eye frames for sleep — a puppy's head, and the
  grown dog folded into her bed; under this rule they are posture evidence for the fold and
  not a licence to shut the eyes.
- **The break is a change to the eyes** — shut, a wink, a side-eye, a widening, whichever
  the one break drawing chooses. At most one such image exists. Its form and its trigger are
  [open questions](#open-questions); until they are answered, no image breaks the face.

### Coat

Medium length, soft, open, slightly irregular waves and loose curls, longest on the skull,
the ears and the legs, with no clipped line anywhere — not the face, not the feet, no
bracelets, no rosettes, and never the continental trim a generic poodle reference returns.
Evidence: [Unclipped coat, soft irregular waves](biscuit_pics/raw/README.md#unclipped-coat-soft-irregular-waves)
and [Coat length and groom state](biscuit_pics/raw/README.md#coat-length-and-groom-state).

In line, the curl is the contour's waver plus a few open loops inside the silhouette where
the coat is longest. It is never a scribble, never hatching, never a texture fill.

### Markings

Cream sits in five places and nowhere else: a band wrapping the muzzle from behind the nose
back under the eyes; the two brow pips; a bib on the chest and throat; stockings from about
the elbow and hock down; and the feet. Skull, ear leathers, back, flanks and rump are body
colour. Evidence:
[The phantom marking map and where it sits](biscuit_pics/raw/README.md#the-phantom-marking-map-and-where-it-sits).

The hindquarters are no longer provisional. The full frames show the back, the flanks and the
rump carrying no cream at all, the stockings starting at about the elbow and the hock, and the
pale hair below them running unbroken into the feet —
[the evidence is in the marking map](biscuit_pics/raw/README.md#the-phantom-marking-map-and-where-it-sits).
Nothing above the hock is cream, and it is now a reading rather than a placeholder.

### Tail

A fuller, longer, paler plume of hair at the end of the tail — not a shaved pom on a
stalk, not a bare tapered whip. Evidence:
[Tail carries a paler plume](biscuit_pics/raw/README.md#tail-carries-a-paler-plume).

Its length and its carriage are established. The tail is long and feathered along its whole
length, and the carriage follows the pose rather than the mood: **up and curved over the back
when she is standing, laid out behind her along the ground when she is sitting or lying**, and
never tucked. What it does at a walk is not photographed; only a run is. Evidence:
[The tail is long, and its carriage follows the pose](biscuit_pics/raw/README.md#the-tail-is-long-and-its-carriage-follows-the-pose).
Every pose draws one of those two carriages and no third.

### Feet

Cream mops from above and from the side; the pads are dark and appear only when the sole
turns to the viewer. Never pink pads, never a clipped foot with the toes exposed. Evidence:
[Dark pads under cream foot feathering](biscuit_pics/raw/README.md#dark-pads-under-cream-foot-feathering).
The foot is documented as a puppy and as a grown dog, and the two agree about pad colour and
feathering; only the adolescent middle is
[still an open gap](biscuit_pics/raw/README.md#there-is-no-clear-view-of-an-adolescent-foot),
so the shape stays flagged even though the colouring does not.

### Colour

Her fills come from the biscuit ramp in `src/app.css`, and the table is the whole of her
palette. No value is mixed, lightened or shaded; each part is one flat token.

| Part | Token | Value | Why this value |
| --- | --- | --- | --- |
| Body: skull, back, flanks, rump, legs above the stocking | `--biscuit-3` | `#8a5230` | The darkest step that still reads as a fill rather than a hole on the near-black page (about 3.1:1), while the ears keep a step darker and the markings a step lighter. She stays recognisably brown; anything paler here is the cream drift the direction calls a defect. |
| Ear leathers | `--biscuit-2` | `#6b3f22` | The darkest thing on her, which is what survives the fade and holds the read at small sizes. |
| Markings: muzzle band, brow pips, bib, stockings, feet | `--biscuit-7` | `#efd3b4` | Cream against the body, separated by two full steps so the marks read as marks and not as shading. |
| Tail plume | `--biscuit-6` | `#dda97b` | Paler than the body, not as pale as a marking. |
| Nose leather | `--biscuit-4` | `#a9663b` | A shade off the body, warm, sitting on the cream band. Nostrils and philtrum are the line, never a darker fill. |
| Iris | `--biscuit-5` | `#c4834e` | Provisional: the ramp's nearest step to amber. If the sheet shows it reading orange, the illustrator proposes one amber value and it lands in `src/app.css` as a token; this page does not add a colour on its own. |
| Pupil and paw pads | `--biscuit-1` | `#3d2313` | A fixed dark. Never the line colour, which is white on the dark page. |
| The line: contour, curl loops, nostrils, mouth, toes | `currentColor` | `--text` | White on dark, near-black on light, and the high-contrast palettes answer for themselves. |

Three things follow. She never takes a result hue or a neutral — green, yellow and the
greys belong to the board and the chrome, and she carries no state. On the light page the
cream markings at the silhouette's edge are held by the contour alone, which is one reason
the line is the register. And no contrast floor applies to her — she is decorative, per
[Accessibility](../explanation/accessibility.md) — so the figures above are why she reads,
not a gate; `tests/contrast.test.ts` does not enumerate her and should not.

The photo index calibrates the real dog's range, from puppy chocolate to café-au-lait
([The range she has to stay inside](biscuit_pics/raw/README.md#the-range-she-has-to-stay-inside));
this table is where the drawing lands inside it, and the body does not move off its step.

## Rendering rules

These govern the full register. The reduced mark has its own short set at the end.

### The line

- **One weight per asset, and the same weight on every asset.** Set at 2 user units on the
  stage below, which renders as 1.5 px — the interface's `--rule-w-strong` — at the minimum
  size and scales with the drawing above it. She is a print, not a UI rule: the line is
  proportionally the same at hero size.
- **No tapers, no pressure, no heavier outer contour, no hatching, no cross-contour, no
  stipple.** Curl is contour waver and a few open loops, as the coat section says.
- **Flat fills only.** No shading, no cast shadow, no highlight, no gradient, no texture,
  no paper. Light does not fall on her.
- **No floor line, no ground, no scene.** The floor is implied by where she touches the
  stage's floor. A drawn ground would be a second element, and she is the only one.
- **Nothing photographic, nothing textural, nothing that reads as generated.** The photo
  index's [matte artefacts](biscuit_pics/raw/README.md#read-these-with-care) — fringes,
  halos, the baked-in sticker border — are never drawn.

### The stage

Every full-register pose is drawn on the same stage, so one pose can replace another
without jumping.

- `viewBox="0 0 240 180"`, a 4:3 field; it is never rendered below 180 × 135 CSS pixels.
- The floor is `y = 160`. Whatever part of her touches the ground touches that line; the
  bottom twenty units are margin.
- Nothing touches an edge. At least eight units of margin all round, and she is drawn as
  large as the pose allows inside that.
- She faces the viewer or moves toward or away from them; the stage is not cropped,
  rotated or mirrored at mount — a mirrored pose is a pose decision made on the sheet.

### Structure for motion

The direction spends all motion on her, and what she does when she moves is decided when
the first pose is mounted, not here. The asset has to make it possible without making it
happen:

- **The asset is still.** No SMIL, no animated SVG, no embedded script. Motion lives in CSS
  under the animations setting, because
  [when motion is off she reduces to the mark](direction.md#when-motion-is-off), and an
  asset that animates itself cannot be told to stop.
- **Named groups.** The SVG groups `head`, the near and far `ear`, `tail`, `body` and
  `eyes` under classes prefixed `biscuit-`, each with its pivot point stated in the delivery,
  so an ear can lift or a tail can move without touching the drawing.
- **One Biscuit per page.** At most one full-register image is on screen at a time, so
  group names never collide.

### Format and home

- **Master:** editable vector, kept with the sheet under `docs/design/biscuit_sheet/`
  beside the photography — proposed, not yet created — because sources never ship.
- **Shipped:** one optimised SVG per pose, no embedded raster, no fonts, no `<text>`, no
  filters, no masks. Fills reference tokens (`var(--biscuit-3)`) and the line is
  `currentColor`, so the image themes itself when inlined the way the icons are inlined
  (`?raw` imports, per decision 0010). Home: `src/lib/assets/biscuit/`, and the porting
  guide's `MascotSlot` row records the mount — see
  [Port a design system component](../how-to/port-a-design-system-component.md).
- **For review:** a PNG at 2× on the dark ground and on the light ground, because the
  reviewer should never have to build the app to see her.
- **Raster only where the platform forces it:** the favicon fallback and the touch icon.
  Those are the mark, not her.

### The reduced mark

Abstract, geometric, monochrome, built from a curl, an ear or a letterform, with exactly
one element knowingly wrong — an ear escaping the grid, a curl with a radius the rest
would never allow. It is drawn in `currentColor`, with no fill but its own ink, so it sits
in the header beside the wordmark and in a tab at sixteen pixels. Which element is wrong
is the illustrator's to propose; [the backlog](biscuit-image-backlog.md#tier-0-before-anything-is-drawn)
asks for candidates. The mark is not a miniature of the line drawing and does not use her
fills, and the only places it takes a fixed colour are the raster exports the platform
forces.

## Rules for using her

[Design direction](direction.md#where-she-is-allowed-to-be) decides where she may be —
at the boundaries, absent while the player is thinking — and
[where she does not go](direction.md#where-she-does-not-go). These are the image-level
rules that follow from it.

- **At a boundary, once.** One of her on screen at most, at an opening, an outcome, a
  sign-off or an ambient state; never over the board, beside a control, inside a menu or
  behind anything as decoration.
- **Decorative in the accessibility tree.** She carries no state and conveys no result, so
  she is hidden from assistive technology, and the narrator line beside her — plain HTML
  copy in the direction's [voice](direction.md#voice) — is the only text. Nothing she
  does may be the only way a player learns something.
- **As drawn, or not at all.** Never recoloured, tinted to a theme, given a result hue,
  flipped at mount, cropped, rotated, stretched, blurred, shadowed, glowed, outlined or
  placed on a texture. Never below the minimum size. Never lightened toward cream.
- **No lettering in the artwork.** No speech bubble, no thought bubble, no caption drawn
  in, no onomatopoeia, no emoji. Everything said is HTML copy, third person, flat.
- **Nothing worn, nothing held, nobody with her.** No collar, no harness, no sweater, no
  party hat; no ball, no plush toy; no second animal, no hand, no person.
- **The asset is the pose.** Motion is added at mount under the animations setting, and
  with motion off she is the mark. An image is never a GIF, a video or a sprite sheet.
- **She is never the fix for a weak screen.** A screen that feels cold is fixed by the
  craft the direction says carries a first visit; a screen that feels cute all over needs
  fewer character elements, not better ones.

## Reviewing a delivered image

Hold every delivery against this list before accepting it. Each line is a yes or a no.

1. The nose is liver, not black.
2. The iris is amber with a dark pupil; no dark button eye; the rim is not black.
3. Both brow pips are present.
4. Cream sits in the five places and nowhere else; rump and back are body colour.
5. Ears are set low, reach the jaw, hang clear of the cheek, and are the darkest value.
6. The head is a circle with a stub, not a wedge.
7. The coat is unclipped, medium, wavy; no pattern, no bracelet, no shaved face or foot.
8. The tail ends in a paler plume, carried up and curved over the back when she stands and
   laid out behind her when she sits or lies, never tucked.
9. Feet are cream; pads are dark and shown only when the sole turns.
10. The body is `--biscuit-3`; no part of her is lighter than its token, and no fill is
    outside the colour table.
11. One stroke weight; no taper, texture, hatching, shading, gradient or shadow.
12. The eyes are the fixed face — open, round, level, on the viewer — unless her back is
    turned, and no image breaks the face without an answered open question.
13. Nothing worn, nothing held, nobody else, no lettering.
14. It reads on the dark page and the light page, and in both high-contrast palettes,
    without edits.
15. It holds at 180 × 135 pixels; the mark holds at sixteen.
16. It sits on the shared stage, touches the floor line, and touches no edge.
17. The named groups are present and the asset is still.
18. The proportions are the sheet's, adolescent.
19. It is at a boundary, alone, and nothing else on the screen moves.
20. Looking at it, the answer to the direction's first test — is there exactly one break,
    and is it her? — is yes.

## Open questions

Unresolved decisions, stated so nobody resolves one silently. The first two are product
decisions; the rest wait on photographs that do not exist yet.

- **The mark's wrong element.** Left to the illustrator's brief by the direction; the
  candidates are in the backlog and the choice is made when they are seen.
- **The face break.** Which change to the eyes it is, and what triggers it — a first win
  after a long absence, a game solved in one, something else. No specification states a
  trigger, so it is an open product question, and until it is answered no image breaks the
  face.
- **The iris value.** Whether `--biscuit-5` reads as amber on the sheet, or a token is
  added.
- **The adolescent foot's shape, and a measured head profile.** Each is provisional above and
  each is closed by the shoot the photo index describes under
  [What this corpus cannot answer](biscuit_pics/raw/README.md#what-this-corpus-cannot-answer).
  Tail carriage and the hindquarter markings were on this list and are not any more; the
  twenty full frames settled both, and
  [the index records which frames did it](biscuit_pics/raw/README.md#what-the-twenty-full-frames-closed).
- **Whether the anchor age survives.** The sheet is anchored to the adolescent and no
  adolescent frame shows a whole animal, while every whole animal in the folder is a grown
  dog whose build is heavier and shorter-legged. Either the proportions stay an inference or
  the anchor moves, and no page decides that on its own.
- **The sources' home.** `docs/design/biscuit_sheet/` is proposed for the sheet and the
  masters and `src/lib/assets/biscuit/` for the shipped SVGs; both are named here so the
  first delivery lands somewhere deliberate, and either may move when it does.

## Related pages

- [Design direction](direction.md) — why she exists, where she is allowed, how she sounds.
- [Biscuit image backlog](biscuit-image-backlog.md) — every image to make, each with its
  brief.
- [Biscuit reference photography](biscuit_pics/raw/README.md) — the evidence behind
  every rule above.
- [Port a design system component](../how-to/port-a-design-system-component.md) — where
  she mounts.
- [Decision 0010: The Biscuit Games design system](../decisions/0010-biscuit-games-design-system.md)
  — the tokens she is drawn in.
- [Accessibility](../explanation/accessibility.md) — why she carries no state.
