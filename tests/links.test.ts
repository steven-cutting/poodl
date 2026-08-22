import { describe, expect, it } from 'vitest';

import { CUSTOM_GAME_PARAM, customGameUrl, tokenFromUrl } from '../src/lib/domain/links';
import {
  TOKEN_ALPHABET,
  TOKEN_LENGTH,
  decodeToken,
  encodeAnswer
} from '../src/lib/domain/obfuscation';
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
   * `DecodeRejectsWhatItDidNotProduce` and `AlterationIsDetectedToABound`, over
   * every single-character alteration of every word in the list rather than a
   * sample: 15,029 words, eight positions, thirty-one substitutions apiece.
   *
   * The two counts asserted are the two the specification states absolutely,
   * and neither is a matter of luck. An altered token cannot decode back to its
   * own word because the codec is a function — the same word always produces
   * the same token, so a different token cannot yield it — and an altered link
   * that became the same game would hide the alteration rather than report it.
   * A survivor that named a guess word would start a different custom game;
   * every other survivor reaches `RejectInvalidCustomLink`, which requires the
   * decoded word to be in the dictionary.
   *
   * The survivors themselves are counted rather than forbidden, because
   * `AlterationIsDetectedToABound` promises a bound and not their absence. The
   * bound asserted here is far looser than the sixteen this sweep actually
   * finds, so it reports a scheme that got worse without failing whenever the
   * check value happens to shift.
   */
  it('never decodes an altered token to its own word, or to any playable game', () => {
    const playable = new Set(dictionary);
    let survivors = 0;
    let ownWord = 0;
    let startsAGame = 0;
    let altered = 0;

    for (const word of dictionary) {
      const token = encodeAnswer(word);

      for (let at = 0; at < TOKEN_LENGTH; at += 1) {
        const before = token.slice(0, at);
        const after = token.slice(at + 1);

        for (const character of TOKEN_ALPHABET) {
          if (character === token[at]) {
            continue;
          }
          altered += 1;
          const decoded = decodeToken(`${before}${character}${after}`);

          if (decoded === null) {
            continue;
          }
          survivors += 1;
          if (decoded === word) {
            ownWord += 1;
          }
          if (playable.has(decoded)) {
            startsAGame += 1;
          }
        }
      }
    }

    expect(altered).toBe(dictionary.length * TOKEN_LENGTH * (TOKEN_ALPHABET.length - 1));
    expect(ownWord).toBe(0);
    expect(startsAGame).toBe(0);
    // One in sixty-five thousand is the stated bound; this sweep finds sixteen.
    expect(survivors).toBeLessThan(altered / 65536);
  });

  /*
   * DecodeRejectsWhatItDidNotProduce: "it never invents a word."
   *
   * The permutation covers all of [0, 2^24) and only its first 26^5 values name
   * one, so the guard that refuses the rest is the whole of this promise. These
   * three tokens are the only kind that can reach it: each carries its own
   * correct checksum, so the integrity tag passes, and each unpermutes to a
   * value outside the word space — 26^5, the one after it, and the last value
   * there is. Pinned as literals for the same reason the round-trip above is:
   * recomputing them here would be asking the codec whether it agrees with
   * itself. Sweeping constructed tokens cannot stand in for this, because
   * nothing that fails the checksum ever reaches the guard.
   */
  it('never invents anything that is not a word', () => {
    for (const token of ['9ypykama', 'c68ny5y7', 'sm6wx0j5']) {
      expect(decodeToken(token)).toBeNull();
    }
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

  it('finds no token when the parameter is absent', () => {
    expect(tokenFromUrl(PAGE)).toBeNull();
    expect(tokenFromUrl(`${PAGE}?other=1`)).toBeNull();
  });

  it('hands back whatever was in the parameter, and lets decoding judge it', () => {
    expect(tokenFromUrl(`${PAGE}?${CUSTOM_GAME_PARAM}=not-a-token`)).toBe('not-a-token');
    expect(decodeToken('not-a-token')).toBeNull();
  });

  /*
   * A parameter that is there and empty is a link that lost its token on the
   * way, not a page without one. Absent is null; empty is the empty token, and
   * RejectInvalidCustomLink refuses it with an explanation rather than the
   * player landing on an ordinary game and never being told.
   */
  it('tells a present but empty parameter apart from an absent one', () => {
    expect(tokenFromUrl(`${PAGE}?${CUSTOM_GAME_PARAM}=`)).toBe('');
    expect(decodeToken('')).toBeNull();
  });
});
