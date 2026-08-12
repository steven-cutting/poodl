<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Keyboard from '../src/lib/components/Keyboard.svelte';
  import { MINIMUM_TOUCH_TARGET, NARROWEST_SUPPORTED_WIDTH } from '../src/lib/config';
  import { IN_PROGRESS, knownFrom } from './fixtures';

  // The gutters `.shell` gives the page at every width, so a frame here leaves
  // the keyboard exactly the room the route does.
  const SHELL_GUTTER = '1rem';
  const SHELL_WIDTH = '34rem';

  const KNOWLEDGE = knownFrom(IN_PROGRESS);

  // Spies, not `action()`. A spy reaches the Actions panel just the same, and
  // unlike an action it can be asserted on, so the interaction stories prove the
  // callback fired rather than only showing it in a panel. This is `vi.fn()`
  // from tests/components.test.ts, in the one form Storybook understands.
  const onletter = fn();
  const ondelete = fn();
  const onsubmit = fn();

  const OVERVIEW = [
    'The on-screen keyboard: twenty-six letters, Enter and Delete, twenty-eight real buttons.',
    '',
    'Governing surfaces: `GameBoard` in `docs/specs/game.allium`, which provides',
    '`PlayerEntersLetter`, `PlayerDeletesLetter` and `PlayerSubmitsGuess`, and',
    '`PhysicalKeyboardInput`, which offers the same three actions from the other channel. Key',
    'status comes from the `KeyboardKnowledge` contract by way of `keyboardKnowledge()`.',
    '',
    'Guarantees this component carries today:',
    '',
    '- `@guarantee FullyKeyboardOperable`. The four interaction stories below are the executable',
    '  evidence: every key reached by Tab in reading order, and activation by both Enter and',
    '  Space.',
    '- `PhysicalKeyboardInput.@guarantee TurningThisOffLeavesTheGameFullyPlayable`. Nothing in',
    '  this component consults that setting, so it stays reachable whatever the setting says.',
    '- `@guarantee ResultsAreNeverConveyedByColourAlone`. A known key carries the same shape a',
    '  tile does as well as its colour, and says the mark in its accessible name.',
    '- `contract DirectManipulation`, which this component is the hardest case for. The two',
    '  width stories below are the executable evidence for',
    '  `@invariant EveryControlIsAComfortableTarget`: at',
    '  `config.narrowest_supported_width` the keyboard meets `config.minimum_touch_target` top',
    '  to bottom, divides each row equally across and keeps a gap between keys, and at the width',
    '  the page shell gives it the keys meet the figure in both directions. They are here rather',
    '  than in `tests/` because jsdom has no layout engine and can return none of these numbers.',
    '',
    'Child-to-parent communication is callback props — `onletter`, `ondelete`, `onsubmit` — as',
    'invariant 2 in AGENTS.md requires. There is no event dispatcher here.'
  ].join('\n');

  /*
   * Which keys share a line is a rendering fact, so it is read from geometry
   * rather than from `.row` — a story that measures layout should not also
   * depend on the class names the layout happens to use.
   */
  function keyRows(canvasElement: HTMLElement): DOMRect[][] {
    const rows: DOMRect[][] = [];
    let line = Number.NaN;

    // Reading order is row order, so a key that starts on a new line starts a
    // new row and the rows come out top to bottom without being sorted.
    for (const key of within(canvasElement).getAllByRole('button')) {
      const box = key.getBoundingClientRect();
      const top = Math.round(box.top);
      const current = rows.at(-1);

      if (current === undefined || top !== line) {
        rows.push([box]);
        line = top;
      } else {
        current.push(box);
      }
    }

    return rows;
  }

  function frameOf(canvasElement: HTMLElement): HTMLElement {
    const frame = canvasElement.querySelector<HTMLElement>('[data-frame]');

    if (frame === null) {
      throw new Error('This story has no frame to measure the keyboard against');
    }
    return frame;
  }

  const { Story } = defineMeta({
    title: 'Game/Keyboard',
    component: Keyboard,
    tags: ['autodocs'],
    args: { onletter, ondelete, onsubmit },
    argTypes: {
      knowledge: {
        control: false,
        description: 'One entry per letter, from the KeyboardKnowledge contract.'
      },
      disabled: { control: 'boolean', description: 'Turns every key off at once.' },
      onletter: { description: 'Called with the lowercase letter of the key that was pressed.' },
      ondelete: { description: 'Called when Delete is pressed.' },
      onsubmit: { description: 'Called when Enter is pressed.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Before any guess: every key plain, every key live. -->
<Story name="Fresh" />

<!--
  After ADOPT and ALARM against APPLE. A is correct, P and L are in the word,
  D O T R M are not. The status is in each key's accessible name — "P, in the
  word, wrong place" — as well as in its colour.
-->
<Story name="With knowledge from two guesses" args={{ knowledge: KNOWLEDGE }} />

<!-- Once the game is over every key is off, and a disabled key takes no focus. -->
<Story name="Disabled" args={{ disabled: true }} />

<!--
  Twenty-eight Tab presses reach twenty-eight keys, in reading order: ten across
  the top row, nine across the middle, then Enter, seven letters and Delete.
  Nothing is activated here — this story only shows that focus can get
  everywhere.
-->
<Story
  name="Every key is reachable by Tab"
  args={{ knowledge: KNOWLEDGE }}
  play={async ({ canvasElement }) => {
    // GameBoard.@guarantee FullyKeyboardOperable
    // PhysicalKeyboardInput.@guarantee TurningThisOffLeavesTheGameFullyPlayable
    const keys = within(canvasElement).getAllByRole('button');

    await expect(keys).toHaveLength(28);

    for (const key of keys) {
      await userEvent.tab();
      await expect(key).toHaveFocus();
    }
  }}
/>

<!-- Enter activates the key that has focus, as a native button does. -->
<Story
  name="Enter activates the focused key"
  play={async ({ canvasElement }) => {
    // GameBoard.@guarantee FullyKeyboardOperable
    onletter.mockClear();
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Q' })).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    await expect(onletter).toHaveBeenCalledWith('q');
  }}
/>

<!--
  Space activates it too. Both keys, or the guarantee is only half true: a button
  that answers to Enter alone is a button half its users cannot press.
-->
<Story
  name="Space activates the focused key"
  play={async ({ canvasElement }) => {
    // GameBoard.@guarantee FullyKeyboardOperable
    onletter.mockClear();
    const canvas = within(canvasElement);

    await userEvent.tab();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'W' })).toHaveFocus();

    await userEvent.keyboard('[Space]');

    await expect(onletter).toHaveBeenCalledWith('w');
  }}
/>

<!--
  Submitting and deleting are operations too, so they have to be reachable the
  same way. Enter opens the last row and Delete closes it: the twentieth and the
  twenty-eighth stop on the way through.
-->
<Story
  name="Enter and Delete are reachable and operable"
  play={async ({ canvasElement }) => {
    // GameBoard.@guarantee FullyKeyboardOperable
    onsubmit.mockClear();
    ondelete.mockClear();
    const canvas = within(canvasElement);

    for (let step = 0; step < 20; step += 1) {
      await userEvent.tab();
    }
    await expect(canvas.getByRole('button', { name: 'Enter' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onsubmit).toHaveBeenCalledTimes(1);

    for (let step = 0; step < 8; step += 1) {
      await userEvent.tab();
    }
    await expect(canvas.getByRole('button', { name: 'Delete' })).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await expect(ondelete).toHaveBeenCalledTimes(1);
  }}
/>

<!--
  The narrowest viewport the specification supports, framed to exactly that
  width with the gutters the page shell gives at every width.

  `EveryControlIsAComfortableTarget` grants the keyboard the one exemption in
  the contract, because ten keys and nine gaps cannot be 44px each across
  320px. What it asks for instead is measured here: the figure met top to
  bottom, each row divided equally across, a gap surviving between keys, and
  nothing scrolling sideways. jsdom has no layout engine and can answer none of
  it, which is why the assertion is here.
-->
<Story
  name="At the narrowest supported width"
  args={{ knowledge: KNOWLEDGE }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async ({ canvasElement }) => {
    // DirectManipulation.@invariant EveryControlIsAComfortableTarget
    const frame = frameOf(canvasElement);
    const rows = keyRows(canvasElement);

    await expect(rows).toHaveLength(3);
    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);

    for (const row of rows) {
      let previous: DOMRect | undefined;

      for (const box of row) {
        await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);

        if (previous !== undefined) {
          // A gap between keys, and an equal division of what is left.
          await expect(box.left - previous.right).toBeGreaterThan(0);
          await expect(Math.abs(box.width - previous.width)).toBeLessThan(1);
        }
        previous = box;
      }
    }
  }}
>
  {#snippet template(args)}
    <div
      data-frame
      style="inline-size: {NARROWEST_SUPPORTED_WIDTH}px; padding-inline: {SHELL_GUTTER}"
    >
      <Keyboard {...args} />
    </div>
  {/snippet}
</Story>

<!--
  The same keyboard at the width `.shell` actually gives it. What a key gives up
  is bounded by the width of the screen and by nothing else, so where the screen
  is wide enough it gives up nothing and meets the figure in both directions —
  the half of the invariant the narrow story cannot show.
-->
<Story
  name="At the width the page gives it"
  args={{ knowledge: KNOWLEDGE }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async ({ canvasElement }) => {
    // DirectManipulation.@invariant EveryControlIsAComfortableTarget
    for (const row of keyRows(canvasElement)) {
      for (const box of row) {
        await expect(box.width).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
        await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
      }
    }
  }}
>
  {#snippet template(args)}
    <div data-frame style="inline-size: {SHELL_WIDTH}; padding-inline: {SHELL_GUTTER}">
      <Keyboard {...args} />
    </div>
  {/snippet}
</Story>

<!--
  What a tap does, in an engine that has the properties. Two of these resolve
  nowhere else: jsdom's CSS parser drops `-webkit-tap-highlight-color` on the
  floor, so `tests/directManipulation.test.ts` can assert the replacement but
  never the removal, and this story is the other half of that pair.
-->
<Story
  name="A key answers to a finger"
  args={{ knowledge: KNOWLEDGE }}
  play={async ({ canvasElement }) => {
    // DirectManipulation.@invariant ATapDoesOnlyWhatTheControlDoes
    // DirectManipulation.@invariant ATouchIsAcknowledged
    const key = within(canvasElement).getByRole('button', { name: 'Q' });
    const resolved = getComputedStyle(key);

    // The platform's guess at what a tap meant, declined; the pinch it is not
    // guessing about, kept.
    await expect(resolved.getPropertyValue('touch-action')).toBe('manipulation');
    await expect(resolved.getPropertyValue('user-select')).toBe('none');
    await expect(resolved.getPropertyValue('-webkit-tap-highlight-color')).toBe('rgba(0, 0, 0, 0)');

    /*
     * And replaced rather than only removed. `:active` is a state only real
     * input produces — no synthetic event reaches it and no story can force it
     * — so what is proved here is that the two tones the replacement is drawn
     * in resolve to real colours in this engine, and that they differ. Their
     * measured contrast against all twelve key backgrounds is recorded in
     * `src/app.css`, and `docs/explanation/accessibility.md` says plainly which
     * part of this no gate can see.
     */
    const palette = getComputedStyle(document.documentElement);
    const ink = palette.getPropertyValue('--text');
    const paper = palette.getPropertyValue('--background');

    await expect(ink).not.toBe('');
    await expect(paper).not.toBe('');
    await expect(ink).not.toBe(paper);
  }}
/>

<!--
  The dark palette, with a keyboard in it. This is the story that had to wait:
  until the key background was repaired, `#f5f5f5` on `#818384` measured 3.49 to
  one and axe would have failed this render — which is exactly why no story
  pinned dark with a keyboard in it, and exactly why the defect survived. The
  measurement now reads 4.77, and this story is the standing evidence.
-->
<Story
  name="Dark theme"
  args={{ knowledge: KNOWLEDGE }}
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
