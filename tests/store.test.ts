import { afterEach, describe, expect, it } from 'vitest';

import { STORAGE_KEY, saveState } from '../src/lib/app/persistence';
import { createStore } from '../src/lib/app/store.svelte';
import type { Store } from '../src/lib/app/store.svelte';
import { ENDLESS_COUNTDOWN_MS } from '../src/lib/config';
import { createFakeClipboard } from '../src/lib/ports/clipboard';
import type { FakeClipboard } from '../src/lib/ports/clipboard';
import { createFakeClock } from '../src/lib/ports/clock';
import type { FakeClock } from '../src/lib/ports/clock';
import { createFakePreferences } from '../src/lib/ports/preferences';
import type { FakePreferences } from '../src/lib/ports/preferences';
import { createFakeRandom } from '../src/lib/ports/random';
import { createFakeStorage } from '../src/lib/ports/storage';
import type { StoragePort } from '../src/lib/ports/storage';
import { createFakeTimer } from '../src/lib/ports/timer';
import type { FakeTimer } from '../src/lib/ports/timer';
import { dayOf } from '../src/lib/domain/calendar';
import { createFakeWordList } from '../src/lib/ports/words';
import { ANSWERS, EXTRA, PAGE, createEnv, daysAfterEpoch, fresh, run } from './engineHarness';

interface Harness {
  store: Store;
  storage: StoragePort;
  clock: FakeClock;
  timer: FakeTimer;
  clipboard: FakeClipboard;
  preferences: FakePreferences;
}

let live: Harness | null = null;

afterEach(() => {
  live?.store.destroy();
  live = null;
});

function harness(options: { storage?: StoragePort; failingClipboard?: boolean } = {}): Harness {
  const storage = options.storage ?? createFakeStorage();
  const clock = createFakeClock(1_000);
  const timer = createFakeTimer();
  const clipboard = createFakeClipboard({ failing: options.failingClipboard });
  const preferences = createFakePreferences();

  const store = createStore(
    {
      storage,
      clock,
      timer,
      clipboard,
      preferences,
      random: createFakeRandom([0]),
      words: createFakeWordList(ANSWERS, EXTRA)
    },
    { pageUrl: PAGE }
  );

  live = { store, storage, clock, timer, clipboard, preferences };
  return live;
}

/** Let a promise the store started settle. */
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/*
 * The one file with runes in it. It holds the state, wires the ports to the
 * engine, and does the two things a pure reducer cannot: write to the clipboard
 * and watch a clock.
 */
describe('the store', () => {
  it('starts from what the device remembers', () => {
    const storage = createFakeStorage();
    const env = createEnv();
    saveState(storage, run(env, fresh(), { kind: 'new_game', mode: 'endless' }));

    const { store } = harness({ storage });

    expect(store.state.currentGame?.mode).toBe('endless');
    expect(store.state.lastMode).toBe('endless');
  });

  it('starts fresh on a device that remembers nothing', () => {
    const { store } = harness();

    expect(store.state.currentGame).toBeNull();
    expect(store.state.awaitingWelcome).toBe(false);
  });

  it('applies a command and keeps what it produced', () => {
    const { store, storage } = harness();

    store.dispatch({ kind: 'new_game', mode: 'random' });

    expect(store.state.currentGame?.status).toBe('in_progress');
    expect(storage.read(STORAGE_KEY)).toContain('"version"');
  });

  it('reads the clock at the moment of the command', () => {
    const { store, clock } = harness();

    clock.set(5_000);
    store.dispatch({ kind: 'new_game', mode: 'random' });

    expect(store.state.currentGame?.startedAt).toBe(5_000);
  });

  /*
   * `TodaysGame.today`: `day_of(now)`, following the clock exactly as `now`
   * does — as of the last dispatch, not ticking on its own. See daily.allium's
   * `@guidance` on why a live tick-driven refresh is a follow-up, not this.
   */
  it('reports the day, from the clock as of the last dispatch', () => {
    const { store, clock } = harness();

    clock.set(daysAfterEpoch(5));
    store.dispatch({ kind: 'open' });

    expect(store.today).toBe(dayOf(daysAfterEpoch(5)));
  });

  /*
   * The rest of the `TodaysGame` surface. `TheDayIsPerceivable` needs the kept
   * game's own day and how it ended to reach a surface at all, and
   * `TheNextWordIsAnnouncedInAdvance` needs `is_todays` to tell an earlier
   * day's game from today's — none of which `today` alone can say.
   */
  it('reports the kept daily game beside today, so an earlier day is not mistaken for today', () => {
    const { store, clock } = harness();

    clock.set(daysAfterEpoch(2));
    store.dispatch({ kind: 'new_game', mode: 'daily' });

    const onDay = store.todaysGame;

    expect(onDay.today).toBe(dayOf(daysAfterEpoch(2)));
    expect(onDay.keptDay).toBe(onDay.today);
    expect(onDay.keptStatus).toBe('in_progress');
    expect(onDay.keptIsCurrent).toBe(true);
    expect(onDay.isTodays).toBe(true);

    // The clock moves on; the same game is now an earlier day's.
    clock.set(daysAfterEpoch(3));
    store.dispatch({ kind: 'enter_letter', letter: 'a' });

    const nextDay = store.todaysGame;

    expect(nextDay.today).toBe(dayOf(daysAfterEpoch(3)));
    expect(nextDay.keptDay).toBe(dayOf(daysAfterEpoch(2)));
    expect(nextDay.isTodays).toBe(false);
  });

  it('reports no kept game when there is none', () => {
    const { store } = harness();

    store.dispatch({ kind: 'open' });

    expect(store.todaysGame.keptDay).toBeNull();
    expect(store.todaysGame.keptStatus).toBeNull();
    expect(store.todaysGame.isTodays).toBe(false);
  });

  // The kept game is still reported while it waits off the board.
  it('reports a set-aside daily game, which is not the one on the board', () => {
    const { store, clock } = harness();

    clock.set(daysAfterEpoch(2));
    store.dispatch({ kind: 'new_game', mode: 'daily' });
    store.dispatch({ kind: 'new_game', mode: 'random' });

    expect(store.todaysGame.keptDay).toBe(dayOf(daysAfterEpoch(2)));
    expect(store.todaysGame.keptIsCurrent).toBe(false);
    expect(store.todaysGame.isTodays).toBe(true);
  });
});

