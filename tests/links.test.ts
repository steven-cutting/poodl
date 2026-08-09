import { describe, expect, it } from 'vitest';

import { CUSTOM_GAME_PARAM, customGameUrl, tokenFromUrl } from '../src/lib/domain/links';
import {
  TOKEN_ALPHABET,
  TOKEN_LENGTH,
  decodeToken,
  encodeAnswer
} from '../src/lib/domain/obfuscation';
import { isWordText } from '../src/lib/domain/words';
import { createBundledWordList } from '../src/lib/ports/words';

const words = createBundledWordList();
const dictionary = [...words.guessWords()];
const PAGE = 'https://steven-cutting.github.io/poodl/';

/**
 * Tokens recorded from the scheme as it stands, so that changing the
 * permutation, the checksum or the alphabet fails the gate rather than quietly
 * breaking every link already in somebody's hands.
 */
const PINNED_TOKENS: Readonly<Record<string, string>> = {
  apple: 'yrqt9rd9',
  zzzzz: '46gn7efv',
  aback: 'y9k8jjyh'
};

/** A spread-out sample, so a failure is not confined to one corner of the space. */
function sample(size: number): string[] {
  const step = Math.floor(dictionary.length / size);
  return dictionary.filter((_, index) => index % step === 0).slice(0, size);
}

/*
 * sharing.allium — the `AnswerObfuscation` contract. This is obfuscation and
 * not encryption: decision 0005 says so, and anyone who reads the codec holds
 * the means to decode a token.
 */
describe('the answer codec', () => {
  it('round-trips every word in the guess dictionary', () => {
    const broken = dictionary.filter((word) => decodeToken(encodeAnswer(word)) !== word);

    expect(broken).toEqual([]);
  });

  // TheUrlCarriesTheTokenAndNothingElseAboutTheAnswer: not even the length of
  // the word beyond the fixed word length, which every token already shares.
  it('gives every word a token of the same length, from one alphabet', () => {
    const lengths = new Set(dictionary.map((word) => encodeAnswer(word).length));
    const characters = new Set(dictionary.flatMap((word) => [...encodeAnswer(word)]));

    expect([...lengths]).toEqual([TOKEN_LENGTH]);
    expect([...characters].every((character) => TOKEN_ALPHABET.includes(character))).toBe(true);
  });

  // AnswerIsNotReadableFromTheToken, first half: the word is not in there.
  it('never carries the answer as text', () => {
    const leaking = dictionary.filter((word) => encodeAnswer(word).includes(word));

    expect(leaking).toEqual([]);
  });

  /*
   * AnswerIsNotReadableFromTheToken, second half. "Cannot be read off by eye"
   * resists a direct assertion, so this measures what would make reading
   * possible: a mapping that preserves order or keeps neighbours close. Words
   * adjacent in the dictionary differ by a letter or two, and their tokens must
   * not.
   */
  it('scatters words that sit next to each other in the dictionary', () => {
    const run = dictionary.slice(400, 600);
    const byToken = [...run].sort((a, b) => encodeAnswer(a).localeCompare(encodeAnswer(b)));

    expect(byToken).not.toEqual(run);

    const tooClose = run.slice(0, -1).filter((word, index) => {
      const next = run[index + 1] as string;
      const [here, there] = [encodeAnswer(word), encodeAnswer(next)];
      return [...here].filter((character, at) => character !== there[at]).length < 3;
    });

    expect(tooClose).toEqual([]);
  });

  it('is deterministic', () => {
    expect(encodeAnswer('apple')).toBe(encodeAnswer('apple'));
  });

  it('refuses to encode anything that is not a word', () => {
    expect(() => encodeAnswer('APPLE')).toThrow(/lowercase/);
    expect(() => encodeAnswer('app')).toThrow(/lowercase/);
  });
});

