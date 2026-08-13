import { describe, expect, it } from 'vitest';

import { createFakeClock, createSystemClock } from '../src/lib/ports/clock';
import { createFakeClipboard, createNavigatorClipboard } from '../src/lib/ports/clipboard';
import { createCryptoRandom, createFakeRandom } from '../src/lib/ports/random';
import { createFakePreferences, createMediaPreferences } from '../src/lib/ports/preferences';
import type { MediaQueryListLike } from '../src/lib/ports/preferences';
import { createFakeStorage, createWebStorage, deviceStore } from '../src/lib/ports/storage';
import { createFakeTimer, createIntervalTimer } from '../src/lib/ports/timer';

/**
 * A working `Storage`, supplied to the adapter as an argument.
 *
 * jsdom exposes no `localStorage` under Node 26 — Node's own experimental
 * global shadows it and stays undefined without `--localstorage-file`. That
 * costs nothing here: the adapter takes its backing store as a parameter, so
 * the real code path is exercised without a browser and without stubbing a
 * global.
 */
function memoryStorage(): Storage {
  const entries = new Map<string, string>();
  return {
    get length(): number {
      return entries.size;
    },
    clear: () => {
      entries.clear();
    },
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [...entries.keys()][index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key);
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    }
  };
}

/** A Storage whose every operation fails, as Safari's private mode does. */
function unusableStorage(): Storage {
  const refuse = (): never => {
    throw new Error('storage is unavailable');
  };
  return {
    get length(): number {
      return 0;
    },
    clear: refuse,
    getItem: refuse,
    key: refuse,
    removeItem: refuse,
    setItem: refuse
  };
}

/** A random source that hands out the given words in order. */
function sequenceSource(values: readonly number[]): Pick<Crypto, 'getRandomValues'> {
  let position = 0;
  return {
    getRandomValues<Target extends ArrayBufferView | null>(target: Target): Target {
      if (target instanceof Uint32Array) {
        target[0] = values[position] ?? 0;
        position += 1;
      }
      return target;
    }
  };
}

describe('storage port', () => {
  it('round-trips a value through the browser store', () => {
    const storage = createWebStorage(memoryStorage());

    expect(storage.read('poodl:game')).toBeNull();
    storage.write('poodl:game', '{"mode":"random"}');
    expect(storage.read('poodl:game')).toBe('{"mode":"random"}');

    storage.remove('poodl:game');
    expect(storage.read('poodl:game')).toBeNull();
  });

  it('stays usable where there is no store at all', () => {
    // The ambient default, in an environment that provides nothing. Losing
    // persistence must not cost the player the game.
    const storage = createWebStorage();

    expect(() => {
      storage.write('poodl:game', 'anything');
    }).not.toThrow();
    expect(storage.read('poodl:game')).toBeNull();
  });

  /*
   * Where the origin is opaque or the player has blocked site data, reading
   * `localStorage` throws rather than returning something unusable — which is
   * why the read cannot sit in a default argument. Nothing above this port sees
   * it: the page has to start.
   */
  it('stays usable where the store refuses to be read at all', () => {
    const storage = createWebStorage(
      deviceStore(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      })
    );

    expect(() => {
      storage.write('poodl:game', 'anything');
    }).not.toThrow();
    expect(storage.read('poodl:game')).toBeNull();
  });

  it('keeps working when the store refuses every operation', () => {
    const storage = createWebStorage(unusableStorage());

    expect(() => {
      storage.write('poodl:game', 'anything');
    }).not.toThrow();
    expect(() => {
      storage.remove('poodl:game');
    }).not.toThrow();
    expect(storage.read('poodl:game')).toBeNull();
  });

  it('offers the same contract in memory', () => {
    const storage = createFakeStorage({ 'poodl:settings': '{"hardMode":true}' });

    expect(storage.read('poodl:settings')).toBe('{"hardMode":true}');
    expect(storage.read('poodl:missing')).toBeNull();

    storage.write('poodl:settings', '{"hardMode":false}');
    expect(storage.read('poodl:settings')).toBe('{"hardMode":false}');

    storage.remove('poodl:settings');
    expect(storage.read('poodl:settings')).toBeNull();
  });
});

describe('random port', () => {
  it('draws from the platform source', () => {
    const random = createCryptoRandom(sequenceSource([7]));

    expect(random.uniformChoice(['a', 'b', 'c'])).toBe('b');
  });

  it('rejects a draw that would bias the low indices', () => {
    // With three candidates the top value of the 32-bit range has no partner,
    // so it is discarded and the next draw is used instead.
    const random = createCryptoRandom(sequenceSource([0xff_ff_ff_ff, 7]));

    expect(random.uniformChoice(['a', 'b', 'c'])).toBe('b');
  });

  it('uses the real platform source by default', () => {
    const random = createCryptoRandom();

    expect(['a', 'b', 'c']).toContain(random.uniformChoice(['a', 'b', 'c']));
  });

  it('walks a fixed sequence in tests, cycling when it runs out', () => {
    const random = createFakeRandom([2, 0]);
    const items = ['a', 'b', 'c'];

    expect(random.uniformChoice(items)).toBe('c');
    expect(random.uniformChoice(items)).toBe('a');
    expect(random.uniformChoice(items)).toBe('c');
  });

  it('wraps an offset that overruns the collection', () => {
    expect(createFakeRandom([4]).uniformChoice(['a', 'b', 'c'])).toBe('b');
    expect(createFakeRandom([]).uniformChoice(['a', 'b'])).toBe('a');
  });

  it('refuses to draw from nothing', () => {
    expect(() => createFakeRandom().uniformChoice([])).toThrow(/at least one candidate/);
    expect(() => createCryptoRandom(sequenceSource([0])).uniformChoice([])).toThrow(
      /at least one candidate/
    );
  });
});

