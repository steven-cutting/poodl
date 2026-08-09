import type { Command } from '$lib/app/commands';
import { hardModeMayBeEnabled, reduce } from '$lib/app/engine';
import { loadState, saveState } from '$lib/app/persistence';
import type { AppState } from '$lib/app/state';
import { animationsActive, darkActive } from '$lib/domain/appearance';
import type { ClipboardPort } from '$lib/ports/clipboard';
import type { ClockPort } from '$lib/ports/clock';
import type { PreferencesPort } from '$lib/ports/preferences';
import type { RandomPort } from '$lib/ports/random';
import type { StoragePort } from '$lib/ports/storage';
import type { TimerPort } from '$lib/ports/timer';
import type { WordListPort } from '$lib/ports/words';

/**
 * The one file with runes in it.
 *
 * `engine.ts` holds every rule and reaches nothing; this holds the state, wires
 * the ports to it, and does the two things a pure reducer cannot — write to the
 * clipboard, and watch a clock. Everything above it takes values and callbacks,
 * so no component has to know a port exists.
 */

/** How often the countdown is looked at. Fine enough to read as seconds. */
const TICK_MS = 250;

export interface Ports {
  storage: StoragePort;
  clock: ClockPort;
  random: RandomPort;
  clipboard: ClipboardPort;
  words: WordListPort;
  preferences: PreferencesPort;
  timer: TimerPort;
}

export interface Store {
  readonly state: AppState;
  /** `Appearance.dark_active`. */
  readonly darkActive: boolean;
  /** `Appearance.animations_active`. */
  readonly animationsActive: boolean;
  /** `SettingsPanel.hard_mode_may_be_enabled`. */
  readonly hardModeMayBeEnabled: boolean;
  /** Whole seconds left on an armed countdown, or null when none is running. */
  readonly secondsRemaining: number | null;
  dispatch(command: Command): void;
  /** Stop watching the clock and the device. */
  destroy(): void;
}

export function createStore(ports: Ports, options: { pageUrl: string }): Store {
  let state = $state<AppState>(loadState(ports.storage));
  let now = $state(ports.clock.now());
  let prefersDark = $state(ports.preferences.prefersDark());
  let prefersReducedMotion = $state(ports.preferences.prefersReducedMotion());

  let stopTicking: (() => void) | null = null;
  let discarded = false;

  const stopWatchingDevice = ports.preferences.subscribe(() => {
    prefersDark = ports.preferences.prefersDark();
    prefersReducedMotion = ports.preferences.prefersReducedMotion();
  });

  function countdownAt(): number | null {
    return state.currentGame?.autoContinueAt ?? null;
  }

  /**
   * Follow the countdown that the rules armed rather than deciding anything
   * about it. `ArmEndlessCountdown` fires once, at the transition, so a stopped
   * countdown stays stopped: there is nothing here that could arm one.
   */
  function watchCountdown(): void {
    if (countdownAt() === null) {
      stopTicking?.();
      stopTicking = null;
      return;
    }

    stopTicking ??= ports.timer.every(TICK_MS, () => {
      now = ports.clock.now();
      dispatch({ kind: 'countdown_elapsed' });
    });
  }

  /**
   * A store that has been thrown away does nothing more.
   *
   * The clipboard settles whenever the browser gets to it, and the report comes
   * back through here. Arriving after `destroy`, it would save to storage on
   * behalf of a page that has gone and — because every dispatch ends by looking
   * at the countdown — start a ticker with nothing left to stop it.
   */
  function dispatch(command: Command): void {
    if (discarded) {
      return;
    }

    now = ports.clock.now();

    const outcome = reduce(state, command, {
      now,
      words: ports.words,
      random: ports.random,
      pageUrl: options.pageUrl
    });

    if (outcome.state !== state) {
      state = outcome.state;
      saveState(ports.storage, state);
    }

    for (const effect of outcome.effects) {
      // The identifier goes back exactly as it arrived: the engine decides what
      // a late result means, and this only has to say which copy it belongs to.
      ports.clipboard.write(effect.text).then(
        () => {
          dispatch({ kind: 'clipboard_settled', id: effect.id, copied: true });
        },
        () => {
          dispatch({ kind: 'clipboard_settled', id: effect.id, copied: false });
        }
      );
    }

    watchCountdown();
  }

  watchCountdown();

  return {
    get state(): AppState {
      return state;
    },
    get darkActive(): boolean {
      return darkActive(state.settings.theme, prefersDark);
    },
    get animationsActive(): boolean {
      return animationsActive(state.settings.animations, prefersReducedMotion);
    },
    get hardModeMayBeEnabled(): boolean {
      return hardModeMayBeEnabled(state);
    },
    get secondsRemaining(): number | null {
      const at = countdownAt();
      return at === null ? null : Math.max(0, Math.ceil((at - now) / 1_000));
    },
    dispatch,
    destroy(): void {
      discarded = true;
      stopTicking?.();
      stopTicking = null;
      stopWatchingDevice();
    }
  };
}
