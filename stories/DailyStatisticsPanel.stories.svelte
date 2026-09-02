<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import DailyStatisticsPanel from '../src/lib/components/DailyStatisticsPanel.svelte';
  import { EMPTY_DAILY_STATISTICS } from '../src/lib/domain/dailyStatistics';
  import { DAILY_STATISTICS, TODAY } from './fixtures';

  const OVERVIEW = [
    'The daily record: days played, won and lost, the guess distribution, and a streak of',
    'consecutive days won.',
    '',
    'Governing surface: `DailyStatisticsPanel` in `docs/specs/daily.allium`. Composed inside',
    '**StatisticsPanel** rather than opened as a dialog of its own — see that story for how the',
    'two sit together and reset together.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee OnlyDailyGamesAreCountedHere`. Every number reads `dailyStatistics`, never the',
    '  primary block.',
    '- `@guarantee AStreakIsConsecutiveDays`. The streak shown is live — computed from `today` and',
    '  `last_won_day` — not the stored value, so a day passed unwon reads as no streak without a',
    '  write having to say so first. The **A day has passed unwon** story is that case.',
    '- `@guarantee DistributionIsReadableWithoutSeeingIt`, by way of **DistributionChart**.',
    '- `@guarantee ResetTogetherWithTheRest`. No reset control here — resetting is',
    '  **StatisticsPanel**’s, and clears both blocks at once.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Statistics/DailyStatisticsPanel',
    component: DailyStatisticsPanel,
    tags: ['autodocs'],
    args: { dailyStatistics: DAILY_STATISTICS, today: TODAY },
    argTypes: {
      dailyStatistics: { control: false, description: 'Days played, won, streaked and bucketed.' },
      today: { control: 'number', description: 'day_of(now), for the live streak.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- A four-day streak, still live today. -->
<Story name="On a streak" />

<!-- Nothing played yet. Every number is still stated rather than hidden. -->
<Story name="Nothing played yet" args={{ dailyStatistics: EMPTY_DAILY_STATISTICS, today: 1 }} />

<!--
  AStreakIsConsecutiveDays: the stored streak is unchanged, but a week has
  passed since the last win, so the live view reads zero.
-->
<Story
  name="A day has passed unwon"
  args={{ today: TODAY + 7 }}
  play={async ({ canvasElement }) => {
    // DailyStatisticsPanel.@guarantee AStreakIsConsecutiveDays
    const region = within(canvasElement).getByRole('region', { name: /daily/i });

    await expect(region).toHaveTextContent(/Current streak\s*0/);
  }}
/>

<!-- No reset control lives here. -->
<Story
  name="Has no reset control of its own"
  play={async ({ canvasElement }) => {
    // DailyStatisticsPanel.@guarantee ResetTogetherWithTheRest
    await expect(within(canvasElement).queryByRole('button')).not.toBeInTheDocument();
  }}
/>
