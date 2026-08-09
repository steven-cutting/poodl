/**
 * Board and keyboard fixtures for the stories.
 *
 * Every fixture is scored by the real `scoreGuess`, so no story can show a
 * result the `GuessScoring` contract in `docs/specs/game.allium` would not
 * produce. Hand-written `LetterResult` arrays would drift the first time
 * scoring changed; these cannot.
 *
 * Imports are relative rather than through `$lib`, matching `tests/` — the
 * other place in this repository that reaches into `src/` from outside it.
 */

import { keyboardKnowledge } from '../src/lib/domain/keyboard';
import { scoreGuess } from '../src/lib/domain/scoring';
import type { KeyKnowledge, ScoredGuess } from '../src/lib/domain/types';

/** The answer every board in the stories is played against. */
export const ANSWER = 'apple';

/** Score words against `ANSWER`, in the order they were played. */
export function played(words: readonly string[]): ScoredGuess[] {
  return words.map((word) => ({ results: scoreGuess(word, ANSWER) }));
}

/** What the guesses so far have revealed, one entry per letter of the alphabet. */
export function knownFrom(words: readonly string[]): KeyKnowledge[] {
  return keyboardKnowledge(played(words));
}

/** Two guesses in: A is placed, P and L are in the word, D O T R M are not. */
export const IN_PROGRESS: readonly string[] = ['adopt', 'alarm'];

/** Won on the third attempt. */
export const WON: readonly string[] = ['adopt', 'alarm', 'apple'];

/**
 * Six attempts spent and none of them the answer. `apply` is deliberately last:
 * it misses APPLE by its final letter, which is the losing board worth looking
 * at.
 */
export const LOST: readonly string[] = ['adopt', 'alarm', 'again', 'aroma', 'aside', 'apply'];
