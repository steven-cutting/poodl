import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Board from '../src/lib/components/Board.svelte';
import Keyboard from '../src/lib/components/Keyboard.svelte';
import Tile from '../src/lib/components/Tile.svelte';
import { MAX_ATTEMPTS } from '../src/lib/config';
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

  it('says what is known about a key rather than only colouring it', () => {
    render(Keyboard, { knowledge: keyboardKnowledge(played(['adopt'])) });

    expect(screen.getByRole('button', { name: 'A, correct' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'P, in the word, wrong place' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'D, not in the word' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Z' })).toBeInTheDocument();
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
});
