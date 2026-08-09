import { describe, expect, it } from 'vitest';

import { STORAGE_KEY, loadState, saveState } from '../src/lib/app/persistence';
import { MAX_ATTEMPTS } from '../src/lib/config';
import { createInitialState } from '../src/lib/app/state';
import type { AppState } from '../src/lib/app/state';
import { createFakeStorage, createWebStorage } from '../src/lib/ports/storage';
import { createEnv, fresh, playGuess, run, winInOne } from './engineHarness';

const env = createEnv();

/** A state with something in every corner of it, to round-trip whole. */
function lived(): AppState {
  const first = winInOne(env, run(env, fresh(), { kind: 'new_game', mode: 'random' }));
  const second = run(env, first, { kind: 'new_game', mode: 'random' });

  return run(
    env,
    playGuess(env, second, 'crumb'),
    { kind: 'choose_theme', choice: 'dark' },
    { kind: 'set_high_contrast', enabled: true }
  );
}

function roundTrip(state: AppState): AppState {
  const storage = createFakeStorage();
  saveState(storage, state);
  return loadState(storage);
}

/** Everything that reached the device, as one string to look for things in. */
function storedText(state: AppState): string {
  const storage = createFakeStorage();
  saveState(storage, state);
  return storage.read(STORAGE_KEY) ?? '';
}

/*
 * Four guarantees ask for this between them: `InProgressGameSurvivesReload`,
 * `ThePreviousModeSurvivesBetweenSessions`, `SettingsPersistBetweenSessions`
 * and `StatisticsPersistBetweenSessions`. There is no server, so all of it
 * lives on the device behind the storage port.
 */
describe('saving and loading', () => {
  it('brings the game back exactly as it was left', () => {
    const state = lived();
    const loaded = roundTrip(state);

    expect(loaded.currentGame).toEqual(state.currentGame);
  });

  it('brings the settings, the statistics, the pool and the remembered mode back', () => {
    const state = lived();
    const loaded = roundTrip(state);

    expect(loaded.settings).toEqual(state.settings);
    expect(loaded.statistics).toEqual(state.statistics);
    expect(loaded.pool).toEqual(state.pool);
    expect(loaded.lastMode).toBe(state.lastMode);
  });

  it('keeps the unsubmitted letters on the board', () => {
    const typed = run(
      env,
      run(env, fresh(), { kind: 'new_game', mode: 'random' }),
      { kind: 'enter_letter', letter: 'a' },
      { kind: 'enter_letter', letter: 'p' }
    );

    expect(roundTrip(typed).currentGame?.currentInput).toBe('ap');
  });

  it('brings a finished game back with its conclusion', () => {
    const won = winInOne(env, run(env, fresh(), { kind: 'new_game', mode: 'random' }));
    const loaded = roundTrip(won);

    expect(loaded.currentGame?.status).toBe('won');
    expect(loaded.currentGame?.completedAt).toBe(won.currentGame?.completedAt);
  });

  /*
   * OpeningPoodlLandsOnTheWelcomeScreen: "no game begins without the player
   * asking for one". A countdown that outlived the session would elapse on the
   * next arrival and start one, so loading clears it — the modal simply stays
   * put, exactly as stopping the countdown leaves it.
   */
  it('does not let a live countdown outlive the session', () => {
    const finished = winInOne(env, run(env, fresh(), { kind: 'new_game', mode: 'endless' }));

    expect(finished.currentGame?.autoContinueAt).not.toBeNull();
    expect(roundTrip(finished).currentGame?.autoContinueAt).toBeNull();
  });

  it('keeps nothing that is only being said right now', () => {
    const said = run(env, fresh(), { kind: 'create_custom_game', entry: 'qqqqq' });

    expect(said.notice).not.toBeNull();

    const loaded = roundTrip(said);

    expect(loaded.notice).toBeNull();
    expect(loaded.announcement).toBeNull();
  });

  /*
   * NothingAboutTheLinkIsKept: the link lasts as long as it takes to copy it,
   * and a reload is the end of it. There is no list of the words a player has
   * set for other people, because there is nothing to make one from.
   */
  it('keeps no link and no shared grid', () => {
    const made = run(env, fresh(), { kind: 'create_custom_game', entry: 'crumb' });
    const shared = run(env, winInOne(env, run(env, made, { kind: 'new_game', mode: 'random' })), {
      kind: 'share_results'
    });

    expect(made.shareable).not.toBeNull();
    expect(shared.shareable).not.toBeNull();
    expect(roundTrip(made).shareable).toBeNull();
    expect(roundTrip(shared).shareable).toBeNull();
    expect(storedText(made)).not.toContain(made.shareable?.text);
  });

  // Arriving is decided by ShowWelcomeOnOpening on every arrival, so a stored
  // answer to it would be a second, staler opinion.
  it('leaves whether the welcome screen is showing to the arrival', () => {
    const waiting = run(env, fresh(), { kind: 'open' });

    expect(waiting.awaitingWelcome).toBe(true);
    expect(roundTrip(waiting).awaitingWelcome).toBe(false);
  });
});

