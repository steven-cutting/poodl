import answersData from '$lib/data/answers.txt?raw';
import guessesData from '$lib/data/guesses.txt?raw';

/**
 * The two word lists Poodl plays from.
 *
 * This realises the `WordListSource` contract in `docs/specs/words.allium`.
 * The lists are replaceable data, not content this code owns: swapping the
 * files changes what the game plays with and nothing else.
 */
export interface WordListPort {
  /** Curated answers, in a stable order so a draw can index into them. */
  answerWords(): readonly string[];
  /** Everything Poodl accepts as a guess. Answers are a subset of these. */
  guessWords(): ReadonlySet<string>;
}

function parse(data: string): string[] {
  return data
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0);
}

/** The lists bundled with the build. */
export function createBundledWordList(): WordListPort {
  const answers = parse(answersData);
  const guesses = new Set(parse(guessesData));
  return {
    answerWords: () => answers,
    guessWords: () => guesses
  };
}

/**
 * A list a test supplies directly. Answers are folded into the guess set so
 * the `AnswersAreASubsetOfGuesses` obligation holds by construction.
 */
export function createFakeWordList(
  answers: readonly string[],
  extraGuesses: readonly string[] = []
): WordListPort {
  const guesses = new Set([...answers, ...extraGuesses]);
  return {
    answerWords: () => [...answers],
    guessWords: () => guesses
  };
}
