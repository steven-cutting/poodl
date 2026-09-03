<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import StatisticsPanel from '../src/lib/components/StatisticsPanel.svelte';
  import { EMPTY_DAILY_STATISTICS } from '../src/lib/domain/dailyStatistics';
  import { EMPTY_STATISTICS } from '../src/lib/domain/statistics';
  import { DAILY_STATISTICS, STATISTICS, STATISTICS_WITH_A_LOSS, TODAY } from './fixtures';

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
    'reach these numbers, and `tests/engine.test.ts` is where that is held.',
    '',
    'Composes `DailyStatisticsPanel` — `@guarantee ShownBesideThePrimaryBlock` in',
    '`docs/specs/daily.allium` — which has no reset control of its own:',
    '`@guarantee ResetTogetherWithTheRest` is why resetting here clears both blocks, and the',
    '“Resetting asks first” story below checks the confirmation names the daily record too.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Statistics/StatisticsPanel',
    component: StatisticsPanel,
    tags: ['autodocs'],
    args: {
      statistics: STATISTICS_WITH_A_LOSS,
      dailyStatistics: DAILY_STATISTICS,
      today: TODAY,
      answersUnseen: 2_386,
      answersMayRepeat: false,
      onreset,
      onclose
    },
    argTypes: {
      statistics: { control: false, description: 'The one block: counts, streaks, distribution.' },
      dailyStatistics: {
        control: false,
        description: 'The daily block, shown by DailyStatisticsPanel.'
      },
      today: { control: 'number', description: 'day_of(now), for the daily streak’s live view.' },
      answersUnseen: { control: 'number', description: 'Answers the pool has not served yet.' },
      answersMayRepeat: { control: 'boolean', description: 'Whether the pool has recycled.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- A player who has been at it a while. -->
<Story name="A run of games" />

<!-- Nothing played. Every number is still stated rather than hidden. -->
<Story
  name="Nothing played yet"
  args={{
    statistics: EMPTY_STATISTICS,
    dailyStatistics: EMPTY_DAILY_STATISTICS,
    answersUnseen: 2_393
  }}
/>

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
    // DailyStatisticsPanel.@guarantee ResetTogetherWithTheRest
    onreset.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /reset/i }));
    await expect(onreset).not.toHaveBeenCalled();

    const confirmation = canvas.getByRole('group', { name: /reset/i });

    await expect(confirmation).toHaveTextContent(/streak/i);
    await expect(confirmation).toHaveTextContent(/distribution/i);
    await expect(confirmation).toHaveTextContent(/answers/i);
    await expect(confirmation).toHaveTextContent(/daily/i);

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

    // Close sits in the dialog's header row, so it is the first stop.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Close' })).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /reset/i })).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    /*
     * Placing focus by hand here would be doing the one thing the player
     * cannot: the button they pressed is gone, so unless the panel carries
     * focus across the swap it is on the body, outside the dialog.
     */
    await expect(canvas.getByRole('group', { name: /reset/i })).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /clear everything/i })).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    await expect(onreset).toHaveBeenCalledTimes(1);
  }}
/>
