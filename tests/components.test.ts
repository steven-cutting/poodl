import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Board from '../src/lib/components/Board.svelte';
import Keyboard from '../src/lib/components/Keyboard.svelte';
import Tile from '../src/lib/components/Tile.svelte';
import TodaysGame from '../src/lib/components/TodaysGame.svelte';
import { MAX_ATTEMPTS } from '../src/lib/config';
import { dayStart } from '../src/lib/domain/calendar';
import { keyboardKnowledge } from '../src/lib/domain/keyboard';
import { scoreGuess } from '../src/lib/domain/scoring';
import type { ScoredGuess } from '../src/lib/domain/types';

const ANSWER = 'apple';

function played(words: readonly string[]): ScoredGuess[] {
  return words.map((word) => ({ results: scoreGuess(word, ANSWER) }));
}

describe('Tile', () => {
  it('names an empty position', () => {
    render(Tile, { position: 3 });

    expect(screen.getByRole('img', { name: 'Position 3, empty' })).toBeInTheDocument();
  });

  it('names a letter that has not been scored', () => {
    render(Tile, { position: 1, letter: 'a' });

    expect(screen.getByRole('img', { name: 'Position 1, A' })).toBeInTheDocument();
  });

  // GameBoard.@guarantee ResultsAreNeverConveyedByColourAlone
  it('describes every mark in words, not only in colour', () => {
    render(Tile, { position: 1, letter: 'a', mark: 'correct' });
    render(Tile, { position: 2, letter: 'b', mark: 'present' });
    render(Tile, { position: 3, letter: 'c', mark: 'absent' });

    expect(screen.getByRole('img', { name: 'Position 1, A, correct' })).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Position 2, B, in the word, wrong place' })
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Position 3, C, not in the word' })).toBeInTheDocument();
  });

  /*
   * The same guarantee's visible half: correct and present carry a marker bar
   * and absent carries the absence of one. The bar is aria-hidden decoration
   * with no role or name to query by, so `[data-marker]` is the structural
   * hook — the same class of hook as the grandfathered `data-mark`, and
   * `docs/reference/testing.md` records the trade. Its relative widths are
   * geometry, held by the Tile stories where a layout engine exists.
   */
  it('draws a marker bar for the two marks that have one, and none for absent', () => {
    render(Tile, { position: 1, letter: 'a', mark: 'correct' });
    render(Tile, { position: 2, letter: 'b', mark: 'present' });
    render(Tile, { position: 3, letter: 'c', mark: 'absent' });
    render(Tile, { position: 4, letter: 'd' });

    const marker = (name: string) =>
      screen.getByRole('img', { name }).querySelector('[data-marker]');

    expect(marker('Position 1, A, correct')).not.toBeNull();
    expect(marker('Position 2, B, in the word, wrong place')).not.toBeNull();
    expect(marker('Position 3, C, not in the word')).toBeNull();
    expect(marker('Position 4, D')).toBeNull();
  });
});

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

