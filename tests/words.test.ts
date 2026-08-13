import { describe, expect, it } from 'vitest';

import { GAME_NAME, MIN_ANSWER_WORDS, MIN_GUESS_WORDS, WORD_LENGTH } from '../src/lib/config';
import { createBundledWordList, createFakeWordList } from '../src/lib/ports/words';

const SHAPE = /^[a-z]+$/;

/**
 * The obligations `WordListSource` puts on whatever supplies the lists. They
 * are asserted against the bundled data so that replacing it — which is the
 * point of the contract — cannot quietly ship a broken list.
 */
describe('the bundled word lists', () => {
  const words = createBundledWordList();
  const answers = words.answerWords();
  const guesses = words.guessWords();

  it('is not empty, so an answer can always be drawn', () => {
    expect(answers.length).toBeGreaterThan(0);
    expect(guesses.size).toBeGreaterThanOrEqual(answers.length);
  });

  it('holds only lowercase words of the right length', () => {
    for (const word of [...answers, ...guesses]) {
      expect(word).toHaveLength(WORD_LENGTH);
      expect(word).toMatch(SHAPE);
    }
  });

  it('holds no word twice', () => {
    expect(new Set(answers).size).toBe(answers.length);
  });

  it('makes every answer a word a player can type', () => {
    const missing = answers.filter((answer) => !guesses.has(answer));

    expect(missing).toEqual([]);
  });

  // GameNameIsInTheAnswerList, and TheGameNameIsAlwaysSupplied on the contract.
  // The one word the specification names has to be an ordinary answer word:
  // drawable, typable, and sendable as a custom link. Membership of the guess
  // dictionary follows from EveryAnswerIsAValidGuess, and is asserted anyway
  // because it is the half a player would notice.
  it('supplies the game its own name, as an answer and as a guess', () => {
    expect(answers).toContain(GAME_NAME);
    expect(guesses.has(GAME_NAME)).toBe(true);
  });

  // AnswerListMeetsItsMinimum and GuessDictionaryMeetsItsMinimum. The floors
  // are what makes a truncated data file fail rather than ship as a playable
  // but tiny vocabulary.
  it('meets both size floors, so a truncated file fails rather than ships', () => {
    expect(answers.length).toBeGreaterThanOrEqual(MIN_ANSWER_WORDS);
    expect(guesses.size).toBeGreaterThanOrEqual(MIN_GUESS_WORDS);
  });
});

describe('createFakeWordList', () => {
  it('keeps answers inside the guess set by construction', () => {
    const words = createFakeWordList(['apple', 'adopt'], ['crumb']);

    expect(words.answerWords()).toEqual(['apple', 'adopt']);
    expect([...words.guessWords()].sort()).toEqual(['adopt', 'apple', 'crumb']);
  });

  it('needs no extra guesses', () => {
    const words = createFakeWordList(['apple']);

    expect(words.guessWords().has('apple')).toBe(true);
    expect(words.guessWords().size).toBe(1);
  });
});
