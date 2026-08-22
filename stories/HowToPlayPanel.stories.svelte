<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import HowToPlayPanel from '../src/lib/components/HowToPlayPanel.svelte';

  const onclose = fn();

  const OVERVIEW = [
    'The explanation as the dialog the header’s info button opens.',
    '',
    'Governing surface: `Welcome` in `docs/specs/game.allium`.',
    '`@guarantee AFirstVisitIsExplained` asks for the explanation to be "reachable again',
    'afterwards rather than being shown once and lost" — this is the afterwards. The words are',
    '`HowToPlay`’s, shared with the welcome screen; this is the design system’s dialog around',
    'them — the same shell and the same Close-first title row as every other panel, and no',
    'footer, because the body has no action to commit to.',
    '',
    '`@guarantee FullyKeyboardOperable` rides on `Modal`, as it does for every panel: focus',
    'arrives inside, Escape closes, and Tab stays on Close — the one stop — rather than',
    'wandering out to the board behind. The play functions below are the evidence.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/HowToPlayPanel',
    component: HowToPlayPanel,
    tags: ['autodocs'],
    args: { onclose },
    argTypes: {
      onclose: { description: 'Close and Escape both call it.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- The dialog as the header opens it. -->
<Story
  name="Open"
  play={async ({ canvasElement }) => {
    // Welcome.@guarantee AFirstVisitIsExplained
    const dialog = within(canvasElement).getByRole('dialog', { name: 'How to play' });

    await expect(dialog).toHaveFocus();
    await expect(dialog).toHaveTextContent(/6 attempts/);
    await expect(within(dialog).getAllByRole('listitem')).toHaveLength(3);
  }}
/>

<!--
  One stop — Close in the title row — so Tab lands on it and a second Tab has
  to land on it again rather than on the board behind the dialog. Escape
  answers from wherever focus is.
-->
<Story
  name="Keeps the keyboard inside"
  play={async ({ canvasElement }) => {
    // FullyKeyboardOperable, by way of Modal.
    onclose.mockClear();
    const close = within(canvasElement).getByRole('button', { name: 'Close' });

    await userEvent.tab();
    await expect(close).toHaveFocus();

    await userEvent.tab();
    await expect(close).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(onclose).toHaveBeenCalledTimes(1);
  }}
/>

<!-- Dark is home: the frame the design was drawn in. -->
<Story
  name="Dark theme"
  globals={{ theme: 'dark' }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
