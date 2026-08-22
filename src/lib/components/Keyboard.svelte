<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import type { KeyKnowledge, LetterMark } from '$lib/domain/types';

  let {
    knowledge = [],
    onletter,
    ondelete,
    onsubmit,
    disabled = false
  }: {
    knowledge?: readonly KeyKnowledge[];
    onletter?: (letter: string) => void;
    ondelete?: () => void;
    onsubmit?: () => void;
    disabled?: boolean;
  } = $props();

  const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

  const DESCRIPTION: Record<LetterMark, string> = {
    correct: 'correct',
    present: 'in the word, wrong place',
    absent: 'not in the word'
  };

  const status = $derived(new Map(knowledge.map((entry) => [entry.letter, entry.status])));

  function labelFor(letter: string): string {
    const mark = status.get(letter) ?? null;
    return mark === null ? letter.toUpperCase() : `${letter.toUpperCase()}, ${DESCRIPTION[mark]}`;
  }
</script>

<!--
  The same indication scheme as the tiles, on the surface the player reads
  every turn. An untried key hugs the page: the page's own ground, a drawn
  border, the page's ink. A scored key steps onto the raised ground; correct
  and present answer in their result's ink — letter, border and marker bar
  together — and absent, with no hue and no bar, answers with its dimmed
  letter. `AnUntriedKeyIsDistinguishableFromAScoredOne` states the figures and
  `tests/contrast.test.ts` computes them.

  The two action keys show icons and say the word in `aria-label` — the
  accessible names GameBoard promised are unchanged, and with no visible text
  there is no name to match against. They may be wider than a letter key and
  never narrower, exactly as `EveryControlIsAComfortableTarget` now words it.
-->
<div class="keyboard" role="group" aria-label="Keyboard">
  {#each ROWS as row, index (index)}
    <div class="row">
      {#if index === ROWS.length - 1}
        <button
          type="button"
          class="action"
          aria-label="Enter"
          {disabled}
          onclick={() => onsubmit?.()}
        >
          <Icon name="corner-down-left" size={18} />
        </button>
      {/if}
      {#each [...row] as letter (letter)}
        <button
          type="button"
          data-mark={status.get(letter) ?? 'none'}
          aria-label={labelFor(letter)}
          {disabled}
          onclick={() => onletter?.(letter)}
        >
          {letter.toUpperCase()}
          {#if status.get(letter) === 'correct' || status.get(letter) === 'present'}
            <span class="marker" data-marker aria-hidden="true"></span>
          {/if}
        </button>
      {/each}
      {#if index === ROWS.length - 1}
        <button
          type="button"
          class="action"
          aria-label="Delete"
          {disabled}
          onclick={() => ondelete?.()}
        >
          <Icon name="delete" size={18} />
        </button>
      {/if}
    </div>
  {/each}
</div>

<style>
  .keyboard {
    display: grid;
    gap: var(--gap-row);
    margin-block-start: 1.5rem;

    /*
     * Never asks for less room than the narrowest screen the game supports, and
     * never more than it is given. Without the floor a parent that sizes to its
     * content — Storybook's centred layout is one — would squeeze rows of keys
     * whose own width is now zero down to the width of ten letters.
     */
    min-inline-size: min(100%, 20rem);
  }

  .row {
    display: flex;
    gap: var(--gap-key);
  }

  /*
   * DirectManipulation.EveryControlIsAComfortableTarget. The invariant grants
   * the keyboard the one exemption in the contract, because ten keys and nine
   * gaps cannot each be 44px across 320px, and says what happens instead: the
   * row is divided equally among its letter keys and a gap is kept between
   * keys.
   *
   * `flex: 1 1 0` is that division, and `min-inline-size: 0` is what lets it
   * happen — the floors that used to sit here defeat flex-shrink and made the
   * bottom row 416px wide on a 320px screen. What a letter key gives up is
   * bounded by the width of the screen and by nothing else, so where there is
   * room it takes the full 44px. `min-block-size` comes from the base rule in
   * `app.css` and is met at every width. Measured in
   * `stories/Keyboard.stories.svelte`; jsdom has no layout engine and can see
   * none of it.
   */
  button {
    position: relative;
    flex: 1 1 0;
    min-inline-size: 0;
    padding: 0.75rem 0.125rem;
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-key);
    background: var(--key-untried-bg);
    color: var(--text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  /*
   * Wider, never narrower: the action keys end a turn rather than build one,
   * and the icon earns comfortable room. 1.5 shares of the same division, so
   * they still shrink with the screen instead of forcing a sideways scroll.
   */
  .action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 1.5 1 0;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Keys the guesses have scored step off the page onto the raised ground. */
  button[data-mark='correct'],
  button[data-mark='present'],
  button[data-mark='absent'] {
    background: var(--key-scored-bg);
  }

  button[data-mark='correct'] {
    border: var(--rule-w-strong) solid var(--result-exact);
    color: var(--result-exact);
  }

  button[data-mark='present'] {
    border: var(--rule-w-strong) solid var(--result-present);
    color: var(--result-present);
  }

  button[data-mark='absent'] {
    border-color: var(--result-absent);
    color: var(--result-absent-text);
  }

  /*
   * The non-colour indication, as on a tile: exact fills most of the bottom
   * edge, present a centred fraction, absent none. Drawn in `currentColor`, so
   * it is always the same ink as the letter and the border.
   */
  .marker {
    position: absolute;
    inset-block-end: 3px;
    inset-inline-start: 50%;
    transform: translateX(-50%);
    block-size: 2px;
    background: currentColor;
  }

  button[data-mark='correct'] .marker {
    inline-size: 56%;
  }

  button[data-mark='present'] .marker {
    inline-size: 20%;
  }
</style>
