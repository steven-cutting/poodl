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
    '- `@guarantee NothingAboutTheLinkIsKept`. This lives for as long as the surface that made',
    '  it — the share dialog or the conclusion — and closes with it. Nothing is written anywhere,',
    '  and a reload loses it.',
    '- `game/DirectManipulation`, both surfaces fulfil it. The link stays selectable by hand, and',
    '  the last story measures the one figure a text control owes on its own: an input the page',
    '  is not magnified to read.'
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

<!--
  `game/DirectManipulation.DeliberateZoomIsNeverTakenAway`, measured on a real
  text field with its component styles over the base ones.

  Below 16px iOS Safari magnifies the page when an input takes focus — the
  platform zooming on its own initiative, which is what the invariant refuses.
  A readonly field is no exception: it still takes focus, and this is the one a
  player taps deliberately, to select the link and take it by hand. `app.css`
  and this component both say `font: inherit`, and this is where that becomes a
  figure, because a user agent's own input font is smaller than the page's and
  jsdom's is not.
-->
<Story
  name="Reading it does not zoom the page"
  play={async ({ canvasElement }) => {
    // game/DirectManipulation.@invariant DeliberateZoomIsNeverTakenAway
    const field = within(canvasElement).getByRole('textbox', { name: /link/i });
    const size = Number.parseFloat(getComputedStyle(field).getPropertyValue('font-size'));

    await expect(size).toBeGreaterThanOrEqual(16);

    // And a second fast tap in it places a caret twice rather than zooming.
    await expect(getComputedStyle(field).getPropertyValue('touch-action')).toBe('manipulation');
  }}
/>
