/**
 * Putting the shared results grid somewhere the player can paste it.
 *
 * `sharing.allium` requires the action to report whether the copy succeeded,
 * so this port resolves or rejects rather than failing silently.
 */
export interface ClipboardPort {
  write(text: string): Promise<void>;
}

/**
 * The browser clipboard.
 *
 * `navigator` is a defaulted argument rather than a global read, because jsdom
 * does not implement `navigator.clipboard` at all — a test supplies a
 * stand-in as an ordinary argument instead of stubbing the environment.
 *
 * The parameter type marks `clipboard` optional even though `lib.dom` declares
 * it as always present, because it is not: an insecure origin and jsdom both
 * leave it undefined. Typing it honestly is what makes the guard below a real
 * check rather than dead code.
 */
export function createNavigatorClipboard(
  source: { readonly clipboard?: Clipboard } = navigator
): ClipboardPort {
  return {
    async write(text) {
      const target = source.clipboard;
      if (target === undefined) {
        throw new Error('this browser exposes no clipboard');
      }
      await target.writeText(text);
    }
  };
}

/** Records what was copied so a test can assert on it. */
export interface FakeClipboard extends ClipboardPort {
  readonly writes: readonly string[];
}

export function createFakeClipboard(options: { failing?: boolean } = {}): FakeClipboard {
  const writes: string[] = [];
  return {
    writes,
    write(text) {
      if (options.failing === true) {
        return Promise.reject(new Error('clipboard unavailable'));
      }
      writes.push(text);
      return Promise.resolve();
    }
  };
}
