import { EMPTY_POOL } from '$lib/domain/answerPool';
import type { AnswerPool } from '$lib/domain/answerPool';
import { EMPTY_STATISTICS } from '$lib/domain/statistics';
import type { Statistics } from '$lib/domain/statistics';
import type {
  GameMode,
  GameStatus,
  Guess,
  GuessRejectionReason,
  StartableMode,
  ThemeChoice
} from '$lib/domain/types';

/**
 * Everything Poodl knows, in one value.
 *
 * The shape follows `docs/specs/` entity by entity: `Player` and its one
 * `Game`, `Settings`, `Statistics` and `AnswerPool`. There is no collection of
 * games, because `Player.OnlyTheCurrentGameIsKept` says every retirement path
 * removes the game it retires — so a game that is not the current one does not
 * exist to be stored.
 */

/** `game.allium`'s `Game` entity, less its back reference to the player. */
export interface GameState {
  mode: GameMode;
  answer: string;
  status: GameStatus;
  /**
   * Whether hard mode was on when this game began. Deliberately a record and
   * nothing more: no rule reads it, because submission is judged against the
   * live setting rather than against how the game started.
   */
  hardModeAtStart: boolean;
  /**
   * Whether hard mode was switched off part way through this game. Once true it
   * stays true, and hard mode cannot come back until a new game starts.
   */
  hardModeReleased: boolean;
  currentInput: string;
  startedAt: number;
  completedAt: number | null;
  /** When an endless game's next round starts, unless the player stops it. */
  autoContinueAt: number | null;
  guesses: readonly Guess[];
}

/** `settings.allium`'s `Settings` entity. */
export interface Settings {
  theme: ThemeChoice;
  highContrast: boolean;
  hardMode: boolean;
  animations: boolean;
  physicalKeyboard: boolean;
  showWelcome: boolean;
}

/**
 * The one thing Poodl is currently telling the player, shown where the player
 * is looking and given a role that announces it.
 *
 * These are the emissions the specifications name that are sentences to read —
 * `GuessRejected`, `CustomAnswerRejected`, `CustomLinkInvalid` and the outcome
 * of `ResultsPlacedOnClipboard`. None of them is durable, and none is persisted.
 */
export type Notice =
  | { kind: 'guess_rejected'; reason: GuessRejectionReason }
  | { kind: 'custom_answer_rejected'; entry: string }
  | { kind: 'custom_link_invalid' }
  | { kind: 'results_copied' }
  | { kind: 'copy_failed' };

/**
 * What Poodl has just made for the player to take away: the link `CustomLinkReady`
 * hands over, or the grid `ShareResults` renders.
 *
 * It sits beside the notice rather than inside one because the two have
 * different lifetimes. A notice is a sentence about what just happened, and the
 * outcome of a copy replaces whatever came before it; this is the thing being
 * copied, and it has to outlive the attempt — `TheGridIsAvailableAsText` and the
 * failure message both send the player to text they can select by hand.
 *
 * Not durable either: `NothingAboutTheLinkIsKept` asks for exactly as long as it
 * takes to copy, so nothing here is written to storage and nothing survives a
 * reload.
 */
export interface Shareable {
  kind: 'custom_link' | 'results';
  text: string;
}

export interface AppState {
  /** `Player.current_game`: in progress, or just finished and not yet replaced. */
  currentGame: GameState | null;
  /** `Player.last_mode`: the mode this player last chose for themselves. */
  lastMode: StartableMode | null;
  /** `Player.awaiting_welcome`. */
  awaitingWelcome: boolean;
  settings: Settings;
  statistics: Statistics;
  pool: AnswerPool;
  notice: Notice | null;
  shareable: Shareable | null;
  /**
   * What the live region says next: the results of a submitted guess, and the
   * conclusion when one arrives.
   */
  announcement: string | null;
  /*
   * Both sequences exist for the same reason. A live region reacts to its text
   * changing, so two identical rejections in a row would be heard once. The
   * number advancing is what makes the second one announce as well as the
   * first; the surfaces key on it rather than on the text.
   */
  noticeSequence: number;
  announcementSequence: number;
  /**
   * Which copy Poodl is waiting on. The clipboard settles asynchronously, so a
   * result that arrives after a second copy was asked for would otherwise report
   * on the wrong one; the shell hands the number back and a stale one is ignored.
   */
  copyRequest: number;
}

/** `default Settings player_settings`. Theme starts at system. */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  highContrast: false,
  hardMode: false,
  animations: true,
  physicalKeyboard: true,
  showWelcome: true
};

/** A player who has never played, on a device that remembers nothing. */
export function createInitialState(): AppState {
  return {
    currentGame: null,
    lastMode: null,
    awaitingWelcome: false,
    settings: { ...DEFAULT_SETTINGS },
    statistics: EMPTY_STATISTICS,
    pool: EMPTY_POOL,
    notice: null,
    shareable: null,
    announcement: null,
    noticeSequence: 0,
    announcementSequence: 0,
    copyRequest: 0
  };
}

/** `Player.can_continue`: a game to resume, or a mode to start another in. */
export function canContinue(state: AppState): boolean {
  return state.currentGame !== null || state.lastMode !== null;
}

/** `Game.attempts_remaining`. */
export function attemptsRemaining(game: GameState, maxAttempts: number): number {
  return maxAttempts - game.guesses.length;
}

/** `Game.is_finished_by_play`: won or lost, as opposed to abandoned. */
export function isFinishedByPlay(game: GameState): boolean {
  return game.status === 'won' || game.status === 'lost';
}

/** `Game.is_stat_eligible`: only random and endless ever touch the numbers. */
export function isStatEligible(mode: GameMode): boolean {
  return mode === 'random' || mode === 'endless';
}
