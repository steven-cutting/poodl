/**
 * Board and keyboard fixtures for the stories.
 *
 * Every fixture is scored by the real `scoreGuess`, so no story can show a
 * result the `GuessScoring` contract in `docs/specs/game.allium` would not
 * produce. Hand-written `LetterResult` arrays would drift the first time
 * scoring changed; these cannot.
 *
 * Imports are relative rather than through `$lib`, matching `tests/` — the
 * other place in this repository that reaches into `src/` from outside it.
 */

import { keyboardKnowledge } from '../src/lib/domain/keyboard';
import { scoreGuess } from '../src/lib/domain/scoring';
import type { KeyKnowledge, ScoredGuess } from '../src/lib/domain/types';

/** The answer every board in the stories is played against. */
export const ANSWER = 'apple';

/** Score words against `ANSWER`, in the order they were played. */
export function played(words: readonly string[]): ScoredGuess[] {
  return words.map((word) => ({ results: scoreGuess(word, ANSWER) }));
}

/** What the guesses so far have revealed, one entry per letter of the alphabet. */
export function knownFrom(words: readonly string[]): KeyKnowledge[] {
  return keyboardKnowledge(played(words));
}

/** Two guesses in: A is placed, P and L are in the word, D O T R M are not. */
export const IN_PROGRESS: readonly string[] = ['adopt', 'alarm'];

/** Won on the third attempt. */
export const WON: readonly string[] = ['adopt', 'alarm', 'apple'];

/**
 * Six attempts spent and none of them the answer. `apply` is deliberately last:
 * it misses APPLE by its final letter, which is the losing board worth looking
 * at.
 */
export const LOST: readonly string[] = ['adopt', 'alarm', 'again', 'aroma', 'aside', 'apply'];

/*
 * Game states for the surfaces built after the board.
 *
 * Assembled here rather than driven through the engine, because a story is a
 * fixture: what a surface must show is the interesting part, and how the state
 * came about is the engine suite's business.
 */

import { EMPTY_POOL } from '../src/lib/domain/answerPool';
import { EMPTY_STATISTICS, recordLoss, recordWin } from '../src/lib/domain/statistics';
import { DEFAULT_SETTINGS } from '../src/lib/app/state';
import type { GameState } from '../src/lib/app/state';
import type { GameMode, Guess } from '../src/lib/domain/types';

function guessesFrom(playedWords: readonly string[]): Guess[] {
  return playedWords.map((word, index) => ({
    position: index + 1,
    word,
    results: scoreGuess(word, ANSWER)
  }));
}

function game(
  playedWords: readonly string[],
  status: GameState['status'],
  overrides: Partial<GameState> = {}
): GameState {
  return {
    mode: 'random',
    answer: ANSWER,
    status,
    hardModeAtStart: false,
    hardModeReleased: false,
    currentInput: '',
    startedAt: 0,
    completedAt: status === 'in_progress' ? null : 1,
    autoContinueAt: null,
    guesses: guessesFrom(playedWords),
    ...overrides
  };
}

/** Two guesses in, with APP typed into the third row. */
export const PLAYING: GameState = game(IN_PROGRESS, 'in_progress', { currentInput: 'app' });

/** Won on the third attempt. */
export const WON_GAME: GameState = game(WON, 'won');

/** Every attempt spent, and none of them the answer. */
export const LOST_GAME: GameState = game(LOST, 'lost');

/** A word somebody else set, still being played. */
export const CUSTOM_GAME: GameState = game(IN_PROGRESS, 'in_progress', { mode: 'custom' });

/** A mode a surface can be shown in without a game behind it. */
export const MODES: readonly GameMode[] = ['random', 'endless', 'practice', 'custom'];

export const SETTINGS = { ...DEFAULT_SETTINGS };

/** Enough play for every number on the panel to be worth reading. */
export const STATISTICS = [3, 4, 4, 5, 3, 4].reduce(
  (statistics, attempts) => recordWin(statistics, attempts),
  EMPTY_STATISTICS
);

export const STATISTICS_WITH_A_LOSS = recordLoss(STATISTICS);

export const POOL = EMPTY_POOL;

/** A link the codec really produced, so no story shows a token it could not. */
export const LINK = 'https://steven-cutting.github.io/poodl/?g=yrqt9rd9';
