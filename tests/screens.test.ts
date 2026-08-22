import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GameConclusion from '../src/lib/components/GameConclusion.svelte';
import GameNavigation from '../src/lib/components/GameNavigation.svelte';
import GameScreen from '../src/lib/components/GameScreen.svelte';
import PhysicalKeyboard from '../src/lib/components/PhysicalKeyboard.svelte';
import WelcomeScreen from '../src/lib/components/WelcomeScreen.svelte';
import { createEnv, fresh, playGuess, run, winInOne } from './engineHarness';
import type { GameState } from '../src/lib/app/state';
import { keyboardKnowledge } from '../src/lib/domain/keyboard';

const env = createEnv();

function gameAfter(...words: readonly string[]): GameState {
  const started = run(env, fresh(), { kind: 'new_game', mode: 'random' });
  const played = words.reduce((state, word) => playGuess(env, state, word), started);

  return played.currentGame as GameState;
}

function screenProps(game: GameState, overrides: Record<string, unknown> = {}) {
  return {
    game,
    keyboard: keyboardKnowledge(game.guesses),
    physicalKeyboard: true,
    notice: null,
    noticeSequence: 0,
    shareable: null,
    announcement: null,
    announcementSequence: 0,
    onletter: vi.fn(),
    ondelete: vi.fn(),
    onsubmit: vi.fn(),
    onshareanswer: vi.fn(),
    oncopy: vi.fn(),
    ondismissnotice: vi.fn(),
    ...overrides
  };
}

/*
 * game.allium — the `Welcome` surface. Opening Poodl lands here, and Continue
 * sits alongside the three modes as one of four equal choices.
 */
describe('WelcomeScreen', () => {
  const base = {
    isFirstVisit: true,
    canContinue: false,
    lastMode: null,
    currentMode: null,
    currentStatus: null,
    oncontinue: vi.fn(),
    onnewgame: vi.fn()
  };

  // AFirstVisitIsExplained.
  it('explains the game to a player with nothing played', () => {
    render(WelcomeScreen, base);

    const explanation = screen.getByRole('group', { name: /how to play/i });

    expect(explanation).toHaveTextContent(/5-letter/);
    expect(explanation).toHaveTextContent(/6 attempts/);
  });

  // "The explanation is reachable again afterwards rather than being shown once
  // and lost."
  it('keeps the explanation reachable on every later visit', () => {
    render(WelcomeScreen, { ...base, isFirstVisit: false, canContinue: true, lastMode: 'random' });

    expect(screen.getByRole('group', { name: /how to play/i })).toBeInTheDocument();
  });

  // ContinueAndTheThreeModesAreEqualChoices.
  it('offers the three modes, always', async () => {
    const onnewgame = vi.fn();
    render(WelcomeScreen, { ...base, onnewgame });

    for (const mode of ['Random', 'Endless', 'Practice']) {
      expect(screen.getByRole('button', { name: mode })).toBeInTheDocument();
    }

    await userEvent.click(screen.getByRole('button', { name: 'Endless' }));

    expect(onnewgame).toHaveBeenCalledWith('endless');
  });

  it('offers nothing to continue on a first visit', () => {
    render(WelcomeScreen, base);

    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument();
  });

  /*
   * ContinuingNeverCostsAGame retires the board "on exactly the terms
   * GameNavigation states", and those terms are stated where the player acts on
   * them "so the cost of switching mode mid-game is never a surprise". Choosing
   * a mode here is acting on them.
   */
  it('says what choosing a mode costs the game on the board', () => {
    render(WelcomeScreen, {
      ...base,
      isFirstVisit: false,
      canContinue: true,
      lastMode: 'random',
      currentMode: 'random',
      currentStatus: 'in_progress'
    });

    expect(screen.getByText(/counts as a loss/i)).toBeInTheDocument();
  });

  it('says nothing about a cost when there is no game to lose', () => {
    render(WelcomeScreen, base);

    expect(screen.queryByText(/counts as a loss/i)).not.toBeInTheDocument();
  });

  // "Continue names the mode it would resume or start, so it never acts on a
  // mode the player cannot see."
  it('names the game it would resume', async () => {
    const oncontinue = vi.fn();
    render(WelcomeScreen, {
      ...base,
      isFirstVisit: false,
      canContinue: true,
      lastMode: 'random',
      currentMode: 'endless',
      currentStatus: 'in_progress',
      oncontinue
    });

    const button = screen.getByRole('button', { name: 'Continue your endless game' });
    await userEvent.click(button);

    expect(oncontinue).toHaveBeenCalledTimes(1);
  });

  it('names the mode it would start when the board is empty', () => {
    render(WelcomeScreen, {
      ...base,
      isFirstVisit: false,
      canContinue: true,
      lastMode: 'practice'
    });

    expect(
      screen.getByRole('button', { name: 'Continue with a practice game' })
    ).toBeInTheDocument();
  });
});

