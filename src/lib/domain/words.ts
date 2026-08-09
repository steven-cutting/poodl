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
 * The same shape, part way through: a word being typed.
 *
 * `PlayerEntersLetter` in `game.allium` guards `is_letter(letter)` and appends
 * `lowercase(letter)`, and `InputNeverExceedsWordLength` bounds the result, so
 * these are the only values `current_input` can hold. Stated once here for the
 * same reason the whole word is, and used where input arrives from somewhere
 * other than that rule — which is only ever storage.
 */
const PARTIAL_SHAPE = new RegExp(`^[a-z]{0,${WORD_LENGTH}}$`);

/** Whether this text could be a Poodl word in progress, the empty one included. */
export function isPartialWordText(text: string): boolean {
  return PARTIAL_SHAPE.test(text);
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
