<script lang="ts">
  import type { LetterMark } from '$lib/domain/types';

  let {
    letter = '',
    mark = null,
    position
  }: { letter?: string; mark?: LetterMark | null; position: number } = $props();

  // `GameBoard.@guarantee ResultsAreNeverConveyedByColourAlone`: each mark
  // carries a shape as well as a colour, and a description for anyone reading
  // by ear rather than by eye.
  const GLYPH: Record<LetterMark, string> = {
    correct: '■',
    present: '▲',
    absent: '×'
  };

  const DESCRIPTION: Record<LetterMark, string> = {
    correct: 'correct',
    present: 'in the word, wrong place',
    absent: 'not in the word'
  };

  const label = $derived.by(() => {
    if (letter === '') {
      return `Position ${position}, empty`;
    }
    const shown = letter.toUpperCase();
    return mark === null
      ? `Position ${position}, ${shown}`
      : `Position ${position}, ${shown}, ${DESCRIPTION[mark]}`;
  });
</script>

<span class="tile" data-mark={mark ?? 'none'} role="img" aria-label={label}>
  <span class="letter" aria-hidden="true">{letter.toUpperCase()}</span>
  {#if mark !== null}
    <span class="glyph" aria-hidden="true">{GLYPH[mark]}</span>
  {/if}
</span>

<style>
  .tile {
    position: relative;
    display: grid;
    place-items: center;
    inline-size: 3rem;
    block-size: 3rem;
    border: 2px solid var(--tile-border);
    border-radius: 4px;
    background: var(--tile-background);
    color: var(--tile-text);
    font-size: 1.5rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .tile[data-mark='correct'] {
    --tile-background: var(--mark-correct);
    --tile-border: var(--mark-correct);
    --tile-text: var(--mark-text);
  }

  .tile[data-mark='present'] {
    --tile-background: var(--mark-present);
    --tile-border: var(--mark-present);
    --tile-text: var(--mark-text);
  }

  .tile[data-mark='absent'] {
    --tile-background: var(--mark-absent);
    --tile-border: var(--mark-absent);
    --tile-text: var(--mark-text);
  }

  .glyph {
    position: absolute;
    inset-block-start: 1px;
    inset-inline-end: 3px;
    font-size: 0.625rem;
    line-height: 1;
    /*
     * Fully opaque. The glyph is what discharges "colour never carries meaning
     * alone", so it has to be legible to the readers it exists for. At 0.85 it
     * composited to 4.43 to one against `--mark-absent`, under the 4.5 bar, and
     * axe cannot report that: the span is aria-hidden, so the contrast rule
     * never inspects it at any opacity. Measured, not assumed — see
     * `docs/decisions/0006-component-workshop.md`.
     */
    opacity: 1;
  }
</style>
