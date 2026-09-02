<script lang="ts">
  import DistributionChart from '$lib/components/DistributionChart.svelte';
  import { dailyLosses, dailyWinPercentage, liveDailyStreak } from '$lib/domain/dailyStatistics';
  import type { DailyStatistics } from '$lib/domain/dailyStatistics';

  /**
   * `daily.allium` — the `DailyStatisticsPanel` surface, composed inside
   * `StatisticsPanel` rather than opened as a dialog of its own.
   *
   * `OnlyDailyGamesAreCountedHere`: every number here reads `dailyStatistics`,
   * never the primary block.
   *
   * `AStreakIsConsecutiveDays`: the streak shown is `liveDailyStreak(dailyStatistics,
   * today)`, not the stored value — a day passed unwon reads as no streak here
   * without a write having to say so first.
   *
   * `ResetTogetherWithTheRest`: this panel has no control of its own. Resetting
   * lives on `StatisticsPanel`, and clears both blocks together.
   */
  let { dailyStatistics, today }: { dailyStatistics: DailyStatistics; today: number } = $props();

  // One identifier per component, as every other component here does it:
  // `$props.id()` may be called once, as a declaration initializer.
  const uid = $props.id();
  const headingId = `${uid}-daily-statistics`;

  const numbers = $derived([
    { label: 'Days played', value: String(dailyStatistics.daysPlayed) },
    { label: 'Days won', value: String(dailyStatistics.daysWon) },
    { label: 'Days lost', value: String(dailyLosses(dailyStatistics)) },
    { label: 'Win rate', value: `${Math.round(dailyWinPercentage(dailyStatistics))}%` },
    { label: 'Current streak', value: String(liveDailyStreak(dailyStatistics, today)) },
    { label: 'Best streak', value: String(dailyStatistics.maxStreak) }
  ]);
</script>

<section aria-labelledby={headingId}>
  <h3 id={headingId}>Daily</h3>
  <dl>
    {#each numbers as entry (entry.label)}
      <div>
        <dt>{entry.label}</dt>
        <dd>{entry.value}</dd>
      </div>
    {/each}
  </dl>
  <DistributionChart distribution={dailyStatistics.buckets} label="Daily guess distribution" />
</section>

<style>
  section {
    margin-block-start: var(--s-7);
  }

  h3 {
    margin-block: 0 var(--s-4);
    font-size: 1rem;
  }

  dl {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--s-5);
    margin: 0 0 var(--s-7);
  }

  dl div {
    text-align: center;
  }

  dt {
    color: var(--text-2);
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
  }

  dd {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--fs-stat);
    font-weight: 600;
    font-variant-numeric: var(--figures-tabular);
  }
</style>
