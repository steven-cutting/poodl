/** Domain vocabulary shared by scoring, the keyboard, and the components. */

/** `game.allium` — the `LetterMark` enumeration. */
export type LetterMark = 'correct' | 'present' | 'absent';

/** `game.allium` — the `GameMode` enumeration: every mode a game can have. */
export type GameMode = 'random' | 'endless' | 'practice' | 'custom' | 'daily';

/**
 * `game.allium` — the `StartableMode` enumeration: what a player may ask to
 * start. Custom is deliberately absent, which is what makes asking for a custom
 * game unrepresentable rather than merely refused. Daily is present: choosing
 * it is always a valid request, even though it may resolve to returning to a
 * kept game rather than starting a new one.
 */
export type StartableMode = 'random' | 'endless' | 'practice' | 'daily';

/** `game.allium` — the states of `Game.status`. */
export type GameStatus = 'in_progress' | 'won' | 'lost' | 'abandoned';

/** `game.allium` — the `GuessRejectionReason` enumeration. */
export type GuessRejectionReason = 'incomplete' | 'not_in_dictionary' | 'hard_mode_violation';

/**
 * `appearance.allium` — the `ThemeChoice` enumeration, which the platform
 * declares and `settings.allium` restates. Re-exported rather than imported
 * everywhere, so the vocabulary a component renders is still named in one
 * place.
 */
export type { ThemeChoice } from '@steven-cutting/biscuit-games';

/** `sharing.allium` — the `SharePalette` enumeration. */
export type SharePalette = 'standard' | 'high_contrast';

/** `game.allium` — the `LetterResult` value type. Positions are 1-based. */
export interface LetterResult {
  position: number;
  letter: string;
  mark: LetterMark;
}

/**
 * `game.allium` — the `KeyKnowledge` value type. A null status means the letter
 * has not appeared in any submitted guess.
 */
export interface KeyKnowledge {
  letter: string;
  status: LetterMark | null;
}

/**
 * The part of a submitted guess that scoring and the keyboard care about.
 * `game.allium`'s `Guess` entity carries more; nothing here needs it.
 */
export interface ScoredGuess {
  results: readonly LetterResult[];
}

/**
 * `game.allium`'s `Guess` entity, less its back reference to the game.
 * `position` is the attempt number and counts from one.
 */
export interface Guess extends ScoredGuess {
  position: number;
  word: string;
}
