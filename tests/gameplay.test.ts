import { beforeEach, describe, expect, it } from 'vitest';

import type { Env } from '../src/lib/app/engine';
import { reduce } from '../src/lib/app/engine';
import type { AppState } from '../src/lib/app/state';
import { ENDLESS_COUNTDOWN_MS, MAX_ATTEMPTS, WORD_LENGTH } from '../src/lib/config';
import {
  answerOf,
  createEnv,
  fresh,
  loseOutright,
  playGuess,
  run,
  winInOne
} from './engineHarness';

let env: Env;

beforeEach(() => {
  env = createEnv();
});

/** A random game under way, with a known answer so a test can aim at it. */
function started(mode: 'random' | 'endless' | 'practice' = 'random'): AppState {
  return run(env, fresh(), { kind: 'new_game', mode });
}

function type(state: AppState, letters: string): AppState {
  return run(
    env,
    state,
    ...[...letters].map((letter) => ({ kind: 'enter_letter', letter }) as const)
  );
}

/*
 * game.allium — Entering letters. Both rules require a game in progress, so the
 * board refuses input once the game is over rather than the surface hiding it.
 */
describe('entering and deleting letters', () => {
  it('appends a letter, in lower case whatever case it arrived in', () => {
    expect(type(started(), 'aP').currentGame?.currentInput).toBe('ap');
  });

  it('ignores anything that is not a letter', () => {
    expect(type(started(), 'a').currentGame?.currentInput).toBe('a');
    expect(
      run(env, type(started(), 'a'), { kind: 'enter_letter', letter: '1' }).currentGame
        ?.currentInput
    ).toBe('a');
    expect(
      run(env, type(started(), 'a'), { kind: 'enter_letter', letter: 'ab' }).currentGame
        ?.currentInput
    ).toBe('a');
  });

  it('stops at the word length', () => {
    const full = type(started(), 'applesauce');

    expect(full.currentGame?.currentInput).toHaveLength(WORD_LENGTH);
  });

  it('deletes the last letter, and does nothing at an empty row', () => {
    expect(
      run(env, type(started(), 'app'), { kind: 'delete_letter' }).currentGame?.currentInput
    ).toBe('ap');
    expect(run(env, started(), { kind: 'delete_letter' }).currentGame?.currentInput).toBe('');
  });

  it('takes no input when there is no game', () => {
    const state = run(env, fresh(), { kind: 'enter_letter', letter: 'a' });

    expect(state.currentGame).toBeNull();
  });

  it('takes no input once the game is over', () => {
    const won = winInOne(env, started());
    const state = type(won, 'ap');

    expect(state.currentGame?.currentInput).toBe('');
  });
});

/*
 * game.allium — Submitting a guess. Two kinds of rejection consume no attempt,
 * and the typed letters stay on the board for the player to correct.
 */
