<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import type { HardModeBlocker } from '$lib/app/engine';
  import type { Settings } from '$lib/app/state';
  import type { ThemeChoice } from '$lib/domain/types';

  /**
   * `settings.allium` — the `SettingsPanel` surface.
   *
   * Three controls carry more than their label. Hard mode says which reason
   * blocks turning it on — this game's own, or the daily game set aside — and what turning it off will cost
   * before it is used — `HardModeIsExplainedWhenItCannotBeTurnedOn` and
   * `TurningHardModeOffMidGameIsAOneWayDoor`. The physical keyboard says what
   * off surrenders, so it never reads as though it would make the game
   * unplayable. High contrast says when it is the device asking rather than the
   * player — `TheContrastControlSaysWhenTheDeviceIsAskingForIt`. Every
   * description is bound with `aria-describedby`, because each of those
   * guarantees asks for the explanation to reach assistive technology rather
   * than only the eye.
   */
  let {
    settings,
    highContrastActive,
    hardModeMayBeEnabled,
    hardModeBlocker,
    hardModeCostsThisGame,
    onclose,
    onchoosetheme,
    onhighcontrast,
    onanimations,
    onphysicalkeyboard,
    onshowwelcome,
    onenablehardmode,
    ondisablehardmode
  }: {
    settings: Settings;
    /** `Settings.high_contrast_active` — the setting or the device, whichever asked. */
    highContrastActive: boolean;
    hardModeMayBeEnabled: boolean;
    /** Which reason blocks re-enabling, when it is blocked. */
    hardModeBlocker: HardModeBlocker;
    /** Whether turning it off now would bar it for the rest of this game. */
    hardModeCostsThisGame: boolean;
    onclose: () => void;
    onchoosetheme: (choice: ThemeChoice) => void;
    onhighcontrast: (enabled: boolean) => void;
    onanimations: (enabled: boolean) => void;
    onphysicalkeyboard: (enabled: boolean) => void;
    onshowwelcome: (enabled: boolean) => void;
    onenablehardmode: () => void;
    ondisablehardmode: () => void;
  } = $props();

  const THEMES: readonly { value: ThemeChoice; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ];

  // One identifier per component, suffixed: `$props.id()` may be called once.
  const uid = $props.id();
  const contrastId = `${uid}-contrast`;
  const hardModeId = `${uid}-hard-mode`;
  const keyboardId = `${uid}-keyboard`;
  const welcomeId = `${uid}-welcome`;

  /*
   * `TheContrastControlSaysWhenTheDeviceIsAskingForIt`. The box shows the
   * effective value, so it never reads as off while the palette is on — which
   * would look as though the player had been ignored. When the two disagree it
   * is because the device asked, and the device wins, so the control says so
   * and steps aside rather than offering a switch that would change nothing.
   *
   * That the player has nowhere to overrule the device is
   * `settings.allium`'s open question, not an answer given here.
   */
  const deviceIsAsking = $derived(highContrastActive && !settings.highContrast);

  const contrastNote = $derived(
    deviceIsAsking
      ? 'Your device asks for more contrast everywhere, so this stays on. Changes the board and the emoji in a shared result together.'
      : 'Changes the board and the emoji in a shared result together.'
  );

  const hardModeNote = $derived.by(() => {
    if (settings.hardMode) {
      return hardModeCostsThisGame
        ? 'Revealed letters must be reused. Turning it off now cannot be turned back on until the next game.'
        : 'Revealed letters must be reused. Turning it off costs nothing before the first guess.';
    }
    if (hardModeMayBeEnabled) {
      return 'Revealed letters must be reused. It applies from your very next guess.';
    }
    switch (hardModeBlocker) {
      case 'released':
        return 'Unavailable: hard mode was switched off part way through this game. It can be turned on again when the next game starts.';
      case 'daily-released':
        return "Unavailable: hard mode was switched off part way through today's daily game, which is set aside and waiting. Finishing it — or the next day replacing it — turns this on again.";
      case 'daily-history':
        return "Unavailable: a guess already submitted to today's daily game, set aside and waiting, would have broken the rule. Finishing it — or the next day replacing it — turns this on again.";
      default:
        return 'Unavailable: a guess already submitted in this game would have broken the rule.';
    }
  });

  function toggleHardMode(): void {
    if (settings.hardMode) {
      ondisablehardmode();
    } else {
      onenablehardmode();
    }
  }
</script>