describe('decoding a token this scheme did not produce', () => {
  // DecodeRejectsWhatItDidNotProduce.
  it('rejects a token of the wrong length', () => {
    const token = encodeAnswer('apple');

    expect(decodeToken(token.slice(1))).toBeNull();
    expect(decodeToken(`${token}a`)).toBeNull();
    expect(decodeToken('')).toBeNull();
  });

  it('rejects characters outside the alphabet, including the case it never emits', () => {
    const token = encodeAnswer('apple');

    expect(decodeToken(token.toUpperCase())).toBeNull();
    expect(decodeToken(`${token.slice(1)}-`)).toBeNull();
    expect(decodeToken(`${token.slice(1)}i`)).toBeNull();
  });

  /*
   * An altered token. The checksum is sixteen bits and the permutation covers a
   * twenty-four bit space of which 26^5 values name a word, so roughly one
   * alteration in ninety thousand survives both tests by chance — a fraction of
   * one expected acceptance over the sweep below. What must never happen is an
   * alteration decoding back to the word it came from: an altered link becoming
   * the same game would hide the alteration rather than report it.
   */
  it('rejects an altered token, and never decodes one back to its own word', () => {
    let accepted = 0;

    for (const word of sample(40)) {
      const token = encodeAnswer(word);

      for (let at = 0; at < TOKEN_LENGTH; at += 1) {
        for (const character of TOKEN_ALPHABET) {
          if (character === token[at]) {
            continue;
          }
          const decoded = decodeToken(`${token.slice(0, at)}${character}${token.slice(at + 1)}`);

          expect(decoded).not.toBe(word);
          if (decoded !== null) {
            accepted += 1;
          }
        }
      }
    }

    expect(accepted).toBeLessThanOrEqual(2);
  });

  it('never invents anything that is not a word', () => {
    const invented = [...TOKEN_ALPHABET]
      .flatMap((first) =>
        [...TOKEN_ALPHABET].map((second) => `${first}${second}wxyz2345`.slice(0, TOKEN_LENGTH))
      )
      .map((token) => decodeToken(token))
      .filter((decoded): decoded is string => decoded !== null)
      .filter((decoded) => !isWordText(decoded));

    expect(invented).toEqual([]);
  });
});

/*
 * words.allium — ReplacingTheListsBreaksNothingAlreadyInPlay: "a custom link
 * issued by an earlier release still decodes to a word that can be played". The
 * codec is therefore a function of the letters alone. A token naming a position
 * in the dictionary would satisfy every other invariant here and fail this one,
 * because the list is sorted and adding a word shifts every position after it.
 */
describe('a link outliving the release that made it', () => {
  it('encodes words the dictionary has never held', () => {
    expect(words.guessWords().has('zzzzz')).toBe(false);
    expect(decodeToken(encodeAnswer('zzzzz'))).toBe('zzzzz');
  });

  it('decodes tokens issued by earlier builds', () => {
    for (const [word, token] of Object.entries(PINNED_TOKENS)) {
      expect(encodeAnswer(word)).toBe(token);
      expect(decodeToken(token)).toBe(word);
    }
  });
});

describe('the custom game link', () => {
  it('carries the token in the query string and nothing else about the answer', () => {
    const token = encodeAnswer('apple');
    const url = customGameUrl(token, PAGE);

    expect(url).toBe(`${PAGE}?${CUSTOM_GAME_PARAM}=${token}`);
    expect(url).not.toContain('apple');
  });

  it('resolves back to the same token', () => {
    const token = encodeAnswer('apple');

    expect(tokenFromUrl(customGameUrl(token, PAGE))).toBe(token);
  });

  it('drops anything the page was already carrying', () => {
    const token = encodeAnswer('apple');

    expect(customGameUrl(token, `${PAGE}?debug=1#board`)).toBe(
      `${PAGE}?${CUSTOM_GAME_PARAM}=${token}`
    );
  });

  it('finds no token when there is none', () => {
    expect(tokenFromUrl(PAGE)).toBeNull();
    expect(tokenFromUrl(`${PAGE}?other=1`)).toBeNull();
    expect(tokenFromUrl(`${PAGE}?${CUSTOM_GAME_PARAM}=`)).toBeNull();
  });

  it('hands back whatever was in the parameter, and lets decoding judge it', () => {
    expect(tokenFromUrl(`${PAGE}?${CUSTOM_GAME_PARAM}=not-a-token`)).toBe('not-a-token');
    expect(decodeToken('not-a-token')).toBeNull();
  });
});
