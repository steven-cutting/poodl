import { describe, expect, it } from 'vitest';

import { hardModeBlocker, hardModeMayBeEnabled, resultsGrid } from '../src/lib/app/engine';
import { MAX_ATTEMPTS } from '../src/lib/config';
import { EMPTY_DAILY_STATISTICS } from '../src/lib/domain/dailyStatistics';
import { dailyAnswer, dayOf } from '../src/lib/domain/calendar';
import { EMPTY_STATISTICS } from '../src/lib/domain/statistics';
import { createEnv, daysAfterEpoch, fresh, loseOutright, playGuess, run } from './engineHarness';

/*
 * daily.allium — the three `NewGameRequested(mode=daily)` rules, and the
 * rules that follow from a daily game existing. `env.now` moves between
 * calendar days via `daysAfterEpoch`, never `Date.now()`.
 */
describe('choosing daily', () => {
  // StartTodaysDailyGame, with no prior daily game at all.
  it('starts todays game, drawn from the schedule, when nothing is kept yet', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const state = run(env, fresh(), { kind: 'new_game', mode: 'daily' });

    expect(state.currentGame?.mode).toBe('daily');
    expect(state.currentGame?.answer).toBe(dailyAnswer(1, env.words.dailySchedule()));
    expect(state.setAsideDaily).toBeNull();
    expect(state.lastMode).toBe('daily');
  });

  /*
   * StartTodaysDailyGame again, once the kept game is from an earlier day: the
   * old one is replaced entirely, not moved anywhere it can be recovered from,
   * and nothing about it is counted.
   */
  it('replaces a kept game from an earlier day outright, counting nothing about it', () => {
    const day1Env = createEnv({ now: daysAfterEpoch(0) });
    const day1 = run(day1Env, fresh(), { kind: 'new_game', mode: 'daily' });

    const day2Env = createEnv({ now: daysAfterEpoch(1) });
    const day2 = run(day2Env, day1, { kind: 'new_game', mode: 'daily' });

    expect(day2.currentGame?.answer).toBe(dailyAnswer(2, day2Env.words.dailySchedule()));
    expect(day2.setAsideDaily).toBeNull();
    expect(day2.dailyStatistics).toEqual(EMPTY_DAILY_STATISTICS);
    expect(day2.statistics).toEqual(EMPTY_STATISTICS);
  });

  /*
   * ReturnToTodaysDailyGame: the regression test. Under a design where the
   * daily slot mirrors the on-board game unconditionally, this fails the
   * moment a guess is submitted — the mirror goes stale and the guess is lost
   * on return.
   */
  it('brings back the exact same game, guess and current input intact, when it is chosen again', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const started = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const withProgress = run(env, playGuess(env, started, 'crumb'), {
      kind: 'enter_letter',
      letter: 'a'
    });
    const switched = run(env, withProgress, { kind: 'new_game', mode: 'random' });

    expect(switched.currentGame?.mode).toBe('random');
    expect(switched.setAsideDaily?.guesses).toHaveLength(1);
    expect(switched.setAsideDaily?.currentInput).toBe('a');

    const back = run(env, switched, { kind: 'new_game', mode: 'daily' });

    expect(back.currentGame).toBe(withProgress.currentGame);
    expect(back.setAsideDaily).toBeNull();
  });

  // ReturnToTodaysDailyGame's cost to the outgoing other-mode game.
  it('costs the outgoing other-mode game its ordinary price, whichever it was', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });

    const toRandomNoGuess = run(env, daily, { kind: 'new_game', mode: 'random' });
    const backNoGuess = run(env, toRandomNoGuess, { kind: 'new_game', mode: 'daily' });

    expect(backNoGuess.statistics.gamesPlayed).toBe(0);

    const toRandomWithGuess = playGuess(
      env,
      run(env, backNoGuess, { kind: 'new_game', mode: 'random' }),
      'crumb'
    );
    const backWithGuess = run(env, toRandomWithGuess, { kind: 'new_game', mode: 'daily' });

    expect(backWithGuess.statistics.gamesPlayed).toBe(1);
    expect(backWithGuess.statistics.currentStreak).toBe(0);
  });

  // StayOnTodaysDailyGame: no control offers a second daily game.
  it('makes no new game when Daily is chosen while it is already on the board', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const again = run(env, daily, { kind: 'new_game', mode: 'daily' });

    expect(again.currentGame).toBe(daily.currentGame);

    const awaitingWelcome = { ...daily, awaitingWelcome: true };
    const dismissed = run(env, awaitingWelcome, { kind: 'new_game', mode: 'daily' });

    expect(dismissed.currentGame).toBe(daily.currentGame);
    expect(dismissed.awaitingWelcome).toBe(false);
  });

  /*
   * ThereIsNoNewGameInDaily: "Daily offers the time the next word arrives and
   * the way back to the welcome screen, where another mode is chosen." Taking
   * that way out spends nothing — the day's game is still today's when the
   * player comes back to it, and Daily is still the mode they last chose.
   */
  it('spends nothing when the welcome screen is asked for from a finished day', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const answer = daily.currentGame?.answer as string;
    const won = playGuess(env, daily, answer);
    const away = run(env, won, { kind: 'return_to_welcome' });

    expect(away.awaitingWelcome).toBe(true);
    expect(away.currentGame).toBe(won.currentGame);
    expect(away.setAsideDaily).toBeNull();
    expect(away.dailyStatistics).toEqual(won.dailyStatistics);

    const back = run(env, away, { kind: 'new_game', mode: 'daily' });

    expect(back.currentGame).toBe(won.currentGame);
    expect(back.awaitingWelcome).toBe(false);
  });
});

