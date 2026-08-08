/**
 * Drawing an answer.
 *
 * `game.allium` and `statistics.allium` both call `uniform_choice`, and both
 * say the same thing about it: what matters is that every candidate is equally
 * likely, not that the same input yields the same word. That makes it the one
 * deliberately non-deterministic step in the specification, and therefore the
 * one that has to sit behind a port.
 */
export interface RandomPort {
  uniformChoice<Value>(items: readonly Value[]): Value;
}

/**
 * Index into a collection that has already been proven non-empty.
 *
 * Both callers reduce their index modulo the length, so it is always in range;
 * `noUncheckedIndexedAccess` cannot see that and types the lookup as possibly
 * undefined. The assertion records what the arithmetic already guarantees,
 * rather than adding a branch no input can reach.
 */
function at<Value>(items: readonly Value[], index: number): Value {
  return items[index] as Value;
}

function requireNonEmpty(length: number): void {
  if (length === 0) {
    throw new Error('uniformChoice needs at least one candidate');
  }
}

/**
 * A uniform choice backed by the platform's cryptographic source.
 *
 * Rejection sampling rather than a modulo: `value % length` favours the low
 * indices whenever the range does not divide evenly, which would quietly bias
 * which answers come up. The source is an argument so a test can supply one
 * instead of reaching for a global.
 */
export function createCryptoRandom(source: Pick<Crypto, 'getRandomValues'> = crypto): RandomPort {
  return {
    uniformChoice<Value>(items: readonly Value[]): Value {
      requireNonEmpty(items.length);
      const limit = Math.floor(0x1_0000_0000 / items.length) * items.length;
      const buffer = new Uint32Array(1);
      let drawn = limit;
      while (drawn >= limit) {
        source.getRandomValues(buffer);
        drawn = buffer[0] as number;
      }
      return at(items, drawn % items.length);
    }
  };
}

/**
 * A deterministic stand-in for tests: it walks the supplied offsets, cycling
 * when it runs out, so a test can say which candidate comes next.
 */
export function createFakeRandom(offsets: readonly number[] = [0]): RandomPort {
  const sequence = offsets.length > 0 ? offsets : [0];
  let position = 0;
  return {
    uniformChoice<Value>(items: readonly Value[]): Value {
      requireNonEmpty(items.length);
      const offset = at(sequence, position % sequence.length);
      position += 1;
      return at(items, ((offset % items.length) + items.length) % items.length);
    }
  };
}
