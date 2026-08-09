import { describe, expect, it } from 'vitest';

import { STORAGE_KEY, loadState, saveState } from '../src/lib/app/persistence';
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

  it('refuses a game whose guesses do not describe a game', () => {
    const storage = createFakeStorage();
    saveState(storage, lived());

    const stored = JSON.parse(storage.read(STORAGE_KEY) as string) as {
      game: Record<string, unknown>;
    };
    const broken = JSON.stringify({
      ...stored,
      game: { ...stored.game, guesses: [{ position: 'first' }] }
    });

    expect(loadState(createFakeStorage({ [STORAGE_KEY]: broken })).currentGame).toBeNull();
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
