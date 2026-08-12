---
title: "Accessibility"
kind: "explanation"
audience: [user, contributor, maintainer, agent]
canonical_for: [accessibility_model]
requires: []
---

# Accessibility

Accessibility is specified, not retrofitted. The surfaces in `docs/specs/` carry named
`@guarantee` clauses, and those clauses are acceptance criteria for any change that
touches a surface.

## The obligations

**Results are never conveyed by colour alone.** Correct, present and absent each carry a
non-colour indication as well as a colour. In the implementation a tile has a shape
glyph, and an accessible name that says the mark in words. A key on the on-screen keyboard
carries the same glyph and the same name — it did not at first, and a sighted colour-blind
reader with no assistive technology had only the colour to go on. This holds in every theme
and in both palettes.

**Everything is keyboard operable.** Every operation a surface `provides` can be reached
and invoked from the keyboard alone, with visible focus. This includes each key of the
on-screen keyboard, and it holds regardless of the physical-keyboard setting — that
setting governs only whether typing goes straight into the board, never whether the game
can be played.

Keyboard operability is where a dialog costs the most, so `Modal` carries the whole of it
once. Focus goes into the panel when it opens, Escape closes it, Tab cycles inside rather
than wandering out to the board behind, and focus goes back to whatever opened it on the
way out. That last one is easy to leave out and invisible until someone tries: closing
destroys the element focus is on, the browser falls back to the document body, and the
player who tabbed to Settings and pressed Escape resumes from the top of the page. A child
that removes the control the player just used — the countdown's stop button, the statistics
confirmation — carries focus across its own swap for the same reason.

**Every submitted guess is announced.** When a guess is accepted, its per-letter results
reach assistive technology in reading order, along with the attempt number and how many
attempts remain.

**Every rejection is announced.** The three rejection reasons — too short, not a word,
hard-mode violation — are each perceivable visually and to assistive technology, and say
which applied. A rejected guess spends no attempt and the typed letters stay put.

**The conclusion is announced.** The outcome, the answer and the attempt count reach
assistive technology when the game ends, and an armed endless countdown is announced
along with the means to stop it. The countdown runs for ten seconds rather than five for
exactly this reason: the web platform gives no way to observe when an announcement has
finished, so the only honest lever is to leave enough room for one.

**Typing can be surrendered to assistive technology.** A screen reader navigates by
letter key, and an application that swallows those keys takes that navigation away.
Turning `physical_keyboard` off is what gives them back: Poodl then handles no key press
at all — not letters, not Enter, not Backspace — and Enter activates whichever control
has focus. The on-screen keyboard still offers every action, so the game stays fully
playable. That is what the setting is for.

**Motion respects the operating system.** Animations run only when the animations setting
is on *and* the operating system expresses no reduced-motion preference. The operating
system wins. The route writes that one derived answer onto `:root` as `data-animations`,
and the tile reveal is gated on the attribute rather than on a media query of its own —
a second opinion on the same question is how the two come apart. The workshop writes the
same attribute from its own toolbar, so both paths are rendered there rather than only the
one the toolbar happens to be left on.

**A tap does only what the control does, and says that it landed.** Touch is the primary way
Poodl is played, and a gesture the platform interprets for itself is a gesture that did not
reach the game. Every control declines the platform's guess — `touch-action: manipulation`,
so a second fast tap on a key is a second letter rather than a zoom; no text selection on a
label; no callout under a held finger. What it declines is the platform's guess and never
the player's intent: `manipulation` keeps the pinch, and the viewport meta has never carried
`user-scalable=no` or a `maximum-scale`, both of which would satisfy the first half of this
by breaking the second.

A text control takes that first declaration and none of the others. Two fast taps in the link
field are a caret placed twice rather than a zoom, which is the rule exactly; but the grid has
to be "selected by hand before it is sent", and on a phone the callout is how a selection is
copied, so suppressing either would buy this guarantee with the one below. Nothing is taken
from a text control, so nothing is owed back: the caret, the focus outline and the platform's
own flash all arrive on contact. What it does need is a font no smaller than 16px, below which
iOS Safari magnifies the page when the field takes focus — the platform zooming on its own
initiative, which is the thing this refuses.

Removing the platform's tap flash without replacing it would leave a control that reads as
dead under exactly the finger the rule exists for, so a pressed control draws a ring in the
page's own ink, backed by its own paper. Two tones rather than one because a key is not one
colour: a plain key, five mark colours and two palettes make twelve backgrounds, and no
single tone stands off all of them — white measures 1.46 to one against a light grey key,
and ink measures 1.77 against a high-contrast blue key in the dark theme. Every one of the
twelve has an edge over 4.1 this way. A filter was the first thing tried and is the reason
this is a shadow: `filter` dims the letter along with the key, and a ten per cent shift took
black on the absent mark from 4.99 to one down to 4.15, buying this guarantee by spending
the one above it.

