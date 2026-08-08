import type { KeyKnowledge, LetterMark, ScoredGuess } from '$lib/domain/types';

// Annotated as `string` rather than left to infer its literal type, so that
// iterating it is covered by the no-misused-spread allowance in eslint.config.js.
const ALPHABET: string = 'abcdefghijklmnopqrstuvwxyz';

/** Strongest first. `game.allium` ranks correct over present over absent. */
const PRECEDENCE: readonly LetterMark[] = ['correct', 'present', 'absent'];

/**
 * What the guesses so far have revealed about each letter of the alphabet.
 *
 * This realises the `KeyboardKnowledge` contract in `docs/specs/game.allium`:
 * every letter gets an entry whether or not it has been guessed, and knowledge
 * never weakens — a letter shown correct stays correct even if a later guess
 * places it wrongly.
 */
export function keyboardKnowledge(guesses: readonly ScoredGuess[]): KeyKnowledge[] {
  const strongest = new Map<string, LetterMark>();

  for (const guess of guesses) {
    for (const result of guess.results) {
      const known = strongest.get(result.letter);
      if (known === undefined || PRECEDENCE.indexOf(result.mark) < PRECEDENCE.indexOf(known)) {
        strongest.set(result.letter, result.mark);
      }
    }
  }

  return [...ALPHABET].map((letter) => ({
    letter,
    status: strongest.get(letter) ?? null
  }));
}