/*
 * sharing.allium — the action reports whether the copy succeeded, which is why
 * the clipboard is a promise the store owns rather than an effect it fires and
 * forgets.
 */
describe('copying a result', () => {
  async function finishedGame(failing = false): Promise<Harness> {
    const live_ = harness({ failingClipboard: failing });
    live_.store.dispatch({ kind: 'new_game', mode: 'random' });
    for (const letter of live_.store.state.currentGame?.answer ?? '') {
      live_.store.dispatch({ kind: 'enter_letter', letter });
    }
    live_.store.dispatch({ kind: 'submit_guess' });
    await settle();
    return live_;
  }

  it('puts the grid on the clipboard and says it worked', async () => {
    const { store, clipboard } = await finishedGame();

    store.dispatch({ kind: 'share_results' });
    await settle();

    expect(clipboard.writes).toHaveLength(1);
    expect(clipboard.writes[0]).toContain('Poodl 1/6');
    expect(store.state.notice).toEqual({ kind: 'results_copied' });
  });

  it('says so when the copy fails', async () => {
    const { store } = await finishedGame(true);

    store.dispatch({ kind: 'share_results' });
    await settle();

    expect(store.state.notice).toEqual({ kind: 'copy_failed' });
  });

  it('copies nothing while a game is still being played', async () => {
    const live_ = harness();
    live_.store.dispatch({ kind: 'new_game', mode: 'random' });
    live_.store.dispatch({ kind: 'share_results' });
    await settle();

    expect(live_.clipboard.writes).toEqual([]);
  });

  it('offers nothing to take away until something has been made', () => {
    const { store } = harness();

    expect(store.shareable).toBeNull();
  });

  it('hands a custom link over exactly as the rules made it', async () => {
    const { store } = harness();

    store.dispatch({ kind: 'create_custom_game', entry: ANSWERS[0] as string });
    await settle();

    expect(store.shareable?.kind).toBe('custom_link');
    expect(store.shareable?.text).toContain(PAGE);
  });

  /*
   * PaletteFollowsHighContrast, for the grid the player is looking at rather
   * than the one they copied. The board repaints from `high_contrast_active`
   * the moment the device asks, and the grid is rendered from the same
   * derivation, so the two cannot come apart while the grid sits on screen.
   */
  it('repaints the grid on screen when the device asks for more contrast', async () => {
    const { store, preferences, clipboard } = await finishedGame();

    store.dispatch({ kind: 'share_results' });
    await settle();

    expect(store.shareable?.text).toContain('🟩');

    preferences.set({ prefersMoreContrast: true });

    expect(store.shareable?.text).toContain('🟧');

    store.dispatch({ kind: 'copy_shareable' });
    await settle();

    expect(clipboard.writes.at(-1)).toContain('🟧');
  });
});

/*
 * game.allium — the endless countdown. EndlessContinuesUnlessStopped requires
 * the remaining time to be perceivable, so the store ticks rather than waiting
 * once.
 */
