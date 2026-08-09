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
glyph, and an accessible name that says the mark in words. A key on the on-screen
keyboard is named the same way. This holds in every theme and in both palettes.

**Everything is keyboard operable.** Every operation a surface `provides` can be reached
and invoked from the keyboard alone, with visible focus. This includes each key of the
on-screen keyboard, and it holds regardless of the physical-keyboard setting — that
setting governs only whether typing goes straight into the board, never whether the game
can be played.

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
system wins.

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

Automated checks still do not cover everything, and silence from one is not a pass. Axe
skips what it cannot attribute — anything behind `aria-hidden`, which includes the tile's
mark glyph, is never checked for contrast at any opacity. Focus order, announcement timing
and whether a description is actually useful still need a person and a screen reader.

## Related pages

- [Specifications](specifications.md)
- [Testing](../reference/testing.md)
- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Work with the specifications](../how-to/work-with-the-specs.md)
