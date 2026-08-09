import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import CustomGameForm from '../src/lib/components/CustomGameForm.svelte';
import InvalidLinkNotice from '../src/lib/components/InvalidLinkNotice.svelte';
import SettingsPanel from '../src/lib/components/SettingsPanel.svelte';
import StatisticsPanel from '../src/lib/components/StatisticsPanel.svelte';
import { DEFAULT_SETTINGS } from '../src/lib/app/state';
import { EMPTY_STATISTICS, recordLoss, recordWin } from '../src/lib/domain/statistics';

function settingsProps(overrides: Record<string, unknown> = {}) {
  return {
    settings: { ...DEFAULT_SETTINGS },
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

    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    await userEvent.click(screen.getByRole('checkbox', { name: /high contrast/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /animations/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /physical keyboard/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /welcome screen/i }));

    expect(props.onchoosetheme).toHaveBeenCalledWith('dark');
    expect(props.onhighcontrast).toHaveBeenCalledWith(true);
    expect(props.onanimations).toHaveBeenCalledWith(false);
    expect(props.onphysicalkeyboard).toHaveBeenCalledWith(false);
    expect(props.onshowwelcome).toHaveBeenCalledWith(false);
  });

  it('shows the theme the player has chosen', () => {
    render(SettingsPanel, settingsProps({ settings: { ...DEFAULT_SETTINGS, theme: 'light' } }));

    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'System' })).not.toBeChecked();
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
});

/*
 * sharing.allium — the `CustomGameCreation` surface.
 */
describe('CustomGameForm', () => {
  function formProps(overrides: Record<string, unknown> = {}) {
    return {
      notice: null,
      shareable: null,
      oncreate: vi.fn(),
      oncopy: vi.fn(),
      onclose: vi.fn(),
      ...overrides
    };
  }

  it('takes a word and asks for a link', async () => {
    const props = formProps();
    render(CustomGameForm, props);

    await userEvent.type(screen.getByRole('textbox', { name: /word/i }), 'crumb');
    await userEvent.click(screen.getByRole('button', { name: /make a link/i }));

    expect(props.oncreate).toHaveBeenCalledWith('crumb');
  });

  // FullyKeyboardOperable: entering a word and submitting it, from the keyboard.
  it('submits from the keyboard alone', async () => {
    const props = formProps();
    render(CustomGameForm, props);

    await userEvent.type(screen.getByRole('textbox', { name: /word/i }), 'crumb{Enter}');

    expect(props.oncreate).toHaveBeenCalledWith('crumb');
  });

  // OnlyAcceptedWordsBecomeCustomGames, and the entry stays put to be corrected.
  it('shows a rejection and keeps the entry', () => {
    const props = formProps({ notice: { kind: 'custom_answer_rejected', entry: 'qqqqq' } });
    render(CustomGameForm, props);

    expect(screen.getByRole('status')).toHaveTextContent(/qqqqq/);
  });

  it('shows the link once there is one, and copies it', async () => {
    const props = formProps({
      shareable: { kind: 'custom_link', text: 'https://poodl.test/?g=yrqt9rd9' }
    });
    render(CustomGameForm, props);

    expect(screen.getByRole('textbox', { name: /link/i })).toHaveValue(
      'https://poodl.test/?g=yrqt9rd9'
    );

    await userEvent.click(screen.getByRole('button', { name: /copy/i }));

    expect(props.oncopy).toHaveBeenCalledTimes(1);
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
