---
title: "Testing"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [testing_reference]
requires: []
---

# Testing

## Framework

Vitest in two configurations. The unit suite runs in jsdom with `globals: true` so Testing
Library registers its automatic cleanup hook, one setup line in `tests/setup.ts`, and is
configured in `vite.config.ts`. The story suite runs in real Chromium through Playwright
and is configured separately in `vitest.storybook.config.ts`.

A third file, `vitest.config.ts`, names those two as projects and holds nothing else. It
exists because `@storybook/addon-vitest` finds its runner's configuration by filename, and
the Testing Module in the Storybook UI otherwise resolves `vite.config.ts` and fails: the
project it filters for, `storybook:<configDir>`, is declared nowhere the jsdom suite can
see. Both recipes pass `--config` themselves, so neither depends on that discovery.

## Layout

Tests live in `tests/`, never colocated with `src/`. Stories live in `stories/`, also at
the repository root, one file per component — plus the one stated exception,
`Foundations.stories.svelte`, which documents the design tokens rather than a component;
[Work in the component workshop](../how-to/work-in-the-component-workshop.md) records why.

| Suffix | Runner |
| --- | --- |
| `*.test.ts` | Vitest in jsdom. Everything in `tests/`. |
| `*.stories.svelte` | Vitest in Chromium, driven by Storybook. Everything in `stories/`. |
| `*.spec.ts` | Playwright directly. Reserved. Playwright itself is installed — it supplies the browser the story run drives — but no suite of this kind exists. |

Files are named for what they cover rather than mirroring a source path:
`scoring.test.ts`, `hardMode.test.ts`, `links.test.ts`, `engine.test.ts`, `panels.test.ts`.

One file in `tests/` is not a test. `engineHarness.ts` holds the fixtures the four engine
suites share — the same fake word list, the same fake randomness, the same way of playing a
guess — so that they agree on one vocabulary rather than each inventing its own. The `include`
glob is `tests/**/*.test.ts`, so it is imported and never collected.

## Conventions

**Query by accessible role and name.** Never by class, never by test id. A query that
fails because a name is missing has found a real defect: it is the same information a
screen reader uses.

```ts
screen.getByRole('button', { name: 'A, correct' });
screen.getByRole('listitem', { name: /^Attempt 1:/ });
```

**Inject fakes; never stub a global.** Each port in `src/lib/ports/` exports an in-memory
fake alongside the real adapter, and every adapter takes its platform object as a
defaulted argument. This is not a stylistic preference, and it is not a jsdom workaround:
the story run is a real browser where a global would work, which is exactly why stubbing
one stays forbidden.

**Callbacks are asserted through the props.** Components take callbacks as props, so a
test passes `vi.fn()` and asserts on the call.

**A new component lands with its test and its story in the same change.**

## Story tests

`just storybook-test` renders every story in `stories/` in real Chromium and runs axe over
each one. A violation fails the run, because `.storybook/preview.ts` sets the accessibility
addon's test mode to error; the addon's own default only reports. Play functions run in the
same pass, which is where a guarantee about interaction — tabbing to a key and activating
it — becomes executable rather than described.

Stories are fixtures, not assertions. The evidence and the coverage floor stay in `tests/`.
And axe is not exhaustive: it skips what it cannot attribute, including anything behind
`aria-hidden`, so a guarantee resting on such an element still has to be measured by hand.
The procedure is in [Work in the component workshop](../how-to/work-in-the-component-workshop.md).

The marker bars are the worked example of the split. The bar that discharges
`ResultsAreNeverConveyedByColourAlone` is aria-hidden decoration with no role and no name,
so the role-and-name convention cannot reach it and it is queried by `[data-marker]` — the
same class of structural hook as the grandfathered `data-mark`, granted for the same
reason. jsdom holds its presence (a bar on correct and present, none on absent); Chromium
holds its geometry (the two bars differ in length), because only a layout engine can
measure a width. The decorative icons are the same class of exception: an icon has no
role and no name by design, so a test that needs to see one queries `svg` — or
`aria-hidden` — inside a control it found by role and name.

## Coverage

v8 provider, measured over `src/lib/**`, with a 90% floor on branches, functions, lines
and statements. Below the floor the run fails.

Only the jsdom suite is measured. Vitest 4 has no per-project coverage option and the v8
provider merges every project that ran into one report before it checks the thresholds, so
a story sharing a run with the unit suite would raise the number without adding an
assertion. The separation is the file it is declared in: the floor lives in
`vite.config.ts`, the story configuration has no coverage block at all, and
`npm run coverage` pins `--config vite.config.ts` so the run that measures the floor is the
run that cannot reach a story.

