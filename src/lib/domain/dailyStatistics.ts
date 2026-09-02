import { MAX_ATTEMPTS } from '$lib/config';

/**
 * The `DailyStatistics` block, from `docs/specs/daily.allium`.
 *
 * Kept separate from `statistics.ts`'s one block — daily.allium declares its
 * own, and nothing merges the two. `DailyDistributionBucket` is modelled the
 * same way `GuessDistributionBucket` is: a list indexed by attempt number, so
 * `BucketIsAnAttemptNumber` holds by construction.
 *
 * The streak here is day-based, not game-based: `recordDailyWin` only extends
 * it when the previous win's day was exactly yesterday relative to this one
 * (`last_won_day = day - 1`). A skipped day resets it to 1, the same as a
 * loss does — there is no separate "decay" step, because `liveDailyStreak`
 * computes the read-time view without ever writing a decay.
 */
export interface DailyStatistics {
  daysPlayed: number;
  daysWon: number;
  currentStreak: number;
  maxStreak: number;
  lastWonDay: number | null;
  buckets: readonly number[];
}

/** `default DailyStatistics daily_block`, with its six buckets at zero. */
export const EMPTY_DAILY_STATISTICS: DailyStatistics = {
  daysPlayed: 0,
  daysWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastWonDay: null,
  buckets: Array.from({ length: MAX_ATTEMPTS }, () => 0)
};

/**
 * `RecordDailyWin`: one more day played, one more day won, a mark in the
 * bucket for however many guesses it took, and a streak that extends only
 * when yesterday was also won — otherwise it starts over at one.
 */
export function recordDailyWin(
  stats: DailyStatistics,
  day: number,
  attempts: number
): DailyStatistics {
  const currentStreak = stats.lastWonDay === day - 1 ? stats.currentStreak + 1 : 1;

  return {
    daysPlayed: stats.daysPlayed + 1,
    daysWon: stats.daysWon + 1,
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    lastWonDay: day,
    buckets: stats.buckets.map((count, index) => (index === attempts - 1 ? count + 1 : count))
  };
}

/**
 * `RecordDailyLoss`: the day counts, the streak ends, everything else —
 * including `last_won_day`, which names the last day *won*, not played — is
 * untouched.
 */
export function recordDailyLoss(stats: DailyStatistics): DailyStatistics {
  return { ...stats, daysPlayed: stats.daysPlayed + 1, currentStreak: 0 };
}

/** `DailyStatistics.losses`. */
export function dailyLosses(stats: DailyStatistics): number {
  return stats.daysPlayed - stats.daysWon;
}

/** `DailyStatistics.win_percentage`, zero rather than undefined at no games. */
export function dailyWinPercentage(stats: DailyStatistics): number {
  return stats.daysPlayed === 0 ? 0 : (stats.daysWon * 100) / stats.daysPlayed;
}

/**
 * `DailyStatisticsPanel.live_streak`: the stored streak, shown only while it
 * is still current — the win that started it was today or yesterday.
 *
 * `stats.lastWonDay !== null` is checked explicitly rather than relying on
 * the comparison alone: `null >= today - 1` coerces `null` to `0` in
 * JavaScript, which reads `true` whenever `today <= 1` and would show a
 * streak that was never won.
 */
export function liveDailyStreak(stats: DailyStatistics, today: number): number {
  return stats.lastWonDay !== null && stats.lastWonDay >= today - 1 ? stats.currentStreak : 0;
}
