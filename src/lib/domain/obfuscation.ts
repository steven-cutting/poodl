import { WORD_LENGTH } from '$lib/config';
import { isWordText } from '$lib/domain/words';

/**
 * Turning an answer into something that can sit in a URL without giving the
 * game away.
 *
 * This realises the codec half of the `AnswerObfuscation` contract in
 * `docs/specs/sharing.allium`. It is obfuscation and not encryption —
 * `docs/decisions/0005-obfuscation-not-security.md` says so plainly, and
 * anyone who reads this file can decode a token. The threat model is idle
 * curiosity and a glance at the address bar.
 *
 * The four invariants of the contract, taken together, fix the shape:
 *
 * - `Roundtrip` wants a bijection, so nothing may be thrown away. A balanced
 *   Feistel network is one **by construction**, for any round function at all,
 *   which makes the property provable rather than tested-and-hoped.
 * - `AnswerIsNotReadableFromTheToken` wants the letters mixed, so that two
 *   words a letter apart do not produce two tokens a character apart. Three
 *   Feistel rounds do that; one or two leave a half of the input in place.
 * - `DecodeRejectsWhatItDidNotProduce` wants an integrity tag, so a token that
 *   was altered on the way is refused rather than decoded into some other word.
 * - `TheUrlCarriesTheTokenAndNothingElseAboutTheAnswer` wants a fixed length,
 *   so the token itself says nothing beyond the word length every Poodl word
 *   shares.
 *
 * The arithmetic then chooses its own sizes. A word is one of 26^5 values,
 * which needs 24 bits; a 16-bit checksum brings the pair to exactly 40 bits;
 * and 40 bits is exactly eight base32 characters, so every token has one
 * encoding and no spare bits. Everything stays below 2^53, so ordinary `Number`
 * arithmetic is exact and no BigInt is needed.
 *
 * The codec never consults a word list. That is what lets a link issued by an
 * earlier release still decode — `words.allium` promises exactly that in
 * `ReplacingTheListsBreaksNothingAlreadyInPlay`, and a token naming a position
 * in the sorted dictionary could not keep the promise.
 */

/**
 * Crockford's base32 alphabet in lower case: the digits and the letters, less
 * `i`, `l`, `o` and `u`. The first three are where reading a token aloud or
 * retyping it goes wrong, and dropping `u` keeps the alphabet from spelling
 * things it did not mean to.
 */
// Annotated as `string` rather than left to infer its literal type, so that
// iterating it is covered by the no-misused-spread allowance in eslint.config.js,
// exactly as `src/lib/domain/keyboard.ts` does with the alphabet.
export const TOKEN_ALPHABET: string = '0123456789abcdefghjkmnpqrstvwxyz';

/** Every token is this long, whatever the word, so the length reveals nothing. */
export const TOKEN_LENGTH = 8;

const ALPHABET_SIZE = 26;
/** The code unit of `a`. Poodl's vocabulary is ASCII, so this is exact. */
const LETTER_A = 97;
const WORD_SPACE = ALPHABET_SIZE ** WORD_LENGTH;

// Two twelve-bit halves, so the network permutes the whole of [0, 2^24) — the
// smallest power of two that holds every word.
const HALF_BITS = 12;
const HALF_SIZE = 2 ** HALF_BITS;

// Three rounds, three different keys. The keys are arbitrary constants; what
// matters is that they differ, so the rounds do not undo one another.
const ROUND_KEYS: readonly number[] = [0x1f7, 0xb3d, 0x6a9];

// Knuth's multiplicative constant. The round function need not be strong — the
// Feistel is a bijection whatever it does — only well mixed.
const KNUTH = 2654435761;

const CHECKSUM_SIZE = 0x1_0000;

/** `AnswerObfuscation.encode`. */
export function encodeAnswer(answer: string): string {
  if (!isWordText(answer)) {
    throw new Error(`encodeAnswer expects ${WORD_LENGTH} lowercase letters`);
  }

  const mixed = permute(toNumber(answer));
  return toBase32(mixed * CHECKSUM_SIZE + checksum(mixed));
}

/**
 * `AnswerObfuscation.decode`. Null for anything this scheme did not produce,
 * and for anything altered on the way; never a word it invented.
 */
