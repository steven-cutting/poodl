import { describe, expect, it } from 'vitest';

import { MAX_ATTEMPTS } from '../src/lib/config';
import {
  EMPTY_DAILY_STATISTICS,
  dailyLosses,
  dailyWinPercentage,
  liveDailyStreak,
  recordDailyLoss,
  recordDailyWin
} from '../src/lib/domain/dailyStatistics';
import type { DailyStatistics } from '../src/lib/domain/dailyStatistics';

/** Sum of every bucket — DistributionAccountsForEveryWin reads this. */
function distributed(statistics: DailyStatistics): number {
  return statistics.buckets.reduce((total, count) => total + count, 0);
}

/*
 * daily.allium — the `DailyStatistics` block. Kept separate from
 * statistics.allium's one block: random and endless feed that one, Daily
 * feeds this one, and nothing merges them.
 */
describe('the daily statistics block', () => {
  it('starts at zero with one bucket per attempt number and no day won yet', () => {
    expect(EMPTY_DAILY_STATISTICS.daysPlayed).toBe(0);
    expect(EMPTY_DAILY_STATISTICS.daysWon).toBe(0);
    expect(EMPTY_DAILY_STATISTICS.currentStreak).toBe(0);
    expect(EMPTY_DAILY_STATISTICS.maxStreak).toBe(0);
    expect(EMPTY_DAILY_STATISTICS.lastWonDay).toBeNull();
    expect(EMPTY_DAILY_STATISTICS.buckets).toHaveLength(MAX_ATTEMPTS);
    expect(distributed(EMPTY_DAILY_STATISTICS)).toBe(0);
  });

  /*
   * RecordDailyWin, first win: a null last_won_day compares false to any day,
   * so the streak always starts at 1 rather than needing a special case.
   */
  it('starts the streak at one on the first win, whatever day it falls on', () => {
    const after = recordDailyWin(EMPTY_DAILY_STATISTICS, 12, 3);

    expect(after.daysPlayed).toBe(1);
    expect(after.daysWon).toBe(1);
    expect(after.currentStreak).toBe(1);
    expect(after.maxStreak).toBe(1);
    expect(after.lastWonDay).toBe(12);
    expect(after.buckets[2]).toBe(1);
    expect(distributed(after)).toBe(1);
  });

  // RecordDailyWin: yesterday's win extends the streak.
  it('extends the streak when the previous win was exactly yesterday', () => {
    const first = recordDailyWin(EMPTY_DAILY_STATISTICS, 5, 2);
    const second = recordDailyWin(first, 6, 4);

    expect(second.currentStreak).toBe(2);
    expect(second.lastWonDay).toBe(6);
  });

  // RecordDailyWin: a skipped day ends the streak just as a loss would.
  it('resets the streak to one when a day was skipped between wins', () => {
    const first = recordDailyWin(EMPTY_DAILY_STATISTICS, 5, 2);
    const second = recordDailyWin(first, 8, 4);

    expect(second.currentStreak).toBe(1);
    expect(second.lastWonDay).toBe(8);
  });

  it('raises the maximum streak but never lowers it', () => {
    const day1 = recordDailyWin(EMPTY_DAILY_STATISTICS, 1, 1);
    const day2 = recordDailyWin(day1, 2, 1);
    const skipped = recordDailyWin(day2, 5, 1);

    expect(day2.maxStreak).toBe(2);
    expect(skipped.currentStreak).toBe(1);
    expect(skipped.maxStreak).toBe(2);
  });

  // RecordDailyLoss: the day counts, the streak ends, the distribution and days won are untouched.
  it('counts a loss without touching the distribution or days won', () => {
    const won = recordDailyWin(EMPTY_DAILY_STATISTICS, 1, 3);
    const after = recordDailyLoss(won);

    expect(after.daysPlayed).toBe(2);
    expect(after.daysWon).toBe(1);
    expect(after.currentStreak).toBe(0);
    expect(after.lastWonDay).toBe(1);
    expect(distributed(after)).toBe(1);
  });

  it('reports losses and a win percentage, zero-safe with nothing played', () => {
    expect(dailyLosses(EMPTY_DAILY_STATISTICS)).toBe(0);
    expect(dailyWinPercentage(EMPTY_DAILY_STATISTICS)).toBe(0);

    const after = recordDailyLoss(recordDailyWin(EMPTY_DAILY_STATISTICS, 1, 1));

    expect(dailyLosses(after)).toBe(1);
    expect(dailyWinPercentage(after)).toBe(50);
  });

  /*
   * DailyStatisticsPanel.live_streak: derived at read time, not stored. The
   * explicit null case is the trap — `lastWonDay >= today - 1` in JS coerces
   * null to 0, which reads true whenever today <= 1, wrongly showing a streak
   * that was never won.
   */
  it('reads no live streak when nothing has ever been won', () => {
    expect(liveDailyStreak(EMPTY_DAILY_STATISTICS, 1)).toBe(0);
    expect(liveDailyStreak(EMPTY_DAILY_STATISTICS, 400)).toBe(0);
  });

  it('reads the streak live while today is the win day or the day after it', () => {
    const won = recordDailyWin(EMPTY_DAILY_STATISTICS, 10, 3);

    expect(liveDailyStreak(won, 10)).toBe(won.currentStreak);
    expect(liveDailyStreak(won, 11)).toBe(won.currentStreak);
  });

  it('reads no live streak once a day has passed unwon, even though the stored streak is unchanged', () => {
    const won = recordDailyWin(EMPTY_DAILY_STATISTICS, 10, 3);

    expect(liveDailyStreak(won, 12)).toBe(0);
    expect(won.currentStreak).toBeGreaterThan(0);
  });
});