describe('clock port', () => {
  it('reads the supplied time source', () => {
    expect(createSystemClock(() => 1_234).now()).toBe(1_234);
  });

  it('reads the system clock by default', () => {
    expect(createSystemClock().now()).toBeGreaterThan(0);
  });

  it('only moves when a test moves it', () => {
    const clock = createFakeClock(1_000);

    expect(clock.now()).toBe(1_000);
    clock.advance(5_000);
    expect(clock.now()).toBe(6_000);
    clock.set(0);
    expect(clock.now()).toBe(0);
  });

  it('starts at the epoch by default', () => {
    expect(createFakeClock().now()).toBe(0);
  });
});

describe('clipboard port', () => {
  it('writes through the supplied navigator', async () => {
    const written: string[] = [];
    const clipboard = createNavigatorClipboard({
      clipboard: {
        writeText: (text: string) => {
          written.push(text);
          return Promise.resolve();
        }
      } as Clipboard
    });

    await clipboard.write('Poodl 4/6');

    expect(written).toEqual(['Poodl 4/6']);
  });

  it('reports a browser that exposes no clipboard', async () => {
    const clipboard = createNavigatorClipboard({});

    await expect(clipboard.write('Poodl 4/6')).rejects.toThrow(/no clipboard/);
  });

  it('records what a test copied', async () => {
    const clipboard = createFakeClipboard();

    await clipboard.write('Poodl X/6');

    expect(clipboard.writes).toEqual(['Poodl X/6']);
  });

  it('can be made to fail so the caller error path is exercised', async () => {
    const clipboard = createFakeClipboard({ failing: true });

    await expect(clipboard.write('Poodl 4/6')).rejects.toThrow(/unavailable/);
    expect(clipboard.writes).toEqual([]);
  });

  it('falls back to the ambient navigator, which jsdom leaves without a clipboard', async () => {
    await expect(createNavigatorClipboard().write('Poodl 4/6')).rejects.toThrow(/no clipboard/);
  });
});

/*
 * settings.allium reads two preferences the player expressed to their operating
 * system rather than to Poodl. `Appearance` keeps matching the colour scheme as
 * it changes, so this port watches as well as reads.
 */
