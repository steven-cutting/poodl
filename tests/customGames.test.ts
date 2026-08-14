import { beforeEach, describe, expect, it } from 'vitest';

import type { Env } from '../src/lib/app/engine';
import { reduce, resultsGrid } from '../src/lib/app/engine';
import type { AppState } from '../src/lib/app/state';
import { CUSTOM_GAME_PARAM } from '../src/lib/domain/links';
import { decodeToken } from '../src/lib/domain/obfuscation';
import { renderShareGrid } from '../src/lib/domain/share';
import {
  PAGE,
  UNKNOWN_WORD,
  createEnv,
  fresh,
  loseOutright,
  playGuess,
  run,
  tokenFor,
  winInOne
} from './engineHarness';

let env: Env;

beforeEach(() => {
  env = createEnv();
});

function started(mode: 'random' | 'endless' | 'practice' = 'random'): AppState {
  return run(env, fresh(), { kind: 'new_game', mode });
}

/** The link a rule has just handed the player. */
function linkFrom(state: AppState): string {
  if (state.shareable?.kind !== 'custom_link') {
    throw new Error(`expected a link, got ${state.shareable?.kind ?? 'nothing'}`);
  }
  return state.shareable.text;
}

function tokenIn(url: string): string {
  return new URL(url).searchParams.get(CUSTOM_GAME_PARAM) as string;
}

/*
 * sharing.allium — CreateCustomGameLink. The creator's word has to be one Poodl
 * would accept as a guess, or the recipient could never type it.
 */
