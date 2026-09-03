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
 * `words.allium` — `config.game_name`.
 *
 * The game's own name, and the only word any specification names.
 * `GameNameIsInTheAnswerList` makes it an ordinary answer word: it can be typed,
 * drawn and sent as a custom link. It is deliberately not derived from
 * `SHARE_HEADING`, which is a separate entry in a separate specification.
 */
export const GAME_NAME = 'poodl';

/**
 * `words.allium` — `config.min_answer_words` and `config.min_guess_words`.
 *
 * Floors, not targets. They exist so that a truncated or half-written data file
 * fails outright instead of shipping as a vocabulary small enough to repeat
 * answers within a sitting.
 */
export const MIN_ANSWER_WORDS = 1000;
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

/**
 * `game.allium` — `config.minimum_touch_target`, in CSS pixels.
 *
 * Across a control, in both directions, for
 * `DirectManipulation.EveryControlIsAComfortableTarget`. The on-screen keyboard
 * is the one place this cannot be met in both, which is why that invariant says
 * what happens instead rather than stating a size alone.
 */
export const MINIMUM_TOUCH_TARGET = 44;

/**
 * `game.allium` — `config.narrowest_supported_width`, in CSS pixels.
 *
 * The narrowest viewport the game is playable on without scrolling sideways,
 * which is the width every target and spacing figure has to survive.
 */
export const NARROWEST_SUPPORTED_WIDTH = 320;

/**
 * `game.allium` — the four contrast floors, as WCAG 2.2 computes a ratio.
 *
 * The first two are the AA bars: text against what is behind it, and anything
 * that is not text — a control's boundary, a state indicator — against what is
 * adjacent to it.
 */
export const MINIMUM_TEXT_CONTRAST = 4.5;
export const MINIMUM_BOUNDARY_CONTRAST = 3.0;

/**
 * `game.allium` — `config.minimum_state_separation`.
 *
 * How far a key nothing is known about sits from one that has been scored. No
 * standard supplies this figure, because standards ask a colour to stand off
 * its background rather than off another state, and a keyboard's states sit
 * side by side.
 */
export const MINIMUM_STATE_SEPARATION = 3.0;

/**
 * `game.allium` — `config.minimum_mark_separation`.
 *
 * How far absent sits from correct, and that pair only. Lower than the figure
 * above deliberately: four states 3 to one apart would need a range of 27 to
 * one, which no palette has. The specification's own reasoning for the gap is
 * worth reading before either number is touched.
 */
export const MINIMUM_MARK_SEPARATION = 2.0;

/** `sharing.allium` — `config.share_heading` and `config.custom_marker`. */
export const SHARE_HEADING = 'Poodl';
export const CUSTOM_MARKER = 'custom';

/** `sharing.allium` — `config.daily_marker`. */
export const DAILY_MARKER = 'daily';

/**
 * `daily.allium` — `config.epoch_date`.
 *
 * Day 1 of the schedule. Moving this renumbers every day, so it is fixed
 * before the mode ships, not something a later change adjusts casually.
 */
export const EPOCH_DATE = '2026-09-01';

/**
 * `daily.allium` — `config.calendar_zone`.
 *
 * `TheDayTurnsAtLocalMidnight` in this zone, for every player everywhere —
 * `Deterministic` rules out the device's own zone, which is why this is a
 * fixed config value rather than something read from the platform.
 */
export const CALENDAR_ZONE = 'America/Los_Angeles';

/** `sharing.allium` — the two tile palettes. Absent is the same in both. */
export const STANDARD_CORRECT_TILE = '🟩';
export const STANDARD_PRESENT_TILE = '🟨';
export const HIGH_CONTRAST_CORRECT_TILE = '🟧';
export const HIGH_CONTRAST_PRESENT_TILE = '🟦';
export const ABSENT_TILE = '⬛';
