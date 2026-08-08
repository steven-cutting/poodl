import { describe, expect, it } from 'vitest';

import { keyboardKnowledge } from '../src/lib/domain/keyboard';
import { scoreGuess } from '../src/lib/domain/scoring';
import type { LetterMark, ScoredGuess } from '../src/lib/domain/types';

function played(words: readonly string[], answer: string): ScoredGuess[] {
  return words.map((word) => ({ results: scoreGuess(word, answer) }));
}

function statusOf(guesses: readonly ScoredGuess[], letter: string): LetterMark | null {
  const entry = keyboardKnowledge(guesses).find((key) => key.letter === letter);
  return entry?.status ?? null;
}

describe('keyboardKnowledge', () => {
  it('covers the alphabet whether or not a letter has been guessed', () => {
    const knowledge = keyboardKnowledge([]);

    expect(knowledge).toHaveLength(26);
    expect(knowledge.map((key) => key.letter).join('')).toBe('abcdefghijklmnopqrstuvwxyz');
    expect(knowledge.every((key) => key.status === null)).toBe(true);
  });

  it('records what a submitted guess revealed', () => {
    const guesses = played(['adopt'], 'apple');

    expect(statusOf(guesses, 'a')).toBe('correct');
    expect(statusOf(guesses, 'p')).toBe('present');
    expect(statusOf(guesses, 'd')).toBe('absent');
    expect(statusOf(guesses, 'z')).toBeNull();
  });

  it('promotes a letter as a later guess reveals more', () => {
    // adopt places p wrongly; apple places it correctly.
    const guesses = played(['adopt', 'apple'], 'apple');

    expect(statusOf(guesses, 'p')).toBe('correct');
  });

  it('never weakens what is already known', () => {
    // apple puts p in place; adopt then puts it in the wrong place. Knowledge
    // of the correct placement has to survive.
    const guesses = played(['apple', 'adopt'], 'apple');

    expect(statusOf(guesses, 'p')).toBe('correct');
  });

  it('prefers present over absent for the same letter', () => {
    // aroma has a at both ends: the first claims the answer's only a, so the
    // last is absent. The key still reads correct.
    const guesses = played(['aroma'], 'abbey');

    expect(statusOf(guesses, 'a')).toBe('correct');
  });
});