describe('rejecting a guess', () => {
  // RejectIncompleteGuess.
  it('refuses fewer than five letters, and keeps them', () => {
    const state = run(env, type(started(), 'app'), { kind: 'submit_guess' });

    expect(state.notice).toEqual({ kind: 'guess_rejected', reason: 'incomplete' });
    expect(state.currentGame?.currentInput).toBe('app');
    expect(state.currentGame?.guesses).toEqual([]);
  });

  // RejectUnknownWord.
  it('refuses a word it does not accept, and keeps it', () => {
    const state = run(env, type(started(), 'qqqqq'), { kind: 'submit_guess' });

    expect(state.notice).toEqual({ kind: 'guess_rejected', reason: 'not_in_dictionary' });
    expect(state.currentGame?.currentInput).toBe('qqqqq');
    expect(state.currentGame?.guesses).toEqual([]);
  });

  /*
   * RejectHardModeViolation. Hard mode is read live, so this depends on the
   * setting as it stands now rather than on how the game started — which is
   * what TheseSettingsGovernPlayImmediately promises.
   */
  it('refuses a guess that drops a revealed letter, once hard mode is on', () => {
    env.random = createEnvAnswer('apple');
    const opened = playGuess(env, started(), 'adopt');
    const state = run(env, type(opened, 'crumb'), { kind: 'submit_guess' });

    expect(state.notice).toBeNull();

    const strict = run(env, opened, { kind: 'enable_hard_mode' });
    const refused = run(env, type(strict, 'crumb'), { kind: 'submit_guess' });

    expect(refused.notice).toEqual({ kind: 'guess_rejected', reason: 'hard_mode_violation' });
    expect(refused.currentGame?.guesses).toHaveLength(1);
    expect(refused.currentGame?.currentInput).toBe('crumb');
  });

  it('says the same thing again when the same rejection repeats', () => {
    const state = run(env, type(started(), 'app'), { kind: 'submit_guess' });
    const again = run(env, state, { kind: 'submit_guess' });

    expect(again.notice).toEqual(state.notice);
    // Identical text in a live region is heard once. The sequence advancing is
    // what makes the second rejection announce as well as the first.
    expect(again.noticeSequence).toBeGreaterThan(state.noticeSequence);
  });
});

/*
 * game.allium — AcceptGuess. The guess is scored, it spends an attempt, and it
 * may end the game.
 */
describe('accepting a guess', () => {
  it('scores it, spends the attempt and clears the row', () => {
    env.random = createEnvAnswer('apple');
    const state = playGuess(env, started(), 'adopt');
    const guess = state.currentGame?.guesses[0];

    expect(state.currentGame?.guesses).toHaveLength(1);
    expect(state.currentGame?.currentInput).toBe('');
    expect(guess?.position).toBe(1);
    expect(guess?.word).toBe('adopt');
    expect(guess?.results.map((result) => result.mark)).toEqual([
      'correct',
      'absent',
      'absent',
      'present',
      'absent'
    ]);
  });

  // EverySubmittedGuessIsAnnounced.
  it('announces the results, the attempt number and what is left', () => {
    env.random = createEnvAnswer('apple');
    const state = playGuess(env, started(), 'adopt');

    expect(state.announcement).toContain('Attempt 1');
    expect(state.announcement).toContain('A correct');
    expect(state.announcement).toContain('5 attempts remaining');
  });

  it('wins when the guess is the answer, and records the win', () => {
    const state = winInOne(env, started());

    expect(state.currentGame?.status).toBe('won');
    expect(state.currentGame?.completedAt).toBe(env.now);
    expect(state.statistics.wins).toBe(1);
    expect(state.statistics.distribution[0]).toBe(1);
    expect(state.announcement).toContain('You won');
    expect(state.announcement).toContain(answerOf(state).toUpperCase());
  });

  it('loses once every attempt is spent, and records the loss', () => {
    const state = loseOutright(env, started());

    expect(state.currentGame?.status).toBe('lost');
    expect(state.currentGame?.guesses).toHaveLength(MAX_ATTEMPTS);
    expect(state.statistics.gamesPlayed).toBe(1);
    expect(state.statistics.wins).toBe(0);
    expect(state.announcement).toContain('You lost');
  });

  it('counts nothing for a practice game, won or lost', () => {
    const state = winInOne(env, started('practice'));

    expect(state.currentGame?.status).toBe('won');
    expect(state.statistics.gamesPlayed).toBe(0);
  });

  it('refuses to submit once the game is over', () => {
    const won = winInOne(env, started());
    const state = run(env, won, { kind: 'submit_guess' });

    expect(state.currentGame?.guesses).toHaveLength(1);
    expect(state.notice).toBeNull();
  });
});

/*
 * game.allium — Endless mode. It shows the same end-of-game modal as random,
 * but arms a countdown.
 */