describe('making a custom game', () => {
  it('hands back a link for a word Poodl accepts', () => {
    const state = run(env, fresh(), { kind: 'create_custom_game', entry: 'crumb' });

    expect(decodeToken(tokenIn(linkFrom(state)))).toBe('crumb');
    expect(linkFrom(state).startsWith(PAGE)).toBe(true);
  });

  it('takes the entry in any case', () => {
    const state = run(env, fresh(), { kind: 'create_custom_game', entry: 'CRuMB' });

    expect(decodeToken(tokenIn(linkFrom(state)))).toBe('crumb');
  });

  // TheWordIsNotReadableInTheLink.
  it('shows nothing about the word alongside the link', () => {
    const url = linkFrom(run(env, fresh(), { kind: 'create_custom_game', entry: 'crumb' }));

    expect(url).not.toContain('crumb');
    expect(url).not.toContain('CRUMB');
  });

  // OnlyAcceptedWordsBecomeCustomGames, and the entry stays put to be corrected.
  it('refuses a word it does not accept, and says which entry it refused', () => {
    for (const entry of ['qqqqq', 'cat', 'crumbs', UNKNOWN_WORD]) {
      const state = run(env, fresh(), { kind: 'create_custom_game', entry });

      expect(state.notice).toEqual({ kind: 'custom_answer_rejected', entry });
    }
  });

  /*
   * OnlyAcceptedWordsBecomeCustomGames: "a word that is not in the guess
   * dictionary produces no link." A link left over from the previous entry is
   * shown beside the refusal and can still be copied, which reads as the link
   * for the word that was just refused — so the refusal takes it away. The
   * entry itself is the one thing that stays, for the creator to correct.
   */
  it('takes the previous link away when the next entry is refused', () => {
    const ready = run(env, fresh(), { kind: 'create_custom_game', entry: 'crumb' });
    const refused = run(env, ready, { kind: 'create_custom_game', entry: 'qqqqq' });

    expect(refused.notice).toEqual({ kind: 'custom_answer_rejected', entry: 'qqqqq' });
    expect(refused.shareable).toBeNull();
    expect(reduce(refused, { kind: 'copy_shareable' }, env).effects).toEqual([]);
  });

  /*
   * FullyKeyboardOperable on CustomGameCreation and on ShareCurrentAnswer:
   * "copying the resulting link can be done from the keyboard alone". The link
   * is put on the clipboard the same way a grid is, and reports the same way.
   */
  it('copies the link it just made', () => {
    const ready = run(env, fresh(), { kind: 'create_custom_game', entry: 'crumb' });
    const { effects } = reduce(ready, { kind: 'copy_shareable' }, env);

    expect(effects).toEqual([{ kind: 'copy', id: 1, text: linkFrom(ready) }]);
  });

  it('has no link to copy when none was made', () => {
    const state = fresh();
    const { effects, state: after } = reduce(state, { kind: 'copy_shareable' }, env);

    expect(effects).toEqual([]);
    expect(after).toBe(state);
  });

  /*
   * The link outlives the attempt to copy it. Both outcomes replace what Poodl
   * is saying and neither takes the link away — the failure in particular sends
   * the player to text they have to select by hand, so the text has to be there.
   */
  it('keeps the link on screen whichever way the copy goes', () => {
    const ready = run(env, fresh(), { kind: 'create_custom_game', entry: 'crumb' });
    const { state: asked } = reduce(ready, { kind: 'copy_shareable' }, env);

    for (const copied of [true, false]) {
      const settled = run(env, asked, { kind: 'clipboard_settled', id: 1, copied });

      expect(settled.notice).toEqual({ kind: copied ? 'results_copied' : 'copy_failed' });
      expect(linkFrom(settled)).toBe(linkFrom(ready));
    }
  });

  /*
   * A copy the player has already moved on from says nothing about the one they
   * are waiting on. Two links made in a row and the first result arriving last
   * would otherwise report on the second.
   */
  it('ignores a result for a copy that has been superseded', () => {
    const made = run(env, fresh(), { kind: 'create_custom_game', entry: 'crumb' });
    const first = run(env, made, { kind: 'copy_shareable' });
    const remade = run(env, first, { kind: 'create_custom_game', entry: 'zesty' });
    const second = run(env, remade, { kind: 'copy_shareable' });
    const stale = run(env, second, { kind: 'clipboard_settled', id: 1, copied: false });

    expect(stale).toBe(second);
    expect(run(env, second, { kind: 'clipboard_settled', id: 2, copied: true }).notice).toEqual({
      kind: 'results_copied'
    });
  });

  /*
   * A copy in flight is a copy of something. The clipboard is asynchronous, so
   * a result can arrive after the text it copied has been put away — and
   * `copy_failed` sends the player to text to select by hand, which is not an
   * instruction anyone can follow once there is none.
   */
  it('drops a copy result for a link that has already gone', () => {
    const ready = run(env, fresh(), { kind: 'create_custom_game', entry: 'crumb' });
    const asked = run(env, ready, { kind: 'copy_shareable' });

    for (const gone of [
      run(env, asked, { kind: 'dismiss_shareable' }),
      run(env, asked, { kind: 'new_game', mode: 'random' })
    ]) {
      expect(gone.shareable).toBeNull();
      expect(run(env, gone, { kind: 'clipboard_settled', id: 1, copied: false })).toBe(gone);
      expect(run(env, gone, { kind: 'clipboard_settled', id: 1, copied: true })).toBe(gone);
    }
  });

  // NothingAboutTheLinkIsKept: no game, no history, nothing durable.
  it('records nothing but the link itself', () => {
    const before = fresh();
    const state = run(env, before, { kind: 'create_custom_game', entry: 'crumb' });

    expect(state.currentGame).toBeNull();
    expect(state.statistics).toEqual(before.statistics);
    expect(state.pool).toEqual(before.pool);
    expect(run(env, state, { kind: 'dismiss_shareable' }).shareable).toBeNull();
  });

  /*
   * Reading what Poodl said about a copy is not the same as putting the link
   * away. The failure message sends the player to text they select by hand, so
   * dismissing the message must leave that text exactly where it is.
   */
  it('keeps the link when the message about it is dismissed', () => {
    const ready = run(env, fresh(), { kind: 'create_custom_game', entry: 'crumb' });
    const asked = run(env, ready, { kind: 'copy_shareable' });
    const failed = run(env, asked, { kind: 'clipboard_settled', id: 1, copied: false });
    const read = run(env, failed, { kind: 'dismiss_notice' });

    expect(read.notice).toBeNull();
    expect(linkFrom(read)).toBe(linkFrom(ready));
  });
});

/*
 * sharing.allium — ShareCurrentAnswerAsCustomGame. The game is a parameter, not
 * a target: nothing in the rule's ensures touches it.
 */
describe('passing on the answer in play', () => {
  // AvailableInEveryModeAndForAsLongAsTheGameIsOnTheBoard.
  it('works in every mode, before a guess and after the game is over', () => {
    for (const mode of ['random', 'endless', 'practice'] as const) {
      const state = run(env, started(mode), { kind: 'share_current_answer' });

      expect(decodeToken(tokenIn(linkFrom(state)))).toBe(state.currentGame?.answer);
    }

    const finished = run(env, winInOne(env, started()), { kind: 'share_current_answer' });

    expect(decodeToken(tokenIn(linkFrom(finished)))).toBe(finished.currentGame?.answer);
  });

  // AWordSomebodySentYouCanBeSentOn.
  it('passes on a word that arrived from somebody else', () => {
    const custom = run(env, fresh(), { kind: 'open_custom_link', token: tokenFor('crumb') });
    const state = run(env, custom, { kind: 'share_current_answer' });

    expect(decodeToken(tokenIn(linkFrom(state)))).toBe('crumb');
  });

  // SharingCostsTheGameNothing.
  it('spends no attempt, retires nothing and moves no number', () => {
    const played = playGuess(env, started(), 'crumb');
    const typed = run(env, played, { kind: 'enter_letter', letter: 'a' });
    const state = run(env, typed, { kind: 'share_current_answer' });

    expect(state.currentGame?.status).toBe('in_progress');
    expect(state.currentGame?.guesses).toEqual(typed.currentGame?.guesses);
    expect(state.currentGame?.currentInput).toBe('a');
    expect(state.statistics).toEqual(typed.statistics);
  });

  it('does nothing when there is no game on the board', () => {
    const state = fresh();

    expect(run(env, state, { kind: 'share_current_answer' })).toBe(state);
  });
});

