import { DEFAULT_SETTINGS, createInitialState } from '$lib/app/state';
import type { AppState, GameState, Settings } from '$lib/app/state';
import { MAX_ATTEMPTS, WORD_LENGTH } from '$lib/config';
import { EMPTY_POOL } from '$lib/domain/answerPool';
import type { AnswerPool } from '$lib/domain/answerPool';
import { EMPTY_STATISTICS } from '$lib/domain/statistics';
import type { Statistics } from '$lib/domain/statistics';
import type { Guess, LetterMark, StartableMode } from '$lib/domain/types';
import { isWordText } from '$lib/domain/words';
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
  settings: Settings;
  statistics: Statistics;
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
 *   them. `NothingAboutTheLinkIsKept` requires exactly that of a custom link.
 */
export function saveState(storage: StoragePort, state: AppState): void {
  const stored: Stored = {
    version: SCHEMA_VERSION,
    lastMode: state.lastMode,
    game: state.currentGame === null ? null : { ...state.currentGame, autoContinueAt: null },
    settings: state.settings,
    statistics: state.statistics,
    pool: state.pool
  };

  storage.write(STORAGE_KEY, JSON.stringify(stored));
}

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

  return {
    ...initial,
    lastMode: readStartableMode(stored['lastMode']),
    currentGame: readGame(stored['game']),
    settings: readSettings(stored['settings']),
    statistics: readStatistics(stored['statistics']),
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
  return isOneOf(value, ['random', 'endless', 'practice'] as const) ? value : null;
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

  return {
    gamesPlayed: value['gamesPlayed'] as number,
    wins: value['wins'] as number,
    currentStreak: value['currentStreak'] as number,
    maxStreak: value['maxStreak'] as number,
    distribution: distribution
  };
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

function readGame(value: unknown): GameState | null {
  if (value === null || !isRecord(value)) {
    return null;
  }

  const guesses = readGuesses(value['guesses']);
  const input: unknown = value['currentInput'];

  if (
    guesses === null ||
    !isOneOf(value['mode'], ['random', 'endless', 'practice', 'custom'] as const) ||
    !isOneOf(value['status'], ['in_progress', 'won', 'lost', 'abandoned'] as const) ||
    typeof value['answer'] !== 'string' ||
    !isWordText(value['answer']) ||
    typeof input !== 'string' ||
    input.length > WORD_LENGTH ||
    typeof value['hardModeAtStart'] !== 'boolean' ||
    typeof value['hardModeReleased'] !== 'boolean' ||
    !isCount(value['startedAt']) ||
    !(value['completedAt'] === null || isCount(value['completedAt']))
  ) {
    return null;
  }

  return {
    mode: value['mode'],
    answer: value['answer'],
    status: value['status'],
    hardModeAtStart: value['hardModeAtStart'],
    hardModeReleased: value['hardModeReleased'],
    currentInput: input,
    startedAt: value['startedAt'],
    completedAt: value['completedAt'],
    autoContinueAt: null,
    guesses
  };
}

/** Null rather than an empty list: a game whose history is unreadable is not that game. */
function readGuesses(value: unknown): Guess[] | null {
  if (!Array.isArray(value) || value.length > MAX_ATTEMPTS) {
    return null;
  }

  const guesses = value.map((entry) => readGuess(entry));

  return guesses.every((guess) => guess !== null) ? guesses : null;
}

function readGuess(value: unknown): Guess | null {
  if (!isRecord(value) || !isCount(value['position']) || typeof value['word'] !== 'string') {
    return null;
  }

  const results: unknown = value['results'];

  if (!Array.isArray(results) || results.length !== WORD_LENGTH) {
    return null;
  }

  const marks: LetterMark[] = ['correct', 'present', 'absent'];
  const readable = results.every(
    (result, index) =>
      isRecord(result) &&
      result['position'] === index + 1 &&
      typeof result['letter'] === 'string' &&
      isOneOf(result['mark'], marks)
  );

  if (!readable || !isWordText(value['word'])) {
    return null;
  }

  return {
    position: value['position'],
    word: value['word'],
    results: results as Guess['results']
  };
}
