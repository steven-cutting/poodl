<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Keyboard from '../src/lib/components/Keyboard.svelte';
  import { IN_PROGRESS, knownFrom } from './fixtures';

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
    '',
    'A gap, stated rather than blessed: `@guarantee ResultsAreNeverConveyedByColourAlone` is not',
    'fully discharged here. A known key says so in its accessible name, but unlike a tile it',
    'carries no glyph, so a sighted colour-blind reader with no assistive technology has only',
    'the colour. Closing that is an application change, not a story change.',
    '',
    'Child-to-parent communication is callback props — `onletter`, `ondelete`, `onsubmit` — as',
    'invariant 2 in AGENTS.md requires. There is no event dispatcher here.'
  ].join('\n');

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
