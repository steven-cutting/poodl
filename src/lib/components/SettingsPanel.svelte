<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import type { Settings } from '$lib/app/state';
  import type { ThemeChoice } from '$lib/domain/types';

  /**
   * `settings.allium` — the `SettingsPanel` surface.
   *
   * Two controls carry more than their label. Hard mode says which of the two
   * reasons blocks turning it on, and what turning it off will cost before it is
   * used — `HardModeIsExplainedWhenItCannotBeTurnedOn` and
   * `TurningHardModeOffMidGameIsAOneWayDoor`. The physical keyboard says what
   * off surrenders, so it never reads as though it would make the game
   * unplayable. Both descriptions are bound with `aria-describedby`, because
   * both guarantees ask for the explanation to reach assistive technology
   * rather than only the eye.
   */
  let {
    settings,
    hardModeMayBeEnabled,
    hardModeReleased,
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
    hardModeMayBeEnabled: boolean;
    /** Which of the two reasons blocks re-enabling: switched off, or history. */
    hardModeReleased: boolean;
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
  const hardModeId = `${uid}-hard-mode`;
  const keyboardId = `${uid}-keyboard`;
  const welcomeId = `${uid}-welcome`;

  const hardModeNote = $derived.by(() => {
    if (settings.hardMode) {
      return hardModeCostsThisGame
        ? 'Revealed letters must be reused. Turning it off now cannot be turned back on until the next game.'
        : 'Revealed letters must be reused. Turning it off costs nothing before the first guess.';
    }
    if (hardModeMayBeEnabled) {
      return 'Revealed letters must be reused. It applies from your very next guess.';
    }
    return hardModeReleased
      ? 'Unavailable: hard mode was switched off part way through this game. It can be turned on again when the next game starts.'
      : 'Unavailable: a guess already submitted in this game would have broken the rule.';
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
          checked={settings.highContrast}
          onchange={(event) => {
            onhighcontrast(event.currentTarget.checked);
          }}
        />
        High contrast
      </label>
      <p>Changes the board and the emoji in a shared result together.</p>
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
      </label>
      <p id={welcomeId}>Takes effect the next time you open Poodl, not on this game.</p>
    </li>
  </ul>
</Modal>

<style>
  fieldset {
    margin: 0 0 1rem;
    padding: 0.6rem 0.9rem;
    border: 1px solid var(--tile-border);
    border-radius: 6px;
  }

  legend {
    padding-inline: 0.35rem;
    font-weight: 600;
  }

  .theme {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .switches {
    display: grid;
    gap: 0.9rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /*
   * game/DirectManipulation.EveryControlIsAComfortableTarget. Three radios and
   * five checkboxes, and left to the user agent each renders about thirteen
   * pixels across — the smallest targets in the game by a wide margin.
   *
   * The row is what grows. A label bound to its control activates that control
   * across its whole area, so the row is what a finger is actually aimed at,
   * and a 44px box drawn where the player has only ever seen a native checkbox
   * would be a stranger thing than the problem it solved. The box grows too,
   * but only far enough to be aimed at deliberately. Measured in
   * `stories/SettingsPanel.stories.svelte`.
   */
  label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    min-block-size: 44px;
    font-weight: 600;
  }

  input[type='radio'],
  input[type='checkbox'] {
    inline-size: 1.5rem;
    block-size: 1.5rem;
  }

  .theme label {
    font-weight: 400;
  }

  /* Indented past the control and its gap, so the note lines up under the name. */
  p {
    margin: 0.15rem 0 0 2rem;
    color: var(--muted);
    font-size: 0.9rem;
  }

  input:disabled + :global(*) {
    opacity: 0.7;
  }
</style>