/*
 * daily.allium — RecordDailyWin and RecordDailyLoss. Daily feeds its own
 * block; is_stat_eligible already excludes it from the primary one.
 */
describe('recording a day', () => {
  it('records a win in the daily block only, leaving the primary block untouched', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const answer = daily.currentGame?.answer as string;
    const won = playGuess(env, daily, answer);

    expect(won.currentGame?.status).toBe('won');
    expect(won.dailyStatistics.daysPlayed).toBe(1);
    expect(won.dailyStatistics.daysWon).toBe(1);
    expect(won.dailyStatistics.buckets[0]).toBe(1);
    expect(won.statistics).toEqual(EMPTY_STATISTICS);
  });

  it('records a loss in the daily block only', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const lost = loseOutright(env, daily);

    expect(lost.currentGame?.status).toBe('lost');
    expect(lost.dailyStatistics.daysPlayed).toBe(1);
    expect(lost.dailyStatistics.daysWon).toBe(0);
    expect(lost.statistics).toEqual(EMPTY_STATISTICS);
  });

  // The streak, driven end to end through the reducer rather than only the pure function.
  it('extends the streak on consecutive days and resets it when a day is skipped', () => {
    const day1Env = createEnv({ now: daysAfterEpoch(0) });
    const day1 = run(day1Env, fresh(), { kind: 'new_game', mode: 'daily' });
    const day1Won = playGuess(day1Env, day1, day1.currentGame?.answer as string);

    const day2Env = createEnv({ now: daysAfterEpoch(1) });
    const day2 = run(day2Env, day1Won, { kind: 'new_game', mode: 'daily' });
    const day2Won = playGuess(day2Env, day2, day2.currentGame?.answer as string);

    expect(day2Won.dailyStatistics.currentStreak).toBe(2);

    const day4Env = createEnv({ now: daysAfterEpoch(3) });
    const day4 = run(day4Env, day2Won, { kind: 'new_game', mode: 'daily' });
    const day4Won = playGuess(day4Env, day4, day4.currentGame?.answer as string);

    expect(day4Won.dailyStatistics.currentStreak).toBe(1);
    expect(day4Won.dailyStatistics.maxStreak).toBe(2);
  });

  // ResetDailyStatisticsToo: the kept game is not touched, on the board or set aside.
  it('resets the daily block together with the rest, leaving the kept game alone', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const won = playGuess(env, daily, daily.currentGame?.answer as string);

    const onBoardReset = run(env, won, { kind: 'reset_statistics' });

    expect(onBoardReset.dailyStatistics).toEqual(EMPTY_DAILY_STATISTICS);
    expect(onBoardReset.currentGame).toEqual(won.currentGame);

    const setAside = run(env, won, { kind: 'new_game', mode: 'random' });
    const offBoardReset = run(env, setAside, { kind: 'reset_statistics' });

    expect(offBoardReset.dailyStatistics).toEqual(EMPTY_DAILY_STATISTICS);
    expect(offBoardReset.setAsideDaily).toEqual(setAside.setAsideDaily);
  });

  /*
   * sharing.allium — the heading names the day the game was started, read off
   * the game itself rather than off the clock: `resultsGrid` takes no `now`
   * at all, so there is nothing for it to read the day from except the game.
   */
  it("heads a finished daily game's share grid with the day it was started", () => {
    const env = createEnv({ now: daysAfterEpoch(11) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const won = playGuess(env, daily, daily.currentGame?.answer as string);

    const grid = resultsGrid(won, false);
    const day = dayOf(won.currentGame?.startedAt as number);

    expect(day).toBe(12);
    expect(grid?.split('\n')[0]).toBe(`Poodl daily ${day} 1/${MAX_ATTEMPTS}`);
  });
});

