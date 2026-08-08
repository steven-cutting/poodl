/** Domain vocabulary shared by scoring, the keyboard, and the components. */

/** `game.allium` — the `LetterMark` enumeration. */
export type LetterMark = 'correct' | 'present' | 'absent';

/** `game.allium` — the `LetterResult` value type. Positions are 1-based. */
export interface LetterResult {
  position: number;
  letter: string;
  mark: LetterMark;
}

/**
 * `game.allium` — the `KeyKnowledge` value type. A null status means the letter
 * has not appeared in any submitted guess.
 */
export interface KeyKnowledge {
  letter: string;
  status: LetterMark | null;
}

/**
 * The part of a submitted guess that scoring and the keyboard care about.
 * `game.allium`'s `Guess` entity carries more; nothing here needs it.
 */
export interface ScoredGuess {
  results: readonly LetterResult[];
}
