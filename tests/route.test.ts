import { render, screen, within } from '@testing-library/svelte';
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

/**
 * Play the game on the board to its end, through the on-screen keyboard.
 *
 * Every answer is a word Poodl accepts, so six of them either hit the drawn
 * answer and win or spend the attempts and lose; both end the game, and the
 * conclusion is what the tests that use this are about.
 */
async function playItOut(): Promise<void> {
  for (const word of words.answerWords().slice(0, 6)) {
    if (screen.queryByRole('dialog') !== null) {
      break;
    }
    for (const letter of word.toUpperCase()) {
      // Once a letter is known its key is named "A, correct" and so on, so the
      // query matches the letter and whatever the game has learned.
      await userEvent.click(screen.getByRole('button', { name: new RegExp(`^${letter}(,|$)`) }));
    }
    await userEvent.click(screen.getByRole('button', { name: 'Enter' }));
  }
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
    expect(
      screen.getByRole('button', { name: 'Playing practice — change game' })
    ).toBeInTheDocument();
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
    expect(
      screen.getByRole('button', { name: 'Playing custom — change game' })
    ).toBeInTheDocument();
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
    expect(
      screen.getByRole('button', { name: 'Playing random — change game' })
    ).toBeInTheDocument();
  });

  /*
   * One notice, one place, for this kind too. The refusal has a surface of its
   * own that explains it and offers the way out, so passing the same notice on
   * to whatever else is showing said it a second time, in a second live region,
   * beside a second control named "Dismiss".
   */
  it('explains an undecodable link once, wherever the player then goes', async () => {
    arriveAt(`?${CUSTOM_GAME_PARAM}=not-a-token`);
    render(Page);

    await screen.findByRole('alert');
    await userEvent.click(screen.getByRole('button', { name: 'Share a game' }));

    expect(screen.getAllByText(/not a poodl link/i)).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Dismiss' })).toHaveLength(1);
  });

  /*
   * A link that lost its token on the way is still a Poodl link, and
   * InvalidLinksAreExplainedAndSurvivable wants it explained rather than passed
   * over in silence: an empty parameter is not the same as no parameter.
   */
  it('explains a link whose token has gone missing', async () => {
    arriveAt(`?${CUSTOM_GAME_PARAM}=`);
    render(Page);

    expect(await screen.findByRole('alert')).toHaveTextContent(/not a poodl link/i);

    await userEvent.click(screen.getByRole('button', { name: /random game/i }));

    expect(
      screen.getByRole('button', { name: 'Playing random — change game' })
    ).toBeInTheDocument();
  });

  it('opens the settings, the statistics and the share dialog', async () => {
    render(Page);
    await screen.findByRole('button', { name: 'Random' });

    for (const [control, dialog] of [
      ['Settings', /settings/i],
      ['Statistics', /statistics/i],
      ['Share a game', /share a game/i]
    ] as const) {
      await userEvent.click(screen.getByRole('button', { name: control }));
      expect(screen.getByRole('dialog', { name: dialog })).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    }
  });

  /*
   * A dialog takes focus and holds it, so while one is open the board is not the
   * surface facing the player. With the board's window listener still mounted,
   * letters and Enter reached a board nobody could see: a player checking their
   * statistics mid-game could type a guess into it and spend an attempt on it
   * without ever seeing the board.
   */
  it('lets no key reach the board while a dialog is open', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await userEvent.click(screen.getByRole('button', { name: 'Statistics' }));

    expect(screen.getByRole('dialog', { name: /statistics/i })).toHaveFocus();

    await userEvent.keyboard('crane{Enter}{Backspace}');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.getByRole('listitem', { name: 'Attempt 1: empty' })).toBeInTheDocument();
    expect(screen.getByText(/0 of 6 attempts used/)).toBeInTheDocument();
  });

  // And with nothing in front of it, typing still goes straight into the board.
  it('takes typing into the board once the dialog is closed', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await userEvent.click(screen.getByRole('button', { name: 'Statistics' }));
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    await userEvent.keyboard('crane');

    expect(
      screen.getByRole('listitem', { name: 'Attempt 1: CRANE, not yet submitted' })
    ).toBeInTheDocument();
  });

  /*
   * One notice, one place. The board and the share dialog read the same
   * notice, so without this the link the dialog made appeared twice — once in
   * the dialog and once on the board behind it, with two elements answering to
   * the same label.
   */
  it('shows a link the share dialog made in the dialog alone', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await userEvent.click(screen.getByRole('button', { name: 'Share a game' }));
    await userEvent.type(screen.getByRole('textbox', { name: /word/i }), 'crumb{Enter}');

    expect(screen.getAllByRole('textbox', { name: /custom game link/i })).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('textbox', { name: /custom game link/i })).not.toBeInTheDocument();
  });

  /*
   * The other half of the same problem. The dialog reads the notice and the
   * shareable the engine holds, so a link the conclusion made — still on the
   * board once the conclusion is closed — and a rejection the board earned
   * both turned up inside a dialog that made neither.
   */
  it('opens the share dialog on a surface of its own', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await playItOut();

    const conclusion = screen.getByRole('dialog', { name: /you won|you lost/i });

    await userEvent.click(within(conclusion).getByRole('button', { name: /share the word/i }));
    await userEvent.click(within(conclusion).getByRole('button', { name: 'Close' }));

    // The board is holding the conclusion's link now.
    expect(screen.getAllByRole('textbox', { name: /custom game link/i })).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'Share a game' }));
    const dialog = screen.getByRole('dialog', { name: /share a game/i });

    expect(
      within(dialog).queryByRole('textbox', { name: /custom game link/i })
    ).not.toBeInTheDocument();
  });

  /*
   * ShareCurrentAnswer, during play: the way in is the share dialog, and the
   * link it makes is shown inside it. The dialog keeps the keyboard inside
   * itself, so a link on the board behind it would be unreachable.
   */
  it('shows a link the share dialog made for this game inside it', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await userEvent.click(screen.getByRole('button', { name: 'Share a game' }));

    const dialog = screen.getByRole('dialog', { name: /share a game/i });

    await userEvent.click(
      within(dialog).getByRole('button', { name: /make a link to this game/i })
    );

    const links = screen.getAllByRole('textbox', { name: /custom game link/i });

    expect(links).toHaveLength(1);
    expect(dialog).toContainElement(links[0] as HTMLElement);
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
   * The conclusion covers the board, and GameNavigation — which carries
   * ThreeModesCanBeStartedFromHere — sits behind the header's chip. Closing
   * the conclusion reaches the chip again, the dialog it opens can start
   * another game, and the board offers the conclusion back so nothing is lost.
   */
  it('closes the conclusion and offers it again', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await playItOut();

    expect(screen.getByRole('dialog', { name: /you won|you lost/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /change game/i }));
    const games = screen.getByRole('dialog', { name: 'Games' });

    expect(within(games).getByRole('button', { name: 'Endless' })).toBeInTheDocument();

    await userEvent.click(within(games).getByRole('button', { name: 'Close' }));
    await userEvent.click(screen.getByRole('button', { name: /show the result again/i }));

    expect(screen.getByRole('dialog', { name: /you won|you lost/i })).toBeInTheDocument();
  });

  /*
   * GameNavigation, reached the way a player reaches it now: the chip in the
   * header opens the Games dialog, the sentence inside states the mode, and
   * choosing one starts the game and puts the dialog away rather than leaving
   * it over the fresh board.
   */
  it('opens the mode dialog from the chip, and a chosen mode closes it', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await userEvent.click(screen.getByRole('button', { name: 'Playing practice — change game' }));

    const games = screen.getByRole('dialog', { name: 'Games' });

    expect(within(games).getByText('Playing practice.')).toBeInTheDocument();
    expect(within(games).getByText(/counts as a loss/i)).toBeInTheDocument();

    await userEvent.click(within(games).getByRole('button', { name: 'Endless' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Playing endless — change game' })
    ).toBeInTheDocument();
  });

  /*
   * Welcome.@guarantee AFirstVisitIsExplained: "the explanation is reachable
   * again afterwards rather than being shown once and lost". The header's
   * info button is the mechanism, and it works mid-game.
   */
  it('keeps the explanation reachable from the header', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await userEvent.click(screen.getByRole('button', { name: 'How to play' }));

    const help = screen.getByRole('dialog', { name: 'How to play' });

    expect(within(help).getByRole('group', { name: /how to play/i })).toBeInTheDocument();

    await userEvent.click(within(help).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  /*
   * The conclusion traps the keyboard, so a link made from inside it has to
   * appear inside it. Rendered on the board behind, it would be unreachable
   * until the modal was closed — and during an endless countdown, not even
   * then.
   */
  it('shows a link made from the conclusion inside the conclusion', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await playItOut();

    const dialog = screen.getByRole('dialog', { name: /you won|you lost/i });

    await userEvent.click(within(dialog).getByRole('button', { name: /share the word/i }));

    const links = screen.getAllByRole('textbox', { name: /custom game link/i });

    expect(links).toHaveLength(1);
    expect(dialog).toContainElement(links[0] as HTMLElement);
  });

  /*
   * ShareResults.TheGridIsAvailableAsText. jsdom has no clipboard, so this is
   * also the failing path: the copy is refused, Poodl says so, and the grid is
   * still there for the player to select by hand — which is exactly what the
   * message tells them to do.
   */
  it('shows the shared grid as text, and keeps it when the clipboard refuses', async () => {
    render(Page);
    await userEvent.click(await screen.findByRole('button', { name: 'Practice' }));
    await playItOut();

    const dialog = screen.getByRole('dialog', { name: /you won|you lost/i });

    await userEvent.click(within(dialog).getByRole('button', { name: /share results/i }));

    const grid = await within(dialog).findByRole('textbox', { name: /shared result/i });
    const text = (grid as HTMLTextAreaElement).value;

    expect(text.split('\n')[0]).toMatch(/^Poodl [1-6X]\/6$/);
    // SharedTextGivesNothingAway: the rows are tiles, and no letter is among them.
    expect(text.split('\n').slice(1).join('')).not.toMatch(/[a-z]/i);

    // The clipboard jsdom does not have refuses the copy, and the grid stays.
    expect(within(dialog).getByRole('status')).toHaveTextContent(/could not reach the clipboard/i);
    expect(grid).toBeInTheDocument();
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
