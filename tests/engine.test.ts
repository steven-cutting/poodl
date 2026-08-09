import { beforeEach, describe, expect, it } from 'vitest';

import type { Env } from '../src/lib/app/engine';
import type { AppState } from '../src/lib/app/state';
import { ANSWERS, createEnv, fresh, playGuess, run, tokenFor, winInOne } from './engineHarness';

let env: Env;

beforeEach(() => {
  env = createEnv();
});

/*
 * game.allium — Arriving. Opening Poodl is the one trigger no surface provides:
 * it is an arrival, not a control, and every surface is reached by arriving.
 */
describe('arriving', () => {
  // ShowWelcomeOnOpening.
  it('lands on the welcome screen', () => {
    const state = run(env, fresh(), { kind: 'open' });

    expect(state.awaitingWelcome).toBe(true);
    expect(state.currentGame).toBeNull();
  });

  /*
   * The second disjunct of ShowWelcomeOnOpening. A player who turned the
   * welcome screen off and then cleared their browser data has nothing to
   * continue, so the screen appears regardless rather than stranding them on an
   * empty board.
   */
  it('lands there even with the setting off, when there is nothing to continue', () => {
    const state = run(env, fresh(), { kind: 'set_show_welcome', enabled: false }, { kind: 'open' });

    expect(state.awaitingWelcome).toBe(true);
    expect(state.currentGame).toBeNull();
  });

  // ContinueOnOpeningWithoutWelcome.
  it('continues straight into a game when the setting is off and there is one to resume', () => {
    const played = run(env, fresh(), { kind: 'new_game', mode: 'random' });
    const state = run(env, played, { kind: 'set_show_welcome', enabled: false }, { kind: 'open' });

    expect(state.awaitingWelcome).toBe(false);
    expect(state.currentGame?.answer).toBe(played.currentGame?.answer);
  });

  // ResumeCurrentGame: nothing is retired, nothing is drawn.
  it('resumes a game already on the board untouched', () => {
    const played = run(env, fresh(), { kind: 'new_game', mode: 'random' }, { kind: 'open' });
    const state = run(env, played, { kind: 'continue' });

    expect(state.awaitingWelcome).toBe(false);
    expect(state.currentGame).toEqual(played.currentGame);
    expect(state.statistics).toEqual(played.statistics);
  });

  it('brings a finished game back with its conclusion still showing', () => {
    const won = winInOne(env, run(env, fresh(), { kind: 'new_game', mode: 'random' }));
    const state = run(env, won, { kind: 'open' }, { kind: 'continue' });

    expect(state.currentGame?.status).toBe('won');
    expect(state.statistics.wins).toBe(1);
  });

  // ContinueInPreviousMode.
  it('starts a fresh game in the remembered mode when the board is empty', () => {
    const remembered = run(env, fresh(), { kind: 'new_game', mode: 'practice' });
    const empty: AppState = { ...remembered, currentGame: null };
    const state = run(env, empty, { kind: 'continue' });

    expect(state.currentGame?.mode).toBe('practice');
    expect(state.awaitingWelcome).toBe(false);
  });

  it('has nothing to continue on a first visit', () => {
    const state = run(env, fresh(), { kind: 'open' }, { kind: 'continue' });

    expect(state.currentGame).toBeNull();
    expect(state.lastMode).toBeNull();
  });
});

/*
 * game.allium — Starting a game. Every game begins at BeginGame, whatever
 * supplied the answer, which is why the welcome screen is dismissed there
 * rather than by a rule of its own.
 */
