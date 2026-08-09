<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import LinkReady from '../src/lib/components/LinkReady.svelte';
  import { LINK } from './fixtures';

  const oncopy = fn();

  const OVERVIEW = [
    'The link a custom game travels in, ready to be taken away.',
    '',
    'Governing surfaces: `CustomGameCreation` and `ShareCurrentAnswer` in',
    '`docs/specs/sharing.allium`.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee TheWordIsNotReadableInTheLink`. Nothing shown here says the word, because',
    '  nothing here has it — only the token. The URL below is one the real codec produced.',
    '- `@guarantee FullyKeyboardOperable`. Copying is a real button, and the link is a real text',
    '  box that can be focused and selected, so the keyboard has two ways through.',
    '- `@guarantee NothingAboutTheLinkIsKept`. This lives for as long as the notice does. Nothing',
    '  is written anywhere, and a reload loses it.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Sharing/LinkReady',
    component: LinkReady,
    tags: ['autodocs'],
    args: { url: LINK, oncopy },
    argTypes: {
      url: { control: 'text', description: 'The link, token and all.' },
      oncopy: { description: 'Called when the player asks for it on the clipboard.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- A link, with the word nowhere in it. -->
<Story name="Ready to copy" />

<!--
  Tab reaches the field, then the button, and Enter copies. Two stops, because
  a player who cannot use the button can still select the text.
-->
<Story
  name="Copied from the keyboard"
  play={async ({ canvasElement }) => {
    // CustomGameCreation.@guarantee FullyKeyboardOperable
    oncopy.mockClear();
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole('textbox', { name: /link/i })).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /copy/i })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(oncopy).toHaveBeenCalledTimes(1);
  }}
/>
