<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent } from 'storybook/test';

  import PhysicalKeyboard from '../src/lib/components/PhysicalKeyboard.svelte';

  const onletter = fn();
  const ondelete = fn();
  const onsubmit = fn();

  const OVERVIEW = [
    'Typing straight into the board.',
    '',
    'Governing surface: `PhysicalKeyboardInput` in `docs/specs/game.allium`.',
    '',
    'This component renders nothing. Its whole body is a window listener, and that is the design:',
    '`@guarantee TurningThisOffSurrendersTheKeysEntirely` says off means Poodl handles no key',
    'press at all — not letters, not Enter, not Backspace — so with the setting off the parent',
    'renders no component and there is no handler to filter. A handler that checked the setting',
    'and returned early would still be a handler. `<svelte:window>` cannot live inside an `{#if}`',
    'anyway, which is what makes the split a component rather than a condition.',
    '',
    'The stories below therefore show a caption and prove the behaviour in their play functions.',
    'The absent case belongs to **GameScreen**, because absence is something only a parent can',
    'show.',
    '',
    'Guarantees: `@guarantee EnterSubmitsAndBackspaceDeletes`, and letter keys enter that letter',
    'whatever case they arrive in — the engine lowercases it, so the board never sees the',
    'difference.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Game/PhysicalKeyboard',
    component: PhysicalKeyboard,
    tags: ['autodocs'],
    args: { onletter, ondelete, onsubmit },
    argTypes: {
      onletter: { description: 'Called with the key as it arrived, case and all.' },
      ondelete: { description: 'Backspace.' },
      onsubmit: { description: 'Enter.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Listening. Type and watch the Actions panel. -->
<Story name="Listening">
  {#snippet template(args)}
    <PhysicalKeyboard {...args} />
    <p>Nothing to see. Type a letter, Enter or Backspace and watch the Actions panel.</p>
  {/snippet}
</Story>

<!-- The three actions, from the physical keyboard. -->
<Story
  name="Enter submits and Backspace deletes"
  play={async () => {
    // PhysicalKeyboardInput.@guarantee EnterSubmitsAndBackspaceDeletes
    onletter.mockClear();
    ondelete.mockClear();
    onsubmit.mockClear();

    await userEvent.keyboard('a');
    await expect(onletter).toHaveBeenCalledWith('a');

    await userEvent.keyboard('{Enter}');
    await expect(onsubmit).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Backspace}');
    await expect(ondelete).toHaveBeenCalledTimes(1);
  }}
>
  {#snippet template(args)}
    <PhysicalKeyboard {...args} />
    <p>Enter submits, Backspace deletes, letters go into the board.</p>
  {/snippet}
</Story>

<!-- The browser keeps its own shortcuts, and a focused control keeps its keys. -->
<Story
  name="The browser keeps its shortcuts"
  play={async () => {
    onletter.mockClear();

    await userEvent.keyboard('{Control>}a{/Control}');
    await userEvent.keyboard('{Meta>}r{/Meta}');

    await expect(onletter).not.toHaveBeenCalled();
  }}
>
  {#snippet template(args)}
    <PhysicalKeyboard {...args} />
    <p>Modified keys pass straight through to the browser.</p>
  {/snippet}
</Story>