Distinguish an untested branch from an unreachable one. Defensive code no input can reach
should be deleted rather than covered; see
[Quality philosophy](../explanation/quality-philosophy.md).

## What the current suite proves

| Suite | Covers |
| --- | --- |
| `scoring.test.ts` | The `GuessScoring` contract, including the duplicate-letter cases and the invariants over the whole answer list. |
| `keyboard.test.ts` | The `KeyboardKnowledge` contract: full alphabet coverage, strongest mark wins, knowledge never weakens. |
| `hardMode.test.ts` | `Game.satisfies_hard_mode` and the `HardModeAdmission` contract, including its prefix semantics. |
| `links.test.ts` | The `AnswerObfuscation` codec: the round trip over the whole dictionary, every single-character alteration of every token swept for the two failures `DecodeRejectsWhatItDidNotProduce` forbids outright, and three tokens pinned so the scheme cannot move under links already issued. |
| `sharing.test.ts` | The `ShareGridFormat` contract, both palettes, and that no letter reaches the grid. |
| `statistics.test.ts` | The statistics block and the answer pool, including what recycling does and why the flag exists. |
| `appearance.test.ts`, `announcements.test.ts` | The two `Appearance` derivations, and the sentences the announcement guarantees ask for. |
| `engine.test.ts` | Arriving, starting and retiring: every path a game leaves by, and what each one costs. |
| `gameplay.test.ts` | Entering letters, the three rejections, accepting a guess, and the endless countdown. |
| `settings.test.ts` | Every setter, both hard-mode guards, and resetting the statistics. |
| `customGames.test.ts` | Making, sharing, opening and refusing a custom link, and sharing a result. |
| `persistence.test.ts` | The round trip, the schema version, and what a damaged store costs — including a record that satisfies every type while breaking an invariant the specifications state. |
| `store.test.ts` | The rune shell: dispatch, persistence, the countdown under a fake timer, and both clipboard outcomes. |
| `ports.test.ts` | Every port, real adapter and fake, including the failure paths. |
| `words.test.ts` | Every `WordListSource` obligation, against the bundled data, floors included. |
| `shells.test.ts`, `screens.test.ts`, `panels.test.ts`, `components.test.ts` | Every component, through accessible roles and names. |
| `primitives.test.ts` | The six design-system primitives — `Icon`, `IconButton`, `Button`, `Wordmark`, `HowToPlay`, `HeaderBar` — through accessible roles and names. |
| `route.test.ts` | The page, driven through its real adapters: arriving, playing, opening a link, and what the appearance writes onto the document. |
| `directManipulation.test.ts` | The `DirectManipulation` contract, as far as jsdom can answer for it: `src/app.css` read from disk, put in the document, and measured on a real control. |
| `contrast.test.ts` | Every measured colour pair in `src/app.css`, read from disk and recomputed over all four combinations of theme and high contrast against the floors `game.allium` states — plus the parity that keeps the two dark routes and the two high-contrast palettes in step. |
| `stories/` | Each component in the states its surface names, rendered in Chromium with axe over every one, and the figures only a layout engine can produce. |

`directManipulation.test.ts` reads the stylesheet rather than importing it. `?raw` is the
idiom `src/lib/ports/words.ts` uses for the word lists, but a `.css` file is claimed by
Vite's stylesheet pipeline first and comes back as the empty string — a test that injected
that would assert against an empty cascade and pass on every property at once. It is worth
knowing about because the failure mode is a green test rather than a red one.

What that file can and cannot see is the whole reason the `DirectManipulation` evidence is
split across both suites. jsdom resolves `touch-action`, `user-select`, the logical size
floors and custom properties, so the cascade is real. It has no layout engine, so
`getBoundingClientRect()` returns zeros and no figure that depends on layout can be taken
there at all — every one of those goes to the stories, where it is measured in Chromium. Its
default input font is 16px where a real user agent's is smaller, so the figure that keeps iOS
Safari from magnifying the page is taken on a rendered input in
`stories/LinkReady.stories.svelte` rather than on the fixture, where it would pass whether or
not the stylesheet said anything.

Its CSS parser also drops `-webkit-tap-highlight-color` and `-webkit-touch-callout` on the
floor, so those resolve to nothing whether or not they were declared. Only the first of the
two is recovered: `stories/Keyboard.stories.svelte` reads it from Chromium.
`-webkit-touch-callout` is declared and verified by neither gate, because desktop Chromium
does not report it and the platform it is for is iOS Safari — it is a manual check on a real
phone, listed as such in [Accessibility](../explanation/accessibility.md). Neither half is
the whole contract, and the two halves together are still not all of it.

## Related pages

- [Test and debug](../how-to/test-and-debug.md)
- [Quality gates](quality-gates.md)
- [Accessibility](../explanation/accessibility.md)
