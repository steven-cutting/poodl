import type { Command, Effect } from '$lib/app/commands';
import { attemptsRemaining, canContinue, isFinishedByPlay, isStatEligible } from '$lib/app/state';
import type { AppState, GameState, Notice, Settings } from '$lib/app/state';
import { ENDLESS_COUNTDOWN_MS, MAX_ATTEMPTS, WORD_LENGTH } from '$lib/config';
import {
  describeConclusion,
  describeCountdown,
  describeSubmission
} from '$lib/domain/announcements';
import { EMPTY_POOL, drawPooledAnswer } from '$lib/domain/answerPool';
import { respectsHardMode, satisfiesHardMode } from '$lib/domain/hardMode';
import { customGameUrl } from '$lib/domain/links';
import { decodeToken, encodeAnswer } from '$lib/domain/obfuscation';
import { scoreGuess } from '$lib/domain/scoring';
import { renderShareGrid } from '$lib/domain/share';
import { EMPTY_STATISTICS, recordLoss, recordWin } from '$lib/domain/statistics';
import type { Statistics } from '$lib/domain/statistics';
import type { GameMode, GuessRejectionReason, Guess, StartableMode } from '$lib/domain/types';
import { isWordText } from '$lib/domain/words';
import type { RandomPort } from '$lib/ports/random';
import type { WordListPort } from '$lib/ports/words';

/**
 * Every rule in `docs/specs/`, as one function.
 *
 * The specifications are written as rules over state — a trigger, its guards
 * and a set of changes — so a reducer maps to them almost one for one, and each
 * handler below is named after the rule it carries. Nothing here reaches
 * outside: the clock, the randomness and the word lists arrive in `env`, and
 * the one effect that cannot be a value — writing to the clipboard — is handed
 * back for the shell to perform.
 *
 * A rule whose guards do not hold changes nothing, and the state comes back by
 * identity, so a caller can tell that nothing happened.
 */

export interface Env {
  /** `now`, as the rules read it. */
  now: number;
  words: WordListPort;
  random: RandomPort;
  /** The page Poodl is served at, which a custom link is built from. */
  pageUrl: string;
}

export interface Outcome {
  state: AppState;
  effects: readonly Effect[];
}

/** The whole of the engine's surface: one command at a time. */
export function reduce(state: AppState, command: Command, env: Env): Outcome {
  switch (command.kind) {
    case 'open':
      return still(openPoodl(state, env));
    case 'continue':
      return still(playerContinues(state, env));
    case 'new_game':
      return still(newGameRequested(state, command.mode, env));
    case 'enter_letter':
      return still(playerEntersLetter(state, command.letter));
    case 'delete_letter':
      return still(playerDeletesLetter(state));
    case 'submit_guess':
      return still(playerSubmitsGuess(state, env));
    case 'stop_countdown':
      return still(playerStopsCountdown(state));
    case 'countdown_elapsed':
      return still(endlessCountdownElapses(state, env));
    case 'choose_theme':
      return still(setSetting(state, 'theme', command.choice));
    case 'set_high_contrast':
      return still(setSetting(state, 'highContrast', command.enabled));
    case 'set_animations':
      return still(setSetting(state, 'animations', command.enabled));
    case 'set_physical_keyboard':
      return still(setSetting(state, 'physicalKeyboard', command.enabled));
    case 'set_show_welcome':
      return still(setSetting(state, 'showWelcome', command.enabled));
    case 'enable_hard_mode':
      return still(playerEnablesHardMode(state));
    case 'disable_hard_mode':
      return still(playerDisablesHardMode(state));
    case 'reset_statistics':
      return still(playerResetsStatistics(state));
    case 'create_custom_game':
      return still(createCustomGameLink(state, command.entry, env));
    case 'share_current_answer':
      return still(shareCurrentAnswer(state, env));
    case 'open_custom_link':
      return still(openCustomGameLink(state, command.token, env));
    case 'accept_random_fallback':
      return still(newGameRequested(dismiss(state), 'random', env));
    case 'share_results':
      return playerSharesResults(state);
    case 'copy_shareable':
      return copyShareable(state);
    case 'clipboard_settled':
      return still(clipboardSettled(state, command.id, command.copied));
    case 'dismiss_notice':
      return still(dismiss(state));
    case 'dismiss_shareable':
      return still(putAway(state));
  }
}

