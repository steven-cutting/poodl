import { describe, expect, it } from 'vitest';

import { MAX_ATTEMPTS } from '../src/lib/config';
import {
  EMPTY_POOL,
  answersUnseen,
  drawPooledAnswer,
  unusedAnswers
} from '../src/lib/domain/answerPool';
import {
  EMPTY_STATISTICS,
  losses,
  recordLoss,
  recordWin,
  winPercentage
} from '../src/lib/domain/statistics';
import type { Statistics } from '../src/lib/domain/statistics';

const ANSWERS = ['apple', 'adopt', 'alarm'];

/** Sum of every bucket — `DistributionAccountsForEveryWin` reads this. */
function distributed(statistics: Statistics): number {
  return statistics.distribution.reduce((total, count) => total + count, 0);
}

/*
 * statistics.allium — the one `Statistics` block. Practice and custom games
 * never reach these functions; deciding which games count is the engine's job,
 * and `OnlyRandomAndEndlessAreCounted` is asserted there.
 */
describe('the statistics block', () => {
  it('starts at zero with one bucket per attempt number', () => {
    expect(EMPTY_STATISTICS.gamesPlayed).toBe(0);
    expect(EMPTY_STATISTICS.wins).toBe(0);
    expect(EMPTY_STATISTICS.currentStreak).toBe(0);
    expect(EMPTY_STATISTICS.maxStreak).toBe(0);
    expect(EMPTY_STATISTICS.distribution).toHaveLength(MAX_ATTEMPTS);
    expect(distributed(EMPTY_STATISTICS)).toBe(0);
  });

  // RecordWin.
  it('counts a win, lengthens the streak, and marks the bucket it took', () => {
    const after = recordWin(EMPTY_STATISTICS, 3);

    expect(after.gamesPlayed).toBe(1);
    expect(after.wins).toBe(1);
    expect(after.currentStreak).toBe(1);
    expect(after.maxStreak).toBe(1);
    expect(after.distribution[2]).toBe(1);
    expect(distributed(after)).toBe(1);
  });

  /*
   * The guidance on RecordWin: the streak is bound before the ensures block, so
   * a new maximum is this win's streak rather than the streak as it stood
   * before. Writing max_streak = current_streak would store the earlier value.
   */
  it('raises the maximum to the streak this win produced, not the one before it', () => {
    const after = [1, 2, 3].reduce((statistics, attempts) => recordWin(statistics, attempts), {
      ...EMPTY_STATISTICS
    });

    expect(after.currentStreak).toBe(3);
    expect(after.maxStreak).toBe(3);
  });

  // RecordLoss: the game counts, the streak goes, the distribution is untouched.
  it('counts a loss, ends the streak, and leaves the distribution alone', () => {
    const won = recordWin(EMPTY_STATISTICS, 4);
    const after = recordLoss(won);

    expect(after.gamesPlayed).toBe(2);
    expect(after.wins).toBe(1);
    expect(after.currentStreak).toBe(0);
    expect(distributed(after)).toBe(1);
  });

  it('keeps the maximum streak a loss has broken', () => {
    const after = recordLoss(recordWin(recordWin(EMPTY_STATISTICS, 2), 2));

    expect(after.currentStreak).toBe(0);
    expect(after.maxStreak).toBe(2);
  });

  it('holds its invariants over a long mixed run', () => {
    let statistics = EMPTY_STATISTICS;

    for (let game = 1; game <= 40; game += 1) {
      statistics = game % 3 === 0 ? recordLoss(statistics) : recordWin(statistics, (game % 6) + 1);

      expect(statistics.wins).toBeLessThanOrEqual(statistics.gamesPlayed);
      expect(statistics.currentStreak).toBeLessThanOrEqual(statistics.maxStreak);
      expect(statistics.currentStreak).toBeLessThanOrEqual(statistics.wins);
      expect(distributed(statistics)).toBe(statistics.wins);
    }
  });

  it('reports losses and a win percentage', () => {
    expect(winPercentage(EMPTY_STATISTICS)).toBe(0);
    expect(losses(EMPTY_STATISTICS)).toBe(0);

    const after = recordLoss(recordWin(EMPTY_STATISTICS, 1));

    expect(losses(after)).toBe(1);
    expect(winPercentage(after)).toBe(50);
  });
});

/*
 * statistics.allium — the `AnswerPool`. Random and endless draw from one shared
 * set of answers not yet used, and the used set clears when it runs out.
 */
describe('the answer pool', () => {
  /** A choice a test can predict: always the first candidate. */
  const first = (candidates: readonly string[]): string => candidates[0] as string;

  it('starts empty and unrecycled', () => {
    expect(EMPTY_POOL.used).toEqual([]);
    expect(EMPTY_POOL.hasRecycled).toBe(false);
    expect(answersUnseen(EMPTY_POOL, ANSWERS)).toBe(ANSWERS.length);
  });

  it('draws from the answers not yet used, and records what it drew', () => {
    const drawn = drawPooledAnswer(EMPTY_POOL, ANSWERS, first);

    expect(drawn.answer).toBe('apple');
    expect(drawn.pool.used).toEqual(['apple']);
    expect(drawn.pool.hasRecycled).toBe(false);
    expect(unusedAnswers({ used: ['apple'], hasRecycled: false }, ANSWERS)).toEqual([
      'adopt',
      'alarm'
    ]);
  });

  it('never draws an answer already used, until there are none left', () => {
    let pool = EMPTY_POOL;
    const seen: string[] = [];

    for (let round = 0; round < ANSWERS.length; round += 1) {
      const drawn = drawPooledAnswer(pool, ANSWERS, first);
      seen.push(drawn.answer);
      pool = drawn.pool;
    }

    expect([...seen].sort()).toEqual([...ANSWERS].sort());
  });

  /*
   * On exhaustion the used set is replaced by the word just drawn rather than
   * emptied, so the reset and the record happen together and the new cycle
   * starts with one answer already spent.
   */
  it('recycles when the pool runs out, keeping the word it drew', () => {
    const spent = { used: [...ANSWERS], hasRecycled: false };
    const drawn = drawPooledAnswer(spent, ANSWERS, first);

    expect(ANSWERS).toContain(drawn.answer);
    expect(drawn.pool.used).toEqual([drawn.answer]);
    expect(drawn.pool.hasRecycled).toBe(true);
  });

  /*
   * has_recycled cannot be inferred from a count: the used set is refilled the
   * instant it empties, so the count is non-zero again by the time anybody
   * reads it. RecyclingIsVisibleBeforeItSurprises depends on the flag.
   */
  it('remembers that it recycled even though the count went back up', () => {
    const recycled = drawPooledAnswer({ used: [...ANSWERS], hasRecycled: false }, ANSWERS, first);
    const next = drawPooledAnswer(recycled.pool, ANSWERS, first);

    expect(answersUnseen(recycled.pool, ANSWERS)).toBeGreaterThan(0);
    expect(next.pool.hasRecycled).toBe(true);
  });
});