/*
 * game.allium — the `GameNavigation` surface, presented as the dialog the
 * header's mode chip opens. Nothing here depends on a game being under way.
 */
describe('GameNavigation', () => {
  const base = {
    mode: null,
    status: null,
    repeatMode: 'random' as const,
    onnewgame: vi.fn(),
    onclose: vi.fn()
  };

  // The surface is a dialog now, with Modal's whole keyboard contract behind it.
  it('is a dialog, and Escape closes it', async () => {
    const onclose = vi.fn();
    render(GameNavigation, { ...base, onclose });

    expect(screen.getByRole('dialog', { name: 'Games' })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  // AvailableWhetherOrNotAGameExists and CurrentModeIsPerceivable.
  it('says no game is under way when none is', () => {
    render(GameNavigation, base);

    expect(screen.getByText(/no game/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Random' })).toBeInTheDocument();
  });

  it('states the mode being played, as text', () => {
    render(GameNavigation, { ...base, mode: 'endless', status: 'in_progress' });

    expect(screen.getByText('Playing endless.')).toBeInTheDocument();
  });

  // ThreeModesCanBeStartedFromHere: custom is not among them.
  it('offers exactly the three startable modes and a new game', () => {
    render(GameNavigation, { ...base, mode: 'custom', status: 'in_progress' });

    expect(screen.queryByRole('button', { name: 'Custom' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New game' })).toBeInTheDocument();
  });

  it('starts another game in the mode it would repeat', async () => {
    const onnewgame = vi.fn();
    render(GameNavigation, {
      ...base,
      mode: 'endless',
      status: 'won',
      repeatMode: 'endless',
      onnewgame
    });

    await userEvent.click(screen.getByRole('button', { name: 'New game' }));

    expect(onnewgame).toHaveBeenCalledWith('endless');
  });

  // StartingAGameEndsTheOneUnderWay, stated where the player acts on it.
  it('says what starting a game costs, while one is under way', () => {
    render(GameNavigation, { ...base, mode: 'random', status: 'in_progress' });

    expect(screen.getByText(/counts as a loss/i)).toBeInTheDocument();
  });

  it('says nothing about the cost when there is nothing to lose', () => {
    render(GameNavigation, base);

    expect(screen.queryByText(/counts as a loss/i)).not.toBeInTheDocument();
  });
});

/*
 * game.allium — the `GameConclusion` surface.
 */
describe('GameConclusion', () => {
  const base = {
    status: 'won' as const,
    mode: 'random' as const,
    answer: 'apple',
    attemptsUsed: 3,
    secondsRemaining: null,
    repeatMode: 'random' as const,
    onstop: vi.fn(),
    onnewgame: vi.fn(),
    onshareresults: vi.fn(),
    onshareanswer: vi.fn(),
    onclose: vi.fn(),
    notice: null,
    noticeSequence: 0,
    shareable: null,
    oncopy: vi.fn()
  };

  // OutcomeAnswerAndAttemptsAreAllShown, on a win as well as on a loss.
  it('shows the outcome, the answer and the attempts on a win', () => {
    render(GameConclusion, base);

    expect(screen.getByRole('dialog', { name: /won/i })).toBeInTheDocument();
    expect(screen.getByText(/APPLE/)).toBeInTheDocument();
    expect(screen.getByText(/3 of 6/)).toBeInTheDocument();
  });

  it('shows all three on a loss too', () => {
    render(GameConclusion, { ...base, status: 'lost', attemptsUsed: 6 });

    expect(screen.getByRole('dialog', { name: /lost/i })).toBeInTheDocument();
    expect(screen.getByText(/APPLE/)).toBeInTheDocument();
  });

  // EndlessContinuesUnlessStopped: in every other mode nothing happens until
  // the player asks for a new game.
  it('counts down only when a countdown is running', async () => {
    const onstop = vi.fn();
    const { unmount } = render(GameConclusion, base);

    expect(screen.queryByRole('button', { name: /stop/i })).not.toBeInTheDocument();
    unmount();

    render(GameConclusion, { ...base, mode: 'endless', secondsRemaining: 7, onstop });

    await userEvent.click(screen.getByRole('button', { name: /stop/i }));

    expect(onstop).toHaveBeenCalledTimes(1);
  });

  // NoDailyLimit: a new game can always be requested.
  it('always offers another game', async () => {
    const onnewgame = vi.fn();
    render(GameConclusion, { ...base, onnewgame });

    await userEvent.click(screen.getByRole('button', { name: 'New game' }));

    expect(onnewgame).toHaveBeenCalledWith('random');
  });

  /*
   * The modal covers GameNavigation, which carries
   * ThreeModesCanBeStartedFromHere and AvailableWhetherOrNotAGameExists. A
   * conclusion that trapped the keyboard would take those away, so it closes —
   * and the board offers it back, because ResumeCurrentGame says a finished
   * game comes back "with its conclusion still showing".
   */
  it('can be closed, so the rest of the game is reachable', async () => {
    const onclose = vi.fn();
    render(GameConclusion, { ...base, onclose });

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  /*
   * EndlessContinuesUnlessStopped: "stopping the countdown is an action the
   * player can take at any point while it runs". The stop control lives here,
   * so while a countdown is running there is no closing this and leaving it
   * unreachable. Stopping first is what makes closing available.
   */
  it('cannot be closed out from under a running countdown', () => {
    render(GameConclusion, { ...base, mode: 'endless' as const, secondsRemaining: 7 });

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  /*
   * Stopping removes the control that stopped it, and a removed element leaves
   * focus on the body — outside the panel Modal listens on, so Escape stops
   * closing and Tab walks the page behind an aria-modal dialog. The keyboard
   * has to be carried across the swap.
   */
  it('keeps the keyboard inside itself when the countdown stops', async () => {
    const onclose = vi.fn();
    const { rerender } = render(GameConclusion, {
      ...base,
      mode: 'endless' as const,
      secondsRemaining: 7,
      onclose
    });
    const dialog = screen.getByRole('dialog', { name: /won/i });

    await userEvent.click(screen.getByRole('button', { name: /stop/i }));
    await rerender({ secondsRemaining: null });

    expect(dialog.contains(document.activeElement)).toBe(true);

    await userEvent.keyboard('{Escape}');

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  /*
   * Both sharing actions are here, so what they produce has to be here too. The
   * modal traps the keyboard — a link rendered on the board behind it would be
   * unreachable, and during an endless countdown unreachable twice over.
   */
  it('shows the link it just made, inside itself', async () => {
    const oncopy = vi.fn();
    render(GameConclusion, {
      ...base,
      shareable: { kind: 'custom_link', text: 'https://poodl.test/?g=yrqt9rd9' },
      oncopy
    });

    const dialog = screen.getByRole('dialog', { name: /won/i });

    expect(within(dialog).getByRole('textbox', { name: /link/i })).toHaveValue(
      'https://poodl.test/?g=yrqt9rd9'
    );

    await userEvent.click(within(dialog).getByRole('button', { name: /copy/i }));

    expect(oncopy).toHaveBeenCalledTimes(1);
  });

  /*
   * ShareResults.@guarantee TheGridIsAvailableAsText: the grid is shown as text
   * and not only copied, so it can be read before it is sent — and it is still
   * there when the copy failed and the player has to select it by hand.
   */
  it('shows the grid it just rendered, inside itself', async () => {
    const oncopy = vi.fn();
    render(GameConclusion, {
      ...base,
      shareable: { kind: 'results', text: 'Poodl 3/6\n🟩⬛⬛🟨⬛' },
      notice: { kind: 'copy_failed' },
      oncopy
    });

    const dialog = screen.getByRole('dialog', { name: /won/i });

    expect(within(dialog).getByRole('textbox', { name: /result/i })).toHaveValue(
      'Poodl 3/6\n🟩⬛⬛🟨⬛'
    );

    await userEvent.click(within(dialog).getByRole('button', { name: /copy result/i }));

    expect(oncopy).toHaveBeenCalledTimes(1);
  });

  // The action reports whether the copy succeeded, where the action was taken.
  it('reports the outcome of a copy, inside itself', () => {
    render(GameConclusion, { ...base, notice: { kind: 'copy_failed' } });

    expect(
      within(screen.getByRole('dialog', { name: /won/i })).getByRole('status')
    ).toHaveTextContent(/could not/i);
  });

  it('offers both kinds of sharing', async () => {
    const onshareresults = vi.fn();
    const onshareanswer = vi.fn();
    render(GameConclusion, { ...base, onshareresults, onshareanswer });

    await userEvent.click(screen.getByRole('button', { name: /share result/i }));
    await userEvent.click(screen.getByRole('button', { name: /share the word/i }));

    expect(onshareresults).toHaveBeenCalledTimes(1);
    expect(onshareanswer).toHaveBeenCalledTimes(1);
  });
});

/*
 * game.allium — the `PhysicalKeyboardInput` surface. The same three actions as
 * the on-screen keyboard, from a different channel.
 */
describe('PhysicalKeyboard', () => {
  // Typed spies rather than bare `vi.fn()`: the component's props are typed, so
  // an untyped mock is not assignable to them and svelte-check says so.
  const keyHandlers = () => ({
    onletter: vi.fn<(letter: string) => void>(),
    ondelete: vi.fn<() => void>(),
    onsubmit: vi.fn<() => void>()
  });

  let handlers = keyHandlers();

  beforeEach(() => {
    handlers = keyHandlers();
  });

  // EnterSubmitsAndBackspaceDeletes.
  it('enters letters, submits on Enter and deletes on Backspace', async () => {
    render(PhysicalKeyboard, handlers);

    await userEvent.keyboard('a');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{Backspace}');

    expect(handlers.onletter).toHaveBeenCalledWith('a');
    expect(handlers.onsubmit).toHaveBeenCalledTimes(1);
    expect(handlers.ondelete).toHaveBeenCalledTimes(1);
  });

  it('takes a letter in whatever case it arrives in', async () => {
    render(PhysicalKeyboard, handlers);

    await userEvent.keyboard('{Shift>}A{/Shift}');

    expect(handlers.onletter).toHaveBeenCalledWith('A');
  });

  it('leaves the browser its own shortcuts', async () => {
    render(PhysicalKeyboard, handlers);

    await userEvent.keyboard('{Control>}a{/Control}');
    await userEvent.keyboard('{Meta>}r{/Meta}');

    expect(handlers.onletter).not.toHaveBeenCalled();
  });

  it('keeps its hands off a control that has focus', async () => {
    render(PhysicalKeyboard, handlers);
    const button = document.createElement('button');
    document.body.append(button);
    button.focus();

    await userEvent.keyboard('{Enter}');

    expect(handlers.onsubmit).not.toHaveBeenCalled();
    button.remove();
  });

  /*
   * Only Enter belongs to the control, because only Enter activates it.
   * `FullyKeyboardOperable` invites the player to tab to the on-screen keyboard
   * and press a key there, and the letters they type next are still the board's
   * — `PhysicalKeyboardInput` grants them on the input length alone.
   */
  it('still hears letters and Backspace while a control has focus', async () => {
    render(PhysicalKeyboard, handlers);
    const button = document.createElement('button');
    document.body.append(button);
    button.focus();

    await userEvent.keyboard('a{Backspace}');

    expect(handlers.onletter).toHaveBeenCalledWith('a');
    expect(handlers.ondelete).toHaveBeenCalledTimes(1);
    button.remove();
  });

  it('leaves every key to somewhere the player is typing', async () => {
    render(PhysicalKeyboard, handlers);
    const field = document.createElement('input');
    document.body.append(field);
    field.focus();

    await userEvent.keyboard('a{Backspace}{Enter}');

    expect(handlers.onletter).not.toHaveBeenCalled();
    expect(handlers.ondelete).not.toHaveBeenCalled();
    expect(handlers.onsubmit).not.toHaveBeenCalled();
    field.remove();
  });
});

/*
 * game.allium — the `GameBoard` surface, assembled.
 */
describe('GameScreen', () => {
  // AnswerIsNeverExposedWhileInProgress.
  it('shows nothing of the answer while the game is in progress', () => {
    const game = gameAfter('crumb');
    render(GameScreen, screenProps(game));

    expect(document.body.textContent).not.toContain(game.answer.toUpperCase());
    expect(document.body.textContent).not.toContain(game.answer);
  });

  it('shows the board and the on-screen keyboard', () => {
    render(GameScreen, screenProps(gameAfter('crumb')));

    expect(screen.getByRole('list', { name: 'Board' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument();
  });

  // FullyKeyboardOperable holds regardless of the physical_keyboard setting,
  // which governs only whether typing goes straight into the board.
  it('keeps the on-screen keyboard live when physical input is off', async () => {
    const onletter = vi.fn();
    render(GameScreen, screenProps(gameAfter(), { physicalKeyboard: false, onletter }));

    await userEvent.click(screen.getByRole('button', { name: 'Q' }));

    expect(onletter).toHaveBeenCalledWith('q');
  });

  // TurningThisOffSurrendersTheKeysEntirely: not letters, not Enter, not
  // Backspace.
  it('handles no key press at all when physical input is off', async () => {
    const props = screenProps(gameAfter(), { physicalKeyboard: false });
    render(GameScreen, props);

    await userEvent.keyboard('a{Enter}{Backspace}');

    expect(props.onletter).not.toHaveBeenCalled();
    expect(props.onsubmit).not.toHaveBeenCalled();
    expect(props.ondelete).not.toHaveBeenCalled();
  });

  it('takes typing straight into the board when physical input is on', async () => {
    const props = screenProps(gameAfter());
    render(GameScreen, props);

    await userEvent.keyboard('a');

    expect(props.onletter).toHaveBeenCalledWith('a');
  });

  it('turns the keyboard off once the game is over', () => {
    const won = winInOne(env, run(env, fresh(), { kind: 'new_game', mode: 'random' }));
    render(GameScreen, screenProps(won.currentGame as GameState));

    expect(screen.getByRole('button', { name: 'Enter' })).toBeDisabled();
  });

  // The way back to a conclusion the player closed.
  it('offers the result again once the conclusion has been closed', async () => {
    const won = winInOne(env, run(env, fresh(), { kind: 'new_game', mode: 'random' }));
    const onshowresult = vi.fn();
    render(GameScreen, screenProps(won.currentGame as GameState, { onshowresult }));

    await userEvent.click(screen.getByRole('button', { name: /show the result/i }));

    expect(onshowresult).toHaveBeenCalledTimes(1);
  });

  it('offers no way back while the conclusion is on screen', () => {
    const won = winInOne(env, run(env, fresh(), { kind: 'new_game', mode: 'random' }));
    render(GameScreen, screenProps(won.currentGame as GameState));

    expect(screen.queryByRole('button', { name: /show the result/i })).not.toBeInTheDocument();
  });

  it('shows what Poodl is saying, and announces it', () => {
    render(
      GameScreen,
      screenProps(gameAfter(), {
        notice: { kind: 'guess_rejected', reason: 'incomplete' },
        announcement: 'Attempt 1: A correct'
      })
    );

    // Two live regions, and deliberately so: the notice is visible text that
    // is its own announcement, and the announcer is hidden text that says what
    // the board already shows.
    const spoken = screen.getAllByRole('status').map((region) => region.textContent);

    expect(spoken.some((text) => text.includes('Not enough letters'))).toBe(true);
    expect(spoken.some((text) => text.includes('Attempt 1: A correct'))).toBe(true);
  });

  /*
   * Whatever Poodl has made is shown where the player is looking, and the board
   * is where they are looking once a dialog is closed: a grid shared from the
   * conclusion is still theirs to copy after they put the conclusion away.
   */
  it('shows the link or the grid it is holding', async () => {
    const props = screenProps(gameAfter(), {
      shareable: { kind: 'custom_link', text: 'https://poodl.test/?g=yrqt9rd9' }
    });
    const { unmount } = render(GameScreen, props);

    expect(screen.getByRole('textbox', { name: /custom game link/i })).toHaveValue(
      'https://poodl.test/?g=yrqt9rd9'
    );
    unmount();

    const shared = screenProps(gameAfter(), {
      shareable: { kind: 'results', text: 'Poodl 3/6\n🟩⬛⬛🟨⬛' }
    });
    render(GameScreen, shared);

    expect(screen.getByRole('textbox', { name: /shared result/i })).toHaveValue(
      'Poodl 3/6\n🟩⬛⬛🟨⬛'
    );

    await userEvent.click(screen.getByRole('button', { name: /copy result/i }));

    expect(shared.oncopy).toHaveBeenCalledTimes(1);
  });

  // ShareCurrentAnswer.AvailableInEveryModeAndForAsLongAsTheGameIsOnTheBoard.
  it('offers to pass the word on, before a guess has been made', async () => {
    const props = screenProps(gameAfter());
    render(GameScreen, props);

    await userEvent.click(screen.getByRole('button', { name: /share the word/i }));

    expect(props.onshareanswer).toHaveBeenCalledTimes(1);
  });
});
