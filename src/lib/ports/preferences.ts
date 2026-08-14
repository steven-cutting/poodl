/**
 * What the player asked their operating system for.
 *
 * `settings.allium` declares a `DevicePreferences` entity with a colour scheme,
 * a reduced-motion preference and a more-contrast preference on it, and says
 * Poodl reads them and never writes them.
 * `ThemeFollowsTheDeviceUntilThePlayerChooses` adds that Poodl "keeps matching
 * it as it changes", so this port watches as well as reads.
 */
export interface PreferencesPort {
  prefersDark(): boolean;
  prefersReducedMotion(): boolean;
  /**
   * `DevicePreferences.prefers_more_contrast`. A separate question from the
   * colour scheme, as the spec says outright: a device can ask for more
   * contrast in either one.
   */
  prefersMoreContrast(): boolean;
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
/*
 * `more` and not `custom`. The media feature has both, and they answer
 * different questions: `more` is the player asking for more contrast, while
 * `custom` merely reports that some palette has been forced on the page —
 * Windows high contrast being the usual one, which substitutes its own colours
 * and would be answered by `forced-colors`, not by swapping in Poodl's second
 * palette on top.
 */
const MORE_CONTRAST = '(prefers-contrast: more)';

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
      prefersMoreContrast: () => false,
      subscribe: () => () => undefined
    };
  }

  const dark = matchMedia(DARK);
  const motion = matchMedia(REDUCED_MOTION);
  const contrast = matchMedia(MORE_CONTRAST);

  return {
    prefersDark: () => dark.matches,
    prefersReducedMotion: () => motion.matches,
    prefersMoreContrast: () => contrast.matches,
    subscribe(listener) {
      dark.addEventListener('change', listener);
      motion.addEventListener('change', listener);
      contrast.addEventListener('change', listener);

      return () => {
        dark.removeEventListener('change', listener);
        motion.removeEventListener('change', listener);
        contrast.removeEventListener('change', listener);
      };
    }
  };
}

/** What a device can be asked, which is also what a test can set. */
interface DeviceAnswers {
  prefersDark?: boolean;
  prefersReducedMotion?: boolean;
  prefersMoreContrast?: boolean;
}

export interface FakePreferences extends PreferencesPort {
  set(next: DeviceAnswers): void;
}

/** A device a test can change its mind on. */
export function createFakePreferences(initial: DeviceAnswers = {}): FakePreferences {
  let dark = initial.prefersDark ?? false;
  let reduced = initial.prefersReducedMotion ?? false;
  let contrast = initial.prefersMoreContrast ?? false;
  const listeners = new Set<() => void>();

  return {
    prefersDark: () => dark,
    prefersReducedMotion: () => reduced,
    prefersMoreContrast: () => contrast,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set(next) {
      dark = next.prefersDark ?? dark;
      reduced = next.prefersReducedMotion ?? reduced;
      contrast = next.prefersMoreContrast ?? contrast;
      for (const listener of listeners) {
        listener();
      }
    }
  };
}
