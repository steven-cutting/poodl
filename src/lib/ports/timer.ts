/**
 * Something happening again and again until it is told to stop.
 *
 * `game.allium` arms an endless countdown and lets it elapse, and
 * `EndlessContinuesUnlessStopped` requires the remaining time to be
 * perceivable — so the countdown has to be watched rather than computed once. A
 * test that waited ten real seconds for one would not be a test worth having,
 * which is why this is a port.
 */
export interface TimerPort {
  /** Run `tick` every `intervalMs`. The returned function stops it. */
  every(intervalMs: number, tick: () => void): () => void;
}

/** The part of the platform the interval adapter uses. */
export interface Scheduler {
  setInterval(tick: () => void, intervalMs: number): number;
  clearInterval(handle: number): void;
}

/**
 * The platform's own interval. The scheduler is an argument rather than a
 * global read, so a test drives the real adapter without stubbing anything.
 */
export function createIntervalTimer(
  scheduler: Scheduler = {
    setInterval: (tick, intervalMs) =>
      globalThis.setInterval(tick, intervalMs) as unknown as number,
    clearInterval: (handle) => {
      globalThis.clearInterval(handle);
    }
  }
): TimerPort {
  return {
    every(intervalMs, tick) {
      const handle = scheduler.setInterval(tick, intervalMs);

      return () => {
        scheduler.clearInterval(handle);
      };
    }
  };
}

export interface FakeTimer extends TimerPort {
  /** Move time forward, running whatever that reaches. */
  advance(milliseconds: number): void;
}

/** A clock-driven timer a test moves by hand. It never advances on its own. */
export function createFakeTimer(): FakeTimer {
  interface Repeating {
    intervalMs: number;
    tick: () => void;
    elapsed: number;
  }

  const repeating = new Set<Repeating>();

  return {
    every(intervalMs, tick) {
      const entry: Repeating = { intervalMs, tick, elapsed: 0 };
      repeating.add(entry);

      return () => repeating.delete(entry);
    },
    /*
     * The set is snapshotted, so a timer a tick starts does not fire for time
     * that passed before it existed — `setInterval` does not either. But
     * membership is checked again on every pass, because `clearInterval` takes
     * effect from the moment it is called and a tick that stops its own timer is
     * how the countdown ends: the store's `watchCountdown` does exactly that.
     * Without the check a stopped timer would keep firing to the end of the
     * advance, and no test could tell a cancellation from a coincidence.
     */
    advance(milliseconds) {
      for (const entry of [...repeating]) {
        entry.elapsed += milliseconds;

        while (repeating.has(entry) && entry.elapsed >= entry.intervalMs) {
          entry.elapsed -= entry.intervalMs;
          entry.tick();
        }
      }
    }
  };
}