/*
 * sharing.allium — Opening a custom link. game.allium takes it from there: it
 * retires whatever game was on the board, which is why opening a link can cost
 * the player a streak.
 */
describe('opening a custom link', () => {
  // OpeningALinkStartsThatGame.
  it('starts a custom game on the word the link decodes to', () => {
    const state = run(env, fresh(), { kind: 'open_custom_link', token: tokenFor('zesty') });

    expect(state.currentGame?.mode).toBe('custom');
    expect(state.currentGame?.answer).toBe('zesty');
    expect(state.currentGame?.status).toBe('in_progress');
    expect(state.awaitingWelcome).toBe(false);
  });

  it('retires whatever was on the board, on the usual terms', () => {
    const played = playGuess(env, started(), 'crumb');
    const state = run(env, played, { kind: 'open_custom_link', token: tokenFor('zesty') });

    expect(state.statistics.gamesPlayed).toBe(1);
    expect(state.statistics.currentStreak).toBe(0);
  });

  it('leaves the pool alone', () => {
    const before = fresh();
    const state = run(env, before, { kind: 'open_custom_link', token: tokenFor('zesty') });

    expect(state.pool).toEqual(before.pool);
  });

  // RejectInvalidCustomLink and InvalidLinksAreExplainedAndSurvivable.
  it('says so when a link does not decode, and starts nothing', () => {
    for (const token of ['', 'not-a-token', `${tokenFor('zesty').slice(1)}7`]) {
      const state = run(env, fresh(), { kind: 'open_custom_link', token });

      expect(state.notice).toEqual({ kind: 'custom_link_invalid' });
      expect(state.currentGame).toBeNull();
    }
  });

  it('says so when the word decodes but this build has never heard of it', () => {
    const state = run(env, fresh(), { kind: 'open_custom_link', token: tokenFor(UNKNOWN_WORD) });

    expect(decodeToken(tokenFor(UNKNOWN_WORD))).toBe(UNKNOWN_WORD);
    expect(state.notice).toEqual({ kind: 'custom_link_invalid' });
    expect(state.currentGame).toBeNull();
  });

  it('leaves the board alone when the link is refused', () => {
    const played = playGuess(env, started(), 'crumb');
    const state = run(env, played, { kind: 'open_custom_link', token: 'not-a-token' });

    expect(state.currentGame).toEqual(played.currentGame);
    expect(state.statistics).toEqual(played.statistics);
  });

  // PlayerAcceptsRandomFallback: a way out rather than a dead end.
  it('offers a random game instead', () => {
    const refused = run(env, fresh(), { kind: 'open_custom_link', token: 'not-a-token' });
    const state = run(env, refused, { kind: 'accept_random_fallback' });

    expect(state.currentGame?.mode).toBe('random');
    expect(state.notice).toBeNull();
  });
});

/*
 * sharing.allium — PlayerSharesResults. What gets copied is text, and the
 * action reports whether the copy succeeded.
 */
