import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import HowToPlayPanel from '../src/lib/components/HowToPlayPanel.svelte';
import InvalidLinkNotice from '../src/lib/components/InvalidLinkNotice.svelte';
import SettingsPanel from '../src/lib/components/SettingsPanel.svelte';
import SharePanel from '../src/lib/components/SharePanel.svelte';
import StatisticsPanel from '../src/lib/components/StatisticsPanel.svelte';
import { DEFAULT_SETTINGS } from '../src/lib/app/state';
import { EMPTY_STATISTICS, recordLoss, recordWin } from '../src/lib/domain/statistics';

function settingsProps(overrides: Record<string, unknown> = {}) {
  return {
    settings: { ...DEFAULT_SETTINGS },
    highContrastActive: false,
    hardModeMayBeEnabled: true,
    hardModeReleased: false,
    hardModeCostsThisGame: false,
    onclose: vi.fn(),
    onchoosetheme: vi.fn(),
    onhighcontrast: vi.fn(),
    onanimations: vi.fn(),
    onphysicalkeyboard: vi.fn(),
    onshowwelcome: vi.fn(),
    onenablehardmode: vi.fn(),
    ondisablehardmode: vi.fn(),
    ...overrides
  };
}

/*
 * settings.allium — the `SettingsPanel` surface.
 */
describe('SettingsPanel', () => {
  it('offers every preference, each labelled and operable', async () => {
    const props = settingsProps();
    render(SettingsPanel, props);

    await userEvent.click(screen.getByRole('radio', { name: 'Light' }));
    await userEvent.click(screen.getByRole('checkbox', { name: /high contrast/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /animations/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /physical keyboard/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /welcome screen/i }));

    expect(props.onchoosetheme).toHaveBeenCalledWith('light');
    expect(props.onhighcontrast).toHaveBeenCalledWith(true);
    expect(props.onanimations).toHaveBeenCalledWith(false);
    expect(props.onphysicalkeyboard).toHaveBeenCalledWith(false);
    expect(props.onshowwelcome).toHaveBeenCalledWith(false);
  });

  it('shows dark chosen until the player says otherwise', () => {
    render(SettingsPanel, settingsProps());

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'System' })).not.toBeChecked();
  });

  it('shows the theme the player has chosen', () => {
    render(SettingsPanel, settingsProps({ settings: { ...DEFAULT_SETTINGS, theme: 'light' } }));

    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Dark' })).not.toBeChecked();
  });

  /*
   * TheContrastControlSaysWhenTheDeviceIsAskingForIt. The box shows the
   * effective value, so it never reads as off while the palette is on; and
   * because the device wins outright, it says which of the two is speaking
   * rather than offering a switch that would change nothing.
   */
  it('says when high contrast is the device asking rather than the player', () => {
    render(
      SettingsPanel,
      settingsProps({
        settings: { ...DEFAULT_SETTINGS, highContrast: false },
        highContrastActive: true
      })
    );
    const control = screen.getByRole('checkbox', { name: /high contrast/i });

    expect(control).toBeChecked();
    expect(control).toBeDisabled();
    expect(control).toHaveAccessibleDescription(/your device/i);
  });

  it('leaves high contrast the player’s own to change while the device is silent', async () => {
    const props = settingsProps({
      settings: { ...DEFAULT_SETTINGS, highContrast: true },
      highContrastActive: true
    });
    render(SettingsPanel, props);
    const control = screen.getByRole('checkbox', { name: /high contrast/i });

    expect(control).toBeChecked();
    expect(control).toBeEnabled();
    expect(control).not.toHaveAccessibleDescription(/your device/i);

    await userEvent.click(control);

    expect(props.onhighcontrast).toHaveBeenCalledWith(false);
  });

  it('turns hard mode on and off through separate rules', async () => {
    const on = settingsProps();
    const { unmount } = render(SettingsPanel, on);

    await userEvent.click(screen.getByRole('checkbox', { name: /hard mode/i }));

    expect(on.onenablehardmode).toHaveBeenCalledTimes(1);
    unmount();

    const off = settingsProps({ settings: { ...DEFAULT_SETTINGS, hardMode: true } });
    render(SettingsPanel, off);

    await userEvent.click(screen.getByRole('checkbox', { name: /hard mode/i }));

    expect(off.ondisablehardmode).toHaveBeenCalledTimes(1);
  });

  // HardModeCanAlwaysBeTurnedOff.
  it('never disables the control that turns hard mode off', () => {
    render(
      SettingsPanel,
      settingsProps({
        settings: { ...DEFAULT_SETTINGS, hardMode: true },
        hardModeMayBeEnabled: false
      })
    );

    expect(screen.getByRole('checkbox', { name: /hard mode/i })).toBeEnabled();
  });

  /*
   * HardModeIsExplainedWhenItCannotBeTurnedOn: the control says which of the
   * two reasons applies, and says it to assistive technology rather than only
   * as a visual state.
   */
  it('says hard mode was switched off during this game', () => {
    render(SettingsPanel, settingsProps({ hardModeMayBeEnabled: false, hardModeReleased: true }));
    const control = screen.getByRole('checkbox', { name: /hard mode/i });

    expect(control).toBeDisabled();
    expect(control).toHaveAccessibleDescription(/switched off/i);
  });

  it('says a guess already submitted would have broken the rule', () => {
    render(SettingsPanel, settingsProps({ hardModeMayBeEnabled: false, hardModeReleased: false }));

    expect(screen.getByRole('checkbox', { name: /hard mode/i })).toHaveAccessibleDescription(
      /already submitted/i
    );
  });

  // TurningHardModeOffMidGameIsAOneWayDoor: said before it is used.
  it('warns what turning hard mode off will cost, before it is used', () => {
    render(
      SettingsPanel,
      settingsProps({
        settings: { ...DEFAULT_SETTINGS, hardMode: true },
        hardModeCostsThisGame: true
      })
    );

    expect(screen.getByRole('checkbox', { name: /hard mode/i })).toHaveAccessibleDescription(
      /cannot be turned back on/i
    );
  });

  // PhysicalKeyboardInputCanBeSurrenderedToAssistiveTechnology.
  it('says what turning the physical keyboard off surrenders', () => {
    render(SettingsPanel, settingsProps());

    expect(
      screen.getByRole('checkbox', { name: /physical keyboard/i })
    ).toHaveAccessibleDescription(/on-screen keyboard/i);
  });

  // TheWelcomeSettingAppliesAtTheNextArrival.
  it('says when the welcome setting takes effect', () => {
    render(SettingsPanel, settingsProps());

    expect(screen.getByRole('checkbox', { name: /welcome screen/i })).toHaveAccessibleDescription(
      /next time/i
    );
  });
});

