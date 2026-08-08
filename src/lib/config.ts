/**
 * Values the specifications declare in their `config` blocks.
 *
 * These are the only numbers in the implementation that a specification also
 * states, so they live in one place and are named after the spec parameter
 * they mirror. Changing one here without changing it in `docs/specs/` is drift.
 */

/** `words.allium` — `config.word_length`. */
export const WORD_LENGTH = 5;

/** `game.allium` — `config.max_attempts`. */
export const MAX_ATTEMPTS = 6;
