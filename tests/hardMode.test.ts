import { describe, expect, it } from 'vitest';

import { respectsHardMode, satisfiesHardMode } from '../src/lib/domain/hardMode';
import { scoreGuess } from '../src/lib/domain/scoring';
import type { Guess } from '../src/lib/domain/types';
import { containsLetter, isWordText, letterAt } from '../src/lib/domain/words';

const ANSWER = 'apple';

/** Guesses played against `ANSWER`, numbered from one as the spec numbers them. */
function played(words: readonly string[], answer = ANSWER): Guess[] {
  return words.map((word, index) => ({
    position: index + 1,
    word,
    results: scoreGuess(word, answer)
  }));
}

describe('word text', () => {
  // words.allium — EntryIsWordLength and EntryIsLowercase.
  it('accepts exactly five lowercase letters of the English alphabet', () => {
    expect(isWordText('apple')).toBe(true);
    expect(isWordText('zzzzz')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isWordText('app')).toBe(false);
    expect(isWordText('apples')).toBe(false);
    expect(isWordText('APPLE')).toBe(false);
    expect(isWordText('app1e')).toBe(false);
    expect(isWordText('ap le')).toBe(false);
    expect(isWordText('')).toBe(false);
  });

  it('reads a letter by its one-based position', () => {
    expect(letterAt('apple', 1)).toBe('a');
    expect(letterAt('apple', 5)).toBe('e');
  });

  it('says whether a word holds a letter anywhere', () => {
    expect(containsLetter('apple', 'p')).toBe(true);
    expect(containsLetter('apple', 'z')).toBe(false);
  });
});

/*
 * game.allium — `Game.satisfies_hard_mode`:
 *
 *     correct_results.all(r => letter_at(candidate.text, r.position) = r.letter)
 *     and present_results.all(r => contains_letter(candidate.text, r.letter))
 *
 * Every letter revealed in place must be played in that same place, and every
 * letter revealed as present must be played somewhere.
 */
describe('satisfiesHardMode', () => {
  it('accepts anything before a guess has revealed anything', () => {
    expect(satisfiesHardMode([], 'zzzzz')).toBe(true);
  });

  it('accepts a candidate that keeps every revealed letter', () => {
    // ADOPT places A correctly and shows P is in the word.
    expect(satisfiesHardMode(played(['adopt']), 'ample')).toBe(true);
  });

  it('rejects a candidate that moves a letter revealed in place', () => {
    // A belongs at position 1; PLEAS puts it at position 4.
    expect(satisfiesHardMode(played(['adopt']), 'pleas')).toBe(false);
  });

  it('rejects a candidate that drops a letter revealed as present', () => {
    // ALOUD keeps A in place but abandons the P that ADOPT found.
    expect(satisfiesHardMode(played(['adopt']), 'aloud')).toBe(false);
  });

  it('reads every guess in the game, not only the last', () => {
    // ADOPT reveals A in place; APPLE would then reveal the rest. Taken
    // together they leave only the answer itself admissible.
    const guesses = played(['adopt', 'ample']);

    expect(satisfiesHardMode(guesses, 'apple')).toBe(true);
    expect(satisfiesHardMode(guesses, 'ample')).toBe(true);
    expect(satisfiesHardMode(guesses, 'aloud')).toBe(false);
  });

  it('accepts the answer itself, always', () => {
    expect(satisfiesHardMode(played(['adopt', 'ample']), ANSWER)).toBe(true);
  });
});

/*
 * game.allium — the `HardModeAdmission` contract. A guess is judged only
 * against what was known before it was submitted, never against its own
 * results.
 */
describe('respectsHardMode', () => {
  it('is trivially true with no guesses', () => {
    expect(respectsHardMode([])).toBe(true);
  });

  it('is true for a single guess, which nothing preceded', () => {
    expect(respectsHardMode(played(['zzzzz']))).toBe(true);
  });

  it('is false when a later guess abandons what an earlier one revealed', () => {
    // ADOPT shows P is in the word; ALARM has no P.
    expect(respectsHardMode(played(['adopt', 'alarm']))).toBe(false);
  });

  it('is true when every guess honours the reveals that preceded it', () => {
    expect(respectsHardMode(played(['adopt', 'ample', 'apple']))).toBe(true);
  });

  it('judges each guess against its predecessors only', () => {
    // The discriminating case. ADOPT is legal because nothing preceded it,
    // and AMPLE is legal because it keeps ADOPT's A in place and its P
    // somewhere. Judged against the pair's combined reveals instead, ADOPT
    // would fail: AMPLE puts P at position 3 and ADOPT has an O there.
    expect(respectsHardMode(played(['adopt', 'ample']))).toBe(true);
  });
});