/**
 * Whether hard mode may be turned on now without invalidating history.
 *
 * `Game.hard_mode_admissible` in `game.allium`, and what `SettingsPanel` exposes
 * as `hard_mode_may_be_enabled` so that an unavailable control can say which of
 * the two reasons applies.
 */
export function hardModeMayBeEnabled(state: AppState): boolean {
  const current = state.currentGame;

  return (
    current === null ||
    current.status !== 'in_progress' ||
    (!current.hardModeReleased && respectsHardMode(current.guesses))
  );
}

// -------------------------------------------------------------- arriving ---

/**
 * `ShowWelcomeOnOpening` and `ContinueOnOpeningWithoutWelcome`.
 *
 * The second disjunct of the first rule is what stops the setting stranding
 * anybody: a player who turned the welcome screen off and then cleared their
 * browser data has nothing to continue, so the screen appears regardless.
 */
function openPoodl(state: AppState, env: Env): AppState {
  if (state.settings.showWelcome || !canContinue(state)) {
    return { ...state, awaitingWelcome: true };
  }
  return playerContinues({ ...state, awaitingWelcome: false }, env);
}

/**
 * `ResumeCurrentGame` and `ContinueInPreviousMode`.
 *
 * Resuming is the whole of the story for a game already on the board: nothing
 * is retired, nothing is drawn, and a game that had already finished comes back
 * with its conclusion still showing.
 */
function playerContinues(state: AppState, env: Env): AppState {
  if (state.currentGame !== null) {
    return { ...state, awaitingWelcome: false };
  }
  if (state.lastMode !== null) {
    return newGameRequested({ ...state, awaitingWelcome: false }, state.lastMode, env);
  }
  return state;
}

// -------------------------------------------------------- starting a game ---

/**
 * `ProvidePracticeAnswer` in `game.allium` and `DrawPooledAnswer` in
 * `statistics.allium`: the two ways an answer reaches a mode a player can ask
 * for. Practice draws straight from the answer list — no pool, no record,
 * repeats allowed.
 */
function newGameRequested(state: AppState, mode: StartableMode, env: Env): AppState {
  const answers = env.words.answerWords();

  if (mode === 'practice') {
    return beginGame(state, 'practice', env.random.uniformChoice(answers), env);
  }

  const drawn = drawPooledAnswer(state.pool, answers, (candidates) =>
    env.random.uniformChoice(candidates)
  );

  return beginGame({ ...state, pool: drawn.pool }, mode, drawn.answer, env);
}

/**
 * `BeginGame`. The outgoing game is retired first, which is why New Game,
 * switching mode, opening a custom link and the endless countdown all get the
 * same treatment. It is also the single place every game start passes through,
 * so the welcome screen is dismissed here rather than by a rule of its own.
 */
function beginGame(state: AppState, mode: GameMode, answer: string, env: Env): AppState {
  return {
    ...retireGame(state),
    currentGame: {
      mode,
      answer,
      status: 'in_progress',
      hardModeAtStart: state.settings.hardMode,
      hardModeReleased: false,
      currentInput: '',
      startedAt: env.now,
      completedAt: null,
      autoContinueAt: null,
      guesses: []
    },
    awaitingWelcome: false,
    // A custom game falls off the end of this deliberately: it could never be
    // started again, because its answer only ever came from a link.
    lastMode: mode === 'custom' ? state.lastMode : mode,
    notice: null,
    shareable: null
  };
}

/**
 * `AbandonRetiredGame`, `DiscardAbandonedGame`, `DiscardRetiredGame` and
 * `DiscardRetiredFinishedGame`, with `RecordAbandonmentAsLoss` in
 * `statistics.allium`.
 *
 * Every path removes the game, so this returns only what survives it. The
 * abandonment loss is recorded from the mode and the attempt count — what the
 * emission carries — rather than from the game, because the game is about to go
 * and neither half may be left reading what the other has removed.
 *
 * A game the player never guessed in leaves no trace at all: no loss, no broken
 * streak, nothing counted.
 */
function retireGame(state: AppState): AppState {
  const outgoing = state.currentGame;

  if (outgoing === null) {
    return state;
  }

  const abandoned = outgoing.status === 'in_progress' && outgoing.guesses.length >= 1;
  const counted = abandoned && isStatEligible(outgoing.mode);

  return {
    ...state,
    currentGame: null,
    statistics: counted ? recordLoss(state.statistics) : state.statistics
  };
}