describe('starting a game', () => {
  // ProvidePracticeAnswer: straight from the answer list, no pool, no record.
  it('draws a practice answer without touching the pool', () => {
    const state = run(env, fresh(), { kind: 'new_game', mode: 'practice' });

    expect(ANSWERS).toContain(state.currentGame?.answer);
    expect(state.pool.used).toEqual([]);
  });

  // DrawPooledAnswer: random and endless share the no-repeat pool.
  it('draws random and endless answers from the pool, and records them', () => {
    const state = run(env, fresh(), { kind: 'new_game', mode: 'random' });

    expect(state.pool.used).toEqual([state.currentGame?.answer]);
  });

  it('never repeats an answer until the pool runs out', () => {
    let state = fresh();
    const drawn: string[] = [];

    for (let game = 0; game < ANSWERS.length; game += 1) {
      state = run(env, state, { kind: 'new_game', mode: 'random' });
      drawn.push(state.currentGame?.answer as string);
    }

    expect([...drawn].sort()).toEqual([...ANSWERS].sort());
    expect(state.pool.hasRecycled).toBe(false);
  });

  it('recycles once every answer has been seen, and says so', () => {
    let state = fresh();

    for (let game = 0; game < ANSWERS.length + 1; game += 1) {
      state = run(env, state, { kind: 'new_game', mode: 'random' });
    }

    expect(state.pool.hasRecycled).toBe(true);
    expect(state.pool.used).toHaveLength(1);
  });

  it('starts in progress, with an empty board and no letters typed', () => {
    const state = run(env, fresh(), { kind: 'open' }, { kind: 'new_game', mode: 'random' });

    expect(state.currentGame?.status).toBe('in_progress');
    expect(state.currentGame?.guesses).toEqual([]);
    expect(state.currentGame?.currentInput).toBe('');
    expect(state.currentGame?.startedAt).toBe(env.now);
    expect(state.currentGame?.completedAt).toBeNull();
    expect(state.awaitingWelcome).toBe(false);
  });

  it('records how hard mode stood when the game began', () => {
    const state = run(
      env,
      fresh(),
      { kind: 'enable_hard_mode' },
      { kind: 'new_game', mode: 'random' }
    );

    expect(state.currentGame?.hardModeAtStart).toBe(true);
    expect(state.currentGame?.hardModeReleased).toBe(false);
  });

  it('remembers each mode a player chose for themselves', () => {
    for (const mode of ['random', 'endless', 'practice'] as const) {
      expect(run(env, fresh(), { kind: 'new_game', mode }).lastMode).toBe(mode);
    }
  });

  /*
   * The guidance on BeginGame: a custom game falls off the end of the
   * conditional deliberately. It could never be started again, because its
   * answer only ever came from a link.
   */
  it('never remembers a custom game as the mode to continue in', () => {
    const played = run(env, fresh(), { kind: 'new_game', mode: 'endless' });
    const state = run(env, played, { kind: 'open_custom_link', token: tokenFor('crumb') });

    expect(state.currentGame?.mode).toBe('custom');
    expect(state.lastMode).toBe('endless');
  });
});

/*
 * game.allium — Retiring. Only the current game is kept, and every retirement
 * path removes it: without guesses it goes without trace, with guesses it is
 * abandoned and then discarded, and one already won or lost is discarded
 * outright.
 */
describe('retiring the outgoing game', () => {
  // AbandonRetiredGame, then RecordAbandonmentAsLoss in statistics.allium.
  it('counts a stat-eligible game that had a guess in it as a loss', () => {
    const played = playGuess(env, run(env, fresh(), { kind: 'new_game', mode: 'random' }), 'crumb');
    const state = run(env, played, { kind: 'new_game', mode: 'random' });

    expect(state.statistics.gamesPlayed).toBe(1);
    expect(state.statistics.wins).toBe(0);
    expect(state.statistics.currentStreak).toBe(0);
  });

  it('breaks a streak the abandoned game was riding', () => {
    const won = winInOne(env, run(env, fresh(), { kind: 'new_game', mode: 'random' }));
    const next = playGuess(env, run(env, won, { kind: 'new_game', mode: 'random' }), 'crumb');
    const state = run(env, next, { kind: 'new_game', mode: 'random' });

    expect(state.statistics.currentStreak).toBe(0);
    expect(state.statistics.maxStreak).toBe(1);
  });

  // DiscardRetiredGame: a game the player never guessed in leaves no trace.
  it('lets a game with no guesses go without trace', () => {
    const started = run(env, fresh(), { kind: 'new_game', mode: 'random' });
    const state = run(env, started, { kind: 'new_game', mode: 'random' });

    expect(state.statistics.gamesPlayed).toBe(0);
    expect(state.statistics.currentStreak).toBe(0);
  });

  // OnlyRandomAndEndlessAreCounted.
  it('counts nothing when the abandoned game was practice or custom', () => {
    const practice = playGuess(
      env,
      run(env, fresh(), { kind: 'new_game', mode: 'practice' }),
      'crumb'
    );
    const custom = playGuess(
      env,
      run(env, practice, { kind: 'open_custom_link', token: tokenFor('zesty') }),
      'crumb'
    );
    const state = run(env, custom, { kind: 'new_game', mode: 'random' });

    expect(state.statistics.gamesPlayed).toBe(0);
  });

  // DiscardRetiredFinishedGame: its outcome went in the moment it ended.
  it('counts a finished game once, not again when it is replaced', () => {
    const won = winInOne(env, run(env, fresh(), { kind: 'new_game', mode: 'random' }));
    const state = run(env, won, { kind: 'new_game', mode: 'random' });

    expect(state.statistics.gamesPlayed).toBe(1);
    expect(state.statistics.wins).toBe(1);
    expect(state.statistics.currentStreak).toBe(1);
  });

  // OnlyTheCurrentGameIsKept.
  it('keeps exactly one game', () => {
    const state = run(
      env,
      fresh(),
      { kind: 'new_game', mode: 'random' },
      { kind: 'new_game', mode: 'endless' }
    );

    expect(state.currentGame?.mode).toBe('endless');
  });
});
