import { DEFAULT_SETTINGS, createInitialState } from '$lib/app/state';
import type { AppState, GameState, Settings } from '$lib/app/state';
import { MAX_ATTEMPTS, WORD_LENGTH } from '$lib/config';
import { EMPTY_POOL } from '$lib/domain/answerPool';
import type { AnswerPool } from '$lib/domain/answerPool';
import { EMPTY_DAILY_STATISTICS } from '$lib/domain/dailyStatistics';
import type { DailyStatistics } from '$lib/domain/dailyStatistics';
import { EMPTY_STATISTICS } from '$lib/domain/statistics';
import type { Statistics } from '$lib/domain/statistics';
import type { GameMode, Guess, StartableMode } from '$lib/domain/types';
import { scoreGuess } from '$lib/domain/scoring';
import { isPartialWordText, isWordText } from '$lib/domain/words';
import type { StoragePort } from '$lib/ports/storage';

/**
 * Everything Poodl remembers between sessions.
 *
 * Four guarantees ask for this between them — `InProgressGameSurvivesReload`,
 * `ThePreviousModeSurvivesBetweenSessions`, `SettingsPersistBetweenSessions`
 * and `StatisticsPersistBetweenSessions` — and there is no server, so all of it
 * lives on the device behind the storage port.
 *
 * Loading is deliberately forgiving in one direction only. Storage is a place
 * other software can write to and an older Poodl may already have written to,
 * so nothing read from it is believed without being checked; but a section that
 * does not survive its check costs only that section, because losing a whole
 * history to one damaged field would be the worse failure. Nothing here throws:
 * a device with unreadable storage is a device that starts a new game.
 */

/** One key, with the schema version inside it rather than in its name. */
export const STORAGE_KEY = 'poodl';

/** Raised whenever the stored shape stops being readable by this code. */
const SCHEMA_VERSION = 1;

interface Stored {
  version: number;
  lastMode: StartableMode | null;
  game: GameState | null;
  setAsideDaily: GameState | null;
  settings: Settings;
  statistics: Statistics;
  dailyStatistics: DailyStatistics;
  pool: AnswerPool;
}

/**
 * What is deliberately not stored:
 *
 * - `awaiting_welcome`, because `ShowWelcomeOnOpening` decides it on every
 *   arrival and a stored answer would be a second, staler opinion.
 * - `auto_continue_at`, because a countdown that outlived the session would
 *   elapse on the next arrival and start a game — and
 *   `OpeningPoodlLandsOnTheWelcomeScreen` says no game begins without the
 *   player asking for one. The modal simply stays put, as a stopped countdown
 *   leaves it.
 * - the notice and the announcement, which exist for as long as Poodl is saying
 *   them.
 * - the shareable and the copy it is waiting on. `NothingAboutTheLinkIsKept`
 *   requires exactly that of a custom link: it lasts as long as it takes to copy
 *   it, and a reload is the end of it.
 */
export function saveState(storage: StoragePort, state: AppState): void {
  const stored: Stored = {
    version: SCHEMA_VERSION,
    lastMode: state.lastMode,
    game: state.currentGame === null ? null : { ...state.currentGame, autoContinueAt: null },
    setAsideDaily: state.setAsideDaily,
    settings: state.settings,
    statistics: state.statistics,
    dailyStatistics: state.dailyStatistics,
    pool: state.pool
  };

  storage.write(STORAGE_KEY, JSON.stringify(stored));
}

const ALL_MODES: readonly GameMode[] = ['random', 'endless', 'practice', 'custom', 'daily'];

