import { WORD_LENGTH } from '$lib/config';
import type { LetterResult } from '$lib/domain/types';

/**
 * Score one guess against the answer.
 *
 * This realises the `GuessScoring` contract in `docs/specs/game.allium`. The
 * two passes are the definition of the behaviour, not an implementation
 * choice: a single left-to-right pass gives different, wrong answers for
 * guesses that repeat a letter the answer holds once.
 */
export function scoreGuess(guess: string, answer: string): LetterResult[] {
  if (guess.length !== WORD_LENGTH || answer.length !== WORD_LENGTH) {
    throw new Error(`scoreGuess expects two ${WORD_LENGTH}-letter words`);
  }

  const answerLetters = [...answer];
  const claimed: boolean[] = answerLetters.map(() => false);

  // Absent is the resting state: a position keeps it unless one of the two
  // passes finds an occurrence for it to claim.
  const results: LetterResult[] = [...guess].map((letter, index) => ({
    position: index + 1,
    letter,
    mark: 'absent'
  }));

  // Pass one visits every position. Where the letters match, the position is
  // marked correct and claims one occurrence of that letter in the answer.
  for (const result of results) {
    const at = result.position - 1;
    if (result.letter === answerLetters[at]) {
      result.mark = 'correct';
      claimed[at] = true;
    }
  }

  // Pass two visits what pass one left alone, in ascending position order, so
  // that the leftmost unmatched position takes the present mark.
  for (const result of results) {
    if (result.mark === 'correct') {
      continue;
    }
    const unclaimed = answerLetters.findIndex(
      (candidate, at) => claimed[at] === false && candidate === result.letter
    );
    if (unclaimed !== -1) {
      claimed[unclaimed] = true;
      result.mark = 'present';
    }
  }

  return results;
}

/** Whether every position of a scored guess came back correct. */
export function isWinning(results: readonly LetterResult[]): boolean {
  return results.length > 0 && results.every((result) => result.mark === 'correct');
}
