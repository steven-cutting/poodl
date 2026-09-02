import type { Command } from '$lib/app/commands';
import type { HardModeBlocker } from '$lib/app/engine';
import { hardModeBlocker, hardModeMayBeEnabled, reduce, resultsGrid } from '$lib/app/engine';
import { loadState, saveState } from '$lib/app/persistence';
import { keptDailyGame } from '$lib/app/state';
import type { AppState, ShareableView } from '$lib/app/state';
import { animationsActive, darkActive, highContrastActive } from '$lib/domain/appearance';
import { dayOf, dayStart } from '$lib/domain/calendar';
import type { GameStatus } from '$lib/domain/types';
import type { ClipboardPort } from '$lib/ports/clipboard';
import type { ClockPort } from '$lib/ports/clock';
import type { PreferencesPort } from '$lib/ports/preferences';
import type { RandomPort } from '$lib/ports/random';
import type { StoragePort } from '$lib/ports/storage';
import type { TimerPort } from '$lib/ports/timer';
import type { WordListPort } from '$lib/ports/words';

/**
 * The only rune-bearing file that is not a component or a route, and the only
 * place the application's state lives.
 *
 * `engine.ts` holds every rule and reaches nothing; this holds the state, wires
 * the ports to it, and does the two things a pure reducer cannot — write to the
 * clipboard, and watch a clock. Everything above it takes values and callbacks,
 * so no component has to know a port exists. What a component keeps for itself
 * is the text in a field, or the element focus has to return to — never a fact
 * the reducer owns.
 */

/** How often the countdown is looked at. Fine enough to read as seconds. */
const TICK_MS = 250;

/**
 * How often the calendar is looked at, so the day turns on a tab left open.
 *
 * `TodaysGame.today` is `day_of(now)`, and `TheNextWordIsAnnouncedInAdvance`
 * wants an earlier day's game said to be that day's once the date has moved
 * on — which a tab sitting idle across midnight would never say if `now`
 * moved only on dispatch. A minute is fine enough for a boundary that comes
 * once a day.
 */
const DAY_WATCH_MS = 60_000;

/**
 * `daily.allium`'s `TodaysGame` surface, as one value.
 *
 * Every field the surface exposes, derived together rather than one getter
 * each: `TheDayIsPerceivable` and `TheNextWordIsAnnouncedInAdvance` both need
 * the kept game's own day read against today's, and a surface handed only
 * `today` cannot tell an earlier day's game from this one's.
 */
export interface TodaysGameView {
  /** `today` — `day_of(now)`. */
  today: number;
  /** `kept_day` — the kept game's own day, or null when there is no kept game. */
  keptDay: number | null;
  /** `kept?.status`. */
  keptStatus: GameStatus | null;
  /** `kept?.is_current` — whether the kept game is the one on the board. */
  keptIsCurrent: boolean;
  /** `is_todays` — false when there is no kept game, since null is not today. */
  isTodays: boolean;
  /** `next_word_at` — `day_start(today + 1)`, always a local midnight. */
  nextWordAt: number;
}

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
  /** `Settings.high_contrast_active`. */
  readonly highContrastActive: boolean;
  /**
   * What Poodl has made to be taken away, with its text.
   *
   * A grid is rendered here rather than read out of the state, so
   * `PaletteFollowsHighContrast` holds while it sits on screen: the board and
   * the grid answer to the same `high_contrast_active`, and a device that turns
   * `prefers-contrast` on moves both at once.
   */
  readonly shareable: ShareableView | null;
  /** `SettingsPanel.hard_mode_may_be_enabled`. */
  readonly hardModeMayBeEnabled: boolean;
  /** `SettingsPanel.hard_mode_blocker` — which reason, when it may not be. */
  readonly hardModeBlocker: HardModeBlocker;
  /**
   * `daily.allium` — `TodaysGame.today`, `day_of(now)`. Follows the clock on
   * every dispatch, and once a minute besides, so a tab left open across
   * midnight turns the day on its own rather than waiting for a keystroke.
   */
  readonly today: number;
  /** `daily.allium` — the whole `TodaysGame` surface, today included. */
  readonly todaysGame: TodaysGameView;
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
  let prefersMoreContrast = $state(ports.preferences.prefersMoreContrast());

  let stopTicking: (() => void) | null = null;
  let discarded = false;

  const stopWatchingDevice = ports.preferences.subscribe(() => {
    prefersDark = ports.preferences.prefersDark();
    prefersReducedMotion = ports.preferences.prefersReducedMotion();
    prefersMoreContrast = ports.preferences.prefersMoreContrast();
  });

  /*
   * Watch the day rather than the clock: `now` moves here only when the
   * calendar date in the zone has turned, so nothing re-renders for time
   * merely passing and no rule runs — which day it is is a fact the surfaces
   * read, not a command.
   */
  const stopWatchingDay = ports.timer.every(DAY_WATCH_MS, () => {
    const current = ports.clock.now();

    if (dayOf(current) !== dayOf(now)) {
      now = current;
    }
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
      pageUrl: options.pageUrl,
      prefersMoreContrast
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
    get highContrastActive(): boolean {
      return highContrastActive(state.settings.highContrast, prefersMoreContrast);
    },
    get shareable(): ShareableView | null {
      if (state.shareable === null) {
        return null;
      }
      if (state.shareable.kind === 'custom_link') {
        return state.shareable;
      }

      // Nothing to show rather than an empty grid, in the case the rules make
      // unreachable: only a game finished by play produces a grid, and starting
      // the next one puts the grid away before it replaces the game.
      const text = resultsGrid(state, prefersMoreContrast);

      return text === null ? null : { kind: 'results', text };
    },
    get hardModeMayBeEnabled(): boolean {
      return hardModeMayBeEnabled(state);
    },
    get hardModeBlocker(): HardModeBlocker {
      return hardModeBlocker(state);
    },
    get today(): number {
      return dayOf(now);
    },
    get todaysGame(): TodaysGameView {
      const today = dayOf(now);
      const kept = keptDailyGame(state);
      const keptDay = kept === null ? null : dayOf(kept.startedAt);

      return {
        today,
        keptDay,
        keptStatus: kept?.status ?? null,
        keptIsCurrent: kept !== null && kept === state.currentGame,
        isTodays: keptDay === today,
        nextWordAt: dayStart(today + 1)
      };
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
      stopWatchingDay();
      stopWatchingDevice();
    }
  };
}
