import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import Button from '../src/lib/components/Button.svelte';
import HeaderBar from '../src/lib/components/HeaderBar.svelte';
import HowToPlay from '../src/lib/components/HowToPlay.svelte';
import Icon from '../src/lib/components/Icon.svelte';
import IconButton from '../src/lib/components/IconButton.svelte';
import Wordmark from '../src/lib/components/Wordmark.svelte';
import { ICONS } from '../src/lib/components/icons';
import type { IconName } from '../src/lib/components/icons';

/** A snippet for `Button`'s children, the way a caller writes text inside it. */
function says(text: string) {
  return createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));
}

/*
 * The icon map and its one renderer. Decorative by construction: an icon never
 * has a role or a name, because the control it sits in carries both.
 */
describe('Icon', () => {
  it('renders a real svg for every icon the app consumes', () => {
    for (const name of Object.keys(ICONS) as IconName[]) {
      const { container, unmount } = render(Icon, { name });

      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });

  it('is hidden from assistive technology', () => {
    const { container } = render(Icon, { name: 'check' });

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('IconButton', () => {
  it('is a button named by its label, not its shape', async () => {
    const onclick = vi.fn();
    render(IconButton, { label: 'Settings', icon: 'settings', onclick });

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(onclick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled, and a disabled one reports nothing', async () => {
    const onclick = vi.fn();
    render(IconButton, { label: 'Close', icon: 'x', onclick, disabled: true });
    const control = screen.getByRole('button', { name: 'Close' });

    expect(control).toBeDisabled();

    await userEvent.click(control);

    expect(onclick).not.toHaveBeenCalled();
  });

  it('stays quiet when no handler is supplied', async () => {
    render(IconButton, { label: 'Close', icon: 'x' });

    await expect(
      userEvent.click(screen.getByRole('button', { name: 'Close' }))
    ).resolves.toBeUndefined();
  });

  // The header's actions open dialogs and say so; Modal's Close opens nothing.
  it('announces a popup only when told it opens one', () => {
    const { unmount } = render(IconButton, {
      label: 'Settings',
      icon: 'settings',
      popup: 'dialog'
    });

    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute(
      'aria-haspopup',
      'dialog'
    );
    unmount();

    render(IconButton, { label: 'Close', icon: 'x' });

    expect(screen.getByRole('button', { name: 'Close' })).not.toHaveAttribute('aria-haspopup');
  });
});

describe('Button', () => {
  it('is named by its children and reports a press', async () => {
    const onclick = vi.fn();
    render(Button, { onclick, children: says('New game') });

    await userEvent.click(screen.getByRole('button', { name: 'New game' }));

    expect(onclick).toHaveBeenCalledTimes(1);
  });

  // The variants and sizes are paint: role and name never move with them.
  it('keeps its role and name across every variant and size', () => {
    for (const variant of ['primary', 'secondary', 'ghost'] as const) {
      for (const size of ['sm', 'md'] as const) {
        const { unmount } = render(Button, { variant, size, children: says('Continue') });

        expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
        unmount();
      }
    }
  });

  it('submits a wrapping form when asked to', async () => {
    const onclick = vi.fn();
    render(Button, { type: 'submit', onclick, children: says('Make a link') });

    expect(screen.getByRole('button', { name: 'Make a link' })).toHaveAttribute('type', 'submit');

    await userEvent.click(screen.getByRole('button', { name: 'Make a link' }));

    expect(onclick).toHaveBeenCalledTimes(1);
  });

  // The mode dialog marks the selected mode, and the sentence beside it agrees.
  it('announces the current choice only when told it is one', () => {
    const { unmount } = render(Button, { current: true, children: says('Random') });

    expect(screen.getByRole('button', { name: 'Random' })).toHaveAttribute('aria-current', 'true');
    unmount();

    render(Button, { children: says('Endless') });

    expect(screen.getByRole('button', { name: 'Endless' })).not.toHaveAttribute('aria-current');
  });

  it('can be disabled', async () => {
    const onclick = vi.fn();
    render(Button, { disabled: true, onclick, children: says('New game') });
    const control = screen.getByRole('button', { name: 'New game' });

    expect(control).toBeDisabled();

    await userEvent.click(control);

    expect(onclick).not.toHaveBeenCalled();
  });
});

describe('Wordmark', () => {
  // The mark's "b" is aria-hidden, so the words are the whole accessible text.
  it('reads as exactly the lockup, with the mark silent', () => {
    render(Wordmark, {});

    expect(screen.getByText(/biscuit/)).toHaveTextContent(/^biscuit games \/ poodl$/);
  });
});

/*
 * The body of the explanation, without a frame: `WelcomeScreen` names it as a
 * group and `HowToPlayPanel` as a dialog, so the component itself carries the
 * words and nothing else.
 */
describe('HowToPlay', () => {
  // Welcome.@guarantee AFirstVisitIsExplained: five letters, six attempts, and
  // as many games as they like.
  it('says how many attempts, how long a word is, and that there is no limit', () => {
    render(HowToPlay, {});

    expect(screen.getByText(/6 attempts/)).toHaveTextContent(/5-letter word/);
    expect(screen.getByText(/as many as you like/i)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  /*
   * GameBoard.@guarantee ResultsAreNeverConveyedByColourAlone, as an
   * illustration: the example beside each mark is the board's own tile, so it
   * carries the bar the board draws — one for correct, a shorter one for
   * present, none for absent. The tiles are hidden from assistive technology,
   * because the sentence beside each is the content; so the visible half is
   * held here through `[data-marker]`, the structural hook
   * `tests/components.test.ts` uses for the same bar, and the names are asked
   * for with `hidden` only to find each tile by the mark it shows.
   */
  it('shows each mark on a real tile that assistive technology does not read', () => {
    render(HowToPlay, {});

    expect(screen.queryAllByRole('img')).toHaveLength(0);

    const marker = (name: string) =>
      screen.getByRole('img', { name, hidden: true }).querySelector('[data-marker]');

    expect(marker('Position 1, C, correct')).not.toBeNull();
    expect(marker('Position 2, R, in the word, wrong place')).not.toBeNull();
    expect(marker('Position 3, N, not in the word')).toBeNull();
  });
});

describe('HeaderBar', () => {
  function headerProps(overrides: Record<string, unknown> = {}) {
    return {
      mode: null,
      status: null,
      onopenmodes: vi.fn(),
      onopensettings: vi.fn(),
      onopenstatistics: vi.fn(),
      onopenshare: vi.fn(),
      onopenhelp: vi.fn(),
      ...overrides
    };
  }

  it('offers the four actions under the names the page always used', async () => {
    const props = headerProps();
    render(HeaderBar, props);

    await userEvent.click(screen.getByRole('button', { name: 'Set a word' }));
    await userEvent.click(screen.getByRole('button', { name: 'Statistics' }));
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    await userEvent.click(screen.getByRole('button', { name: 'How to play' }));

    expect(props.onopenshare).toHaveBeenCalledTimes(1);
    expect(props.onopenstatistics).toHaveBeenCalledTimes(1);
    expect(props.onopensettings).toHaveBeenCalledTimes(1);
    expect(props.onopenhelp).toHaveBeenCalledTimes(1);

    // Each action opens a dialog and announces it, exactly as the chip does.
    for (const name of ['Set a word', 'Statistics', 'Settings', 'How to play']) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-haspopup', 'dialog');
    }
  });

  it('carries the brand as the page heading', () => {
    render(HeaderBar, headerProps());

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('biscuit games / poodl');
  });

  /*
   * GameNavigation.@guarantee CurrentModeIsPerceivable, the chip half: the
   * mode is the chip's visible word, and the label says the state and what
   * pressing it does. The phrase "random game" never appears in any of them —
   * `InvalidLinkNotice`'s "Play a random game" owns that query.
   */
  it('says no game is under way when none is', async () => {
    const props = headerProps();
    render(HeaderBar, props);
    const chip = screen.getByRole('button', { name: 'No game under way — change game' });

    expect(chip).toHaveTextContent('No game');
    expect(chip).toHaveAttribute('aria-haspopup', 'dialog');

    await userEvent.click(chip);

    expect(props.onopenmodes).toHaveBeenCalledTimes(1);
  });

  it('states the mode being played', () => {
    render(HeaderBar, headerProps({ mode: 'random', status: 'in_progress' }));

    expect(screen.getByRole('button', { name: 'Playing random — change game' })).toHaveTextContent(
      'random'
    );
  });

  it('says a finished game finished', () => {
    render(HeaderBar, headerProps({ mode: 'endless', status: 'won' }));

    expect(
      screen.getByRole('button', { name: 'Endless finished — change game' })
    ).toBeInTheDocument();
  });
});