/*
 * settings.allium — the hard-mode guard reads both slots. HardModeIsNeverOn
 * OverAGameThatBreaksIt names an invariant over every in-progress game, and
 * a second, set-aside game is still a game.
 */
describe('hard mode with a kept daily game', () => {
  it('stays locked while a set-aside daily game would break it, even though the game on the board would not', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    // ADOPT reveals A in place and P present; CRUMB abandons both — against
    // day 1's answer, 'apple', exactly the pair hardMode.test.ts uses.
    const violated = playGuess(env, playGuess(env, daily, 'adopt'), 'crumb');
    const switched = run(env, violated, { kind: 'new_game', mode: 'random' });

    expect(switched.currentGame?.mode).toBe('random');
    expect(hardModeMayBeEnabled(switched)).toBe(false);

    const compliant = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const switchedCompliant = run(env, compliant, { kind: 'new_game', mode: 'random' });

    expect(hardModeMayBeEnabled(switchedCompliant)).toBe(true);
  });

  /*
   * HardModeIsExplainedWhenItCannotBeTurnedOn's third reason: today's daily
   * game, set aside part way through, is what blocks it — not history in the
   * game on the board, which has no guesses in it at all here.
   */
  it('names the set-aside daily game as the reason, not the game on the board', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const violated = playGuess(env, playGuess(env, daily, 'adopt'), 'crumb');
    const switched = run(env, violated, { kind: 'new_game', mode: 'random' });

    expect(hardModeBlocker(switched)).toBe('daily-history');
  });

  /*
   * The two reasons a set-aside daily game can block are not the same reason,
   * and HardModeIsExplainedWhenItCannotBeTurnedOn asks for which one applies.
   * A game released mid-play has broken no rule — saying a guess did would
   * name a cause that never happened.
   */
  it('tells a released set-aside daily game from one a guess broke', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const strict = run(env, daily, { kind: 'enable_hard_mode' });
    // ADOPT complies with hard mode; the release, not a guess, is the blocker.
    const released = run(env, playGuess(env, strict, 'adopt'), { kind: 'disable_hard_mode' });
    const switched = run(env, released, { kind: 'new_game', mode: 'random' });

    expect(switched.setAsideDaily?.hardModeReleased).toBe(true);
    expect(hardModeBlocker(switched)).toBe('daily-released');
  });

  it('reduces to the single-game case while the daily game is the one on the board', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const violated = playGuess(env, playGuess(env, daily, 'adopt'), 'crumb');

    expect(violated.setAsideDaily).toBeNull();
    expect(hardModeMayBeEnabled(violated)).toBe(false);
  });

  // settings.allium guidance: disabling hard mode does not release a game set aside.
  it('does not release a set-aside daily game when hard mode is disabled while playing elsewhere', () => {
    const env = createEnv({ now: daysAfterEpoch(0) });
    const daily = run(env, fresh(), { kind: 'new_game', mode: 'daily' });
    const dailyWithGuess = playGuess(env, daily, 'adopt');
    const switched = run(env, dailyWithGuess, { kind: 'new_game', mode: 'random' });
    const strict = run(env, switched, { kind: 'enable_hard_mode' });
    const playedElsewhere = playGuess(env, strict, 'crumb');
    const relaxed = run(env, playedElsewhere, { kind: 'disable_hard_mode' });

    expect(relaxed.currentGame?.hardModeReleased).toBe(true);
    expect(relaxed.setAsideDaily).toEqual(switched.setAsideDaily);
    expect(relaxed.setAsideDaily?.hardModeReleased).toBe(false);
  });
});
