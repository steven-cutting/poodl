import {
  ABSENT_TILE,
  CUSTOM_MARKER,
  HIGH_CONTRAST_CORRECT_TILE,
  HIGH_CONTRAST_PRESENT_TILE,
  MAX_ATTEMPTS,
  SHARE_HEADING,
  STANDARD_CORRECT_TILE,
  STANDARD_PRESENT_TILE
} from '$lib/config';
import type { GameMode, Guess, LetterMark, SharePalette } from '$lib/domain/types';

/**
 * The part of a finished game a grid is rendered from.
 *
 * `sharing.allium` hands `render_share_grid` the whole game; only these three
 * fields are read, and the answer is deliberately not among them. A renderer
 * that cannot see the answer cannot leak it.
 */
export interface FinishedGame {
  mode: GameMode;
  status: 'won' | 'lost';
  guesses: readonly Guess[];
}

const TILES: Record<SharePalette, Record<LetterMark, string>> = {
  standard: {
    correct: STANDARD_CORRECT_TILE,
    present: STANDARD_PRESENT_TILE,
    absent: ABSENT_TILE
  },
  high_contrast: {
    correct: HIGH_CONTRAST_CORRECT_TILE,
    present: HIGH_CONTRAST_PRESENT_TILE,
    absent: ABSENT_TILE
  }
};

/**
 * A finished game as the grid people paste into messages.
 *
 * This realises the `ShareGridFormat` contract in `docs/specs/sharing.allium`.
 * The heading names the mode only when the mode is custom, so a grid never
 * reads as though the player beat a word Poodl chose; a lost game uses `X`
 * where a won one uses its attempt count; and the rows carry tiles and nothing
 * else, so a recipient who has not played can read it without being spoiled.
 */
export function renderShareGrid(game: FinishedGame, palette: SharePalette): string {
  const tiles = TILES[palette];
  const marker = game.mode === 'custom' ? ` ${CUSTOM_MARKER}` : '';
  const score = game.status === 'lost' ? 'X' : String(game.guesses.length);

  const rows = [...game.guesses]
    .sort((a, b) => a.position - b.position)
    .map((guess) => guess.results.map((result) => tiles[result.mark]).join(''));

  return [`${SHARE_HEADING}${marker} ${score}/${MAX_ATTEMPTS}`, ...rows].join('\n');
}