describe('sharing a result', () => {
  it('copies the grid for a game finished by play', () => {
    const won = winInOne(env, started());
    const { state, effects } = reduce(won, { kind: 'share_results' }, env);
    const grid = renderShareGrid(
      { mode: 'random', status: 'won', guesses: won.currentGame?.guesses ?? [] },
      'standard'
    );

    expect(effects).toEqual([{ kind: 'copy', id: 1, text: grid }]);
    expect(state.notice).toBeNull();
  });

  /*
   * TheGridIsAvailableAsText: the grid is available as well as copied, so it can
   * be read before it is sent and selected by hand when the clipboard refuses.
   * What the state keeps is that there is one to show; `resultsGrid` renders it,
   * and answers the same before and after the refusal.
   */
  it('keeps the grid available as text, and through a copy that failed', () => {
    const won = winInOne(env, started());
    const shared = run(env, won, { kind: 'share_results' });
    const grid = renderShareGrid(
      { mode: 'random', status: 'won', guesses: won.currentGame?.guesses ?? [] },
      'standard'
    );

    expect(shared.shareable).toEqual({ kind: 'results' });
    expect(resultsGrid(shared, env.prefersMoreContrast)).toEqual(grid);

    const failed = run(env, shared, { kind: 'clipboard_settled', id: 1, copied: false });

    expect(failed.notice).toEqual({ kind: 'copy_failed' });
    expect(failed.shareable).toEqual({ kind: 'results' });
    expect(resultsGrid(failed, env.prefersMoreContrast)).toEqual(grid);
    expect(reduce(failed, { kind: 'copy_shareable' }, env).effects).toEqual([
      { kind: 'copy', id: 2, text: grid }
    ]);
  });

  // SharingCostsTheGameNothing: the grid is rendered from the game, not out of it.
  it('leaves the finished game exactly as it was', () => {
    const won = winInOne(env, started());
    const shared = run(env, won, { kind: 'share_results' });

    expect(shared.currentGame).toEqual(won.currentGame);
    expect(shared.statistics).toEqual(won.statistics);
  });

  // PaletteFollowsHighContrast.
  it('uses the high-contrast palette when that setting is on', () => {
    const won = run(env, winInOne(env, started()), { kind: 'set_high_contrast', enabled: true });
    const { effects } = reduce(won, { kind: 'share_results' }, env);

    expect(effects[0]).toMatchObject({ kind: 'copy' });
    expect((effects[0] as { text: string }).text).toContain('🟧');
  });

  /*
   * PaletteFollowsHighContrast, following it "as it applies rather than as it
   * was set". The setting is off here and the device is the one asking, so a
   * grid rendered from the setting alone would stop matching the board the
   * moment a device turned the palette on — which is the whole reason
   * `high_contrast_active` exists on the entity rather than on the surface.
   */
  it('uses the high-contrast palette when the device is the one asking', () => {
    const won = winInOne(env, started());
    const asking = { ...env, prefersMoreContrast: true };
    const { effects } = reduce(won, { kind: 'share_results' }, asking);

    expect(won.settings.highContrast).toBe(false);
    expect((effects[0] as { text: string }).text).toContain('🟧');
  });

  /*
   * PaletteFollowsHighContrast again, for a grid that is already on screen. The
   * palette is `high_contrast_active`, which the specifications state as a
   * derivation rather than an event, so a grid held as text would be a second
   * answer to it: the board would repaint under the device's preference and the
   * grid would not. Nothing keeps the text, so there is nothing to go stale.
   */
  it('repaints a grid already shared when the device asks for more contrast', () => {
    const shared = run(env, winInOne(env, started()), { kind: 'share_results' });
    const asking = { ...env, prefersMoreContrast: true };

    expect(resultsGrid(shared, env.prefersMoreContrast)).toContain('🟩');
    expect(resultsGrid(shared, asking.prefersMoreContrast)).toContain('🟧');
    expect(
      (reduce(shared, { kind: 'copy_shareable' }, asking).effects[0] as { text: string }).text
    ).toContain('🟧');
  });

  // The same, by the route that pre-dates the device preference: the player
  // turning the setting on while the grid they just shared is still showing.
  it('repaints a grid already shared when the player turns high contrast on', () => {
    const shared = run(env, winInOne(env, started()), { kind: 'share_results' });
    const turned = run(env, shared, { kind: 'set_high_contrast', enabled: true });

    expect(turned.shareable).toEqual({ kind: 'results' });
    expect(resultsGrid(turned, env.prefersMoreContrast)).toContain('🟧');
    expect(
      (reduce(turned, { kind: 'copy_shareable' }, env).effects[0] as { text: string }).text
    ).toContain('🟧');
  });

  // SharingIsAvailableOnceTheGameIsOver: never while one is in progress.
  it('copies nothing while the game is still being played', () => {
    const playing = playGuess(env, started(), 'crumb');
    const { state, effects } = reduce(playing, { kind: 'share_results' }, env);

    expect(effects).toEqual([]);
    expect(state).toBe(playing);
  });

  it('marks a custom result as one', () => {
    const custom = run(env, fresh(), { kind: 'open_custom_link', token: tokenFor('zesty') });
    const lost = loseOutright(env, custom);
    const { effects } = reduce(lost, { kind: 'share_results' }, env);

    expect((effects[0] as { text: string }).text.split('\n')[0]).toBe('Poodl custom X/6');
  });

  // The action reports whether the copy worked, either way.
  it('reports the outcome of the copy either way', () => {
    const shared = run(env, winInOne(env, started()), { kind: 'share_results' });

    expect(run(env, shared, { kind: 'clipboard_settled', id: 1, copied: true }).notice).toEqual({
      kind: 'results_copied'
    });
    expect(run(env, shared, { kind: 'clipboard_settled', id: 1, copied: false }).notice).toEqual({
      kind: 'copy_failed'
    });
  });
});