<Modal title="Settings" {onclose}>
  <fieldset class="theme">
    <legend>Theme</legend>
    {#each THEMES as choice (choice.value)}
      <label>
        <input
          type="radio"
          name="theme"
          value={choice.value}
          checked={settings.theme === choice.value}
          onchange={() => {
            onchoosetheme(choice.value);
          }}
        />
        {choice.label}
      </label>
    {/each}
  </fieldset>

  <ul class="switches">
    <li>
      <label>
        <input
          type="checkbox"
          checked={highContrastActive}
          disabled={deviceIsAsking}
          aria-describedby={contrastId}
          onchange={(event) => {
            onhighcontrast(event.currentTarget.checked);
          }}
        />
        High contrast
        <span class="state" aria-hidden="true">{highContrastActive ? 'On' : 'Off'}</span>
      </label>
      <p id={contrastId}>{contrastNote}</p>
    </li>

    <li>
      <label>
        <input
          type="checkbox"
          checked={settings.hardMode}
          disabled={!settings.hardMode && !hardModeMayBeEnabled}
          aria-describedby={hardModeId}
          onchange={toggleHardMode}
        />
        Hard mode
        <span class="state" aria-hidden="true">{settings.hardMode ? 'On' : 'Off'}</span>
      </label>
      <p id={hardModeId}>{hardModeNote}</p>
    </li>

    <li>
      <label>
        <input
          type="checkbox"
          checked={settings.animations}
          onchange={(event) => {
            onanimations(event.currentTarget.checked);
          }}
        />
        Animations
        <span class="state" aria-hidden="true">{settings.animations ? 'On' : 'Off'}</span>
      </label>
      <p>Off whenever your system asks for reduced motion, whatever this says.</p>
    </li>

    <li>
      <label>
        <input
          type="checkbox"
          checked={settings.physicalKeyboard}
          aria-describedby={keyboardId}
          onchange={(event) => {
            onphysicalkeyboard(event.currentTarget.checked);
          }}
        />
        Physical keyboard
        <span class="state" aria-hidden="true">{settings.physicalKeyboard ? 'On' : 'Off'}</span>
      </label>
      <p id={keyboardId}>
        Off hands every key back — letters, Enter and Backspace — so a screen reader can navigate by
        letter. The on-screen keyboard still plays the whole game.
      </p>
    </li>

    <li>
      <label>
        <input
          type="checkbox"
          checked={settings.showWelcome}
          aria-describedby={welcomeId}
          onchange={(event) => {
            onshowwelcome(event.currentTarget.checked);
          }}
        />
        Welcome screen
        <span class="state" aria-hidden="true">{settings.showWelcome ? 'On' : 'Off'}</span>
      </label>
      <p id={welcomeId}>Takes effect the next time you open Poodl, not on this game.</p>
    </li>
  </ul>
</Modal>

<style>
  fieldset {
    margin: 0 0 var(--s-6);
    padding: var(--s-4) var(--s-5);
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: var(--radius-card);
  }

  legend {
    padding-inline: var(--s-2);
    font-weight: 600;
  }

  .theme {
    display: flex;
    gap: var(--s-6);
    flex-wrap: wrap;
  }

  /* Rule-separated rows, in the design system's manner. */
  .switches {
    display: grid;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .switches li {
    padding-block: var(--s-3);
    border-block-start: var(--rule-w) solid var(--rule);
  }

  .switches li:first-child {
    border-block-start: 0;
  }

  /*
   * game/DirectManipulation.EveryControlIsAComfortableTarget. Three radios and
   * five checkboxes, and left to the user agent each renders about thirteen
   * pixels across — the smallest targets in the game by a wide margin.
   *
   * The row is what grows. A label bound to its control activates that control
   * across its whole area, so the row is what a finger is actually aimed at,
   * and the switch drawn below is sized to be aimed at deliberately. Measured
   * in `stories/SettingsPanel.stories.svelte`.
   */
  label {
    display: flex;
    gap: var(--s-5);
    align-items: center;
    min-block-size: 44px;
    font-weight: 600;
  }

  input[type='radio'] {
    inline-size: 1.5rem;
    block-size: 1.5rem;
  }

  .theme label {
    font-weight: 400;
  }

  /*
   * The design system's switch, drawn on the native checkbox itself so the
   * role, the focus outline, the label binding and every `aria-describedby`
   * sentence survive untouched. State is carried by the knob's position, by
   * the aria-hidden On/Off word beside the row, and by the checked state
   * assistive technology already reads — never by colour alone.
   */
  input[type='checkbox'] {
    appearance: none;
    position: relative;
    flex: 0 0 auto;
    inline-size: 44px;
    block-size: 26px;
    margin: 0;
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: 2px;
    background: transparent;
  }

  input[type='checkbox']::after {
    content: '';
    position: absolute;
    inset-block-start: 3px;
    inset-inline-start: 3px;
    inline-size: 18px;
    block-size: 18px;
    border-radius: 2px;
    background: var(--key-untried-rule);
    transition: transform var(--dur-1) var(--ease);
  }

  input[type='checkbox']:checked {
    border-color: var(--text);
    background: var(--text);
  }

  input[type='checkbox']:checked::after {
    background: var(--background);
    transform: translateX(18px);
  }

  .state {
    margin-inline-start: auto;
    color: var(--text-2);
    font-size: var(--fs-small);
    font-weight: 400;
  }

  label:has(input:disabled) {
    color: var(--text-disabled);
  }

  /* Indented past the control and its gap, so the note lines up under the name. */
  p {
    margin: 0.15rem 0 0 calc(44px + var(--s-5));
    color: var(--text-2);
    font-size: var(--fs-small);
  }
</style>