// -------------------------------------------------------- entering letters ---

/** `PlayerEntersLetter`. Anything that is not one letter is not a letter. */
function playerEntersLetter(state: AppState, letter: string): AppState {
  const game = state.currentGame;

  if (
    game === null ||
    game.status !== 'in_progress' ||
    !/^[a-z]$/i.test(letter) ||
    game.currentInput.length >= WORD_LENGTH
  ) {
    return state;
  }

  return typing(state, { ...game, currentInput: game.currentInput + letter.toLowerCase() });
}

/** `PlayerDeletesLetter`. */
function playerDeletesLetter(state: AppState): AppState {
  const game = state.currentGame;

  if (game === null || game.status !== 'in_progress' || game.currentInput.length === 0) {
    return state;
  }

  return typing(state, { ...game, currentInput: game.currentInput.slice(0, -1) });
}

/**
 * Editing the row clears whatever Poodl was saying about the last submission.
 * A rejection describes a submission, and the player is already correcting it.
 */
function typing(state: AppState, game: GameState): AppState {
  const edited = withGame(state, game);

  return edited.notice?.kind === 'guess_rejected' ? dismiss(edited) : edited;
}

// ------------------------------------------------------ submitting a guess ---

/**
 * The four submission rules, in the order their guards separate them:
 * `RejectIncompleteGuess`, `RejectUnknownWord`, `RejectHardModeViolation` and
 * `AcceptGuess`.
 *
 * Hard mode is read from the live setting rather than from `hard_mode_at_start`,
 * which is what `TheseSettingsGovernPlayImmediately` promises: a change applies
 * from the very next submission.
 */
function playerSubmitsGuess(state: AppState, env: Env): AppState {
  const game = state.currentGame;

  if (game === null || game.status !== 'in_progress') {
    return state;
  }

  const candidate = game.currentInput;

  if (candidate.length < WORD_LENGTH) {
    return rejectGuess(state, 'incomplete');
  }
  if (!env.words.guessWords().has(candidate)) {
    return rejectGuess(state, 'not_in_dictionary');
  }
  if (state.settings.hardMode && !satisfiesHardMode(game.guesses, candidate)) {
    return rejectGuess(state, 'hard_mode_violation');
  }

  return acceptGuess(state, game, candidate, env);
}

/** A rejection spends no attempt: the typed letters stay for the player to correct. */
function rejectGuess(state: AppState, reason: GuessRejectionReason): AppState {
  return notify(state, { kind: 'guess_rejected', reason });
}

/** `AcceptGuess`, and the statistics its outcome moves. */
function acceptGuess(state: AppState, game: GameState, candidate: string, env: Env): AppState {
  const submitted: Guess = {
    position: game.guesses.length + 1,
    word: candidate,
    results: scoreGuess(candidate, game.answer)
  };
  const guesses = [...game.guesses, submitted];
  const won = submitted.results.every((result) => result.mark === 'correct');
  const lost = !won && guesses.length === MAX_ATTEMPTS;
  const over = won || lost;

  const played: GameState = {
    ...game,
    guesses,
    currentInput: '',
    status: won ? 'won' : lost ? 'lost' : 'in_progress',
    completedAt: over ? env.now : null,
    /*
     * ArmEndlessCountdown, at the transition and only at the transition. Read
     * off the state instead — armed whenever a finished endless game has no
     * countdown — it would re-arm the instant the player stopped it, and
     * StoppingTheCountdownIsFinal says a stopped countdown cannot be restarted.
     */
    autoContinueAt: over && game.mode === 'endless' ? env.now + ENDLESS_COUNTDOWN_MS : null
  };

  const submission = describeSubmission(
    submitted.position,
    submitted.results,
    attemptsRemaining(played, MAX_ATTEMPTS)
  );
  /*
   * `ConclusionIsAnnounced` asks for two things: the outcome, the answer and
   * the count, "and an armed countdown is announced along with the means to
   * stop it". The countdown is said here rather than by the modal, because a
   * sentence rendered inside a dialog is read when the reader gets to it, and
   * by then the ten seconds may be spent.
   */
  const countdown =
    played.autoContinueAt === null ? '' : ` ${describeCountdown(ENDLESS_COUNTDOWN_MS / 1_000)}`;
  const conclusion = over
    ? ` ${describeConclusion(won ? 'won' : 'lost', game.answer, guesses.length)}${countdown}`
    : '';

  return announce(
    {
      ...state,
      currentGame: played,
      statistics: record(state.statistics, game.mode, won, lost, guesses.length),
      notice: null
    },
    `${submission}${conclusion}`
  );
}

