/**
 * What the player asked their operating system for.
 *
 * `settings.allium` declares a `DevicePreferences` entity with a colour scheme
 * and a reduced-motion preference on it, and says Poodl reads them and never
 * writes them. `ThemeFollowsTheDeviceUntilThePlayerChooses` adds that Poodl
 * "keeps matching it as it changes", so this port watches as well as reads.
 */
export interface PreferencesPort {
  prefersDark(): boolean;
  prefersReducedMotion(): boolean;
  /** Call on any change. The returned function stops listening. */
  subscribe(listener: () => void): () => void;
}

/**
 * The part of `MediaQueryList` this port uses.
 *
 * Named rather than taken from `lib.dom` because the adapter has to accept a
 * stand-in: jsdom under Node 26 has no `matchMedia` at all, and a test supplies
 * one as an ordinary argument rather than stubbing the environment.
 */
export interface MediaQueryListLike {
  readonly matches: boolean;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

export type MatchMedia = (query: string) => MediaQueryListLike;

const DARK = '(prefers-color-scheme: dark)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/**
 * The device, through media queries.
 *
 * `matchMedia` is a defaulted argument rather than a global read, and its type
 * admits `undefined` because that is honest: prerendering in Node leaves it
 * absent, and so does jsdom, which supplies a `window` without one. A device
 * Poodl cannot ask is a device that asked for nothing, which is the same answer
 * as a device with no preference — so this never throws and never needs a
 * caller to know which environment it is in.
 */
export function createMediaPreferences(
  matchMedia: MatchMedia | undefined = typeof globalThis.matchMedia === 'function'
    ? (query) => globalThis.matchMedia(query)
    : undefined
): PreferencesPort {
  if (matchMedia === undefined) {
    return {
      prefersDark: () => false,
      prefersReducedMotion: () => false,
      subscribe: () => () => undefined
    };
  }

  const dark = matchMedia(DARK);
  const motion = matchMedia(REDUCED_MOTION);

  return {
    prefersDark: () => dark.matches,
    prefersReducedMotion: () => motion.matches,
    subscribe(listener) {
      dark.addEventListener('change', listener);
      motion.addEventListener('change', listener);

      return () => {
        dark.removeEventListener('change', listener);
        motion.removeEventListener('change', listener);
      };
    }
  };
}

export interface FakePreferences extends PreferencesPort {
  set(next: { prefersDark?: boolean; prefersReducedMotion?: boolean }): void;
}

/** A device a test can change its mind on. */
export function createFakePreferences(
  initial: { prefersDark?: boolean; prefersReducedMotion?: boolean } = {}
): FakePreferences {
  let dark = initial.prefersDark ?? false;
  let reduced = initial.prefersReducedMotion ?? false;
  const listeners = new Set<() => void>();

  return {
    prefersDark: () => dark,
    prefersReducedMotion: () => reduced,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(next) {
      dark = next.prefersDark ?? dark;
      reduced = next.prefersReducedMotion ?? reduced;
      for (const listener of listeners) {
        listener();
      }
    }
  };
}
