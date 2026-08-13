<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import SettingsPanel from '../src/lib/components/SettingsPanel.svelte';
  import { MINIMUM_TOUCH_TARGET } from '../src/lib/config';
  import { SETTINGS } from './fixtures';

  const handlers = {
    onclose: fn(),
    onchoosetheme: fn(),
    onhighcontrast: fn(),
    onanimations: fn(),
    onphysicalkeyboard: fn(),
    onshowwelcome: fn(),
    onenablehardmode: fn(),
    ondisablehardmode: fn()
  };

  const OVERVIEW = [
    'The player’s preferences.',
    '',
    'Governing surface: `SettingsPanel` in `docs/specs/settings.allium`.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee HardModeIsExplainedWhenItCannotBeTurnedOn`. Two stories below are the two',
    '  reasons, and each one is bound to the control with `aria-describedby` rather than shown',
    '  only as a visual state.',
    '- `@guarantee TurningHardModeOffMidGameIsAOneWayDoor`. The control says what it will cost',
    '  **before** it is used, so the cost is known in advance rather than discovered afterwards.',
    '- `@guarantee HardModeCanAlwaysBeTurnedOff`. Whatever else is true, the control that turns',
    '  it off is never disabled.',
    '- `@guarantee PhysicalKeyboardInputCanBeSurrenderedToAssistiveTechnology`. The control says',
    '  what off surrenders — every key, letters and Enter and Backspace alike — and says that the',
    '  on-screen keyboard still plays the whole game, so it never reads as though it would make',
    '  Poodl unplayable.',
    '- `@guarantee TheWelcomeSettingAppliesAtTheNextArrival`, said on the control itself.',
    '- `@guarantee HighContrastGovernsTheSharedGridToo`: one preference, not two.',
    '- `@guarantee FullyKeyboardOperable`, proved by the play function below.',
    '- `game/DirectManipulation`, whose `@invariant EveryControlIsAComfortableTarget` is the',
    '  reason the last story measures every labelled row: three theme radios and five checkboxes',
    '  are the smallest targets in the game, and the row bound to each one is what a finger hits.',
    '',
    '`@guarantee SettingsPersistBetweenSessions` and',
    '`@guarantee TheseSettingsGovernPlayImmediately` are not this component’s to keep — the first',
    'belongs to persistence, the second to the engine reading the live setting at submission.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Settings/SettingsPanel',
    component: SettingsPanel,
    tags: ['autodocs'],
    args: {
      settings: SETTINGS,
      highContrastActive: false,
      hardModeMayBeEnabled: true,
      hardModeReleased: false,
      hardModeCostsThisGame: false,
      ...handlers
    },
    argTypes: {
      settings: { control: false, description: 'The six preferences, as they stand.' },
      highContrastActive: {
        control: 'boolean',
        description: 'High contrast as it applies: the setting, or the device asking.'
      },
      hardModeMayBeEnabled: { control: 'boolean' },
      hardModeReleased: { control: 'boolean', description: 'Which of the two reasons applies.' },
      hardModeCostsThisGame: { control: 'boolean', description: 'Whether turning it off bars it.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- The defaults: theme following the device, hard mode off and available. -->
<Story name="Defaults" />

<!-- Hard mode on, before a guess. Turning it off costs nothing yet. -->
<Story name="Hard mode on, nothing played" args={{ settings: { ...SETTINGS, hardMode: true } }} />

<!-- Hard mode on, with guesses behind it. Now the control says what off costs. -->
<Story
  name="Hard mode on, and a one-way door"
  args={{ settings: { ...SETTINGS, hardMode: true }, hardModeCostsThisGame: true }}
/>

<!-- The first reason it cannot be turned on: it was switched off during this game. -->
<Story
  name="Unavailable: switched off this game"
  args={{ hardModeMayBeEnabled: false, hardModeReleased: true }}
  play={async ({ canvasElement }) => {
    // SettingsPanel.@guarantee HardModeIsExplainedWhenItCannotBeTurnedOn
    // The explanation has to reach assistive technology, not only the eye.
    const control = within(canvasElement).getByRole('checkbox', { name: /hard mode/i });

    await expect(control).toBeDisabled();
    await expect(control).toHaveAccessibleDescription(/switched off/i);
  }}
/>

<!-- The second: a guess already submitted would have broken the rule. -->
<Story
  name="Unavailable: a guess would have broken it"
  args={{ hardModeMayBeEnabled: false, hardModeReleased: false }}
  play={async ({ canvasElement }) => {
    // SettingsPanel.@guarantee HardModeIsExplainedWhenItCannotBeTurnedOn
    await expect(
      within(canvasElement).getByRole('checkbox', { name: /hard mode/i })
    ).toHaveAccessibleDescription(/already submitted/i);
  }}
/>

<!-- Hard mode off is never guarded, even when it could not be turned back on. -->
<Story
  name="Off is always available"
  args={{ settings: { ...SETTINGS, hardMode: true }, hardModeMayBeEnabled: false }}
  play={async ({ canvasElement }) => {
    // SettingsPanel.@guarantee HardModeCanAlwaysBeTurnedOff
    await expect(within(canvasElement).getByRole('checkbox', { name: /hard mode/i })).toBeEnabled();
  }}
/>

<!-- Every preference operable from the keyboard alone. -->
<Story
  name="Operable from the keyboard"
  play={async ({ canvasElement }) => {
    // SettingsPanel.@guarantee FullyKeyboardOperable
    handlers.onchoosetheme.mockClear();
    handlers.onhighcontrast.mockClear();
    const canvas = within(canvasElement);

    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: 'System' })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(handlers.onchoosetheme).toHaveBeenCalledWith('light');

    await userEvent.tab();
    await expect(canvas.getByRole('checkbox', { name: /high contrast/i })).toHaveFocus();

    await userEvent.keyboard('[Space]');
    await expect(handlers.onhighcontrast).toHaveBeenCalledWith(true);
  }}
/>

<!-- The high-contrast palette, which the shared grid follows too. -->
<Story
  name="High contrast"
  args={{ settings: { ...SETTINGS, highContrast: true }, highContrastActive: true }}
  globals={{ highContrast: 'on' }}
/>

<!--
  The palette on because the device asked, not because the player did. The
  setting underneath is still off and stays off — `settings.allium` derives
  `high_contrast_active` precisely so the player's own answer survives being
  overridden.
-->
<Story
  name="High contrast, asked for by the device"
  args={{ settings: { ...SETTINGS, highContrast: false }, highContrastActive: true }}
  globals={{ highContrast: 'on' }}
  play={async ({ canvasElement }) => {
    // SettingsPanel.@guarantee TheContrastControlSaysWhenTheDeviceIsAskingForIt
    // Checked, so it never reads as though the player had been ignored; and it
    // says which of the two is speaking, to assistive technology and not only
    // as a visual state.
    const control = within(canvasElement).getByRole('checkbox', { name: /high contrast/i });

    await expect(control).toBeChecked();
    await expect(control).toBeDisabled();
    await expect(control).toHaveAccessibleDescription(/your device/i);
  }}
/>

<!--
  Three theme radios and five checkboxes, and left to the user agent they render
  about thirteen pixels across — the smallest targets in the game by a wide
  margin.

  What is measured is the labelled row rather than the box inside it. A label
  bound to its control activates that control across its whole area, so the row
  is what a finger actually hits, and a 44px box drawn where the player has only
  ever seen a native checkbox would be a stranger thing than the problem it
  solved. jsdom can return none of these numbers.

  The row is also what acknowledges the touch, for the same reason: `app.css`
  draws its pressed ring on `label:has(input:not(:disabled)):active` as well as
  on a button, because the rule that takes the platform's tap flash away reaches
  every one of these. `:active` is a state no play function can force, so what
  is measured here is the target and the cue is asserted in
  `tests/directManipulation.test.ts` instead.
-->
<Story
  name="Every preference is a comfortable target"
  play={async ({ canvasElement }) => {
    // game/DirectManipulation.@invariant EveryControlIsAComfortableTarget
    const controls = canvasElement.querySelectorAll('input[type="radio"], input[type="checkbox"]');

    await expect(controls.length).toBeGreaterThan(0);

    for (const control of controls) {
      const row = control.closest('label');

      if (row === null) {
        throw new Error('A preference with no label is a preference with nothing to hit');
      }

      const box = row.getBoundingClientRect();

      await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
      await expect(box.width).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
    }
  }}
/>
