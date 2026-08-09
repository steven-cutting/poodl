---
title: "Decision 0006: A component workshop"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_component_workshop]
requires: []
---

# Decision 0006: A component workshop

## Context

The specifications name thirteen surfaces. Three components existed. The other ten had to
be built, and each one is an accessibility contract as much as a rendering job: a shape
for every mark, a name for every control, a keyboard path to every operation, and two
palettes to satisfy.

Nothing in the repository renders a component on its own. A component is reachable only
through a route, and the states that matter — an empty board, a board mid-guess, a
keyboard that has learned three letters, high contrast — are reached by playing the game
until it produces them. The component tests assert accessible names in jsdom, which is
exactly the right evidence and is not something anybody looks at.

## Decision

Add Storybook as a local component workshop. Stories live in a root-level `stories/`
directory, written in Svelte CSF as `*.stories.svelte`, one file per component, covering
the states its surface names.

`@storybook/addon-vitest` renders every story in real Chromium through Playwright, and
`@storybook/addon-a11y` runs axe over each one in the same pass, failing the run on a
violation rather than filing a note. Toolbar globals set `data-theme` and
`data-high-contrast` on the root element, which is what `src/app.css` already keys on, so
both palettes are one click apart before the settings surface exists.

The workshop is local. A recipe serves it, two recipes gate it, and nothing publishes it.
The Pages workflow is untouched.

## Consequences

Every state of a component becomes a thing you can open, in either palette, and the
accessibility check for it runs without anyone remembering to ask for it.

**It found a real defect on the first run, and the palette changed.** Measured against a
white `--mark-text`: correct `#538d4e` is 3.97 to 1, present `#b59f3b` is 2.63 to 1,
absent `#787c7e` is 4.22 to 1. The keyboard's keys are sixteen pixels at weight six
hundred, which is normal text needing 4.5 to 1, so all three failed. `--mark-text` is now
black, measured at 5.29, 7.99 and 4.98 to 1. No hue moved, so the green and yellow squares
`sharing.allium` specifies still match what the player sees, and `settings.allium` lists
palette mechanics as an explicit non-goal, so this was a code decision rather than a
specification one. No axe rule is disabled anywhere.

**One defect the tool cannot see was fixed by hand.** The tile's mark glyph is
`aria-hidden`, and axe's contrast rule never inspects it — forcing the glyph to an opacity
of 0.12 produced no finding at all, so the rule's silence is not evidence. Composited at
its former 0.85 opacity the glyph measured 4.43 to 1 against `--mark-absent`, under the
bar. It is now fully opaque. The glyph is what discharges "colour never carries meaning
alone", so it has to be legible to the readers it exists for.

**A third defect took a second pass, because the gate could not reach it.** In the dark
theme a plain keyboard key was `#f5f5f5` on `#818384`, measured at 3.49 to 1. No story
pinned the dark theme with a keyboard in it and headless Chromium reports a light
preference, so the gate stayed green while the defect was real; flipping the Theme control
in the workshop showed it. It is repaired: the key background is now `#6b6d6e`, where the
text measures 4.77 to 1 and the key's own boundary still stands off the page background at
3.60, over the 3.0 that a control's boundary answers to. No hue moved, and palette mechanics
are an explicit non-goal in `settings.allium`, so this was a code decision like `--mark-text`
above. `Keyboard`'s "Dark theme" story now pins the palette that had none, which is what
turns the measurement from something this record remembers into something the gate holds.

The dependency surface grows sharply in a repository that pins every version by hand. Each
direct package is pinned exactly, as invariant 4 requires, but the transitive tree under
Storybook is held by `package-lock.json` and by nothing else. Two consequences are worth
naming: the autodocs addon depends on React, which now lives in the tree although it never
enters `src/` or the build; and the Svelte framework package pins TypeScript to a 5.x
line, so npm nests a second copy of the compiler beside the 6.x one this repository uses.

The story run needs a real browser, and a real browser is in neither lockfile. Playwright
downloads a Chromium build over the network into a cache outside the repository, versioned
by the `playwright` pin rather than by anything `package.json` records. This repository
prefers evidence that runs offline, and this is the first check that does not. It is
accepted because axe on a real browser reports contrast, landmarks and computed names that
a jsdom render cannot produce at all.

Component behaviour is now expressed in two places: an assertion in `tests/` and a fixture
in `stories/`. They can disagree, and when they do neither is the arbiter — the
specification is, as it was already. Each story cites the surface and the `@guarantee`
clauses it stands for by name, so a story says which authority it answers to rather than
becoming one.

Coverage is unaffected on purpose. The floor over `src/lib/**` is measured from the jsdom
suite alone, and the story run lives in its own Vitest configuration with no coverage
block, so a story that renders a component cannot make that number look better than the
tests have earned.

Everything Storybook writes is ignored by Git, because a gate that changes one byte of the
worktree fails the run before its own exit code is read.

## What would reopen this

The Svelte CSF addon falling behind a Svelte major, which would make the story format the
reason not to upgrade the framework. Storybook majors moving past the Vite and Svelte line
this repository pins. Or the ten surfaces getting built and the workshop costing more to
keep than it returns — it is a tool for building, and a tool that has finished its job can
be deleted.

## Related pages

- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Testing](../reference/testing.md)
- [Accessibility](../explanation/accessibility.md)