describe('the endless countdown', () => {
  // ArmEndlessCountdown.
  it('is armed when an endless game finishes by play', () => {
    const state = winInOne(env, started('endless'));

    expect(state.currentGame?.autoContinueAt).toBe(env.now + ENDLESS_COUNTDOWN_MS);
  });

  it('is never armed in another mode', () => {
    expect(winInOne(env, started('random')).currentGame?.autoContinueAt).toBeNull();
    expect(loseOutright(env, started('practice')).currentGame?.autoContinueAt).toBeNull();
  });

  it('is armed on a loss as well as a win', () => {
    expect(loseOutright(env, started('endless')).currentGame?.autoContinueAt).toBe(
      env.now + ENDLESS_COUNTDOWN_MS
    );
  });

  // EndlessCountdownElapses.
  it('starts the next round by itself once it runs out', () => {
    const finished = winInOne(env, started('endless'));
    const later = createEnv({ now: env.now + ENDLESS_COUNTDOWN_MS });
    const state = run(later, finished, { kind: 'countdown_elapsed' });

    expect(state.currentGame?.status).toBe('in_progress');
    expect(state.currentGame?.mode).toBe('endless');
    expect(state.currentGame?.autoContinueAt).toBeNull();
  });

  it('does nothing before its moment', () => {
    const finished = winInOne(env, started('endless'));
    const state = run(env, finished, { kind: 'countdown_elapsed' });

    expect(state.currentGame?.status).toBe('won');
    expect(state.currentGame?.autoContinueAt).toBe(env.now + ENDLESS_COUNTDOWN_MS);
  });

  // PlayerStopsCountdown and StoppingTheCountdownIsFinal.
  it('stops outright, and cannot be restarted for this game', () => {
    const finished = winInOne(env, started('endless'));
    const stopped = run(env, finished, { kind: 'stop_countdown' });

    expect(stopped.currentGame?.autoContinueAt).toBeNull();

    const later = createEnv({ now: env.now + ENDLESS_COUNTDOWN_MS * 4 });
    const state = run(later, stopped, { kind: 'countdown_elapsed' });

    expect(state.currentGame?.status).toBe('won');
    expect(state.currentGame?.autoContinueAt).toBeNull();
  });

  it('does nothing when there is no countdown to stop', () => {
    const playing = started('endless');

    expect(run(env, playing, { kind: 'stop_countdown' })).toBe(playing);
    expect(run(env, fresh(), { kind: 'stop_countdown' }).currentGame).toBeNull();
  });

  it('is not re-armed by anything that touches the finished game afterwards', () => {
    const stopped = run(env, winInOne(env, started('endless')), { kind: 'stop_countdown' });
    const state = run(
      env,
      stopped,
      { kind: 'open' },
      { kind: 'continue' },
      { kind: 'set_high_contrast', enabled: true }
    );

    expect(state.currentGame?.autoContinueAt).toBeNull();
  });

  it('counts the round it replaces exactly once', () => {
    const finished = winInOne(env, started('endless'));
    const later = createEnv({ now: env.now + ENDLESS_COUNTDOWN_MS });
    const state = run(later, finished, { kind: 'countdown_elapsed' });

    expect(state.statistics.gamesPlayed).toBe(1);
    expect(state.statistics.wins).toBe(1);
  });
});

/**
 * An environment whose draw lands on a chosen answer, so a test can aim a
 * guess. `createFakeRandom` walks offsets, and the pool hands it the answers in
 * list order.
 */
function createEnvAnswer(answer: string): Env['random'] {
  const index = ['apple', 'adopt', 'alarm'].indexOf(answer);

  return {
    uniformChoice: <Value>(items: readonly Value[]): Value => items[index % items.length] as Value
  };
}

/** Assert the reducer hands back an untouched state for a command it ignores. */
describe('a command with nothing to do', () => {
  it('changes nothing and emits nothing', () => {
    const state = fresh();
    const outcome = reduce(state, { kind: 'delete_letter' }, env);

    expect(outcome.state).toBe(state);
    expect(outcome.effects).toEqual([]);
  });
});