describe('loading from a device that has nothing usable', () => {
  it('starts fresh when nothing has been stored', () => {
    expect(loadState(createFakeStorage())).toEqual(createInitialState());
  });

  it('starts fresh rather than throwing on anything unreadable', () => {
    for (const stored of ['', 'not json', '[]', 'null', '42', '{"version":99}']) {
      expect(loadState(createFakeStorage({ [STORAGE_KEY]: stored }))).toEqual(createInitialState());
    }
  });

  it('keeps the parts that are intact when one part is not', () => {
    const storage = createFakeStorage();
    saveState(storage, lived());

    const stored: unknown = JSON.parse(storage.read(STORAGE_KEY) as string);
    const damaged = { ...(stored as Record<string, unknown>), settings: 'gone', game: 7 };
    const loaded = loadState(createFakeStorage({ [STORAGE_KEY]: JSON.stringify(damaged) }));

    expect(loaded.settings).toEqual(createInitialState().settings);
    expect(loaded.currentGame).toBeNull();
    expect(loaded.statistics.gamesPlayed).toBeGreaterThan(0);
  });

  it('ignores fields it does not know about', () => {
    const storage = createFakeStorage();
    const state = lived();
    saveState(storage, state);

    const stored = JSON.parse(storage.read(STORAGE_KEY) as string) as Record<string, unknown>;
    const extended = JSON.stringify({ ...stored, somethingLater: { of: 'no concern' } });

    expect(loadState(createFakeStorage({ [STORAGE_KEY]: extended })).currentGame).toEqual(
      state.currentGame
    );
  });

  /**
   * Storage is a place other software can write to and an older Poodl may
   * already have written to, so every section is checked rather than believed.
   * Each damaged section costs only itself.
   */
  it('falls back section by section', () => {
    const storage = createFakeStorage();
    saveState(storage, lived());
    const stored = JSON.parse(storage.read(STORAGE_KEY) as string) as Record<string, unknown>;
    const initial = createInitialState();

    const damage = (patch: Record<string, unknown>): AppState =>
      loadState(createFakeStorage({ [STORAGE_KEY]: JSON.stringify({ ...stored, ...patch }) }));

    expect(damage({ statistics: null }).statistics).toEqual(initial.statistics);
    expect(damage({ statistics: { gamesPlayed: -1 } }).statistics).toEqual(initial.statistics);
    expect(
      damage({ statistics: { ...(stored['statistics'] as object), distribution: [1, 2] } })
        .statistics
    ).toEqual(initial.statistics);
    expect(damage({ pool: 'used' }).pool).toEqual(initial.pool);
    expect(damage({ pool: { used: ['toolong'], hasRecycled: false } }).pool).toEqual(initial.pool);
    expect(damage({ lastMode: 'custom' }).lastMode).toBeNull();
  });

  it('refuses a game it cannot read as a game', () => {
    const storage = createFakeStorage();
    saveState(storage, lived());
    const stored = JSON.parse(storage.read(STORAGE_KEY) as string) as {
      game: Record<string, unknown>;
    };

    const withGame = (patch: Record<string, unknown>): AppState =>
      loadState(
        createFakeStorage({
          [STORAGE_KEY]: JSON.stringify({ ...stored, game: { ...stored.game, ...patch } })
        })
      );

    expect(withGame({ mode: 'daily' }).currentGame).toBeNull();
    expect(withGame({ answer: 'apples' }).currentGame).toBeNull();
    expect(withGame({ currentInput: 'toolong' }).currentGame).toBeNull();
    expect(withGame({ startedAt: 'yesterday' }).currentGame).toBeNull();
    expect(withGame({ completedAt: 'later' }).currentGame).toBeNull();
    expect(withGame({ guesses: 'none' }).currentGame).toBeNull();
    expect(withGame({ guesses: Array.from({ length: 7 }, () => ({})) }).currentGame).toBeNull();
  });

  /*
   * `Game` says more than its field types do, and a record that satisfies the
   * types while breaking the invariants is not a game this code can play. An
   * in-progress game holding every attempt is the sharp one: `AcceptGuess` tests
   * the count for equality, so it is never lost and goes on spending attempts on
   * a board that stopped drawing rows.
   */
  it('refuses a game the specifications say cannot exist', () => {
    const storage = createFakeStorage();
    saveState(storage, lived());
    const stored = JSON.parse(storage.read(STORAGE_KEY) as string) as {
      game: Record<string, unknown>;
    };
    const played = (stored.game['guesses'] as Record<string, unknown>[])[0];

    const withGame = (patch: Record<string, unknown>): AppState =>
      loadState(
        createFakeStorage({
          [STORAGE_KEY]: JSON.stringify({ ...stored, game: { ...stored.game, ...patch } })
        })
      );

    // Poodl never writes one: every retirement path removes the game instead.
    expect(withGame({ status: 'abandoned' }).currentGame).toBeNull();
    // NeverMoreThanTheAttemptLimit, with nothing left to play.
    expect(
      withGame({
        guesses: Array.from({ length: MAX_ATTEMPTS }, (_unused, index) => ({
          ...played,
          position: index + 1
        }))
      }).currentGame
    ).toBeNull();
    // LostGamesUsedEveryAttempt.
    expect(withGame({ status: 'lost', completedAt: 1 }).currentGame).toBeNull();
    // WonGamesHoldAWinningGuess.
    expect(withGame({ status: 'won', completedAt: 1 }).currentGame).toBeNull();
    // completed_at is set exactly when the game is over, and not otherwise.
    expect(withGame({ status: 'in_progress', completedAt: 1 }).currentGame).toBeNull();
  });

  it('refuses a game whose guesses do not describe a game', () => {
    const storage = createFakeStorage();
    saveState(storage, lived());

    const stored = JSON.parse(storage.read(STORAGE_KEY) as string) as {
      game: Record<string, unknown>;
    };
    const guess = (stored.game['guesses'] as Record<string, unknown>[])[0] as Record<
      string,
      unknown
    >;
    const results = guess['results'] as Record<string, unknown>[];

    const withGuesses = (guesses: unknown): AppState =>
      loadState(
        createFakeStorage({
          [STORAGE_KEY]: JSON.stringify({ ...stored, game: { ...stored.game, guesses } })
        })
      );

    expect(withGuesses([{ position: 'first' }]).currentGame).toBeNull();
    // PositionIsAnAttemptNumber: a guess is read against the place it sits in.
    expect(withGuesses([{ ...guess, position: 99 }]).currentGame).toBeNull();
    /*
     * OneResultPerPositionInOrder. Left unchecked, `satisfies_hard_mode`
     * compares a candidate against a letter the word never had, and refuses
     * every guess the player can type.
     */
    expect(
      withGuesses([{ ...guess, results: [{ ...results[0], letter: 'zzzz' }, ...results.slice(1)] }])
        .currentGame
    ).toBeNull();
  });

  /*
   * `Statistics` says more than its four field types do, and each of the four
   * clauses below is an invariant `statistics.allium` states by name. Nothing
   * downstream argues with a block that breaks one: `Statistics.losses` is
   * `games_played - wins`, so more wins than games renders a negative number of
   * games lost on the panel.
   *
   * Each case breaks exactly one clause and satisfies the other three, so no
   * clause can be deleted and left covered by its neighbours.
   */
  it('refuses statistics the specifications say cannot exist', () => {
    const storage = createFakeStorage();
    saveState(storage, lived());
    const stored = JSON.parse(storage.read(STORAGE_KEY) as string) as Record<string, unknown>;
    const empty = createInitialState().statistics;

    const withStatistics = (statistics: Record<string, unknown>): AppState =>
      loadState(createFakeStorage({ [STORAGE_KEY]: JSON.stringify({ ...stored, statistics }) }));

    /** Every win taken in one guess, so the buckets account for the number. */
    const buckets = (wins: number): number[] =>
      Array.from({ length: MAX_ATTEMPTS }, (_unused, index) => (index === 0 ? wins : 0));

    // WinsFallWithinGamesPlayed.
    expect(
      withStatistics({
        gamesPlayed: 1,
        wins: 2,
        currentStreak: 1,
        maxStreak: 1,
        distribution: buckets(2)
      }).statistics
    ).toEqual(empty);

    // CurrentStreakNeverExceedsMaximum.
    expect(
      withStatistics({
        gamesPlayed: 3,
        wins: 2,
        currentStreak: 2,
        maxStreak: 1,
        distribution: buckets(2)
      }).statistics
    ).toEqual(empty);

    // StreakCannotExceedWins.
    expect(
      withStatistics({
        gamesPlayed: 3,
        wins: 1,
        currentStreak: 2,
        maxStreak: 2,
        distribution: buckets(1)
      }).statistics
    ).toEqual(empty);

    // DistributionAccountsForEveryWin.
    expect(
      withStatistics({
        gamesPlayed: 3,
        wins: 2,
        currentStreak: 1,
        maxStreak: 2,
        distribution: buckets(1)
      }).statistics
    ).toEqual(empty);

    // And a history that holds all four comes back untouched.
    const honest = {
      gamesPlayed: 3,
      wins: 2,
      currentStreak: 1,
      maxStreak: 2,
      distribution: [1, 1, 0, 0, 0, 0]
    };

    expect(withStatistics(honest).statistics).toEqual(honest);
  });
});

describe('saving on a device that will not have it', () => {
  /*
   * Safari's private mode throws on write. The storage adapter is already
   * defensive about that, so this asserts the pairing rather than repeating the
   * port's own test: a game that cannot be saved is still playable, and the
   * next load simply finds nothing.
   */
  it('costs persistence rather than play', () => {
    const refuse = (): never => {
      throw new Error('storage is unavailable');
    };
    const storage = createWebStorage({
      get length(): number {
        return 0;
      },
      clear: refuse,
      getItem: refuse,
      key: refuse,
      removeItem: refuse,
      setItem: refuse
    });

    expect(() => {
      saveState(storage, lived());
    }).not.toThrow();
    expect(loadState(storage)).toEqual(createInitialState());
  });
});
