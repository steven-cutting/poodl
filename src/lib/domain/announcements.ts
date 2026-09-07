import type { Mark } from '@steven-cutting/biscuit-games';

import type { GuessRejectionReason, LetterMark, LetterResult } from '$lib/domain/types';

/**
 * What Poodl says out loud.
 *
 * Three guarantees ask for an announcement — `EverySubmittedGuessIsAnnounced`
 * and `EveryRejectionIsAnnounced` on `GameBoard`, and `ConclusionIsAnnounced`
 * on `GameConclusion` — and each names what the sentence has to carry. Building
 * them here rather than inside a component makes what an assistive technology
 * hears testable without rendering anything, and keeps the board's row labels
 * and the live region saying the same thing.
 */

/**
 * What each mark means, in Poodl's words: the sentence a cell says after its
 * letter. One map for the board, the keyboard and the explanation, which used
 * to hold two identical copies of it between them.
 *
 * Every value is a real sentence, and has to be. The platform draws no mark it
 * has no words for — `EveryMarkIsNamedInWords` — so a blank here would paint a
 * cell and tell a reader nothing about it, which is the failure that clause
 * exists to name.
 */
const MARK_DESCRIPTIONS: Record<LetterMark, string> = {
  correct: 'correct',
  present: 'in the word, wrong place',
  absent: 'not in the word'
};

/**
 * A result as the platform paints it, with Poodl's sentence for it.
 *
 * The engine says `correct`, because that is what Poodl's rules say. The
 * platform's name for the paint is `exact`, after the `--result-exact` token
 * the stylesheet chose before any component did. This is the whole of the
 * translation between the two, applied where a mark reaches something rendered
 * and nowhere else: `describeResults` below still says `correct`, because a row
 * label and an announcement are the game speaking about its own rules.
 */
export function markFor(mark: LetterMark): Mark {
  return { name: mark === 'correct' ? 'exact' : mark, description: MARK_DESCRIPTIONS[mark] };
}

const REJECTIONS: Record<GuessRejectionReason, string> = {
  incomplete: 'Not enough letters. Fill the row before submitting.',
  not_in_dictionary: 'That is not in the word list. Try another word.',
  hard_mode_violation: 'Hard mode: every letter already revealed has to be used.'
};

/** How many attempts are left, in words that read correctly at nought and one. */
function remaining(attempts: number): string {
  if (attempts === 0) {
    return 'No attempts remaining.';
  }
  return attempts === 1 ? '1 attempt remaining.' : `${attempts} attempts remaining.`;
}

/** One guess's marks, in position order: the reading order of the row. */
export function describeResults(results: readonly LetterResult[]): string {
  return results.map((result) => `${result.letter.toUpperCase()} ${result.mark}`).join(', ');
}

/** A board row's accessible name. */
export function describeAttempt(position: number, results: readonly LetterResult[]): string {
  return `Attempt ${position}: ${describeResults(results)}`;
}

/** What is announced when a guess is accepted. */
export function describeSubmission(
  position: number,
  results: readonly LetterResult[],
  attemptsRemaining: number
): string {
  return `${describeAttempt(position, results)}. ${remaining(attemptsRemaining)}`;
}

/** What is announced when a guess is refused. A rejection spends no attempt. */
export function describeRejection(reason: GuessRejectionReason): string {
  return REJECTIONS[reason];
}

/** What is announced when the game ends: the outcome, the answer, the count. */
export function describeConclusion(
  status: 'won' | 'lost',
  answer: string,
  attemptsUsed: number
): string {
  const attempts = attemptsUsed === 1 ? '1 attempt' : `${attemptsUsed} attempts`;
  const outcome = status === 'won' ? `You won in ${attempts}.` : `You lost after ${attempts}.`;

  return `${outcome} The answer was ${answer.toUpperCase()}.`;
}

/** What is announced while an endless countdown runs, and how to stop it. */
export function describeCountdown(secondsRemaining: number): string {
  const seconds = secondsRemaining === 1 ? '1 second' : `${secondsRemaining} seconds`;

  return `The next game starts in ${seconds}. Stop the countdown to stay here.`;
}