/*
 * statistics.allium — the `StatisticsPanel` surface.
 */
describe('StatisticsPanel', () => {
  const played = recordLoss(recordWin(recordWin(EMPTY_STATISTICS, 3), 3));

  function statisticsProps(overrides: Record<string, unknown> = {}) {
    return {
      statistics: played,
      answersUnseen: 2_391,
      answersMayRepeat: false,
      onreset: vi.fn(),
      onclose: vi.fn(),
      ...overrides
    };
  }

  it('states every number as text', () => {
    render(StatisticsPanel, statisticsProps());

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /statistics/i })).toHaveTextContent('67%');
    expect(screen.getByRole('list', { name: /distribution/i })).toHaveTextContent(
      '3 guesses: 2 wins'
    );
  });

  // RecyclingIsVisibleBeforeItSurprises.
  it('says how many answers remain unseen', () => {
    render(StatisticsPanel, statisticsProps());

    expect(screen.getByRole('dialog', { name: /statistics/i })).toHaveTextContent('2,391');
  });

  it('says so once the pool has run out and started again', () => {
    const { unmount } = render(StatisticsPanel, statisticsProps());

    expect(screen.queryByText(/may repeat/i)).not.toBeInTheDocument();
    unmount();

    render(StatisticsPanel, statisticsProps({ answersMayRepeat: true }));

    expect(screen.getByText(/may repeat/i)).toBeInTheDocument();
  });

  /*
   * ResettingIsDeliberate: confirmed before anything is cleared, and the
   * confirmation says what will go.
   */
  it('confirms before it clears anything, and says what will go', async () => {
    const props = statisticsProps();
    render(StatisticsPanel, props);

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(props.onreset).not.toHaveBeenCalled();

    const confirmation = screen.getByRole('group', { name: /reset/i });

    expect(confirmation).toHaveTextContent(/streak/i);
    expect(confirmation).toHaveTextContent(/distribution/i);
    expect(confirmation).toHaveTextContent(/answers/i);

    await userEvent.click(screen.getByRole('button', { name: /clear everything/i }));

    expect(props.onreset).toHaveBeenCalledTimes(1);
  });

  it('lets the player back out of resetting', async () => {
    const props = statisticsProps();
    render(StatisticsPanel, props);

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    await userEvent.click(screen.getByRole('button', { name: /keep/i }));

    expect(props.onreset).not.toHaveBeenCalled();
    expect(screen.queryByRole('group', { name: /reset/i })).not.toBeInTheDocument();
  });

  /*
   * FullyKeyboardOperable: the confirmation is "reachable and announced". Each
   * step replaces the control that was pressed, so unless focus is carried
   * across it lands on the body — outside the panel Escape and the Tab cycle
   * live on, and with nothing said about the step that just appeared.
   */
  it('takes the keyboard to the confirmation and back', async () => {
    render(StatisticsPanel, statisticsProps());

    // Close sits in the dialog's header row, so it is the first stop.
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: /reset/i })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('group', { name: /reset/i })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: /clear everything/i })).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: /keep/i }));
    expect(screen.getByRole('button', { name: /reset/i })).toHaveFocus();
  });
});

