import { describe, expect, it } from 'vitest';

import { MAX_ATTEMPTS } from '../src/lib/config';
import { scoreGuess } from '../src/lib/domain/scoring';
import { renderShareGrid } from '../src/lib/domain/share';
import type { FinishedGame } from '../src/lib/domain/share';
import type { GameMode, GameStatus, Guess } from '../src/lib/domain/types';

const ANSWER = 'apple';

const WON = ['adopt', 'alarm', 'apple'];
const LOST = ['adopt', 'alarm', 'again', 'aroma', 'aside', 'apply'];

function finished(
  played: readonly string[],
  status: GameStatus & ('won' | 'lost'),
  mode: GameMode = 'random'
): FinishedGame {
  const guesses: Guess[] = played.map((word, index) => ({
    position: index + 1,
    word,
    results: scoreGuess(word, ANSWER)
  }));

  return { mode, status, guesses };
}

/*
 * sharing.allium — the `ShareGridFormat` contract. Every obligation here is one
 * of its invariants; the grid says how a game went and never what the word was.
 */
describe('renderShareGrid', () => {
  // Heading.
  it('heads a won game with the attempt count over the limit', () => {
    expect(renderShareGrid(finished(WON, 'won'), 'standard').split('\n')[0]).toBe(
      `Poodl 3/${MAX_ATTEMPTS}`
    );
  });

  it('heads a lost game with an X in place of the count', () => {
    expect(renderShareGrid(finished(LOST, 'lost'), 'standard').split('\n')[0]).toBe(
      `Poodl X/${MAX_ATTEMPTS}`
    );
  });

  // ACustomResultSaysSo: the marker names the mode and nothing else.
  it('marks a custom game, and only a custom game', () => {
    expect(renderShareGrid(finished(WON, 'won', 'custom'), 'standard').split('\n')[0]).toBe(
      `Poodl custom 3/${MAX_ATTEMPTS}`
    );
    expect(renderShareGrid(finished(LOST, 'lost', 'custom'), 'standard').split('\n')[0]).toBe(
      `Poodl custom X/${MAX_ATTEMPTS}`
    );

    for (const mode of ['random', 'endless', 'practice'] as const) {
      expect(renderShareGrid(finished(WON, 'won', mode), 'standard')).not.toContain('custom');
    }
  });

  // OneRowPerSubmittedGuess: attempts the player never used produce no row.
  it('renders one row per submitted guess and no row for an unused attempt', () => {
    const rows = renderShareGrid(finished(WON, 'won'), 'standard').split('\n').slice(1);

    expect(rows).toHaveLength(WON.length);
    expect(renderShareGrid(finished(LOST, 'lost'), 'standard').split('\n').slice(1)).toHaveLength(
      MAX_ATTEMPTS
    );
  });

  // TilesFollowTheMarks, standard palette.
  it('renders each mark as its tile, left to right', () => {
    expect(renderShareGrid(finished(WON, 'won'), 'standard')).toBe(
      ['Poodl 3/6', '🟩⬛⬛🟨⬛', '🟩🟨⬛⬛⬛', '🟩🟩🟩🟩🟩'].join('\n')
    );
  });

  // TilesFollowTheMarks, high-contrast palette. PaletteFollowsHighContrast is
  // what chooses between them; absent is the same tile in both.
  it('swaps only correct and present for the high-contrast palette', () => {
    expect(renderShareGrid(finished(WON, 'won'), 'high_contrast')).toBe(
      ['Poodl 3/6', '🟧⬛⬛🟦⬛', '🟧🟦⬛⬛⬛', '🟧🟧🟧🟧🟧'].join('\n')
    );
  });

  // NeverRevealsTheAnswer and SharedTextGivesNothingAway.
  it('names no letter of the answer or of any guess', () => {
    for (const game of [finished(WON, 'won'), finished(LOST, 'lost', 'custom')]) {
      const rows = renderShareGrid(game, 'standard').split('\n').slice(1).join('');

      expect(rows).not.toMatch(/[a-z]/i);
      for (const guess of game.guesses) {
        expect(renderShareGrid(game, 'standard')).not.toContain(guess.word);
      }
      expect(renderShareGrid(game, 'standard')).not.toContain(ANSWER);
    }
  });

  // NoLinkTravelsWithTheGrid.
  it('carries no link', () => {
    const text = renderShareGrid(finished(WON, 'won', 'custom'), 'standard');

    expect(text).not.toContain('://');
    expect(text).not.toContain('http');
  });

  it('is deterministic', () => {
    expect(renderShareGrid(finished(WON, 'won'), 'standard')).toBe(
      renderShareGrid(finished(WON, 'won'), 'standard')
    );
  });

  it('renders the guesses in ascending position order whatever order it is handed', () => {
    const game = finished(WON, 'won');
    const shuffled: FinishedGame = { ...game, guesses: [...game.guesses].reverse() };

    expect(renderShareGrid(shuffled, 'standard')).toBe(renderShareGrid(game, 'standard'));
  });
});
