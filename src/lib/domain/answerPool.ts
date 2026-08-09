/**
 * The answers random and endless have already served up.
 *
 * `docs/specs/statistics.allium` — the `AnswerPool` entity and the
 * `DrawPooledAnswer` rule. Practice ignores this entirely and custom games
 * never come near it.
 */
export interface AnswerPool {
  /** Answers already drawn. A list rather than a set, so it survives JSON. */
  used: readonly string[];
  /**
   * Whether the pool has ever run out and started again. A count of unused
   * answers cannot stand in for this: on exhaustion the used set is immediately
   * refilled with the word just drawn, so the count is non-zero again by the
   * time anybody reads it.
   */
  hasRecycled: boolean;
}

/** `default AnswerPool pool`. */
export const EMPTY_POOL: AnswerPool = { used: [], hasRecycled: false };

/** The answers this pool has not served yet. */
export function unusedAnswers(pool: AnswerPool, answerWords: readonly string[]): string[] {
  const used = new Set(pool.used);
  return answerWords.filter((word) => !used.has(word));
}

/** `StatisticsPanel.answers_unseen`, which the panel states as text. */
export function answersUnseen(pool: AnswerPool, answerWords: readonly string[]): number {
  return unusedAnswers(pool, answerWords).length;
}

/**
 * `DrawPooledAnswer`: draw uniformly from the answers not yet used, and record
 * what was drawn. When nothing is left the used set clears and drawing carries
 * on from the whole list, so answers may repeat from then on.
 *
 * `choose` is passed in rather than imported. `uniform_choice` is the one
 * deliberately non-deterministic step in the specification, so it lives behind
 * the randomness port — and this layer may not reach a port, which is exactly
 * the boundary `docs/explanation/layering.md` draws.
 */
export function drawPooledAnswer(
  pool: AnswerPool,
  answerWords: readonly string[],
  choose: (candidates: readonly string[]) => string
): { answer: string; pool: AnswerPool } {
  const unused = unusedAnswers(pool, answerWords);
  const exhausted = unused.length === 0;
  const answer = choose(exhausted ? answerWords : unused);

  // On exhaustion the used set is replaced by the word just drawn rather than
  // emptied, so the reset and the record happen together and the new cycle
  // starts with one answer already spent.
  return {
    answer,
    pool: exhausted
      ? { used: [answer], hasRecycled: true }
      : { used: [...pool.used, answer], hasRecycled: pool.hasRecycled }
  };
}
