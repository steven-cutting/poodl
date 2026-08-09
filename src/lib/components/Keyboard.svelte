<script lang="ts">
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

  // The same three shapes a tile carries. AGENTS.md invariant 6 asks for a
  // non-colour indication on every key state as well as every letter result,
  // and the accessible name alone leaves a sighted colour-blind reader with no
  // assistive technology holding only the colour.
  const GLYPH: Record<LetterMark, string> = {
    correct: '\u25a0',
    present: '\u25b2',
    absent: '\u00d7'
  };

  const status = $derived(new Map(knowledge.map((entry) => [entry.letter, entry.status])));

  function labelFor(letter: string): string {
    const mark = status.get(letter) ?? null;
    return mark === null ? letter.toUpperCase() : `${letter.toUpperCase()}, ${DESCRIPTION[mark]}`;
  }
</script>

<div class="keyboard" role="group" aria-label="Keyboard">
  {#each ROWS as row, index (index)}
    <div class="row">
      {#if index === ROWS.length - 1}
        <button type="button" class="wide" {disabled} onclick={() => onsubmit?.()}>Enter</button>
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
          {#if status.get(letter) != null}
            <span class="glyph" aria-hidden="true">{GLYPH[status.get(letter) as LetterMark]}</span>
          {/if}
        </button>
      {/each}
      {#if index === ROWS.length - 1}
        <button type="button" class="wide" {disabled} onclick={() => ondelete?.()}>Delete</button>
      {/if}
    </div>
  {/each}
</div>

<style>
  .keyboard {
    display: grid;
    gap: 0.35rem;
    margin-block-start: 1.5rem;
  }

  .row {
    display: flex;
    gap: 0.35rem;
    justify-content: center;
  }

  button {
    position: relative;
    min-inline-size: 2rem;
    padding: 0.75rem 0.5rem;
    border: 1px solid var(--key-border);
    border-radius: 4px;
    background: var(--key-background);
    color: var(--key-text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  button:focus-visible {
    outline: 3px solid var(--focus);
    outline-offset: 2px;
  }

  .wide {
    min-inline-size: 4rem;
  }

  /*
   * Fully opaque, for the reason the tile's glyph is: this is what discharges
   * "colour never carries meaning alone", so it has to be legible to the
   * readers it exists for. Axe cannot see it — the span is aria-hidden, so the
   * contrast rule never inspects it at any opacity — and black on each of the
   * three mark colours is already measured at 5.29, 7.99 and 4.98 to one. See
   * `docs/decisions/0006-component-workshop.md`.
   */
  .glyph {
    position: absolute;
    inset-block-start: 1px;
    inset-inline-end: 2px;
    font-size: 0.5rem;
    line-height: 1;
    opacity: 1;
  }

  /* Keys repeat the board's palette, and the mark is in the accessible name
  as well as the colour. */
  button[data-mark='correct'] {
    background: var(--mark-correct);
    border-color: var(--mark-correct);
    color: var(--mark-text);
  }

  button[data-mark='present'] {
    background: var(--mark-present);
    border-color: var(--mark-present);
    color: var(--mark-text);
  }

  button[data-mark='absent'] {
    background: var(--mark-absent);
    border-color: var(--mark-absent);
    color: var(--mark-text);
  }
</style>
