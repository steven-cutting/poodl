<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import ResultsReady from '../src/lib/components/ResultsReady.svelte';
  import { ANSWER, GRID } from './fixtures';

  const oncopy = fn();

  const OVERVIEW = [
    'The grid of a finished game, ready to be taken away.',
    '',
    'Governing surface: `ShareResults` in `docs/specs/sharing.allium`.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee TheGridIsAvailableAsText`. The grid is shown as text and not only written to',
    '  the clipboard, so it can be read by assistive technology before it is sent and selected by',
    '  hand when the clipboard cannot be reached.',
    '- `@guarantee SharedTextGivesNothingAway`. What is shown is exactly what is copied, and it',
    '  names no letter of the answer or of any guess.',
    '- `@guarantee PaletteFollowsHighContrast` belongs to the renderer, not to this: the tiles',
    '  arrive already chosen.',
    '',
    'The grid below comes from the real renderer over a real scored board, so no story here can',
    'show a result the `ShareGridFormat` contract would not produce.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Sharing/ResultsReady',
    component: ResultsReady,
    tags: ['autodocs'],
    args: { text: GRID, oncopy },
    argTypes: {
      text: { control: 'text', description: 'The rendered grid, exactly as it is copied.' },
      oncopy: { description: 'Called when the player asks for it on the clipboard.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- A won game, three attempts, with no letter of any word anywhere in it. -->
<Story
  name="Ready to copy"
  play={async ({ canvasElement }) => {
    // ShareResults.@guarantee SharedTextGivesNothingAway
    await expect(canvasElement.textContent).not.toContain(ANSWER);
  }}
/>

<!--
  Tab reaches the text, then the button, and Enter copies. Two stops, because a
  player the clipboard refuses can still select the grid and take it by hand.
-->
<Story
  name="Copied from the keyboard"
  play={async ({ canvasElement }) => {
    // ShareResults.@guarantee TheGridIsAvailableAsText
    oncopy.mockClear();
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole('textbox', { name: /result/i })).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /copy result/i })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(oncopy).toHaveBeenCalledTimes(1);
  }}
/>

<!--
  And selectable by hand, which is the half of that guarantee the keyboard story
  does not reach.

  `game/DirectManipulation.ATapDoesOnlyWhatTheControlDoes` puts `user-select:
  none` on every control and on every label, and `user-select` inherits — so a
  label that wrapped this textarea rather than pointing at it with `for` would
  make the grid unselectable and satisfy one specification passage by breaking
  another. Nothing does today. This is what says so if that ever changes.
-->
<Story
  name="The grid can still be selected by hand"
  play={async ({ canvasElement }) => {
    // ShareResults.@guarantee TheGridIsAvailableAsText
    const grid = within(canvasElement).getByRole('textbox', { name: /result/i });

    await expect(getComputedStyle(grid).getPropertyValue('user-select')).not.toBe('none');
  }}
/>