describe('the endless countdown', () => {
  function endlessWin(): Harness {
    const live_ = harness();
    live_.store.dispatch({ kind: 'new_game', mode: 'endless' });
    for (const letter of live_.store.state.currentGame?.answer ?? '') {
      live_.store.dispatch({ kind: 'enter_letter', letter });
    }
    live_.store.dispatch({ kind: 'submit_guess' });
    return live_;
  }

  it('has nothing to count down before a game ends', () => {
    const { store } = harness();

    expect(store.secondsRemaining).toBeNull();
  });

  it('counts down in whole seconds', () => {
    const { store, clock, timer } = endlessWin();

    expect(store.secondsRemaining).toBe(ENDLESS_COUNTDOWN_MS / 1_000);

    clock.advance(3_000);
    timer.advance(1_000);

    expect(store.secondsRemaining).toBe(7);
  });

  it('starts the next round once the countdown runs out', () => {
    const { store, clock, timer } = endlessWin();
    const first = store.state.currentGame?.answer;

    clock.advance(ENDLESS_COUNTDOWN_MS);
    timer.advance(1_000);

    expect(store.state.currentGame?.status).toBe('in_progress');
    expect(store.state.currentGame?.mode).toBe('endless');
    expect(store.secondsRemaining).toBeNull();
    expect(store.state.pool.used).toContain(first);
  });

  // StoppingTheCountdownIsFinal.
  it('stops for good when the player says so', () => {
    const { store, clock, timer } = endlessWin();

    store.dispatch({ kind: 'stop_countdown' });

    expect(store.secondsRemaining).toBeNull();

    clock.advance(ENDLESS_COUNTDOWN_MS * 4);
    timer.advance(10_000);

    expect(store.state.currentGame?.status).toBe('won');
  });

  it('stops ticking once the store is thrown away', () => {
    const live_ = endlessWin();
    live_.store.destroy();

    live_.clock.advance(ENDLESS_COUNTDOWN_MS);
    live_.timer.advance(1_000);

    expect(live_.store.state.currentGame?.status).toBe('won');
    live = null;
  });

  /*
   * The clipboard settles whenever the browser gets to it, which may be after
   * the page has gone. Every dispatch ends by looking at the countdown, so a
   * late report would start a ticker that nothing is left holding the stop for.
   */
  it('starts nothing on a clipboard report that arrives after it has gone', async () => {
    const live_ = endlessWin();

    live_.store.dispatch({ kind: 'share_results' });

    const before = live_.store.state;

    live_.store.destroy();
    await Promise.resolve();
    await Promise.resolve();

    live_.clock.advance(ENDLESS_COUNTDOWN_MS);
    live_.timer.advance(1_000);

    expect(live_.store.state).toBe(before);
    expect(live_.store.state.currentGame?.status).toBe('won');
    live = null;
  });
});

/*
 * settings.allium — the `Appearance` surface. The store is where the device's
 * preferences and the player's settings meet.
 */
describe('appearance', () => {
  // The default is dark, not system: a device asking for light does not get it
  // until the player chooses system or light.
  it('starts dark, whatever the device asks for', () => {
    const { store, preferences } = harness();

    expect(store.darkActive).toBe(true);

    preferences.set({ prefersDark: false });

    expect(store.darkActive).toBe(true);
  });

  // SystemFollowsTheDeviceAsItChanges.
  it('follows the device while the theme is system, and keeps following it', () => {
    const { store, preferences } = harness();

    store.dispatch({ kind: 'choose_theme', choice: 'system' });

    expect(store.darkActive).toBe(false);

    preferences.set({ prefersDark: true });

    expect(store.darkActive).toBe(true);
  });

  it('stops consulting the device once the player picks a side', () => {
    const { store, preferences } = harness();

    store.dispatch({ kind: 'choose_theme', choice: 'light' });
    preferences.set({ prefersDark: true });

    expect(store.darkActive).toBe(false);
  });

  it('gives no motion to a device that asked for less', () => {
    const { store, preferences } = harness();

    expect(store.animationsActive).toBe(true);

    preferences.set({ prefersReducedMotion: true });

    expect(store.animationsActive).toBe(false);
  });

  // MoreContrastFromTheDeviceTurnsHighContrastOn, and without overwriting the
  // player's own answer: the setting stays exactly as they left it.
  it('turns high contrast on for a device that asks for more of it', () => {
    const { store, preferences } = harness();

    expect(store.highContrastActive).toBe(false);

    preferences.set({ prefersMoreContrast: true });

    expect(store.highContrastActive).toBe(true);
    expect(store.state.settings.highContrast).toBe(false);
  });

  it('keeps high contrast on for a player who asked, on a device that did not', () => {
    const { store } = harness();

    store.dispatch({ kind: 'set_high_contrast', enabled: true });

    expect(store.highContrastActive).toBe(true);
  });

  it('stops listening to the device once it is thrown away', () => {
    const live_ = harness();
    live_.store.dispatch({ kind: 'choose_theme', choice: 'system' });
    live_.store.destroy();

    live_.preferences.set({ prefersDark: true });

    expect(live_.store.darkActive).toBe(false);
    live = null;
  });
});

describe('what the settings panel needs to know', () => {
  it('says whether hard mode may be turned on', () => {
    const { store } = harness();

    expect(store.hardModeMayBeEnabled).toBe(true);

    store.dispatch({ kind: 'new_game', mode: 'random' });
    store.dispatch({ kind: 'enable_hard_mode' });
    for (const letter of 'crumb') {
      store.dispatch({ kind: 'enter_letter', letter });
    }
    store.dispatch({ kind: 'submit_guess' });
    store.dispatch({ kind: 'disable_hard_mode' });

    expect(store.hardModeMayBeEnabled).toBe(false);
  });
});
