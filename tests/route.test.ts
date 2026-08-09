import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import Page from '../src/routes/+page.svelte';
import { CUSTOM_GAME_PARAM } from '../src/lib/domain/links';
import { encodeAnswer } from '../src/lib/domain/obfuscation';
import { createBundledWordList } from '../src/lib/ports/words';

const words = createBundledWordList();
const KNOWN = words.answerWords()[0] as string;

/** Arrive at a URL, the way a player following a link does. */
function arriveAt(search: string): void {
  window.history.replaceState(null, '', `/${search}`);
}

afterEach(() => {
  arriveAt('');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-high-contrast');
  document.documentElement.removeAttribute('data-animations');
});

/*
 * The whole application, assembled and driven through its real adapters. Every
 * port here is the one the browser gets: jsdom has no localStorage, no
 * clipboard and no matchMedia, and each adapter answers for that itself rather
 * than being stubbed.
 */
describe('the page', () => {
  it('lands on the welcome screen', async () => {
    render(Page);

    expect(await screen.findByRole('button', { name: 'Random' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /how to play/i })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Board' })).not.toBeInTheDocument();
  });

  it('starts a game when a mode is chosen, and shows the board', async () => {
    render(Page);

    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));

    expect(screen.getByRole('list', { name: 'Board' })).toBeInTheDocument();
    expect(screen.getByText('Playing practice.')).toBeInTheDocument();
  });

  it('plays a guess from the on-screen keyboard', async () => {
    render(Page);

    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    for (const letter of 'CRANE') {
      await userEvent.click(screen.getByRole('button', { name: letter }));
    }

    expect(
      screen.getByRole('listitem', { name: /Attempt 1: CRANE, not yet submitted/ })
    ).toBeInTheDocument();
  });

  /*
   * sharing.allium — OpeningALinkStartsThatGame. Opening is dispatched first
   * and the token second, so BeginGame dismisses the welcome screen: a link
   * lands on the game it names even with the welcome setting on.
   */
  it('opens a custom game from a link', async () => {
    arriveAt(`?${CUSTOM_GAME_PARAM}=${encodeAnswer(KNOWN)}`);
    render(Page);

    expect(await screen.findByRole('list', { name: 'Board' })).toBeInTheDocument();
    expect(screen.getByText('Playing custom.')).toBeInTheDocument();
  });

  /*
   * The token is spent once. Left in the address bar it would open the same
   * link again on the next reload, retiring the game that was on the board —
   * which for a stat-eligible game with a guess in it is a loss the player
   * never asked for.
   */
  it('takes the token out of the address bar once it is used', async () => {
    arriveAt(`?${CUSTOM_GAME_PARAM}=${encodeAnswer(KNOWN)}`);
    render(Page);

    await screen.findByRole('list', { name: 'Board' });

    expect(window.location.search).toBe('');
  });

  // InvalidLinksAreExplainedAndSurvivable.
  it('explains a link that does not decode, and offers a way out', async () => {
    arriveAt(`?${CUSTOM_GAME_PARAM}=not-a-token`);
    render(Page);

    expect(await screen.findByRole('alert')).toHaveTextContent(/not a poodl link/i);

    await userEvent.click(screen.getByRole('button', { name: /random game/i }));

    expect(screen.getByRole('list', { name: 'Board' })).toBeInTheDocument();
    expect(screen.getByText('Playing random.')).toBeInTheDocument();
  });

  it('opens the settings, the statistics and the custom game form', async () => {
    render(Page);
    await screen.findByRole('button', { name: 'Random' });

    for (const [control, dialog] of [
      ['Settings', /settings/i],
      ['Statistics', /statistics/i],
      ['Set a word', /set a word/i]
    ] as const) {
      await userEvent.click(screen.getByRole('button', { name: control }));
      expect(screen.getByRole('dialog', { name: dialog })).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  });

  /*
   * One notice, one place. The board and the custom game form read the same
   * notice, so without this the link a form made appeared twice — once in the
   * form and once on the board behind it, with two elements answering to the
   * same label.
   */
  it('shows a link the custom game form made in the form alone', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await userEvent.click(screen.getByRole('button', { name: 'Set a word' }));
    await userEvent.type(screen.getByRole('textbox', { name: /word/i }), 'crumb{Enter}');

    expect(screen.getAllByRole('textbox', { name: /custom game link/i })).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('textbox', { name: /custom game link/i })).not.toBeInTheDocument();
  });

  // ShareCurrentAnswer: the board's own link is shown on the board.
  it('shows a link the board made on the board', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await userEvent.click(screen.getByRole('button', { name: /share the word/i }));

    expect(screen.getAllByRole('textbox', { name: /custom game link/i })).toHaveLength(1);
  });

  /*
   * settings.allium — the `Appearance` surface. `app.css` keys every palette on
   * `:root`, so this is the one place the derived appearance reaches the
   * document.
   */
  it('writes the appearance onto the document', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Settings' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    await userEvent.click(screen.getByRole('checkbox', { name: /high contrast/i }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
    // Animations default to on, and jsdom's device asks for nothing.
    expect(document.documentElement).toHaveAttribute('data-animations', 'on');

    await userEvent.click(screen.getByRole('checkbox', { name: /animations/i }));

    expect(document.documentElement).not.toHaveAttribute('data-animations');
  });

  /*
   * The conclusion covers GameNavigation, which carries
   * ThreeModesCanBeStartedFromHere. Closing it reaches those controls again,
   * and the board offers the conclusion back so nothing is lost.
   */
  it('closes the conclusion and offers it again', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));

    // Play it out. Every answer is a word Poodl accepts, so six of them either
    // hit the drawn answer and win or spend the attempts and lose; both end the
    // game, and the conclusion is what this is about.
    for (const word of words.answerWords().slice(0, 6)) {
      if (screen.queryByRole('dialog') !== null) {
        break;
      }
      for (const letter of word.toUpperCase()) {
        // Once a letter is known its key is named "A, correct" and so on, so
        // the query matches the letter and whatever the game has learned.
        await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${letter}(,|$)`) }));
      }
      await userEvent.click(screen.getByRole('button', { name: 'Enter' }));
    }

    expect(screen.getByRole('dialog', { name: /you won|you lost/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Endless' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /show the result again/i }));

    expect(screen.getByRole('dialog', { name: /you won|you lost/i })).toBeInTheDocument();
  });

  // GameConclusion is scoped to a game finished by play, so nothing of it is on
  // screen while one is in progress — and neither is the answer.
  it('keeps the conclusion, and the answer, off screen while a game runs', async () => {
    render(Page);

    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));

    expect(screen.getByRole('list', { name: 'Board' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/The word was/);
  });
});
