import { MAX_ATTEMPTS } from '$lib/config';

/**
 * The one statistics block, from `docs/specs/statistics.allium`.
 *
 * `GuessDistributionBucket` is modelled as a list rather than as a collection
 * of entities: one entry per attempt number, index 0 holding wins in one guess.
 * The bucket's `guesses_used` is its position, so the spec's
 * `BucketIsAnAttemptNumber` holds by construction and no bucket can go missing.
 */
export interface Statistics {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: readonly number[];
}

/** `default Statistics primary`, with its six buckets at zero. */
export const EMPTY_STATISTICS: Statistics = {
  gamesPlayed: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: Array.from({ length: MAX_ATTEMPTS }, () => 0)
};

/**
 * `RecordWin`: one more game, one more win, a longer streak, and a mark in the
 * bucket for however many guesses it took.
 *
 * The streak is computed once and used for both the current streak and any new
 * maximum. Taking the maximum from the pre-rule current streak instead — which
 * is what `max_streak = current_streak` would read — stores the streak as it
 * stood before this win.
 */
export function recordWin(statistics: Statistics, attempts: number): Statistics {
  const currentStreak = statistics.currentStreak + 1;

  return {
    gamesPlayed: statistics.gamesPlayed + 1,
    wins: statistics.wins + 1,
    currentStreak,
    maxStreak: Math.max(statistics.maxStreak, currentStreak),
    distribution: statistics.distribution.map((count, index) =>
      index === attempts - 1 ? count + 1 : count
    )
  };
}

/**
 * `RecordLoss` and `RecordAbandonmentAsLoss`: the game counts, the streak goes,
 * and the distribution is untouched. Abandoning a game under way costs exactly
 * what losing it costs, which is why both rules land here.
 */
export function recordLoss(statistics: Statistics): Statistics {
  return { ...statistics, gamesPlayed: statistics.gamesPlayed + 1, currentStreak: 0 };
}

/** `Statistics.losses`. */
export function losses(statistics: Statistics): number {
  return statistics.gamesPlayed - statistics.wins;
}

/** `Statistics.win_percentage`, which is zero rather than undefined at no games. */
export function winPercentage(statistics: Statistics): number {
  return statistics.gamesPlayed === 0 ? 0 : (statistics.wins * 100) / statistics.gamesPlayed;
}
