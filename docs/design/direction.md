---
title: "Design direction"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [design_direction]
requires: []
---

# Design direction

This page decides how Biscuit Games looks, sounds and feels, and why. It is the owning
page for the platform's aesthetic: its identity, palette, typography, density, motion,
mascot and voice. It does not decide gameplay behaviour — the Allium specifications under
`docs/specs/` do that, and where the two ever appear to disagree, the specifications win.

It supersedes an earlier brand guide that assumed accounts, profiles, achievements and a
cream palette. Two of those are non-goals this project states outright in
[Purpose and scope](../project/purpose-and-scope.md#what-it-deliberately-does-not-do), and
the third is rejected below. Nothing from that guide survives here except where it is
repeated here.

The research behind the vocabulary is catalogued separately in the
[Design resource index](resource-index.md); this page is the opinion, that page is the
reading.

## North star

> **Biscuit's workshop.**
>
> A precision instrument with exactly one soft thing living inside it.

The platform is named after a miniature poodle, and she is not a decoration applied to a
games site. She owns the place. That matters because it resolves the contradiction the rest
of this page would otherwise carry: the dark room, the tight grid, the tabular numerals and
the instant response are **her** taste, not a designer's. A ridiculous animal is allowed to
keep an exacting workshop. That is funnier, and more coherent, than a serious product
wearing a mascot.

The character comes first. The interface exists to serve her, not the other way round.

## The operating rule

> **Perfect, broken once, on purpose.**

Every layer is built to an exacting standard and then broken in exactly one place, and the
break is always Biscuit.

| Layer | Perfect | Broken once |
| --- | --- | --- |
| The mark | Abstract, geometric, cold | One warm tell — an ear escaping the grid, a curl too soft for the rest |
| The interface | Dark, tight, tabular, instant | She arrives |
| Her face | Fixed, learned by heart | A rare break, which is therefore an event |
| Motion | 120–180ms, no bounce, nothing decorative moves | The only thing that moves is her |
| The object it evokes | A machined aluminium puzzle box | One dog hair on it, never removed |

This is the test every new decision answers to. **A decision with no break is cold. A
decision with two is noise.** It is deliberately cheap to apply: look at the thing you are
proposing, find the single warm exception, and check there is exactly one.

## What the first five seconds are carried by

A stranger's first visit is won by **visible craft and by the name and the mark** — by the
quality of the type, the spacing, the response of a key, and by a logo and a name that are
obviously nobody else's.

It is explicitly **not** carried by the mascot. Biscuit is rationed, and rationing means a
first session may contain very little of her. She is the reason to come back, not the
reason to arrive. Any proposal that fixes a weak first impression by adding more dog is
solving the wrong problem.

The review this whole page exists to avoid is *"another Wordle clone."* Not *"it's cute"*,
not *"it looks like a startup"* — those are survivable. That one is not.

## What is deliberately not the brand

Poodl never rations a game, keeps no account, runs no server and collects no telemetry.
That is a real difference from every other puzzle platform, and it is a **quiet virtue,
stated once**. It belongs on an about page. It is not the identity, it is not the
marketing, and no visual decision should be made in order to express it.

## Naming and architecture

| Thing | Name |
| --- | --- |
| The platform | **Biscuit Games** |
| The word game | **Poodl** |
| The tile game | **Pawjong** — intended, not yet built |

Games are **the same instrument with a different attachment**. Chrome, navigation, controls,
settings, statistics, sharing, motion and Biscuit are identical across all of them; the play
surface is the only thing that changes shape. A new game is therefore cheap to add, and two
screenshots from different games read unmistakably as one product.

The cost of this choice is accepted knowingly: an individual game has little room for a look
of its own. Differentiation between games is bought with the board's geometry and with
Biscuit's relationship to it, never by re-theming the shell.

## Visual system

### Ground

**Stark.** True white and near-black, with marks at full strength. The palette already in
`src/app.css` stands, and the warm cream ground proposed by the superseded guide is
rejected: it would spend contrast headroom the board needs, and warm-neutral-plus-friendly-
sans is the house style of most consumer products launched since 2021.

The ground is not where the brand lives. The type and the mark are.

### Dark is home

Near-black is the identity — the hero image, the screenshot, the thing to picture when
picturing the product. Light is the courtesy option, and a first-class one.

This inverts how `src/app.css` currently reads, where the light theme is stated first and
the dark theme follows it. Colour decisions are now made for dark and then answered for
light, not the reverse. Nothing about the four-way theme × high-contrast structure changes;
only which of the four is designed first.

### Typography

**Humanist, with real quirk. Open licence, self-hosted.**

Not neo-grotesque — too neutral to carry a brand on a stark ground. Not geometric — the
friendly-round register is the fastest available route to looking like everything else.
What is wanted is a sans with fingerprints: an odd bowl, a warm terminal, letterforms
someone clearly decided.

No recurring licence and no third-party font host. The file lives in the repository,
subset, so the static-site story stays intact and the page has nothing to fetch from
anywhere.

The candidates were rendered and compared, and the selection landed with
[decision 0010](../decisions/0010-biscuit-games-design-system.md): **Bricolage Grotesque**
carries display, the brand and the board — the risk the shortlist named, that it might be
too strange inside a tile, did not survive seeing it there — and **Instrument Sans**
carries the interface. Two families rather than one, bought deliberately: the display
face's fingerprints are the differentiation, and the interface face's plainer figures are
what keep a settings row from shouting.

| Face | Carries | Axes in the committed build |
| --- | --- | --- |
| Bricolage Grotesque | Display, wordmark, board letters, statistics figures | optical size, width, weight 200–800 |
| Instrument Sans | Interface copy, controls, labels | width, weight 400–700, plus italic |

Both are OFL, self-hosted as latin-subset variable woff2 files in
`src/lib/assets/fonts/` with the licence texts beside them and provenance in the
`src/app.css` header — no font host, nothing fetched from anywhere, exactly as this page
required. Both files carry the `tnum` feature the statistics need, verified from the
committed files rather than from the foundry's page.

### Density

**Precise and instrumental.** Thin rules, a tight grid, tabular numerals, and a lot of
small confident detail. It should read as a beautifully made tool.

This is chosen because it is the sharpest available contrast against a soft animal, and the
contrast is the brand. Airy editorial layout would be pleasant and would waste the joke;
chunky and tactile would collapse into the childishness this page is trying to avoid.

The obvious risk is that stark, dark, precise and crisp is also the recipe for every
developer tool of the last five years. The defence is the mark and the wordmark, and it has
to actually work — see below.

### Motion

**Crisp and near-instant.** 120–180ms, minimal easing, and **no bounce anywhere in the
interface**. Overshoot, squash and spring are the fastest way to read as a generic mobile
game, and every one of them is spent on Biscuit instead.

Because the interface barely moves, movement means her. That signal is worth protecting: a
decorative transition added somewhere harmless still costs it.

Motion is also a setting. Poodl lets a player switch animations off and honours a request
for reduced motion, and what happens then is stated under [Biscuit](#biscuit) rather than
left to each component to decide.

### Sound

**Deferred.** There is no audio, and the decision to have any waits until there is a second
game and a reason. When it is taken, it is taken here.

## The mark

Abstract and geometric — a curl, an ear, a letterform — rather than a drawing of a dog. It
has to sit beside precision typography without softening it, work at sixteen pixels, and
still be right in ten years.

Because the mark is what defends against the developer-tool reading, a cold mark alone will
not do it. The construction stays geometric, and **exactly one element is knowingly wrong**:
an ear that escapes the grid, or a curl with a radius the rest of the mark would never
allow. Precise everywhere, animal in one place. The wordmark carries the rest — *biscuit
games* is not a name any productivity product would have, set in a face with fingerprints
on it.

Which element is the wrong one is left to the illustrator's brief rather than decided here.

## Biscuit

She is a brown miniature poodle, drawn from a real dog, and she behaves as the platform's
host rather than its logo.

### Two registers

A **reduced icon-mark** — favicon, tab, header, loading, and the motion-off state — and a
**fuller illustrated Biscuit** for the moments that deserve her. The reduced register does
most of the work by volume; the full one does all the work by weight.

### A fixed face, broken rarely

One face, learned by heart, and comedy that comes from what she is doing rather than from
her expression. The face breaks so seldom that the break is itself the payoff — something a
returning player notices and mentions to someone.

Rarely means rarely. A break that shows up often enough to be expected has already stopped
being one.

### Voice

Split by register, and the split is strict:

- **Anything functional is plain, warm interface copy.** The word was CRANE. Three guesses
  left. Copied. The interface never pretends to be a dog while telling a player something
  they need.
- **Rare moments are a dry third-person narrator, about her.** *Biscuit has stopped
  watching.* She is observed, not conversational.

She never speaks in the first person. The deadpan is the point: she behaves
disproportionately and the prose stays flat, and that contrast is what keeps the character
from reading as juvenile.

### Where she is allowed to be

At the boundaries — opening, the end of a game, sign-off, and ambient states. She is absent
while a player is thinking and present once they have stopped, so she never competes with
the board for attention and never obscures state.

Per-guess reactions are a later purchase, made only once the character has proved it lands.

### When motion is off

**She reduces to the mark.** With animations disabled or reduced motion requested, only the
icon-mark and header remain.

This is a decision, not an oversight, and it has a cost worth naming: those players lose the
character reward entirely and are carried by craft alone. That is consistent with craft
being what carries a first visit anyway, and it is preferable to a half-animated compromise.
The obligations in [Accessibility](../explanation/accessibility.md) are unaffected — Biscuit
is decorative, carries no state, and never conveys a result.

### The first pose set

Commissioned from an illustrator. The first set is a budget as much as a wish list:

- **Outcomes** — win and loss. Two poses that have to be very good.
- **Bookends** — arrival and sign-off.
- **Ambient and stateful** — idle after a long pause, sleepier late at night, different
  after a long absence. These read the clock through the existing port rather than through
  a global.

Explicitly excluded from the first set: per-guess reactions.

A character reference sheet defines her proportions, colouring, face, ears, tail and paws
before any pose is drawn, so the character cannot drift between illustrations. She stays
recognisably brown; drifting toward cream or white is a defect, not a variation.

Raw reference photography of the real dog — puppy through adolescent — lives in
[Biscuit reference photography](biscuit_pics/raw/README.md), gathered for this reference
sheet to draw from.

### Where she does not go

Beside every button, on every game tile, inside every modal, behind the interface as
decoration, or anywhere she competes with play. The measure is whether her presence adds
personality, information or emotion. If a screen feels cute all over, the answer is fewer
character elements, not better ones.

## The board

Green and yellow stay. They are a genre convention now, in the way red and black are a
convention in a deck of cards, and fighting them would spend a stranger's first thirty
seconds on comprehension. Three other things carry the differentiation instead:

1. **Our own green and yellow.** The same hues at deliberately unusual values, chosen for
   the dark theme first rather than inherited from a light one.
2. **Tile form.** Thin rules rather than heavy fills, a tighter grid, considered corners —
   the instrument language reaching the play surface.
3. **The letters.** The humanist face goes inside the tiles. It is the largest type on
   screen, and it is the cheapest differentiation available.

The first two are not paint. Both move figures that `tests/contrast.test.ts` enumerates
against the floors `game.allium` states, and the second changes the lightness scheme
`src/app.css` documents at length — a key nothing is known about hugs the page, a scored key
steps away from it. That scheme is what
`AnUntriedKeyIsDistinguishableFromAScoredOne` costs, and it survives a dimmed screen that
takes the hues with it. Neither change is made without the specification and accessibility
work that [Testing](../reference/testing.md) and
[Accessibility](../explanation/accessibility.md) describe.

Colour never carries meaning alone here, and nothing on this page relaxes that.

## Avoid

Not stylistic preferences — each of these actively breaks something above.

- Cream or warm-neutral grounds, friendly geometric sans, soft pill buttons everywhere.
- Pixel art, arcade nostalgia, steampunk, skeuomorphism, visible hand-drawn texture.
- Cartoon styling aimed at children, hyperrealism, 3D rendering, glossy mobile-game
  character art, or anything carrying generative-AI artefacts.
- Excessive gradients, busy dashboards, ornate illustration.
- Springy or bouncy interface motion.
- Meme language, sarcasm, and first-person mascot chatter.
- Copying the New York Times Games look, which is the failure mode this page is built
  against.

## Testing a decision

1. Is there exactly one break, and is it her?
2. Would a stranger see craft before they see a dog?
3. Does it survive the contrast floors in all four theme and high-contrast combinations?
4. Does it still work with animations off?
5. Does it read as the same product as every other game here?
6. Could it be mistaken for a developer tool? If so, the mark is not doing its job.
7. Is the poodle helping, or is she just present?

## Related pages

- [Design resource index](resource-index.md)
- [Purpose and scope](../project/purpose-and-scope.md)
- [Accessibility](../explanation/accessibility.md)
- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Testing](../reference/testing.md)
