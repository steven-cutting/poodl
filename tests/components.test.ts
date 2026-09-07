import { render, screen, within } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Board from '../src/lib/components/Board.svelte';
import TodaysGame from '../src/lib/components/TodaysGame.svelte';
import { MAX_ATTEMPTS } from '../src/lib/config';
import { dayStart } from '../src/lib/domain/calendar';
import { scoreGuess } from '../src/lib/domain/scoring';
import type { ScoredGuess } from '../src/lib/domain/types';

const ANSWER = 'apple';

function played(words: readonly string[]): ScoredGuess[] {
  return words.map((word) => ({ results: scoreGuess(word, ANSWER) }));
}

describe('Board', () => {
  it('shows one row per attempt, whether played or not', () => {
    render(Board, { guesses: played(['adopt']) });

    expect(screen.getAllByRole('listitem')).toHaveLength(MAX_ATTEMPTS);
  });

  it('names a submitted attempt by its per-letter results, in reading order', () => {
    render(Board, { guesses: played(['adopt']) });

    expect(
      screen.getByRole('listitem', {
        name: 'Attempt 1: A correct, D absent, O absent, P present, T absent'
      })
    ).toBeInTheDocument();
  });

  it('shows the letters typed but not yet submitted', () => {
    render(Board, { guesses: played(['adopt']), currentInput: 'app' });

    const row = screen.getByRole('listitem', { name: 'Attempt 2: APP, not yet submitted' });

    expect(within(row).getByRole('img', { name: 'Position 3, P' })).toBeInTheDocument();
    expect(within(row).getByRole('img', { name: 'Position 4, empty' })).toBeInTheDocument();
  });

  it('reports how many attempts are used and how many remain', () => {
    render(Board, { guesses: played(['adopt', 'alarm']) });

    expect(screen.getByText('2 of 6 attempts used, 4 remaining')).toBeInTheDocument();
  });

  it('starts every row empty before the first guess', () => {
    render(Board);

    expect(screen.getByRole('list', { name: 'Board' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(MAX_ATTEMPTS);
    expect(screen.getByText('0 of 6 attempts used, 6 remaining')).toBeInTheDocument();
  });

  it('follows the game as further guesses are submitted', async () => {
    const { rerender } = render(Board, { guesses: played(['adopt']) });

    expect(screen.getByText('1 of 6 attempts used, 5 remaining')).toBeInTheDocument();

    await rerender({ guesses: played(['adopt', 'alarm']) });

    expect(screen.getByText('2 of 6 attempts used, 4 remaining')).toBeInTheDocument();
    expect(
      screen.getByRole('listitem', {
        name: 'Attempt 2: A correct, L present, A absent, R absent, M absent'
      })
    ).toBeInTheDocument();
  });

  it('offers no unsubmitted row once every attempt is spent', () => {
    render(Board, { guesses: played(['adopt', 'alarm', 'again', 'aroma', 'aside', 'apple']) });

    expect(screen.getAllByRole('listitem')).toHaveLength(MAX_ATTEMPTS);
    expect(screen.getByText('6 of 6 attempts used, 0 remaining')).toBeInTheDocument();
  });
});

/*
 * daily.allium — the `TodaysGame` surface's next-word announcement,
 * `ThereIsNoNewGameInDaily`: "Daily offers... the time the next word
 * arrives." Mounted inside `GameConclusion` in place of a repeat control.
 */
describe('TodaysGame', () => {
  /** The surface's own fields, for a game on the board on the day it started. */
  function todaysGame(overrides: Record<string, unknown> = {}) {
    return {
      today: 4,
      keptDay: 4,
      keptStatus: 'won' as const,
      keptIsCurrent: true,
      isTodays: true,
      nextWordAt: dayStart(5),
      ...overrides
    };
  }

  it('says when the next word arrives, as text', () => {
    render(TodaysGame, { todaysGame: todaysGame() });

    expect(screen.getByText(/tomorrow's word arrives/i)).toBeInTheDocument();
    expect(screen.getByText(/12:00 AM/)).toBeInTheDocument();
  });

  // TheDayIsPerceivable: the day number as text, not a colour or a selection.
  it('states which day the word on the board belongs to', () => {
    render(TodaysGame, { todaysGame: todaysGame({ keptDay: 12, today: 12 }) });

    expect(screen.getByText(/day 12/i)).toBeInTheDocument();
  });

  // TheDayIsPerceivable: and how today's game ended, as text.
  it.each([
    ['won', /won/i],
    ['lost', /lost/i],
    ['in_progress', /under way/i]
  ])('says today’s game is %s', (keptStatus, expected) => {
    render(TodaysGame, { todaysGame: todaysGame({ keptStatus }) });

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  /*
   * TheNextWordIsAnnouncedInAdvance's second sentence: once the date has moved
   * on, the game still on the board is said to be the earlier day's and the
   * new word is said to be available — rather than being left looking like
   * today's, which announcing "tomorrow's word" would do.
   */
  it('says an earlier day’s game is that day’s, and that today’s word is available', () => {
    render(TodaysGame, { todaysGame: todaysGame({ today: 5, keptDay: 4, isTodays: false }) });

    expect(screen.getByText(/day 4/i)).toBeInTheDocument();
    expect(screen.getByText(/available/i)).toBeInTheDocument();
    expect(screen.queryByText(/tomorrow's word arrives/i)).not.toBeInTheDocument();
  });
});
