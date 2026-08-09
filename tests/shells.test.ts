import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Announcer from '../src/lib/components/Announcer.svelte';
import Countdown from '../src/lib/components/Countdown.svelte';
import DistributionChart from '../src/lib/components/DistributionChart.svelte';
import LinkReady from '../src/lib/components/LinkReady.svelte';
import Modal from '../src/lib/components/Modal.svelte';
import Notice from '../src/lib/components/Notice.svelte';
import ResultsReady from '../src/lib/components/ResultsReady.svelte';

/*
 * The live region three guarantees rest on: `EverySubmittedGuessIsAnnounced`,
 * `EveryRejectionIsAnnounced` and `ConclusionIsAnnounced`.
 */
describe('Announcer', () => {
  it('carries the message where assistive technology will find it', () => {
    render(Announcer, { message: 'Attempt 1: A correct', sequence: 1 });

    expect(screen.getByRole('status')).toHaveTextContent('Attempt 1: A correct');
  });

  it('says nothing when there is nothing to say', () => {
    render(Announcer, { message: null, sequence: 0 });

    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('announces politely rather than interrupting', () => {
    render(Announcer, { message: 'Attempt 1', sequence: 1 });

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});

/*
 * What Poodl is telling the player right now, visibly and out loud at once.
 * `EveryRejectionIsAnnounced` asks for both.
 */
describe('Notice', () => {
  it('says which of the three rejections applied', () => {
    render(Notice, { notice: { kind: 'guess_rejected', reason: 'not_in_dictionary' } });

    expect(screen.getByRole('status')).toHaveTextContent(/word list/i);
  });

  it('names the entry a custom answer was refused for', () => {
    render(Notice, { notice: { kind: 'custom_answer_rejected', entry: 'qqqqq' } });

    expect(screen.getByRole('status')).toHaveTextContent(/qqqqq/);
  });

  it('reports both outcomes of a copy', () => {
    const { unmount } = render(Notice, { notice: { kind: 'results_copied' } });

    expect(screen.getByRole('status')).toHaveTextContent(/copied/i);
    unmount();

    render(Notice, { notice: { kind: 'copy_failed' } });

    expect(screen.getByRole('status')).toHaveTextContent(/could not/i);
  });

  /*
   * The region has to be there before it says anything, or the first thing it
   * says arrives with it and a live region that has not changed is not read.
   * So "nothing to say" is an empty region, not an absent one.
   */
  it('keeps an empty region waiting when there is no notice', () => {
    render(Notice, { notice: null });

    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  /*
   * Two identical sentences in a row change no text, so the nodes are replaced
   * instead. The sequence is what the engine advances for exactly this.
   */
  it('is heard again when the same thing is said twice', async () => {
    const notice = { kind: 'guess_rejected', reason: 'incomplete' } as const;
    const { rerender } = render(Notice, { notice, sequence: 1 });
    const region = screen.getByRole('status');
    const said = region.firstElementChild;

    await rerender({ notice: { ...notice }, sequence: 2 });

    expect(screen.getByRole('status')).toBe(region);
    expect(region.firstElementChild).not.toBe(said);
  });

  it('can be dismissed when a caller offers to take it back', async () => {
    const ondismiss = vi.fn();
    render(Notice, { notice: { kind: 'results_copied' }, ondismiss });

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(ondismiss).toHaveBeenCalledTimes(1);
  });
});

/*
 * sharing.allium — `CustomLinkReady`. The link is shown so it can be copied, and
 * `TheWordIsNotReadableInTheLink` means nothing beside it says the word.
 */
describe('LinkReady', () => {
  const URL_ = 'https://poodl.test/?g=yrqt9rd9';

  it('offers the link as text that can be read and selected', () => {
    render(LinkReady, { url: URL_ });

    expect(screen.getByRole('textbox', { name: /link/i })).toHaveValue(URL_);
  });

  it('copies it on request', async () => {
    const oncopy = vi.fn();
    render(LinkReady, { url: URL_, oncopy });

    await userEvent.click(screen.getByRole('button', { name: /copy/i }));

    expect(oncopy).toHaveBeenCalledTimes(1);
  });

  it('is reachable by keyboard alone', async () => {
    const oncopy = vi.fn();
    render(LinkReady, { url: URL_, oncopy });

    await userEvent.tab();
    await userEvent.tab();

    expect(screen.getByRole('button', { name: /copy/i })).toHaveFocus();

    await userEvent.keyboard('{Enter}');

    expect(oncopy).toHaveBeenCalledTimes(1);
  });
});

/*
 * sharing.allium — `TheGridIsAvailableAsText`. The grid is shown as text and not
 * only written to the clipboard: readable before it is sent, and selectable by
 * hand when the clipboard cannot be reached.
 */
describe('ResultsReady', () => {
  const GRID = 'Poodl 3/6\n🟩⬛⬛🟨⬛\n🟩🟨⬛⬛⬛\n🟩🟩🟩🟩🟩';

  it('offers the grid as text that can be read and selected', () => {
    render(ResultsReady, { text: GRID });

    expect(screen.getByRole('textbox', { name: /result/i })).toHaveValue(GRID);
  });

  // SharedTextGivesNothingAway: what is shown is what is copied, and it names
  // no letter of any word.
  it('shows exactly what would be copied, and no letter of any word', () => {
    render(ResultsReady, { text: GRID });

    expect(screen.getByRole('textbox', { name: /result/i })).toHaveValue(GRID);
    expect(document.body.textContent).not.toMatch(/apple/i);
  });

  it('is reachable by keyboard alone', async () => {
    const oncopy = vi.fn();
    render(ResultsReady, { text: GRID, oncopy });

    await userEvent.tab();

    expect(screen.getByRole('textbox', { name: /result/i })).toHaveFocus();

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(oncopy).toHaveBeenCalledTimes(1);
  });
});

/*
 * The shell every panel and the end-of-game modal sit in. Each of them carries
 * FullyKeyboardOperable, so the shell is where that is made true once.
 */
describe('Modal', () => {
  it('is a dialog with a name', () => {
    render(Modal, { title: 'Settings' });

    expect(screen.getByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });

  it('takes focus when it opens, so the keyboard arrives inside it', () => {
    render(Modal, { title: 'Settings' });

    expect(screen.getByRole('dialog', { name: 'Settings' })).toHaveFocus();
  });

  it('closes on Escape', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Settings', onclose });

    await userEvent.keyboard('{Escape}');

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  // A caller that offers no way to close gets no control that pretends to.
  it('offers no close at all when a caller keeps it open', () => {
    render(Modal, { title: 'You won' });

    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('closes from its own control', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Settings', onclose });

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it('keeps the keyboard inside itself', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Settings', onclose });
    const close = screen.getByRole('button', { name: 'Close' });

    await userEvent.tab();

    expect(close).toHaveFocus();

    await userEvent.tab();

    expect(close).toHaveFocus();
  });

  /*
   * The trap listens on the panel, so it works only while focus is on it or in
   * it — and a removed element fires no `focusout` for this to answer. So the
   * shell cannot catch a child that removes the control the player just used;
   * each child carries focus across its own swap, and this records why Escape
   * is worth testing again from wherever focus lands.
   */
  it('answers Escape from anywhere inside itself', async () => {
    const onclose = vi.fn();
    render(Modal, { title: 'Settings', onclose });

    screen.getByRole('button', { name: 'Close' }).focus();
    await userEvent.keyboard('{Escape}');

    expect(onclose).toHaveBeenCalledTimes(1);
  });
});

/*
 * game.allium — `EndlessContinuesUnlessStopped`: the remaining time is
 * perceivable, and stopping is an action available while it runs.
 */
describe('Countdown', () => {
  it('says how long is left, as text', () => {
    render(Countdown, { seconds: 7, onstop: vi.fn() });

    expect(screen.getByText(/7 seconds/)).toBeInTheDocument();
  });

  it('reads correctly at one second', () => {
    render(Countdown, { seconds: 1, onstop: vi.fn() });

    expect(screen.getByText(/1 second\b/)).toBeInTheDocument();
  });

  it('stops on request', async () => {
    const onstop = vi.fn();
    render(Countdown, { seconds: 7, onstop });

    await userEvent.click(screen.getByRole('button', { name: /stop/i }));

    expect(onstop).toHaveBeenCalledTimes(1);
  });
});

/*
 * statistics.allium — `DistributionIsReadableWithoutSeeingIt`: each bucket's
 * attempt number and count are available as text, so the distribution can be
 * read rather than inferred from the length of a bar.
 */
describe('DistributionChart', () => {
  it('states every bucket as an attempt number and a count', () => {
    render(DistributionChart, { distribution: [1, 0, 3, 0, 0, 2] });

    const rows = within(screen.getByRole('list', { name: /distribution/i })).getAllByRole(
      'listitem'
    );

    expect(rows).toHaveLength(6);
    expect(rows[0]).toHaveTextContent('1 guess: 1 win');
    expect(rows[2]).toHaveTextContent('3 guesses: 3 wins');
    expect(rows[3]).toHaveTextContent('4 guesses: 0 wins');
  });
});
