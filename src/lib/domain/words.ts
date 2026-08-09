import { WORD_LENGTH } from '$lib/config';

/**
 * The shape every entry in either list has to satisfy.
 *
 * `docs/specs/words.allium` states it as two invariants on the `Word` entity —
 * `EntryIsWordLength` and `EntryIsLowercase` — and the `WordListSource`
 * contract repeats it as `EveryEntryIsAFiveLetterLowercaseWord`. Built from
 * `WORD_LENGTH` rather than written out, so the two cannot drift apart.
 */
const WORD_SHAPE = new RegExp(`^[a-z]{${WORD_LENGTH}}$`);

/** Whether this text could be a Poodl word: five lowercase English letters. */
export function isWordText(text: string): boolean {
  return WORD_SHAPE.test(text);
}

/**
 * The letter at a one-based position, as the specifications count them.
 *
 * `letter_at` in `game.allium` is always applied to a word of the right shape,
 * so an out-of-range position cannot arise; the empty string it would return is
 * not a case any caller distinguishes.
 */
export function letterAt(text: string, position: number): string {
  return text.charAt(position - 1);
}

/** `contains_letter` in `game.allium`: whether the word holds it anywhere. */
export function containsLetter(text: string, letter: string): boolean {
  return text.includes(letter);
}
