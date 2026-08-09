---
title: "Work in the component workshop"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [component_workshop]
requires: []
---

# Work in the component workshop

The workshop is Storybook, served locally. It renders one component at a time, in every
state its surface names, in either palette, with the accessibility check running as you
go. It is where the remaining surfaces get built. Why it exists is in
[Decision 0006](../decisions/0006-component-workshop.md).

## Run it

```console
just storybook
```

The workshop opens on port 6006 with hot module replacement, the same as `just dev`.

To render every story in Chromium and run axe over each one:

```console
just storybook-test
```

The same run is available from the workshop itself: **Run tests** at the foot of the
sidebar, with interactions, coverage and accessibility as separate toggles, marks each story
in the sidebar as it finishes. It is the same story suite the recipe runs — the panel starts
its own Vitest, which is why `vitest.config.ts` exists — but `just check` reads the recipe,
so the button is for working, not for evidence.

Both `just storybook-build` and `just storybook-test` are part of `just check`, so a story
that stops rendering, or a component that picks up an accessibility violation, fails the
gate rather than waiting to be noticed.

## Install the browser

The story run needs a real Chromium, which is in neither lockfile.

```console
just storybook-browsers
```

This downloads a browser over the network into a cache outside the repository. It is the
one thing here that cannot run offline. `just initialize` does it for you; run it again
by hand after the `playwright` pin moves. On Linux, `just storybook-browsers-deps`
installs the system libraries Chromium links against.

## Where stories live

Stories live in `stories/` at the repository root, one file per component. The layout rule
and what the story run proves are in [Testing](../reference/testing.md).

## Write a story

Svelte CSF means the story file is itself a Svelte component. Call `defineMeta` in a module
script, destructure the `Story` component out of what it returns, and write one `Story`
element per state.

```svelte
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import type { ComponentProps } from 'svelte';
  import Tile from '../src/lib/components/Tile.svelte';

  const { Story } = defineMeta({ title: 'Game/Tile', component: Tile, tags: ['autodocs'] });

  const correct: ComponentProps<typeof Tile> = { position: 1, letter: 'a', mark: 'correct' };
</script>

<!-- The comment above a story becomes its description on the docs page. -->
<Story name="Correct" args={correct} />
```

Imports reach into `src/` with a relative path, matching `tests/`.

Four rules on top of the format:

1. **Name the states the surface names.** A story set is a reading of the specification, so
   cover the states `docs/specs/` says the surface has, and say which surface and which
   `@guarantee` clauses it stands for. Cite them by name; the words live in one place.
2. **A story is a fixture, not an assertion.** The evidence still lives in `tests/`, and the
   coverage floor is still earned there.
3. **Inject port fakes, never touch a browser global.** The story run is a real browser, so
   `localStorage` and the clipboard exist and would work. That is exactly why the rule
   holds: construct the component against the fakes in `src/lib/ports/`, as `tests/` does.
4. **Reach for a play function when the guarantee is about interaction.** A story that tabs
   to a key and activates it is executable evidence for `FullyKeyboardOperable` in a way a
   rendered picture is not.

A story that needs composition — a wrapper, a sibling, children of its own — either sets
`asChild` and supplies children, which ignores args, or supplies a snippet named `template`,
which receives the args and the story context. The addon's own documentation covers both.

## Switch theme, contrast and motion

The toolbar carries three globals. Theme and high contrast set `data-theme` and
`data-high-contrast` on the preview's root element, which is what `src/app.css` keys on, so
a story sees the tokens the application will. A story pins a value with a `globals` prop,
which beats the toolbar and disables the matching control.

Reduced motion is a simulation, labelled as one: it freezes declarative motion in the
preview but cannot make the browser report the preference, and Poodl has no animation yet.

Check both palettes before you finish. Colour never carries meaning alone here, and high
contrast changes which colours carry it — see
[Accessibility](../explanation/accessibility.md).

## When the accessibility check fails

The accessibility panel names the axe rule that failed and the node that failed it. The
story run fails on a violation because `.storybook/preview.ts` sets the addon's test mode
to error; its own default only reports.

1. **Fix the component, not the story.** A story is a fixture; turning a rule off to make
   one pass leaves the defect in the application and deletes the report.
2. **A missing or wrong accessible name is a test failure too.** It is the same information
   a role-and-name query matches on, so add the assertion in `tests/` while you are there.
3. **A contrast failure is usually a token, not a component.** Check the light palette, the
   dark palette and high contrast in `src/app.css` before changing any markup.
4. **Silence is not always a pass.** Axe skips what it cannot attribute, including anything
   behind `aria-hidden` — the tile's mark glyph is not checked by the contrast rule at all.
   Measure by hand when a guarantee rests on something the tool does not report.
5. **If a rule is genuinely wrong for this project**, configure it once, where the
   configuration lives, with a stated reason. The rule about suppressions does not bend for
   this tool; see [Quality philosophy](../explanation/quality-philosophy.md).

## Related pages

- [Testing](../reference/testing.md)
- [Test and debug](test-and-debug.md)
- [Decision 0006: A component workshop](../decisions/0006-component-workshop.md)