/** `RecordWin` and `RecordLoss`, both guarded by `is_stat_eligible`. */
function record(
  statistics: Statistics,
  mode: GameMode,
  won: boolean,
  lost: boolean,
  attempts: number
): Statistics {
  if (!isStatEligible(mode)) {
    return statistics;
  }
  if (won) {
    return recordWin(statistics, attempts);
  }
  return lost ? recordLoss(statistics) : statistics;
}

// ----------------------------------------------------------- endless mode ---

/**
 * `EndlessCountdownElapses`. Clearing `auto_continue_at` is what stops this
 * firing again, and the round it replaces is retired on the ordinary terms —
 * already finished, so discarded rather than counted twice.
 */
function endlessCountdownElapses(state: AppState, env: Env): AppState {
  const game = state.currentGame;

  if (
    game === null ||
    game.mode !== 'endless' ||
    game.autoContinueAt === null ||
    game.autoContinueAt > env.now
  ) {
    return state;
  }

  return newGameRequested(withGame(state, { ...game, autoContinueAt: null }), 'endless', env);
}

/**
 * `PlayerStopsCountdown`. One action and it cancels outright: a stopped
 * countdown does not resume and cannot be restarted for this game.
 */
function playerStopsCountdown(state: AppState): AppState {
  const game = state.currentGame;

  if (game === null || game.autoContinueAt === null) {
    return state;
  }

  return withGame(state, { ...game, autoContinueAt: null });
}

// --------------------------------------------------------------- settings ---

/** The five plain setters, each guarded against being told what it already is. */
function setSetting<Key extends keyof Settings>(
  state: AppState,
  key: Key,
  value: Settings[Key]
): AppState {
  if (state.settings[key] === value) {
    return state;
  }
  return { ...state, settings: { ...state.settings, [key]: value } };
}

/**
 * `PlayerEnablesHardMode`. Both guards earn their place: `hard_mode_released`
 * catches the player who switched it off to escape the constraint, and
 * admissibility catches the game where hard mode was simply never on and the
 * guesses so far would not have complied.
 */
function playerEnablesHardMode(state: AppState): AppState {
  if (state.settings.hardMode || !hardModeMayBeEnabled(state)) {
    return state;
  }
  return { ...state, settings: { ...state.settings, hardMode: true } };
}

/**
 * `PlayerDisablesHardMode`. Never guarded — relaxing the constraint invalidates
 * no history — but part way through a game that has guesses in it, it is a
 * one-way door. A game with no guesses is untouched: turning hard mode off
 * before playing anything is the same as never having had it on.
 */
function playerDisablesHardMode(state: AppState): AppState {
  if (!state.settings.hardMode) {
    return state;
  }

  const game = state.currentGame;
  const relaxed: AppState = { ...state, settings: { ...state.settings, hardMode: false } };

  if (game === null || game.status !== 'in_progress' || game.guesses.length === 0) {
    return relaxed;
  }
  return withGame(relaxed, { ...game, hardModeReleased: true });
}

/**
 * `PlayerResetsStatistics`. The pool goes with the numbers because they are the
 * same record of play seen from two sides.
 */
function playerResetsStatistics(state: AppState): AppState {
  return { ...state, statistics: EMPTY_STATISTICS, pool: EMPTY_POOL };
}

// ---------------------------------------------------------------- sharing ---

/** `CreateCustomGameLink` and `RejectCustomAnswer`. */
function createCustomGameLink(state: AppState, entry: string, env: Env): AppState {
  const text = entry.toLowerCase();

  if (!isWordText(text) || !env.words.guessWords().has(text)) {
    return notify(state, { kind: 'custom_answer_rejected', entry });
  }
  return linkReady(state, text, env);
}

/**
 * `ShareCurrentAnswerAsCustomGame`. The game is a parameter, not a target:
 * sharing spends no attempt, retires nothing and changes no status, so the
 * board is exactly as it was afterwards.
 *
 * There is no rejection counterpart and no validation to do. Unlike
 * `CreateCustomGameLink`, which is handed a word by a person, this answer came
 * from Poodl, and `AnswersAreAlwaysGuessable` already holds it in the guess
 * dictionary.
 */
