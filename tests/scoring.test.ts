import { describe, expect, it } from 'vitest';

import { WORD_LENGTH } from '../src/lib/config';
import { isWinning, scoreGuess } from '../src/lib/domain/scoring';
import type { LetterMark } from '../src/lib/domain/types';
import { createBundledWordList } from '../src/lib/ports/words';

function marks(guess: string, answer: string): LetterMark[] {
  return scoreGuess(guess, answer).map((result) => result.mark);
}

function occurrences(word: string, letter: string): number {
  return [...word].filter((candidate) => candidate === letter).length;
}

describe('scoreGuess', () => {
  it('marks every position correct when the guess is the answer', () => {
    expect(marks('apple', 'apple')).toEqual([
      'correct',
      'correct',
      'correct',
      'correct',
      'correct'
    ]);
  });

  it('returns one result per position, in order, carrying the guess letters', () => {
    const results = scoreGuess('adopt', 'apple');

    expect(results).toHaveLength(WORD_LENGTH);
    expect(results.map((result) => result.position)).toEqual([1, 2, 3, 4, 5]);
    expect(results.map((result) => result.letter).join('')).toBe('adopt');
  });

  it('marks a letter absent when the answer does not hold it', () => {
    expect(marks('crumb', 'apple')).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
  });

  it('scores a partial match', () => {
    // adopt vs apple: a is in place, p is in the word but misplaced.
    expect(marks('adopt', 'apple')).toEqual(['correct', 'absent', 'absent', 'present', 'absent']);
  });

  // The duplicate-letter obligations from GuessScoring. These are the cases a
  // single left-to-right pass gets wrong.
  describe('duplicate letters', () => {
    it('gives the present mark to the leftmost unmatched position', () => {
      // hello holds two l; alter holds one.
      expect(marks('hello', 'alter')).toEqual(['absent', 'present', 'present', 'absent', 'absent']);
    });

    it('lets exact matches claim their occurrence before any present mark', () => {
      // timer holds one e, at position 4. eaves holds two: the one in position
      // 4 matches exactly and claims it in pass one, which leaves the leading e
      // nothing to claim. A single left-to-right pass would mark it present.
      expect(marks('eaves', 'timer')).toEqual(['absent', 'absent', 'absent', 'correct', 'absent']);
    });

    it('never marks a letter correct or present more often than the answer holds it', () => {
      const pairs: [string, string][] = [
        ['hello', 'alter'],
        ['eaves', 'timer'],
        ['abbey', 'abaci'],
        ['added', 'adage'],
        ['aroma', 'aroma']
      ];

      for (const [guess, answer] of pairs) {
        const results = scoreGuess(guess, answer);
        for (const result of results) {
          const claimed = results.filter(
            (other) => other.letter === result.letter && other.mark !== 'absent'
          ).length;
          expect(claimed).toBeLessThanOrEqual(occurrences(answer, result.letter));
        }
      }
    });
  });

  it('holds its invariants across the whole answer list', () => {
    const words = createBundledWordList();
    const answers = words.answerWords();
    const guess = 'aroma';

    for (const answer of answers) {
      const results = scoreGuess(guess, answer);

      for (const result of results) {
        // A correct mark always sits on a matching position.
        if (result.mark === 'correct') {
          expect(answer[result.position - 1]).toBe(result.letter);
        }
        // A letter the answer does not hold is always absent.
        if (occurrences(answer, result.letter) === 0) {
          expect(result.mark).toBe('absent');
        }
      }

      // All correct exactly when the guess is the answer.
      expect(results.every((result) => result.mark === 'correct')).toBe(guess === answer);
    }
  });

  it('is deterministic', () => {
    expect(scoreGuess('adopt', 'apple')).toEqual(scoreGuess('adopt', 'apple'));
  });

  it('rejects words of the wrong length', () => {
    expect(() => scoreGuess('cat', 'apple')).toThrow(/5-letter/);
    expect(() => scoreGuess('apple', 'cat')).toThrow(/5-letter/);
  });
});

describe('isWinning', () => {
  it('is true only when every position is correct', () => {
    expect(isWinning(scoreGuess('apple', 'apple'))).toBe(true);
    expect(isWinning(scoreGuess('adopt', 'apple'))).toBe(false);
  });

  it('is false for a guess with no results', () => {
    expect(isWinning([])).toBe(false);
  });
});