describe('the preferences port', () => {
  /** A `matchMedia` a test controls, standing in for the one jsdom lacks. */
  function fakeMatchMedia(state: Record<string, boolean>) {
    const listeners = new Map<string, Set<() => void>>();

    const change = (query: string, matches: boolean): void => {
      state[query] = matches;
      for (const listener of listeners.get(query) ?? []) {
        listener();
      }
    };

    const matchMedia = (query: string): MediaQueryListLike => ({
      get matches(): boolean {
        return state[query] ?? false;
      },
      addEventListener: (_type: 'change', listener: () => void) => {
        const registered = listeners.get(query) ?? new Set();
        registered.add(listener);
        listeners.set(query, registered);
      },
      removeEventListener: (_type: 'change', listener: () => void) => {
        listeners.get(query)?.delete(listener);
      }
    });

    return { matchMedia, change };
  }

  it('reads all three device preferences', () => {
    const media = fakeMatchMedia({
      '(prefers-color-scheme: dark)': true,
      '(prefers-reduced-motion: reduce)': false,
      '(prefers-contrast: more)': true
    });
    const preferences = createMediaPreferences(media.matchMedia);

    expect(preferences.prefersDark()).toBe(true);
    expect(preferences.prefersReducedMotion()).toBe(false);
    expect(preferences.prefersMoreContrast()).toBe(true);
  });

  /*
   * Contrast and colour scheme are separate questions, as the spec says
   * outright: a device can ask for more contrast in either one. A port that
   * read one query for both would pass every test above and still turn the
   * high-contrast palette on for anybody in dark mode.
   */
  it('asks about contrast separately from the colour scheme', () => {
    const media = fakeMatchMedia({
      '(prefers-color-scheme: dark)': true,
      '(prefers-contrast: more)': false
    });
    const preferences = createMediaPreferences(media.matchMedia);

    expect(preferences.prefersDark()).toBe(true);
    expect(preferences.prefersMoreContrast()).toBe(false);
  });

  // MoreContrastFromTheDeviceTurnsHighContrastOn is only as live as this: a
  // device that changes its mind has to be heard, the same as for the theme.
  it('reports a change of contrast preference', () => {
    const media = fakeMatchMedia({ '(prefers-contrast: more)': false });
    const preferences = createMediaPreferences(media.matchMedia);
    let changes = 0;
    const stop = preferences.subscribe(() => {
      changes += 1;
    });

    media.change('(prefers-contrast: more)', true);

    expect(changes).toBe(1);
    expect(preferences.prefersMoreContrast()).toBe(true);

    stop();
    media.change('(prefers-contrast: more)', false);

    expect(changes).toBe(1);
  });

  // ThemeFollowsTheDeviceUntilThePlayerChooses: it keeps matching as it changes.
  it('reports a change, and stops once nobody is listening', () => {
    const media = fakeMatchMedia({ '(prefers-color-scheme: dark)': false });
    const preferences = createMediaPreferences(media.matchMedia);
    let changes = 0;

    const stop = preferences.subscribe(() => {
      changes += 1;
    });

    media.change('(prefers-color-scheme: dark)', true);

    expect(changes).toBe(1);
    expect(preferences.prefersDark()).toBe(true);

    stop();
    media.change('(prefers-color-scheme: dark)', false);

    expect(changes).toBe(1);
  });

  it('has a fake a test can move', () => {
    const preferences = createFakePreferences({ prefersDark: false });
    let changes = 0;
    const stop = preferences.subscribe(() => {
      changes += 1;
    });

    preferences.set({ prefersDark: true, prefersReducedMotion: true, prefersMoreContrast: true });

    expect(preferences.prefersDark()).toBe(true);
    expect(preferences.prefersReducedMotion()).toBe(true);
    expect(preferences.prefersMoreContrast()).toBe(true);
    expect(changes).toBe(1);

    stop();
    preferences.set({
      prefersDark: false,
      prefersReducedMotion: false,
      prefersMoreContrast: false
    });

    expect(changes).toBe(1);
  });

  // jsdom supplies a window without matchMedia, so the ambient fallback is the
  // real code path here rather than a hypothetical one.
  it('falls back to a device that asks for nothing where matchMedia is absent', () => {
    const preferences = createMediaPreferences();
    const stop = preferences.subscribe(() => undefined);

    expect(preferences.prefersDark()).toBe(false);
    expect(preferences.prefersReducedMotion()).toBe(false);
    expect(preferences.prefersMoreContrast()).toBe(false);
    expect(() => {
      stop();
    }).not.toThrow();
  });
});

/*
 * game.allium's endless countdown has to be watched rather than computed once:
 * the remaining time is perceivable while it runs. A test that waited ten real
 * seconds for one would not be worth having.
 */
describe('the timer port', () => {
  it('repeats until it is stopped', () => {
    const scheduled: (() => void)[] = [];
    let cleared = 0;

    const timer = createIntervalTimer({
      setInterval: (tick: () => void) => {
        scheduled.push(tick);
        return scheduled.length;
      },
      clearInterval: () => {
        cleared += 1;
      }
    });

    const stop = timer.every(250, () => undefined);

    expect(scheduled).toHaveLength(1);

    stop();

    expect(cleared).toBe(1);
  });

  // The adapter's own default, which is the code path the browser takes.
  it('uses the platform scheduler when it is given none', async () => {
    const timer = createIntervalTimer();
    let ticks = 0;

    const stop = timer.every(1, () => {
      ticks += 1;
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    stop();
    const settled = ticks;
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(settled).toBeGreaterThan(0);
    expect(ticks).toBe(settled);
  });

  it('has a fake a test can advance', () => {
    const timer = createFakeTimer();
    let ticks = 0;

    const stop = timer.every(250, () => {
      ticks += 1;
    });

    timer.advance(1_000);

    expect(ticks).toBe(4);

    stop();
    timer.advance(1_000);

    expect(ticks).toBe(4);
  });

  /*
   * The stop above is called between advances, which is the easy half. The
   * countdown stops itself from inside a tick — `watchCountdown` sees the armed
   * time gone and clears the ticker on the way out of the dispatch — so the fake
   * has to honour a stop mid-advance the way `clearInterval` does. A fake that
   * ran to the end of the advance regardless would report a cancelled timer and
   * a coincidence identically.
   */
  it('honours a stop the tick itself calls', () => {
    const timer = createFakeTimer();
    let stop: (() => void) | null = null;
    let ticks = 0;

    stop = timer.every(250, () => {
      ticks += 1;
      stop?.();
    });

    timer.advance(1_000);

    expect(ticks).toBe(1);
  });

  it('runs every timer the fake is holding', () => {
    const timer = createFakeTimer();
    const ticked: string[] = [];

    timer.every(100, () => ticked.push('fast'));
    timer.every(300, () => ticked.push('slow'));
    timer.advance(300);

    expect(ticked.filter((name) => name === 'fast')).toHaveLength(3);
    expect(ticked.filter((name) => name === 'slow')).toHaveLength(1);
  });
});