function shareCurrentAnswer(state: AppState, env: Env): AppState {
  const game = state.currentGame;

  if (game === null) {
    return state;
  }
  return linkReady(state, game.answer, env);
}

/**
 * `CustomLinkReady`. The link is a thing to take away rather than a sentence to
 * read, so it goes in `shareable` and takes whatever Poodl was last saying with
 * it: the rejection this link answers has been answered.
 */
function linkReady(state: AppState, answer: string, env: Env): AppState {
  return {
    ...dismiss(state),
    shareable: {
      kind: 'custom_link',
      text: customGameUrl(encodeAnswer(answer), env.pageUrl)
    }
  };
}

/** `OpenCustomGameLink` and `RejectInvalidCustomLink`. */
function openCustomGameLink(state: AppState, token: string, env: Env): AppState {
  const decoded = decodeToken(token);

  if (decoded === null || !env.words.guessWords().has(decoded)) {
    return notify(state, { kind: 'custom_link_invalid' });
  }
  return beginGame(state, 'custom', decoded, env);
}

/**
 * `PlayerSharesResults`. The palette follows high contrast, so what gets pasted
 * matches the board it came from, and the game itself is untouched: no attempt,
 * no status, nothing counted.
 *
 * The grid is kept as well as copied. `TheGridIsAvailableAsText` asks for text
 * that can be read before it is sent and selected by hand when the clipboard
 * cannot be reached, and a grid that only ever existed inside an effect was
 * neither.
 */
function playerSharesResults(state: AppState): Outcome {
  const game = state.currentGame;

  if (game === null || !isFinishedByPlay(game)) {
    return still(state);
  }

  const text = renderShareGrid(
    { mode: game.mode, status: game.status === 'won' ? 'won' : 'lost', guesses: game.guesses },
    state.settings.highContrast ? 'high_contrast' : 'standard'
  );

  return copying({ ...dismiss(state), shareable: { kind: 'results', text } }, text);
}

/**
 * Putting whatever Poodl has just made on the clipboard.
 *
 * `FullyKeyboardOperable` on `CustomGameCreation`, `ShareCurrentAnswer` and
 * `ShareResults` alike requires copying to be doable from the keyboard alone. A
 * link and a grid travel the same path, and the outcome is reported the same
 * way; what is copied stays put either way, so a copy the browser refused can be
 * made by hand.
 */
function copyShareable(state: AppState): Outcome {
  if (state.shareable === null) {
    return still(state);
  }
  return copying(state, state.shareable.text);
}

/** Ask the shell for a copy, and remember which one Poodl is waiting on. */
function copying(state: AppState, text: string): Outcome {
  const id = state.copyRequest + 1;

  return { state: { ...state, copyRequest: id }, effects: [{ kind: 'copy', id, text }] };
}

/**
 * What the shell reports back. A result for a copy that has already been
 * superseded says nothing about the one the player is waiting on, so it is
 * dropped rather than allowed to describe it wrongly.
 */
function clipboardSettled(state: AppState, id: number, copied: boolean): AppState {
  if (id !== state.copyRequest) {
    return state;
  }
  return notify(state, { kind: copied ? 'results_copied' : 'copy_failed' });
}

// ---------------------------------------------------------------- helpers ---

function still(state: AppState): Outcome {
  return { state, effects: [] };
}

function withGame(state: AppState, game: GameState): AppState {
  return { ...state, currentGame: game };
}

/**
 * Both sequences advance rather than only the value changing, because a live
 * region is heard when its text changes and two identical messages in a row
 * would otherwise be heard once.
 */
function notify(state: AppState, notice: Notice): AppState {
  return { ...state, notice, noticeSequence: state.noticeSequence + 1 };
}

function announce(state: AppState, message: string): AppState {
  return { ...state, announcement: message, announcementSequence: state.announcementSequence + 1 };
}

/** What Poodl was saying stops being said. Anything it made to take away stays. */
function dismiss(state: AppState): AppState {
  return state.notice === null ? state : { ...state, notice: null };
}

/**
 * The link or the grid goes, without waiting for a new game to take it.
 * Closing the surface it was made on is what asks for this, and it is the end of
 * that link — `NothingAboutTheLinkIsKept`, and lose it and it is gone.
 */
function putAway(state: AppState): AppState {
  return state.shareable === null ? state : { ...state, shareable: null };
}
