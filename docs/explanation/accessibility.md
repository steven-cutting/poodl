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
non-colour indication as well as a colour. In the implementation that indication is a
marker bar: correct fills most of a tile or key's bottom edge, present shows a short
centred fraction of it, and absent carries no bar at all — the absence, beside a dimmed
letter and a lighter-weight rule, is itself the indication, so a reader without hue tells
the three states apart as bar, shorter bar and no bar. Every mark also has an accessible
name that says it in words. A key on the on-screen keyboard carries the same bar and the
same name as a tile — it once carried neither shape, and a sighted colour-blind reader
with no assistive technology had only the colour to go on. This holds in every theme and
in both palettes.

**A key nobody has tried is distinguishable from one that has been scored.** By at least
3 to one, and absent stands off correct by at least 2 to one. These are `game.allium`'s
`config.minimum_state_separation` and `config.minimum_mark_separation`, and they are
separate from the clause above rather than covered by it: the bar speaks for a mark, and a
letter no guess has covered carries no mark, so there is no bar to read. Lightness is all
there is, which is why the figures are stated as lightness and not left to hue. The report
that prompted them was a phone at minimum backlight, where an absent key and an untried
one were the same object; the pair once measured 1.23 to one in the dark theme.

One shape carries this in `app.css`, and it is what the range had to be spent on. **A key
nothing is known about hugs the page**: its ground is the page's own, its border draws it,
and its letter is the page's ink. A scored key steps onto the raised ground and answers in
the way its state affords — correct and present paint their result ink through the letter,
the border and the bar together, standing off the ground the untried key hugs; absent,
with no hue and no bar, holds its dimmed letter apart from the untried letter; and absent
stands off correct by the border each of the two draws, a distance with no direction —
which of the pair is the lighter is the palette's own business, and today correct's hue
is the lighter in all four. What
`sharing.allium` ties to high contrast is which palette is in use, and the emoji "are
whatever the reader's platform draws, and never were the board's own colours".

**The floor holds in all four combinations of theme and high contrast**, not in the one a
change happened to be looked at in. Text reaches 4.5 to one, every control's boundary
reaches 3, and the two figures above hold — in light and dark, standard and high contrast.
High contrast raises the floor nowhere: it is a second palette that has to clear the same
bar, not the version where legibility is finally attended to. Whoever tunes a palette should
satisfy the high-contrast one first, for the reason `game.allium` gives where the figures
are declared.

**More contrast asked of the operating system turns high contrast on.** The device wins the
same way it does for motion, so a player who has already asked their system does not have to
find the setting and ask again. It never overwrites the player's own answer: the setting
stays as they left it, and `Settings.high_contrast_active` is what everything rendering
reads — the board, the keyboard and the shared grid alike, so a grid pasted into a message
still matches the board it came from. The control says which of the two is speaking rather
than looking as though it had ignored the player. What a player cannot yet do is overrule
the device, and `settings.allium` carries that as an open question rather than a decision.

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
page's own ink, backed by its own paper. Two tones rather than one because no single tone
stands off every ground a control can carry — the untried key sits on the page, a scored
key on the raised surface, a primary button on the ink itself — and ink and paper between
them always do, because one of the two is always at the far end of the range. The figures
are computed by the gate over both key grounds rather than recorded here. A filter was the
first thing tried and is the reason this is a shadow: `filter` dims the letter along with
the key, which costs the clause above the contrast it depends on — buying this guarantee
by spending that one.

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
There the keys meet it top to bottom, divide each row equally among its letter keys and
keep a gap between them, so what a letter key gives up is bounded by the width of the
screen and by nothing else. Before this the keys carried width floors of 2rem and 4rem,
which defeat flex-shrink: the bottom row measured 416px inside a 320px screen and the game
scrolled sideways at the width it is supposed to be playable at. Enter and Delete are
icons, because about 27px is what an equal share comes to and neither word fits that at
any legible size — and they take a wider share than a letter key, never a narrower one,
exactly as the invariant now words it; each still says its word in `aria-label`, so
nothing a screen reader hears has changed.

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

**Axe has never judged a key or a tile, and cannot.** Its contrast rule downgrades any
element whose visible text is a single character to *incomplete* — `shortTextContent` in
axe-core — and an incomplete result is reported without failing. Every key on the on-screen
keyboard shows one letter; so does every tile. The palette repairs axe did find were on
`WelcomeScreen` and its siblings, which share the palette but carry words. This page
used to say that pinning a dark keyboard story turned the dark key's measurement into
something the gate held, and that was simply wrong. It is checkable in a minute: put an
unreadable letter ink in `app.css` and every other component's stories fail while
`Keyboard`'s stay green.

So the contrast figures are held by `tests/contrast.test.ts` and by nothing else. It reads
`src/app.css` from disk, drives each of the four combinations of theme and high contrast
through the root attributes, and recomputes every pair — every reading ink on the page and
the raised surfaces, every letter on its key ground, each control's boundary against the
page, the focus ring, the pressed ring over both key grounds, the untried letter against
the absent letter, each hue result against the ground the untried key hugs, and absent's
border against correct's. No figure quoted in a comment or on this page is load-bearing;
each is derived from the colours that actually resolve. It was verified the way the rest
of this is: by running the reworked test against the old palette and watching it fail.

All four combinations are covered. What jsdom cannot drive is one of the two *routes* to
one of them: it answers no media query, so every ratio is taken with the dark theme reached
by attribute, while `app.css` declares the same palette a second time for the device's own
colour-scheme preference. That duplication is the only way this palette can drift, so the
same test reads both blocks as text and holds them equal — which is what makes every figure
cover both routes rather than the one it can reach. What is left over is not a ratio at all:
that the palette is legible on a dimmed phone is what prompted this, and it still takes a
phone.

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
  the button and the preference row are drawn in them. Whether those two tones are legible
  over every key is no longer left to the eye — `tests/contrast.test.ts` computes all twelve
  edges — but that the ring appears at all is still something only a finger can confirm.
- Whether the ring is what a finger on a real phone actually sees still needs a real phone.

Automated checks still do not cover everything, and silence from one is not a pass. Axe
skips what it cannot attribute — anything behind `aria-hidden`, which includes every
marker bar and the two action keys' icons, is never checked for contrast at any opacity —
and it declines to judge single-character text at all, which is the whole keyboard and the
whole board. Axe's `target-size` rule answers to 24px, not to the 44 this
project states, so a control it passes can still fail
`EveryControlIsAComfortableTarget`; the story measurements are what hold that figure. No
rule anywhere knows that one key state must stand off another, because standards ask a
colour to stand off its background rather than off another state — that pair is stated in
`game.allium` and held by `tests/contrast.test.ts` alone. Focus order, announcement timing
and whether a description is actually useful still need a person and a screen reader.

## Related pages

- [Specifications](specifications.md)
- [Testing](../reference/testing.md)
- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Work with the specifications](../how-to/work-with-the-specs.md)