The ring goes wherever the flash was taken from, which is a wider set than the keys. A
preference row in Settings is suppressed along with everything else and would otherwise stay
visually unchanged until the finger lifted, so the row draws the ring too — the row and not
the box inside it, for the same reason the row is what grew to 44px. A label that merely
points at a text field with `for` is left out of both: pressing it moves focus into the field,
and the focus outline lands on the control that took the tap rather than on the words pointing
at it.

**Every control is big enough to hit.** 44px, from `config.minimum_touch_target`, in both
directions and down to the 320px viewport `config.narrowest_supported_width` names. Most of
that is one base rule in `app.css`, because ten surfaces fulfil this contract and none of
them owns it. Settings is the exception worth naming: three theme radios and five checkboxes
render about thirteen pixels across, and what grew is the labelled row rather than the box,
because a label bound to its control activates it across its whole area and a 44px checkbox
would be a stranger thing than the problem it solved.

The on-screen keyboard is the one place the figure cannot be met in both directions — ten
keys and nine gaps do not fit 44px each across 320px, and the specification says so itself.
There the keys meet it top to bottom, divide each row equally across and keep a gap between
them, so what a key gives up is bounded by the width of the screen and by nothing else.
Before this the keys carried width floors of 2rem and 4rem, which defeat flex-shrink: the
bottom row measured 416px inside a 320px screen and the game scrolled sideways at the width
it is supposed to be playable at. Enter and Delete are glyphs now, because about 27px is
what an equal share comes to and neither word fits that at any legible size; each still says
its word in `aria-label`, so nothing a screen reader hears has changed.

**The distribution is readable without seeing it.** Each statistics bucket's attempt
number and count are available as text, so the shape is read rather than inferred from
the length of a bar.

## The one that is a security property too

`GameBoard` deliberately omits the answer from what it exposes. While a game is in
progress nothing on the board reveals the answer, or any letter of it, beyond what the
player's own guesses revealed. It becomes visible only when the game is over. That
applies to the DOM, not just to what is painted: an answer hidden behind CSS is not
hidden.

## How this is checked

By test, not by audit. Component tests query by accessible role and name, which means an
assertion fails when a name is missing or wrong — the same information a screen reader
would use. The `accessibility-review` skill in `.agents/skills/` carries the review
procedure.

Axe runs too, on every story. `stories/` holds each implemented component in the states its
surface names, and the story run renders each one in real Chromium and runs axe over it.
That catches a class of defect a role-and-name query cannot see at all: contrast below
threshold, a landmark used twice, a control with no computed name. It found one the first
time it ran — the mark colours failed the contrast bar against white text, and the palette
changed. Each story is checked in the appearance its globals select, so a palette is
covered when a story pins it rather than automatically. See
[Decision 0006](../decisions/0006-component-workshop.md).

That last sentence is not a caveat; it is how the second defect survived. The dark-theme
plain key measured 3.49 to one against its text and no story pinned dark **with a keyboard
in it**, so the gate was green and the defect was real. The palette is repaired and the
story that would have caught it now exists — verified by putting the old value back and
watching axe fail, rather than by reasoning that it would.

Touch is checked in both suites at once, because neither can see the whole of it. jsdom
resolves `touch-action`, `user-select` and the size floors from the real stylesheet, so
`tests/directManipulation.test.ts` measures the cascade; it has no layout engine, so every
figure — a key's height, a row's division, whether anything scrolls sideways at 320px —
is taken from Chromium by the stories instead. One figure goes to Chromium for a subtler
reason: jsdom's own input font is already 16px, so an input measured there would clear the
iOS zoom threshold whether or not the stylesheet said so, and the assertion is taken on a
rendered field instead.

Three things neither gate reaches, stated rather than left to be assumed:

- `-webkit-touch-callout` is declared and never verified. jsdom's parser drops it, desktop
  Chromium does not report it, and the platform it is for is iOS Safari. It is the one
  declaration in this contract that rests on a manual check.
- `:active` is a state only real input produces. No synthetic event reaches it and no play
  function can force it, so what the story proves is that the two tones the pressed ring is
  drawn in resolve to real, different colours, and what the unit test proves is that both
  the button and the preference row are drawn in them. That the ring is legible on a plain
  key and on each mark was checked by eye in both palettes and in high contrast, and the
  contrast figures above were computed rather than eyeballed — but no gate holds either.
- Whether the ring is what a finger on a real phone actually sees still needs a real phone.

Automated checks still do not cover everything, and silence from one is not a pass. Axe
skips what it cannot attribute — anything behind `aria-hidden`, which includes the tile's
mark glyph and now the keyboard's two action glyphs, is never checked for contrast at any
opacity. Axe's `target-size` rule answers to 24px, not to the 44 this project states, so a
control it passes can still fail `EveryControlIsAComfortableTarget`; the story measurements
are what hold that figure. Focus order, announcement timing and whether a description is
actually useful still need a person and a screen reader.

## Related pages

- [Specifications](specifications.md)
- [Testing](../reference/testing.md)
- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Work with the specifications](../how-to/work-with-the-specs.md)