export function decodeToken(token: string): string | null {
  const value = fromBase32(token);
  if (value === null) {
    return null;
  }

  const mixed = Math.floor(value / CHECKSUM_SIZE);
  if (value % CHECKSUM_SIZE !== checksum(mixed)) {
    return null;
  }

  // The permutation covers all of [0, 2^24), and only its first 26^5 values
  // name a word. The rest are tokens the scheme could not have produced.
  const number = unpermute(mixed);
  return number < WORD_SPACE ? toWord(number) : null;
}

/** The word as a base-26 number, first letter most significant. */
function toNumber(answer: string): number {
  return [...answer].reduce(
    (total, letter) => total * ALPHABET_SIZE + (letter.charCodeAt(0) - LETTER_A),
    0
  );
}

function toWord(number: number): string {
  const letters: string[] = [];
  let rest = number;

  for (let position = 0; position < WORD_LENGTH; position += 1) {
    letters.unshift(String.fromCharCode(LETTER_A + (rest % ALPHABET_SIZE)));
    rest = Math.floor(rest / ALPHABET_SIZE);
  }

  return letters.join('');
}

function round(half: number, key: number): number {
  return Math.floor(((half + key) * KNUTH) / HALF_SIZE) % HALF_SIZE;
}

/** A balanced Feistel network: a bijection on [0, 2^24) for any round function. */
function permute(number: number): number {
  let left = Math.floor(number / HALF_SIZE);
  let right = number % HALF_SIZE;

  for (const key of ROUND_KEYS) {
    [left, right] = [right, left ^ round(right, key)];
  }

  return left * HALF_SIZE + right;
}

/** The same network with its rounds run backwards. */
function unpermute(mixed: number): number {
  let left = Math.floor(mixed / HALF_SIZE);
  let right = mixed % HALF_SIZE;

  for (const key of [...ROUND_KEYS].reverse()) {
    [left, right] = [right ^ round(left, key), left];
  }

  return left * HALF_SIZE + right;
}

/**
 * Sixteen bits of integrity tag. Not a cryptographic digest and not claimed to
 * be one: it exists so that an altered token is refused rather than decoded
 * into a different game.
 *
 * Every bit of `mixed` has to reach the result, which is the whole difficulty.
 * A cheaper tag whose product wrapped at 2^32 left the top of `mixed` barely
 * represented, and alterations to a token's leading characters — which are
 * exactly the ones carrying those bits — survived it at around one in a
 * hundred and forty rather than one in ninety thousand. Multiplying below the
 * exact-integer ceiling and folding three windows of the product together
 * fixes that: `SPREAD` is under 2^29 and `mixed` under 2^24, so the product
 * stays under 2^53 and no precision is lost.
 */
function checksum(mixed: number): number {
  const spread = (mixed ^ 0x5b_d1e9) * 0x1b87_3593;
  const low = spread % CHECKSUM_SIZE;
  const middle = Math.floor(spread / CHECKSUM_SIZE) % CHECKSUM_SIZE;
  const high = Math.floor(spread / 0x1_0000_0000) % CHECKSUM_SIZE;

  // Three values below 2^16, so their exclusive-or is below 2^16 too.
  return low ^ middle ^ high;
}

function toBase32(value: number): string {
  const characters: string[] = [];
  let rest = value;

  for (let place = 0; place < TOKEN_LENGTH; place += 1) {
    characters.unshift(TOKEN_ALPHABET.charAt(rest % 32));
    rest = Math.floor(rest / 32);
  }

  return characters.join('');
}

/** Null unless the token is exactly what `toBase32` emits: length and alphabet both. */
function fromBase32(token: string): number | null {
  if (token.length !== TOKEN_LENGTH) {
    return null;
  }

  let value = 0;
  for (const character of token) {
    const digit = TOKEN_ALPHABET.indexOf(character);
    if (digit === -1) {
      return null;
    }
    value = value * 32 + digit;
  }

  // 32^8 is 2^40 and the packed value is below 2^24 * 2^16, which is the same
  // number, so every eight-character token is in range and this needs no guard.
  return value;
}
