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
import { dayStart } from '../src/lib/domain/calendar';
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
    oncopy: vi.fn(),
    ondismissnotice: vi.fn(),
    ...overrides
  };
}

/*
 * game.allium — the `Welcome` surface. Opening Poodl lands here, and Continue
 * sits alongside the four modes as one of five equal choices.
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

  // ContinueAndTheFourModesAreEqualChoices.
  it('offers the four modes, always', async () => {
    const onnewgame = vi.fn();
    render(WelcomeScreen, { ...base, onnewgame });

    for (const mode of ['Random', 'Endless', 'Practice', 'Daily']) {
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

  // StartingAGameEndsTheOneUnderWay's daily exception, said here on the same terms as GameNavigation.
  it('says the daily game is set aside rather than lost, while it is the one under way', () => {
    render(WelcomeScreen, {
      ...base,
      isFirstVisit: false,
      canContinue: true,
      lastMode: 'daily',
      currentMode: 'daily',
      currentStatus: 'in_progress',
      dailyIsTodays: true
    });

    expect(screen.getByText(/set aside/i)).toBeInTheDocument();
    expect(screen.queryByText(/counts as a loss/i)).not.toBeInTheDocument();
  });

  /*
   * ANewDayReplacesTheOldGame: "Where the choice would discard a game still
   * under way, it says so before it is taken." Once the day has turned, the
   * game on the board is an earlier day's and choosing Daily ends it — so the
   * same-day promise that Daily brings it back would be exactly backwards.
   */
  it('warns that choosing Daily ends an earlier day’s game, rather than bringing it back', () => {
    render(WelcomeScreen, {
      ...base,
      isFirstVisit: false,
      canContinue: true,
      lastMode: 'daily',
      currentMode: 'daily',
      currentStatus: 'in_progress',
      dailyIsTodays: false
    });

    expect(screen.getByText(/ends this one|goes for good/i)).toBeInTheDocument();
    expect(screen.queryByText(/brings it back/i)).not.toBeInTheDocument();
  });

  /*
   * The standing sentence GameNavigation carries, said here too because Daily
   * is offered here too: how today's game stands while it waits off the board
   * (TheDayIsPerceivable), and once the date has moved on, that choosing Daily
   * ends an earlier day's game (ANewDayReplacesTheOldGame) — before the choice
   * is taken.
   */
  it('says how today’s daily game stands while it waits off the board', () => {
    render(WelcomeScreen, {
      ...base,
      isFirstVisit: false,
      canContinue: true,
      lastMode: 'random',
      currentMode: 'random',
      currentStatus: 'in_progress',
      todaysDaily: {
        day: 7,
        status: 'won',
        isCurrent: false,
        isTodays: true,
        today: 7,
        nextWordAt: dayStart(8)
      }
    });

    expect(screen.getByText(/today's daily is day 7:\s*won/i)).toBeInTheDocument();
    // TheNextWordIsAnnouncedInAdvance: the time, from the moment it is over.
    expect(screen.getByText(/tomorrow's word arrives/i)).toBeInTheDocument();
  });

  /*
   * TheNextWordIsAnnouncedInAdvance is scoped to today's finished game. A game
   * still under way is not over, and an earlier day's next word is today's —
   * which the sentence beside it already says is available, so a time a day in
   * the past would only confuse.
   */
  it('announces the next word only once today’s daily game is over', () => {
    const waiting = {
      day: 7,
      status: 'in_progress' as const,
      isCurrent: false,
      isTodays: true,
      today: 7,
      nextWordAt: dayStart(8)
    };

    const { unmount } = render(WelcomeScreen, {
      ...base,
      isFirstVisit: false,
      canContinue: true,
      lastMode: 'random',
      currentMode: 'random',
      currentStatus: 'in_progress',
      todaysDaily: waiting
    });

    expect(screen.queryByText(/tomorrow's word arrives/i)).not.toBeInTheDocument();
    unmount();

    render(WelcomeScreen, {
      ...base,
      isFirstVisit: false,
      canContinue: true,
      lastMode: 'random',
      currentMode: 'random',
      currentStatus: 'in_progress',
      todaysDaily: { ...waiting, day: 4, status: 'lost', isTodays: false, today: 5 }
    });

    expect(screen.queryByText(/tomorrow's word arrives/i)).not.toBeInTheDocument();
  });

  it('warns that an earlier day’s set-aside game ends for good if Daily is chosen', () => {
    render(WelcomeScreen, {
      ...base,
      isFirstVisit: false,
      canContinue: true,
      lastMode: 'random',
      currentMode: 'random',
      currentStatus: 'in_progress',
      todaysDaily: {
        day: 4,
        status: 'in_progress',
        isCurrent: false,
        isTodays: false,
        today: 5,
        nextWordAt: dayStart(6)
      }
    });

    expect(screen.getByText(/day 4.*for good/i)).toBeInTheDocument();
    expect(screen.queryByText(/today's daily/i)).not.toBeInTheDocument();
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

  // FourModesCanBeStartedFromHere: custom is not among them.
  it('offers exactly the four startable modes and a new game', () => {
    render(GameNavigation, { ...base, mode: 'custom', status: 'in_progress' });

    for (const mode of ['Random', 'Endless', 'Practice', 'Daily']) {
      expect(screen.getByRole('button', { name: mode })).toBeInTheDocument();
    }
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

  /*
   * StartingAGameEndsTheOneUnderWay's daily exception: "it leaves the board
   * rather than being retired, kept with its guesses, and choosing Daily
   * brings it back". A daily game in progress is not at risk of a loss, so
   * the ordinary cost sentence would misstate it.
   */
  it('says the daily game is set aside rather than lost, while it is the one under way', () => {
    render(GameNavigation, {
      ...base,
      mode: 'daily',
      status: 'in_progress',
      dailyIsTodays: true
    });

    expect(screen.getByText(/set aside/i)).toBeInTheDocument();
    expect(screen.queryByText(/counts as a loss/i)).not.toBeInTheDocument();
  });

  /*
   * TheDayIsPerceivable: "whether today's game has been played and how it
   * ended" has to be readable as text. While the daily game waits off the
   * board there is nowhere else to read it — this is the surface that offers
   * Daily as a choice, so it is where the player looks before choosing.
   */
  it('says how today’s daily game stands while it waits off the board', () => {
    render(GameNavigation, {
      ...base,
      mode: 'random',
      status: 'in_progress',
      todaysDaily: {
        day: 7,
        status: 'won',
        isCurrent: false,
        isTodays: true,
        today: 7,
        nextWordAt: dayStart(8)
      }
    });

    expect(screen.getByText(/day 7/i)).toBeInTheDocument();
    expect(screen.getByText(/won/i)).toBeInTheDocument();
  });

  /*
   * TheNextWordIsAnnouncedInAdvance: "available as text from the moment
   * today's game is over". The game that carries the time on the board is off
   * it, and coming back to it costs the game that took its place, so the time
   * is said here rather than sold at that price.
   */
  it('says when the next word arrives, for a finished daily game set aside', () => {
    render(GameNavigation, {
      ...base,
      mode: 'random',
      status: 'in_progress',
      todaysDaily: {
        day: 7,
        status: 'lost',
        isCurrent: false,
        isTodays: true,
        today: 7,
        nextWordAt: dayStart(8)
      }
    });

    expect(screen.getByText(/tomorrow's word arrives/i)).toBeInTheDocument();
  });

  it('says nothing about a daily game when there is none', () => {
    render(GameNavigation, { ...base, mode: 'random', status: 'in_progress' });

    expect(screen.queryByText(/today's daily/i)).not.toBeInTheDocument();
  });

  /*
   * ANewDayReplacesTheOldGame, for a game set aside rather than on the board:
   * once the date has moved on it is an earlier day's, choosing Daily discards
   * it rather than bringing it back, and the guarantee asks for that to be
   * said before the choice is taken. Calling it "today's daily" would say the
   * opposite.
   */
  it('warns that an earlier day’s set-aside game ends for good if Daily is chosen', () => {
    render(GameNavigation, {
      ...base,
      mode: 'random',
      status: 'in_progress',
      todaysDaily: {
        day: 4,
        status: 'in_progress',
        isCurrent: false,
        isTodays: false,
        today: 5,
        nextWordAt: dayStart(6)
      }
    });

    expect(screen.getByText(/day 4.*for good/i)).toBeInTheDocument();
    expect(screen.getByText(/day 5.*available/i)).toBeInTheDocument();
    expect(screen.queryByText(/today's daily/i)).not.toBeInTheDocument();
  });

  it('says an earlier day’s finished game is over, and that today’s word is available', () => {
    render(GameNavigation, {
      ...base,
      mode: 'random',
      status: 'in_progress',
      todaysDaily: {
        day: 4,
        status: 'won',
        isCurrent: false,
        isTodays: false,
        today: 5,
        nextWordAt: dayStart(6)
      }
    });

    expect(screen.getByText(/day 4.*over/i)).toBeInTheDocument();
    expect(screen.getByText(/day 5.*available/i)).toBeInTheDocument();
    expect(screen.queryByText(/for good/i)).not.toBeInTheDocument();
  });

  /*
   * ThereIsNoNewGameInDaily: "No control offers a second daily game." New
   * game repeats the mode on the board, and over a daily game the request it
   * would make is answered by StayOnTodaysDailyGame with nothing — so the
   * control is not offered, and Daily is the one way to ask.
   */
  it('offers no New game control while the mode it would repeat is Daily', () => {
    render(GameNavigation, { ...base, mode: 'daily', status: 'in_progress', repeatMode: 'daily' });

    expect(screen.queryByRole('button', { name: 'New game' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Daily' })).toBeInTheDocument();
  });

  /*
   * ANewDayReplacesTheOldGame: the earlier day's game is discarded by choosing
   * Daily, and the guarantee asks for that to be said before it is taken —
   * where the same-day sentence promises the opposite.
   */
  it('warns that choosing Daily ends an earlier day’s game, rather than bringing it back', () => {
    render(GameNavigation, {
      ...base,
      mode: 'daily',
      status: 'in_progress',
      dailyIsTodays: false
    });

    expect(screen.getByText(/ends this one|goes for good/i)).toBeInTheDocument();
    expect(screen.queryByText(/brings it back/i)).not.toBeInTheDocument();
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
    todaysGame: null,
    onstop: vi.fn(),
    onnewgame: vi.fn(),
    onshareresults: vi.fn(),
    onshareanswer: vi.fn(),
    onclose: vi.fn(),
    onwelcome: vi.fn(),
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

  // NothingButDailyIsRationed: outside Daily, a new game can always be requested.
  it('always offers another game outside Daily', async () => {
    const onnewgame = vi.fn();
    render(GameConclusion, { ...base, onnewgame });

    await userEvent.click(screen.getByRole('button', { name: 'New game' }));

    expect(onnewgame).toHaveBeenCalledWith('random');
  });

  /*
   * ThereIsNoNewGameInDaily: "No control offers a second daily game... Daily
   * offers the time the next word arrives and the way back to the welcome
   * screen." The repeat control a finished daily game would otherwise show is
   * replaced, not merely hidden — a dead "New game" button that no-ops is not
   * this guarantee's "offers", and NothingButDailyIsRationed says Daily is the
   * one mode where a second go at the same word is exactly what is withheld.
   */
  it('offers no repeat control for a finished daily game, only when the next word arrives', () => {
    render(GameConclusion, {
      ...base,
      mode: 'daily',
      repeatMode: 'daily',
      todaysGame: {
        today: 2,
        keptDay: 2,
        keptStatus: 'won',
        keptIsCurrent: true,
        isTodays: true,
        nextWordAt: dayStart(3)
      }
    });

    expect(screen.queryByRole('button', { name: 'New game' })).not.toBeInTheDocument();
    expect(screen.getByText(/tomorrow's word arrives/i)).toBeInTheDocument();
  });

  /*
   * NothingButDailyIsRationed: "the welcome screen, where the four modes are
   * equal choices, stays one action away". This is a dialog that keeps the
   * keyboard, so the header's chip is not one action away from inside it —
   * the way out is offered here, where ThereIsNoNewGameInDaily puts it:
   * "Daily offers the time the next word arrives and the way back to the
   * welcome screen, where another mode is chosen."
   */
  it('offers the welcome screen from a finished daily game, one action away', async () => {
    const onwelcome = vi.fn();
    render(GameConclusion, {
      ...base,
      mode: 'daily',
      repeatMode: 'daily',
      todaysGame: {
        today: 2,
        keptDay: 2,
        keptStatus: 'won',
        keptIsCurrent: true,
        isTodays: true,
        nextWordAt: dayStart(3)
      },
      onwelcome
    });

    // No mode is chosen in here: the welcome screen is where they are equal
    // choices, and offering a subset of them beside it would rank them.
    for (const mode of ['Daily', 'Random', 'Endless', 'Practice']) {
      expect(screen.queryByRole('button', { name: mode })).not.toBeInTheDocument();
    }

    await userEvent.click(screen.getByRole('button', { name: 'Play another mode' }));

    expect(onwelcome).toHaveBeenCalledTimes(1);
  });

  /*
   * The same way out from an earlier day's finished game, which is the case
   * that has nowhere else to go: ANewDayReplacesTheOldGame means today's word
   * is available, and the welcome screen is where Daily is chosen.
   */
  it("offers it from an earlier day's game too", () => {
    render(GameConclusion, {
      ...base,
      mode: 'daily',
      repeatMode: 'daily',
      todaysGame: {
        today: 5,
        keptDay: 4,
        keptStatus: 'won',
        keptIsCurrent: true,
        isTodays: false,
        nextWordAt: dayStart(6)
      }
    });

    expect(screen.getByRole('button', { name: 'Play another mode' })).toBeInTheDocument();
    expect(screen.getByText(/day 5.*is available now/i)).toBeInTheDocument();
  });

  /*
   * The modal covers GameNavigation, which carries
   * FourModesCanBeStartedFromHere and AvailableWhetherOrNotAGameExists. A
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
   * The grid is shown where the player is looking, and the board is where they
   * are looking once a dialog is closed: a grid shared from the conclusion is
   * still theirs to copy after they put the conclusion away. A link is not —
   * it lives inside the surface that made it, so a link handed here is nothing.
   */
  it('shows the grid it is holding, and never a link', async () => {
    const props = screenProps(gameAfter(), {
      shareable: { kind: 'custom_link', text: 'https://poodl.test/?g=yrqt9rd9' }
    });
    const { unmount } = render(GameScreen, props);

    expect(screen.queryByRole('textbox', { name: /custom game link/i })).not.toBeInTheDocument();
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
});