describe('Keyboard', () => {
  it('offers every letter plus Enter and Delete', () => {
    render(Keyboard);

    expect(screen.getAllByRole('button')).toHaveLength(28);
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  /*
   * DirectManipulation.EveryControlIsAComfortableTarget. A row divided equally
   * among its letter keys leaves about 27px per control at
   * `narrowest_supported_width`, which the words "Enter" and "Delete" do not
   * fit at any legible size, so the two action keys show the icon every
   * on-screen keyboard shows. The name is what the surface promised and it
   * does not change: the icon is hidden from assistive technology and the
   * label says the word, so GameBoard.@guarantee FullyKeyboardOperable reads
   * exactly as it did.
   */
  it('names the action keys in words while showing the icon a finger expects', () => {
    render(Keyboard);

    for (const name of ['Enter', 'Delete']) {
      const key = screen.getByRole('button', { name });

      expect(key.querySelector('svg')).not.toBeNull();
      // The icon is the whole face: no visible text competes with the label.
      expect(key.textContent.trim()).toBe('');
    }
  });

  it('says what is known about a key rather than only colouring it', () => {
    render(Keyboard, { knowledge: keyboardKnowledge(played(['adopt'])) });

    expect(screen.getByRole('button', { name: 'A, correct' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'P, in the word, wrong place' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'D, not in the word' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Z' })).toBeInTheDocument();
  });

  /*
   * AGENTS.md invariant 6 and GameBoard.@guarantee
   * ResultsAreNeverConveyedByColourAlone. The accessible name carries the
   * status for anyone reading by ear; the marker bar carries it for a sighted
   * colour-blind reader with no assistive technology — bar for correct,
   * shorter bar for present, and for absent the absence of one beside a
   * dimmed letter. A tile has carried a shape from the start; a key had not.
   */
  it('marks a known key with a shape as well as a colour', () => {
    render(Keyboard, { knowledge: keyboardKnowledge(played(['adopt'])) });

    const keys = new Map(
      screen.getAllByRole('button').map((key) => [key.getAttribute('data-mark'), key])
    );

    expect(keys.get('correct')?.querySelector('[data-marker]')).not.toBeNull();
    expect(keys.get('present')?.querySelector('[data-marker]')).not.toBeNull();
    expect(keys.get('absent')?.querySelector('[data-marker]')).toBeNull();
    // A key nothing is known about carries its letter and nothing else.
    expect(keys.get('none')?.querySelector('[data-marker]')).toBeNull();
    expect(keys.get('none')?.textContent.trim()).toMatch(/^[A-Z]$/);
  });

  it('reports the letter that was pressed', async () => {
    const onletter = vi.fn();
    render(Keyboard, { onletter });

    await userEvent.click(screen.getByRole('button', { name: 'Q' }));

    expect(onletter).toHaveBeenCalledWith('q');
  });

  it('reports submission and deletion', async () => {
    const onsubmit = vi.fn();
    const ondelete = vi.fn();
    render(Keyboard, { onsubmit, ondelete });

    await userEvent.click(screen.getByRole('button', { name: 'Enter' }));
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onsubmit).toHaveBeenCalledTimes(1);
    expect(ondelete).toHaveBeenCalledTimes(1);
  });

  it('stays silent when no handler is supplied', async () => {
    render(Keyboard);

    await expect(
      userEvent.click(screen.getByRole('button', { name: 'Q' }))
    ).resolves.toBeUndefined();
  });

  it('can be disabled as a whole', () => {
    render(Keyboard, { disabled: true });

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });

  /*
   * Appearance.@guarantee AnUnavailableControlIsExempt, which is the clause
   * that lets a finished game's keyboard go quiet at all. The exemption is
   * only from the contrast figures; it buys nothing about how the state is
   * known, and it names two things a dimmed key still owes. Both are asserted
   * here because the dimming is one `opacity` declaration away from taking
   * them with it, and neither gate above would notice: `tests/contrast.test.ts`
   * measures tokens rather than rendered keys, and axe declines to judge a
   * disabled control at all.
   *
   * So: the unavailability reaches the accessibility tree rather than resting
   * on the dim, and every non-colour indication the live keyboard carried —
   * the marker bar and the description — survives being switched off.
   */
  it('keeps a scored key legible to a reader once the game switches it off', () => {
    render(Keyboard, { knowledge: keyboardKnowledge(played(['adopt'])), disabled: true });

    const keys = new Map(
      screen.getAllByRole('button').map((key) => [key.getAttribute('data-mark'), key])
    );

    for (const mark of ['correct', 'present', 'absent', 'none'] as const) {
      expect(keys.get(mark)).toBeDisabled();
    }

    expect(keys.get('correct')?.querySelector('[data-marker]')).not.toBeNull();
    expect(keys.get('present')?.querySelector('[data-marker]')).not.toBeNull();
    expect(keys.get('absent')?.querySelector('[data-marker]')).toBeNull();

    expect(screen.getByRole('button', { name: 'A, correct' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'O, not in the word' })).toBeDisabled();
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
