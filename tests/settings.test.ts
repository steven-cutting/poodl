import { beforeEach, describe, expect, it } from 'vitest';

import type { Env } from '../src/lib/app/engine';
import { hardModeMayBeEnabled } from '../src/lib/app/engine';
import type { AppState } from '../src/lib/app/state';
import { createEnv, fresh, playGuess, run, winInOne } from './engineHarness';

let env: Env;

beforeEach(() => {
  env = createEnv();
});

function started(): AppState {
  return run(env, fresh(), { kind: 'new_game', mode: 'random' });
}

/*
 * settings.allium — the plain setters. Each is guarded only against being told
 * what it already is, which the engine treats as nothing to do.
 */
describe('the preferences', () => {
  it('starts at the defaults, with the theme dark', () => {
    expect(fresh().settings).toEqual({
      theme: 'dark',
      highContrast: false,
      hardMode: false,
      animations: true,
      physicalKeyboard: true,
      showWelcome: true
    });
  });

  it('records each choice', () => {
    const state = run(
      env,
      fresh(),
      { kind: 'choose_theme', choice: 'light' },
      { kind: 'set_high_contrast', enabled: true },
      { kind: 'set_animations', enabled: false },
      { kind: 'set_physical_keyboard', enabled: false },
      { kind: 'set_show_welcome', enabled: false }
    );

    expect(state.settings).toEqual({
      theme: 'light',
      highContrast: true,
      hardMode: false,
      animations: false,
      physicalKeyboard: false,
      showWelcome: false
    });
  });

  it('does nothing when told what it already is', () => {
    const state = fresh();

    expect(run(env, state, { kind: 'choose_theme', choice: 'dark' })).toBe(state);
    expect(run(env, state, { kind: 'set_high_contrast', enabled: false })).toBe(state);
  });
});

/*
 * settings.allium — the hard-mode guard. Hard mode may be turned on part way
 * through a game on two conditions: it was not switched off during this game,
 * and nothing already submitted would have broken it.
 */
describe('turning hard mode on', () => {
  it('is always available between games', () => {
    expect(hardModeMayBeEnabled(fresh())).toBe(true);
    expect(run(env, fresh(), { kind: 'enable_hard_mode' }).settings.hardMode).toBe(true);
  });

  // TriviallyTrueWithNoGuesses.
  it('is available in a game nothing has been submitted to', () => {
    expect(hardModeMayBeEnabled(started())).toBe(true);
  });

  it('is available while the guesses so far would have complied', () => {
    env.random = pick('apple');
    const played = playGuess(env, started(), 'adopt');

    expect(hardModeMayBeEnabled(played)).toBe(true);
    expect(run(env, played, { kind: 'enable_hard_mode' }).settings.hardMode).toBe(true);
  });

  /*
   * The second guard: a game where hard mode was simply never on and the
   * guesses so far would not have complied. ADOPT reveals A in place and P
   * somewhere; CRUMB keeps neither.
   */
  it('is refused when a guess already submitted would have broken the rule', () => {
    env.random = pick('apple');
    const played = playGuess(env, playGuess(env, started(), 'adopt'), 'crumb');

    expect(hardModeMayBeEnabled(played)).toBe(false);
    expect(run(env, played, { kind: 'enable_hard_mode' }).settings.hardMode).toBe(false);
  });

  // The first guard: the player who switched it off to escape the constraint.
  it('is refused for the rest of a game it was switched off during', () => {
    env.random = pick('apple');
    const strict = run(env, started(), { kind: 'enable_hard_mode' });
    const played = playGuess(env, strict, 'adopt');
    const released = run(env, played, { kind: 'disable_hard_mode' });

    expect(released.currentGame?.hardModeReleased).toBe(true);
    expect(hardModeMayBeEnabled(released)).toBe(false);
    expect(run(env, released, { kind: 'enable_hard_mode' }).settings.hardMode).toBe(false);
  });

  it('comes back the moment a new game starts', () => {
    env.random = pick('apple');
    const released = run(
      env,
      playGuess(env, run(env, started(), { kind: 'enable_hard_mode' }), 'adopt'),
      { kind: 'disable_hard_mode' }
    );
    const next = run(env, released, { kind: 'new_game', mode: 'random' });

    expect(hardModeMayBeEnabled(next)).toBe(true);
  });

  it('is available again once the game is over, whatever it was released to', () => {
    const finished = run(env, winInOne(env, started()), { kind: 'disable_hard_mode' });

    expect(hardModeMayBeEnabled(finished)).toBe(true);
  });
});

/*
 * settings.allium — PlayerDisablesHardMode. Turning it off is never guarded:
 * relaxing the constraint invalidates no history. Doing so part way through a
 * game is a one-way door, though.
 */
describe('turning hard mode off', () => {
  // HardModeCanAlwaysBeTurnedOff.
  it('is available at every point in a game', () => {
    env.random = pick('apple');
    const played = playGuess(env, run(env, started(), { kind: 'enable_hard_mode' }), 'adopt');

    expect(run(env, played, { kind: 'disable_hard_mode' }).settings.hardMode).toBe(false);
  });

  /*
   * A game with no guesses in it is untouched: turning hard mode off before
   * playing anything is the same as never having had it on, so it can be turned
   * straight back on.
   */
  it('costs nothing in a game with no guesses in it', () => {
    const started_ = run(env, started(), { kind: 'enable_hard_mode' });
    const state = run(env, started_, { kind: 'disable_hard_mode' });

    expect(state.currentGame?.hardModeReleased).toBe(false);
    expect(hardModeMayBeEnabled(state)).toBe(true);
  });

  it('leaves a finished game alone', () => {
    const won = run(env, winInOne(env, started()), { kind: 'enable_hard_mode' });
    const state = run(env, won, { kind: 'disable_hard_mode' });

    expect(state.currentGame?.hardModeReleased).toBe(false);
  });

  it('does nothing when hard mode is already off', () => {
    const state = started();

    expect(run(env, state, { kind: 'disable_hard_mode' })).toBe(state);
  });
});

/*
 * statistics.allium — PlayerResetsStatistics. One action clears one record of
 * play, and the pool goes with the numbers because they are the same record
 * seen from two sides.
 */
describe('resetting the statistics', () => {
  // ResettingClearsThePoolToo.
  it('sets every number to zero and empties the record of used answers', () => {
    const played = winInOne(env, started());
    const state = run(env, played, { kind: 'reset_statistics' });

    expect(played.statistics.wins).toBe(1);
    expect(played.pool.used).not.toEqual([]);
    expect(state.statistics).toEqual(fresh().statistics);
    expect(state.pool).toEqual(fresh().pool);
  });

  it('leaves the game on the board alone', () => {
    const played = winInOne(env, started());
    const state = run(env, played, { kind: 'reset_statistics' });

    expect(state.currentGame).toEqual(played.currentGame);
  });

  it('clears the recycled flag with everything else', () => {
    let state = fresh();
    for (let game = 0; game < 4; game += 1) {
      state = run(env, state, { kind: 'new_game', mode: 'random' });
    }

    expect(state.pool.hasRecycled).toBe(true);
    expect(run(env, state, { kind: 'reset_statistics' }).pool.hasRecycled).toBe(false);
  });
});

/** A draw that lands on a chosen answer, so a test can aim its guesses. */
function pick(answer: string): Env['random'] {
  return {
    uniformChoice: <Value>(items: readonly Value[]): Value =>
      (items.find((item) => item === answer) ?? items[0]) as Value
  };
}
