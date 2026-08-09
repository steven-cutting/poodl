import { describe, expect, it } from 'vitest';

import {
  describeAttempt,
  describeConclusion,
  describeCountdown,
  describeRejection,
  describeResults,
  describeSubmission
} from '../src/lib/domain/announcements';
import { scoreGuess } from '../src/lib/domain/scoring';

const RESULTS = scoreGuess('adopt', 'apple');

/*
 * The sentences three guarantees ask for: `EverySubmittedGuessIsAnnounced` and
 * `EveryRejectionIsAnnounced` on `GameBoard`, and `ConclusionIsAnnounced` on
 * `GameConclusion`. They live here rather than in a component so that what an
 * assistive technology hears is testable without rendering anything.
 */
describe('describeResults', () => {
  it('reads the marks in position order', () => {
    expect(describeResults(RESULTS)).toBe('A correct, D absent, O absent, P present, T absent');
  });
});

describe('describeAttempt', () => {
  it('names the attempt and its results', () => {
    expect(describeAttempt(1, RESULTS)).toBe(
      'Attempt 1: A correct, D absent, O absent, P present, T absent'
    );
  });
});

describe('describeSubmission', () => {
  // EverySubmittedGuessIsAnnounced: the results in reading order, the attempt
  // number, and how many attempts remain.
  it('adds how many attempts are left', () => {
    expect(describeSubmission(1, RESULTS, 5)).toBe(
      'Attempt 1: A correct, D absent, O absent, P present, T absent. 5 attempts remaining.'
    );
  });

  it('says one attempt rather than 1 attempts', () => {
    expect(describeSubmission(5, RESULTS, 1)).toContain('1 attempt remaining.');
  });

  it('says none are left when none are', () => {
    expect(describeSubmission(6, RESULTS, 0)).toContain('No attempts remaining.');
  });
});

describe('describeRejection', () => {
  // EveryRejectionIsAnnounced: it says which of the three reasons applied, and
  // a rejected guess spends no attempt, so each sentence tells the player what
  // to do next rather than only what went wrong.
  it('distinguishes all three reasons', () => {
    const sentences = (['incomplete', 'not_in_dictionary', 'hard_mode_violation'] as const).map(
      (reason) => describeRejection(reason)
    );

    expect(new Set(sentences).size).toBe(3);
    expect(sentences[0]).toMatch(/letters/i);
    expect(sentences[1]).toMatch(/word list/i);
    expect(sentences[2]).toMatch(/hard mode/i);
  });
});

describe('describeConclusion', () => {
  // OutcomeAnswerAndAttemptsAreAllShown: outcome, answer and attempt count, on
  // a win as well as on a loss.
  it('gives the outcome, the answer and the attempts on a win', () => {
    const sentence = describeConclusion('won', 'apple', 3);

    expect(sentence).toContain('won');
    expect(sentence).toContain('APPLE');
    expect(sentence).toContain('3');
  });

  it('gives the outcome, the answer and the attempts on a loss', () => {
    const sentence = describeConclusion('lost', 'apple', 6);

    expect(sentence).toContain('lost');
    expect(sentence).toContain('APPLE');
    expect(sentence).toContain('6');
  });
});

describe('describeCountdown', () => {
  // EndlessContinuesUnlessStopped: the remaining time is perceivable and
  // stopping it is an action the player can take while it runs, so the
  // announcement carries both.
  it('says how long is left and how to stop it', () => {
    const sentence = describeCountdown(7);

    expect(sentence).toContain('7');
    expect(sentence).toMatch(/stop/i);
  });

  it('says one second rather than 1 seconds', () => {
    expect(describeCountdown(1)).toContain('1 second.');
  });
});
