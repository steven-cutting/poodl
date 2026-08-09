/**
 * Shared scaffolding for the four suites that drive `reduce`.
 *
 * Not a test file: `vite.config.ts` includes `tests/**\/*.test.ts`, so this is
 * imported and never collected. It exists so the engine suites agree on one
 * vocabulary — the same fake word list, the same fake randomness, the same way
 * of playing a guess — rather than each inventing its own.
 */

import type { Command } from '../src/lib/app/commands';
import { reduce } from '../src/lib/app/engine';
import type { Env } from '../src/lib/app/engine';
import { createInitialState } from '../src/lib/app/state';
import type { AppState } from '../src/lib/app/state';
import { encodeAnswer } from '../src/lib/domain/obfuscation';
import { createFakeRandom } from '../src/lib/ports/random';
import { createFakeWordList } from '../src/lib/ports/words';

/** Three answers, so exhausting the pool takes three games rather than 2,393. */
export const ANSWERS = ['apple', 'adopt', 'alarm'];

/** Words Poodl accepts as guesses but never sets as answers. */
export const EXTRA = ['ample', 'aloud', 'crumb', 'zesty', 'apply', 'aside', 'again', 'aroma'];

/** A word this build has never heard of, for the link that cannot be opened. */
export const UNKNOWN_WORD = 'brick';

export const PAGE = 'https://poodl.test/';

export function createEnv(overrides: Partial<Env> = {}): Env {
  return {
    now: 1_000,
    words: createFakeWordList(ANSWERS, EXTRA),
    random: createFakeRandom([0]),
    pageUrl: PAGE,
    ...overrides
  };
}

/** A player who has never played, on a device that remembers nothing. */
export function fresh(): AppState {
  return createInitialState();
}

/** Fold a run of commands, which is what the store does one at a time. */
export function run(env: Env, state: AppState, ...commands: readonly Command[]): AppState {
  return commands.reduce((current, command) => reduce(current, command, env).state, state);
}

/** Type a word into the board and submit it. */
export function playGuess(env: Env, state: AppState, word: string): AppState {
  const letters: Command[] = [...word].map((letter) => ({ kind: 'enter_letter', letter }));
  return run(env, state, ...letters, { kind: 'submit_guess' });
}

/** Win the game on the board in one guess, whatever its answer turned out to be. */
export function winInOne(env: Env, state: AppState): AppState {
  return playGuess(env, state, answerOf(state));
}

/** Lose the game on the board by spending every attempt on something else. */
export function loseOutright(env: Env, state: AppState): AppState {
  const wrong = EXTRA.filter((word) => word !== answerOf(state));

  return wrong.slice(0, 6).reduce((current, word) => playGuess(env, current, word), state);
}

/** The answer of the game on the board. Tests know it; no surface does. */
export function answerOf(state: AppState): string {
  const answer = state.currentGame?.answer;

  if (answer === undefined) {
    throw new Error('there is no game on the board');
  }
  return answer;
}

/** A token, made the way the codec makes one rather than through the engine. */
export function tokenFor(word: string): string {
  return encodeAnswer(word);
}