/*
 * sharing.allium — the `CustomGameCreation` surface, and the way in to
 * `ShareCurrentAnswer` while a game is on the board.
 */
describe('SharePanel', () => {
  function panelProps(overrides: Record<string, unknown> = {}) {
    return {
      notice: null,
      shareable: null,
      onshareanswer: vi.fn(),
      oncreate: vi.fn(),
      oncopy: vi.fn(),
      onclose: vi.fn(),
      ...overrides
    };
  }

  it('takes a word and asks for a link', async () => {
    const props = panelProps();
    render(SharePanel, props);

    await userEvent.type(screen.getByRole('textbox', { name: /word/i }), 'crumb');
    await userEvent.click(screen.getByRole('button', { name: 'Make a link' }));

    expect(props.oncreate).toHaveBeenCalledWith('crumb');
  });

  // FullyKeyboardOperable: entering a word and submitting it, from the keyboard.
  it('submits from the keyboard alone', async () => {
    const props = panelProps();
    render(SharePanel, props);

    await userEvent.type(screen.getByRole('textbox', { name: /word/i }), 'crumb{Enter}');

    expect(props.oncreate).toHaveBeenCalledWith('crumb');
  });

  // OnlyAcceptedWordsBecomeCustomGames, and the entry stays put to be corrected.
  it('shows a rejection and keeps the entry', async () => {
    const { rerender } = render(SharePanel, panelProps());
    const field = screen.getByRole('textbox', { name: /word/i });

    await userEvent.type(field, 'qqqqq{Enter}');
    await rerender({ notice: { kind: 'custom_answer_rejected', entry: 'qqqqq' } });

    expect(screen.getByRole('status')).toHaveTextContent(/qqqqq/);
    // Typed first, so this is the field and not the sentence about it.
    expect(field).toHaveValue('qqqqq');
  });

  // TheWordIsNotReadableInTheLink: "nor anything shown alongside it".
  it('takes the word off the screen once the link is made', async () => {
    const { rerender } = render(SharePanel, panelProps());
    const field = screen.getByRole('textbox', { name: /word/i });

    await userEvent.type(field, 'crumb{Enter}');
    await rerender({
      shareable: { kind: 'custom_link', text: 'https://poodl.test/?g=yrqt9rd9' }
    });

    expect(field).toHaveValue('');
  });

  /*
   * The sequence the engine advances is what makes a repeat heard: a live
   * region reacts to its text changing, and the same refusal twice does not
   * change it. Every other Notice caller threads it, and this one used not to.
   */
  it('announces an identical refusal a second time', async () => {
    const notice = { kind: 'custom_answer_rejected', entry: 'qqqqq' } as const;
    const { rerender } = render(SharePanel, panelProps({ notice, noticeSequence: 1 }));
    const first = screen.getByRole('status').firstElementChild;

    await rerender({ notice: { ...notice }, noticeSequence: 2 });

    expect(screen.getByRole('status').firstElementChild).not.toBe(first);
  });

  it('shows the link once there is one, and copies it', async () => {
    const props = panelProps({
      shareable: { kind: 'custom_link', text: 'https://poodl.test/?g=yrqt9rd9' }
    });
    render(SharePanel, props);

    expect(screen.getByRole('textbox', { name: /link/i })).toHaveValue(
      'https://poodl.test/?g=yrqt9rd9'
    );

    await userEvent.click(screen.getByRole('button', { name: /copy/i }));

    expect(props.oncopy).toHaveBeenCalledTimes(1);
  });

  // ShareCurrentAnswer.AvailableInEveryModeAndForAsLongAsTheGameIsOnTheBoard: the
  // caller says whether there is a game, and this offers it whenever there is.
  it('offers to pass the word on while a game is on the board', async () => {
    const props = panelProps();
    render(SharePanel, props);

    await userEvent.click(screen.getByRole('button', { name: /make a link to this game/i }));

    expect(props.onshareanswer).toHaveBeenCalledTimes(1);
    // Making the link is the engine's; nothing is copied from here.
    expect(props.oncopy).not.toHaveBeenCalled();
  });

  // ShareCurrentAnswer.FullyKeyboardOperable: asking for the link from the keyboard
  // alone. Close is the dialog's first stop, and this game comes before the field.
  it('asks for the link from the keyboard alone', async () => {
    const props = panelProps();
    render(SharePanel, props);

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Make a link to this game' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(props.onshareanswer).toHaveBeenCalledTimes(1);

    await userEvent.tab();
    expect(screen.getByRole('textbox', { name: /word/i })).toHaveFocus();
  });

  // ShareCurrentAnswer exposes current_game.mode and current_game.status, and a
  // modal hides the header chip that says them — so the section says which game.
  it('names the game it would pass on', () => {
    const playing = render(SharePanel, panelProps({ mode: 'practice', status: 'in_progress' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Playing practice.');
    playing.unmount();

    const finished = render(SharePanel, panelProps({ mode: 'practice', status: 'won' }));

    expect(screen.getByRole('dialog')).toHaveTextContent('Practice game finished.');
    finished.unmount();

    // No game, no section — whatever the caller left in the props.
    render(SharePanel, panelProps({ mode: 'random', status: 'won', onshareanswer: undefined }));

    expect(screen.getByRole('dialog')).not.toHaveTextContent(/finished/i);
  });

  it('offers nothing to pass on when there is no game', () => {
    render(SharePanel, panelProps({ onshareanswer: undefined }));

    expect(
      screen.queryByRole('button', { name: /make a link to this game/i })
    ).not.toBeInTheDocument();
    // The other half of the dialog is unaffected.
    expect(screen.getByRole('textbox', { name: /word/i })).toBeInTheDocument();
  });
});

/*
 * sharing.allium — the `CustomLinkEntry` surface.
 * InvalidLinksAreExplainedAndSurvivable.
 */
describe('InvalidLinkNotice', () => {
  it('says the link is not a Poodl link, and offers a way out', async () => {
    const onaccept = vi.fn();
    render(InvalidLinkNotice, { onaccept, ondismiss: vi.fn() });

    expect(screen.getByRole('alert')).toHaveTextContent(/not a poodl link/i);

    await userEvent.click(screen.getByRole('button', { name: /random game/i }));

    expect(onaccept).toHaveBeenCalledTimes(1);
  });

  it('can be dismissed instead', async () => {
    const ondismiss = vi.fn();
    render(InvalidLinkNotice, { onaccept: vi.fn(), ondismiss });

    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));

    expect(ondismiss).toHaveBeenCalledTimes(1);
  });
});

/*
 * game.allium — the `Welcome` surface's explanation, as the dialog the
 * header's info button opens. AFirstVisitIsExplained: "reachable again
 * afterwards rather than being shown once and lost".
 */
describe('HowToPlayPanel', () => {
  it('is the explanation inside a dialog named for it', () => {
    render(HowToPlayPanel, { onclose: vi.fn() });
    const dialog = screen.getByRole('dialog', { name: 'How to play' });

    expect(dialog).toHaveFocus();
    expect(dialog).toHaveTextContent(/6 attempts/);
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(3);
  });

  it('closes from its own control', async () => {
    const onclose = vi.fn();
    render(HowToPlayPanel, { onclose });

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  // FullyKeyboardOperable, by way of Modal.
  it('closes on Escape', async () => {
    const onclose = vi.fn();
    render(HowToPlayPanel, { onclose });

    await userEvent.keyboard('{Escape}');

    expect(onclose).toHaveBeenCalledTimes(1);
  });
});