/** The state a device holds, or a fresh one when it holds nothing usable. */
export function loadState(storage: StoragePort): AppState {
  const initial = createInitialState();
  const raw = storage.read(STORAGE_KEY);

  if (raw === null) {
    return initial;
  }

  const stored = parseJson(raw);

  if (!isRecord(stored) || stored['version'] !== SCHEMA_VERSION) {
    return initial;
  }

  const currentGame = readGame(stored['game'], ALL_MODES);
  const setAsideDaily = readGame(stored['setAsideDaily'], ['daily']);

  return {
    ...initial,
    lastMode: readStartableMode(stored['lastMode']),
    currentGame,
    // ThereIsOnlyOneDailyGame: a blob where both slots hold a daily game
    // disagrees with itself — only damage or an older write could produce
    // it, and the one on the board wins.
    setAsideDaily: currentGame?.mode === 'daily' ? null : setAsideDaily,
    settings: readSettings(stored['settings']),
    statistics: readStatistics(stored['statistics']),
    dailyStatistics: readDailyStatistics(stored['dailyStatistics']),
    pool: readPool(stored['pool'])
  };
}

// ---------------------------------------------------------------- reading ---

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOneOf<Value extends string>(value: unknown, allowed: readonly Value[]): value is Value {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function readStartableMode(value: unknown): StartableMode | null {
  return isOneOf(value, ['random', 'endless', 'practice', 'daily'] as const) ? value : null;
}

function readSettings(value: unknown): Settings {
  if (!isRecord(value)) {
    return { ...DEFAULT_SETTINGS };
  }

  const booleans = ['highContrast', 'hardMode', 'animations', 'physicalKeyboard', 'showWelcome'];

  if (
    !isOneOf(value['theme'], ['system', 'light', 'dark'] as const) ||
    booleans.some((key) => typeof value[key] !== 'boolean')
  ) {
    return { ...DEFAULT_SETTINGS };
  }

  return {
    theme: value['theme'],
    highContrast: value['highContrast'] as boolean,
    hardMode: value['hardMode'] as boolean,
    animations: value['animations'] as boolean,
    physicalKeyboard: value['physicalKeyboard'] as boolean,
    showWelcome: value['showWelcome'] as boolean
  };
}

/**
 * A statistics block, or an empty one unless it is one `statistics.allium` says
 * can exist.
 *
 * Four numbers that are each a count on their own can still be a record no play
 * could produce, and the panel shows them without arguing: `Statistics.losses`
 * is `games_played - wins`, so more wins than games renders a negative number of
 * games lost. So the relations between them are read too, and each one below is
 * an invariant the specification states by name.
 *
 * Nothing Poodl writes can break them — `recordWin` moves the win and its bucket
 * together and `recordLoss` moves neither — so this costs a stored history
 * nothing and only refuses one that was never ours.
 */
function readStatistics(value: unknown): Statistics {
  if (!isRecord(value)) {
    return EMPTY_STATISTICS;
  }

  const distribution: unknown = value['distribution'];
  const counts = ['gamesPlayed', 'wins', 'currentStreak', 'maxStreak'];

  if (
    counts.some((key) => !isCount(value[key])) ||
    !Array.isArray(distribution) ||
    distribution.length !== MAX_ATTEMPTS ||
    !distribution.every((count) => isCount(count))
  ) {
    return EMPTY_STATISTICS;
  }

  const statistics: Statistics = {
    gamesPlayed: value['gamesPlayed'] as number,
    wins: value['wins'] as number,
    currentStreak: value['currentStreak'] as number,
    maxStreak: value['maxStreak'] as number,
    distribution: distribution
  };

  // Every count is already known to be a non-negative integer, which is the
  // other half of the first two invariants and the whole of the buckets'
  // `WinCountIsNeverNegative`.
  const counted = statistics.distribution.reduce((total, bucket) => total + bucket, 0);

  if (
    // `WinsFallWithinGamesPlayed`.
    statistics.wins > statistics.gamesPlayed ||
    // `CurrentStreakNeverExceedsMaximum`.
    statistics.currentStreak > statistics.maxStreak ||
    // `StreakCannotExceedWins`.
    statistics.currentStreak > statistics.wins ||
    // `DistributionAccountsForEveryWin`.
    counted !== statistics.wins
  ) {
    return EMPTY_STATISTICS;
  }

  return statistics;
}

/**
 * A daily statistics block, or an empty one unless it is one `daily.allium`
 * says can exist — the same five invariants `DailyStatistics` states by name,
 * mirroring `readStatistics` above. `AStreakImpliesAWin` has no counterpart on
 * the primary block: `Statistics` has no `last_won_day` for a streak to imply
 * anything about.
 */
function readDailyStatistics(value: unknown): DailyStatistics {
  if (!isRecord(value)) {
    return EMPTY_DAILY_STATISTICS;
  }

  const buckets: unknown = value['buckets'];
  const counts = ['daysPlayed', 'daysWon', 'currentStreak', 'maxStreak'];
  const lastWonDay: unknown = value['lastWonDay'];

  if (
    counts.some((key) => !isCount(value[key])) ||
    !(lastWonDay === null || isCount(lastWonDay)) ||
    !Array.isArray(buckets) ||
    buckets.length !== MAX_ATTEMPTS ||
    !buckets.every((count) => isCount(count))
  ) {
    return EMPTY_DAILY_STATISTICS;
  }

  const dailyStatistics: DailyStatistics = {
    daysPlayed: value['daysPlayed'] as number,
    daysWon: value['daysWon'] as number,
    currentStreak: value['currentStreak'] as number,
    maxStreak: value['maxStreak'] as number,
    lastWonDay: lastWonDay,
    buckets: buckets
  };

  const counted = dailyStatistics.buckets.reduce((total, bucket) => total + bucket, 0);

  if (
    // `WinsFallWithinDaysPlayed`.
    dailyStatistics.daysWon > dailyStatistics.daysPlayed ||
    // `CurrentStreakNeverExceedsMaximum`.
    dailyStatistics.currentStreak > dailyStatistics.maxStreak ||
    // `StreakCannotExceedWins`.
    dailyStatistics.currentStreak > dailyStatistics.daysWon ||
    // `DistributionAccountsForEveryWin`.
    counted !== dailyStatistics.daysWon ||
    // `AStreakImpliesAWin`.
    (dailyStatistics.currentStreak > 0 && dailyStatistics.lastWonDay === null)
  ) {
    return EMPTY_DAILY_STATISTICS;
  }

  return dailyStatistics;
}

function readPool(value: unknown): AnswerPool {
  if (
    !isRecord(value) ||
    !Array.isArray(value['used']) ||
    !value['used'].every((word) => typeof word === 'string' && isWordText(word)) ||
    typeof value['hasRecycled'] !== 'boolean'
  ) {
    return EMPTY_POOL;
  }

  return { used: value['used'] as string[], hasRecycled: value['hasRecycled'] };
}

/**
 * A stored game, or null unless it is one `game.allium` says can exist.
 *
 * The shape is only half of it. `Game` carries invariants relating its status
 * to its history, and a record that satisfies the types while breaking them is
 * not a game this code can play: an in-progress game holding every attempt is
 * never lost, because `AcceptGuess` tests the count for equality, and it goes
 * on spending attempts on a board that stopped drawing rows.
 *
 * The answer is read first because the rest is read against it: every stored
 * guess is scored again rather than believed, which is what makes the status
 * checks below mean anything.
 *
 * `abandoned` is absent from the statuses deliberately. Every retirement path
 * removes the game it retires unless it is daily, and
 * `OnlyTheCurrentAndTheDailyGameAreKept` is why nothing else could be kept.
 *
 * `allowedModes` restricts what a caller believes: the board accepts any of
 * the five modes, the set-aside slot only `daily` — `TheKeptDailyGameIsADailyGame`.
 */
function readGame(value: unknown, allowedModes: readonly GameMode[]): GameState | null {
  if (value === null || !isRecord(value)) {
    return null;
  }

  const answer: unknown = value['answer'];

  if (typeof answer !== 'string' || !isWordText(answer)) {
    return null;
  }

  const guesses = readGuesses(value['guesses'], answer);
  const input: unknown = value['currentInput'];
  const status: unknown = value['status'];

  if (
    guesses === null ||
    !isOneOf(value['mode'], allowedModes) ||
    !isOneOf(status, ['in_progress', 'won', 'lost'] as const) ||
    // The shape as well as the length. `PlayerEntersLetter` appends
    // `lowercase(letter)` behind an `is_letter` guard, so uppercase text,
    // punctuation or a digit is not input this game could have produced, and
    // the board would draw it as though it were.
    typeof input !== 'string' ||
    !isPartialWordText(input) ||
    typeof value['hardModeAtStart'] !== 'boolean' ||
    typeof value['hardModeReleased'] !== 'boolean' ||
    !isCount(value['startedAt']) ||
    !(value['completedAt'] === null || isCount(value['completedAt'])) ||
    // `Game.completed_at: Timestamp when status = won | lost | abandoned`.
    (value['completedAt'] === null) !== (status === 'in_progress') ||
    // `NeverMoreThanTheAttemptLimit`, and a game with attempts left to play.
    (status === 'in_progress' && guesses.length >= MAX_ATTEMPTS) ||
    // `LostGamesUsedEveryAttempt`.
    (status === 'lost' && guesses.length !== MAX_ATTEMPTS) ||
    // `WonGamesHoldAWinningGuess` — any of them, not only the last.
    (status === 'won' &&
      !guesses.some((guess) => guess.results.every((result) => result.mark === 'correct')))
  ) {
    return null;
  }

  return {
    mode: value['mode'],
    answer,
    status,
    hardModeAtStart: value['hardModeAtStart'],
    hardModeReleased: value['hardModeReleased'],
    currentInput: input,
    startedAt: value['startedAt'],
    completedAt: value['completedAt'],
    autoContinueAt: null,
    guesses
  };
}

/**
 * Null rather than an empty list: a game whose history is unreadable is not
 * that game.
 *
 * Each guess is read against the place it sits in, which is what
 * `PositionIsAnAttemptNumber` and `GuessPositionsAreDistinct` amount to
 * together, and what `acceptGuess` writes in the first place.
 */
function readGuesses(value: unknown, answer: string): Guess[] | null {
  if (!Array.isArray(value) || value.length > MAX_ATTEMPTS) {
    return null;
  }

  const guesses = value.map((entry, index) => readGuess(entry, index + 1, answer));

  return guesses.every((guess) => guess !== null) ? guesses : null;
}

/**
 * A stored guess, or null unless it is the one `GuessScoring` produces for this
 * word against this answer.
 *
 * The results are recomputed rather than believed. `OneResultPerPositionInOrder`
 * fixes each result's position and letter, but the mark is the whole of what a
 * guess says, and a stored mark is the one field storage could change without
 * breaking any shape: marking an unrelated word correct throughout satisfies
 * `WonGamesHoldAWinningGuess` and restores a game that was never won, with a
 * keyboard, a set of hard-mode constraints and a shared grid to match. Scoring
 * is pure and the answer is already in hand, so asking `scoreGuess` costs a
 * load nothing and settles all three at once.
 */
function readGuess(value: unknown, position: number, answer: string): Guess | null {
  if (!isRecord(value) || value['position'] !== position || typeof value['word'] !== 'string') {
    return null;
  }

  const word = value['word'];
  const results: unknown = value['results'];

  if (!isWordText(word) || !Array.isArray(results) || results.length !== WORD_LENGTH) {
    return null;
  }

  const scored = scoreGuess(word, answer);
  const readable = results.every((result, index) => {
    const expected = scored[index];

    return (
      isRecord(result) &&
      expected !== undefined &&
      result['position'] === expected.position &&
      result['letter'] === expected.letter &&
      result['mark'] === expected.mark
    );
  });

  if (!readable) {
    return null;
  }

  return { position, word, results: scored };
}
