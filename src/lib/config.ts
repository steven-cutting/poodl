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
