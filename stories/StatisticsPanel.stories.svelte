<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import StatisticsPanel from '../src/lib/components/StatisticsPanel.svelte';
  import { EMPTY_STATISTICS } from '../src/lib/domain/statistics';
  import { STATISTICS, STATISTICS_WITH_A_LOSS } from './fixtures';

  const onreset = fn();
  const onclose = fn();

  const OVERVIEW = [
    'How the player has done, and how much of the answer list is left.',
    '',
    'Governing surface: `StatisticsPanel` in `docs/specs/statistics.allium`.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee DistributionIsReadableWithoutSeeingIt`, by way of **DistributionChart**.',
    '- `@guarantee RecyclingIsVisibleBeforeItSurprises`. How many answers remain unseen is text,',
    '  and once the pool has run out and started again the panel says so outright — a player who',
    '  meets a word twice can see why rather than doubting the game.',
    '- `@guarantee ResettingIsDeliberate`. Resetting is confirmed before anything is cleared, and',
    '  the confirmation names what will go: the numbers, the streaks, the distribution and the',
    '  record of which answers have been seen.',
    '- `@guarantee ResettingClearsThePoolToo`, which is why the confirmation names the answers.',
    '- `@guarantee FullyKeyboardOperable`, proved by the play function below.',
    '',
    '`@guarantee OnlyRandomAndEndlessAreCounted` is the engine’s: practice and custom games never',
    'reach these numbers, and `tests/engine.test.ts` is where that is held.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Statistics/StatisticsPanel',
    component: StatisticsPanel,
    tags: ['autodocs'],
    args: {
      statistics: STATISTICS_WITH_A_LOSS,
      answersUnseen: 2_386,
      answersMayRepeat: false,
      onreset,
      onclose
    },
    argTypes: {
      statistics: { control: false, description: 'The one block: counts, streaks, distribution.' },
      answersUnseen: { control: 'number', description: 'Answers the pool has not served yet.' },
      answersMayRepeat: { control: 'boolean', description: 'Whether the pool has recycled.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- A player who has been at it a while. -->
<Story name="A run of games" />

<!-- Nothing played. Every number is still stated rather than hidden. -->
<Story name="Nothing played yet" args={{ statistics: EMPTY_STATISTICS, answersUnseen: 2_393 }} />

<!-- On a streak: current and best agree. -->
<Story name="On a streak" args={{ statistics: STATISTICS }} />

<!-- The pool has run out and started again, and the panel says so. -->
<Story
  name="Answers have started repeating"
  args={{ answersMayRepeat: true, answersUnseen: 2_392 }}
  play={async ({ canvasElement }) => {
    // StatisticsPanel.@guarantee RecyclingIsVisibleBeforeItSurprises
    await expect(within(canvasElement).getByRole('dialog')).toHaveTextContent(/may repeat/i);
  }}
/>

<!--
  Resetting, one step at a time. The first press only asks; the confirmation
  names what will go, and backing out is as easy as going on.
-->
<Story
  name="Resetting asks first"
  play={async ({ canvasElement }) => {
    // StatisticsPanel.@guarantee ResettingIsDeliberate
    // StatisticsPanel.@guarantee ResettingClearsThePoolToo
    onreset.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /reset/i }));
    await expect(onreset).not.toHaveBeenCalled();

    const confirmation = canvas.getByRole('group', { name: /reset/i });

    await expect(confirmation).toHaveTextContent(/streak/i);
    await expect(confirmation).toHaveTextContent(/distribution/i);
    await expect(confirmation).toHaveTextContent(/answers/i);

    await userEvent.click(canvas.getByRole('button', { name: /keep/i }));
    await expect(onreset).not.toHaveBeenCalled();
  }}
/>

<!-- And the whole of it from the keyboard. -->
<Story
  name="Reset from the keyboard"
  play={async ({ canvasElement }) => {
    // StatisticsPanel.@guarantee FullyKeyboardOperable
    onreset.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /reset/i }));

    const clear = canvas.getByRole('button', { name: /clear everything/i });

    clear.focus();
    await userEvent.keyboard('{Enter}');

    await expect(onreset).toHaveBeenCalledTimes(1);
  }}
/>
