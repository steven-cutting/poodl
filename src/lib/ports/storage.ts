/**
 * Persistent storage on this device.
 *
 * The specifications ask for a game, its settings and its statistics to
 * survive a reload without ever naming a mechanism. This port is that
 * boundary: everything above it is testable without a browser.
 */
export interface StoragePort {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}

/**
 * The browser's `localStorage`.
 *
 * The backing store is taken as an argument so a test can supply one instead
 * of reaching for a global. Every method is defensive: Safari's private mode
 * throws on write, and a game that cannot be saved must still be playable.
 */
export function createWebStorage(backing: Storage = localStorage): StoragePort {
  return {
    read(key) {
      try {
        return backing.getItem(key);
      } catch {
        return null;
      }
    },
    write(key, value) {
      try {
        backing.setItem(key, value);
      } catch {
        // A full or disabled store costs persistence, not play.
      }
    },
    remove(key) {
      try {
        backing.removeItem(key);
      } catch {
        // As above.
      }
    }
  };
}

/** An in-memory store for tests. */
export function createFakeStorage(initial: Readonly<Record<string, string>> = {}): StoragePort {
  const entries = new Map<string, string>(Object.entries(initial));
  return {
    read: (key) => entries.get(key) ?? null,
    write: (key, value) => {
      entries.set(key, value);
    },
    remove: (key) => {
      entries.delete(key);
    }
  };
}
