import { describe, expect, it } from 'vitest';

import { describeNotice } from '../src/lib/app/state';

import {
  describeAttempt,
  describeConclusion,
  describeCountdown,
  describeModeChip,
  describeRejection,
  describeResults,
  describeSubmission,
  markFor
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

/*
 * The mark a rendered cell is handed: the platform's name for the paint, and
 * Poodl's sentence about it. The engine's own vocabulary is untouched — the row
 * labels above still say "correct" — so this is the whole of the translation
 * and the only place it happens.
 */
describe('markFor', () => {
  it('gives the platform its name for each mark, and Poodl the words', () => {
    expect(markFor('correct')).toEqual({ name: 'exact', description: 'correct' });
    expect(markFor('present')).toEqual({
      name: 'present',
      description: 'in the word, wrong place'
    });
    expect(markFor('absent')).toEqual({ name: 'absent', description: 'not in the word' });
  });

  /*
   * The platform draws no mark it has no words for, so a blank sentence would
   * paint a cell and tell a reader nothing about it — a state carried by colour
   * and shape alone. Nothing but this holds the map to real sentences.
   */
  it('says something for every mark', () => {
    for (const mark of ['correct', 'present', 'absent'] as const) {
      expect(markFor(mark).description.trim()).not.toBe('');
    }
  });
});

/*
 * GameNavigation.@guarantee CurrentModeIsPerceivable, the chip half. The
 * platform draws the chip and knows nothing about modes; these are the words.
 */
describe('describeModeChip', () => {
  it('says no game is under way when none is', () => {
    expect(describeModeChip(null, null)).toEqual({
      word: 'No game',
      label: 'No game under way — change game'
    });
  });

  it('names the mode being played', () => {
    expect(describeModeChip('random', 'in_progress')).toEqual({
      word: 'random',
      label: 'Playing random — change game'
    });
  });

  it('says a finished game finished', () => {
    expect(describeModeChip('endless', 'won')).toEqual({
      word: 'endless',
      label: 'Endless finished — change game'
    });
  });

  /*
   * Never the two words together, in any combination. `InvalidLinkNotice`'s
   * "Play a random game" owns that query, and a second control matching it
   * would make every such query ambiguous — which a single hand-written case
   * would not have caught for the four modes nobody thought to try.
   */
  it('never puts "random game" in a label', () => {
    const modes = ['random', 'endless', 'practice', 'custom', 'daily'] as const;
    const states = [null, 'in_progress', 'won', 'lost', 'abandoned'] as const;

    for (const mode of modes) {
      for (const status of states) {
        expect(describeModeChip(mode, status).label).not.toMatch(/random game/);
      }
    }
  });
});

/*
 * What Poodl is telling the player right now. The platform's `Notice` takes a
 * sentence and a tone, so the sentences are the product's and are written once
 * for the three surfaces that show one.
 */
describe('describeNotice', () => {
  it('says which of the three rejections applied', () => {
    expect(describeNotice({ kind: 'guess_rejected', reason: 'not_in_dictionary' })).toEqual({
      message: 'That is not in the word list. Try another word.',
      tone: 'alert'
    });
  });

  it('names the entry a custom answer was refused for', () => {
    expect(describeNotice({ kind: 'custom_answer_rejected', entry: 'qqqqq' }).message).toContain(
      'qqqqq'
    );
  });

  it('refuses a link it did not make', () => {
    expect(describeNotice({ kind: 'custom_link_invalid' }).message).toBe(
      'That is not a Poodl link.'
    );
  });

  // The one kind that earns the tick; the four refusals take the default.
  it('reports both outcomes of a copy, and marks only success', () => {
    expect(describeNotice({ kind: 'results_copied' })).toEqual({
      message: 'Copied to the clipboard.',
      tone: 'success'
    });
    expect(describeNotice({ kind: 'copy_failed' }).tone).toBe('alert');
    expect(describeNotice({ kind: 'copy_failed' }).message).toMatch(
      /could not reach the clipboard/
    );
  });

  it('says nothing when there is nothing to say', () => {
    expect(describeNotice(null)).toEqual({ message: null, tone: 'alert' });
  });
});
