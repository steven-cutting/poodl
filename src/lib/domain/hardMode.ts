import type { Guess, LetterResult, ScoredGuess } from '$lib/domain/types';
import { containsLetter, letterAt } from '$lib/domain/words';

/** Every result of every guess so far — `Game.all_results` in `game.allium`. */
function allResults(guesses: readonly ScoredGuess[]): LetterResult[] {
  return guesses.flatMap((guess) => [...guess.results]);
}

/**
 * Hard mode applied to a candidate guess.
 *
 * `docs/specs/game.allium` — `Game.satisfies_hard_mode`. Every letter revealed
 * in place must be played in that same place, and every letter revealed as
 * present must be played somewhere. Containment is all the second clause asks
 * for: two present marks on the same letter do not oblige the candidate to
 * carry it twice.
 */
export function satisfiesHardMode(guesses: readonly ScoredGuess[], candidate: string): boolean {
  const results = allResults(guesses);

  return (
    results
      .filter((result) => result.mark === 'correct')
      .every((result) => letterAt(candidate, result.position) === result.letter) &&
    results
      .filter((result) => result.mark === 'present')
      .every((result) => containsLetter(candidate, result.letter))
  );
}

/**
 * Whether the guesses already submitted would all have been legal under hard
 * mode. `game.allium` asks this when a player wants hard mode on part way
 * through a game.
 *
 * This realises the `HardModeAdmission` contract: guesses are taken in
 * ascending position order and each is judged only against the reveals that
 * preceded it. Judging a guess against the whole game instead would refuse
 * histories that were never illegal, because a later guess can reveal a letter
 * an earlier one had no way of knowing about.
 */
export function respectsHardMode(guesses: readonly Guess[]): boolean {
  const ordered = [...guesses].sort((a, b) => a.position - b.position);

  return ordered.every((guess, index) => satisfiesHardMode(ordered.slice(0, index), guess.word));
}
