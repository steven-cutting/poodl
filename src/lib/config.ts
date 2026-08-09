/**
 * Values the specifications declare in their `config` blocks.
 *
 * These are the only numbers in the implementation that a specification also
 * states, so they live in one place and are named after the spec parameter
 * they mirror. Changing one here without changing it in `docs/specs/` is drift.
 */

/** `words.allium` — `config.word_length`. */
export const WORD_LENGTH = 5;

/**
 * `words.allium` — `config.min_answer_words` and `config.min_guess_words`.
 *
 * Floors, not targets. They exist so that a truncated or half-written data file
 * fails outright instead of shipping as a vocabulary small enough to repeat
 * answers within a sitting.
 */
export const MIN_ANSWER_WORDS = 2000;
export const MIN_GUESS_WORDS = 10000;

/** `game.allium` — `config.max_attempts`. */
export const MAX_ATTEMPTS = 6;

/**
 * `game.allium` — `config.endless_countdown`, in milliseconds.
 *
 * Long enough to read the answer and the attempt count, and to leave a screen
 * reader room to finish announcing the conclusion, without making endless feel
 * as though it has stalled.
 */
export const ENDLESS_COUNTDOWN_MS = 10_000;

/** `sharing.allium` — `config.share_heading` and `config.custom_marker`. */
export const SHARE_HEADING = 'Poodl';
export const CUSTOM_MARKER = 'custom';

/** `sharing.allium` — the two tile palettes. Absent is the same in both. */
export const STANDARD_CORRECT_TILE = '🟩';
export const STANDARD_PRESENT_TILE = '🟨';
export const HIGH_CONTRAST_CORRECT_TILE = '🟧';
export const HIGH_CONTRAST_PRESENT_TILE = '🟦';
export const ABSENT_TILE = '⬛';
