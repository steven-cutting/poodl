<script lang="ts">
  import type { LetterMark } from '$lib/domain/types';

  /**
   * One board cell, drawn with rules rather than heavy fills.
   *
   * `GameBoard.@guarantee ResultsAreNeverConveyedByColourAlone`: correct and
   * present each carry a marker bar whose length tells the two apart, absent
   * carries no bar and a dimmed letter, and every mark carries a description
   * for anyone reading by ear rather than by eye. The bar is `data-marker` for
   * the same reason the tile is `data-mark`: an aria-hidden decoration has no
   * role or name to be queried by, so the structural hook is the honest one —
   * `docs/reference/testing.md` records the trade.
   */
  let {
    letter = '',
    mark = null,
    position
  }: { letter?: string; mark?: LetterMark | null; position: number } = $props();

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

<span
  class="tile"
  class:pending={letter !== '' && mark === null}
  data-mark={mark ?? 'none'}
  role="img"
  aria-label={label}
>
  <span class="letter" aria-hidden="true">{letter.toUpperCase()}</span>
  {#if mark === 'correct' || mark === 'present'}
    <span class="marker" data-marker aria-hidden="true"></span>
  {/if}
</span>

<style>
  /*
   * The ink carries the result three ways at once — the letter, the border and
   * the marker bar are all painted in it — which is what lets the bar draw in
   * `currentColor` and stay right in every palette. Empty is the faintest rule
   * on the page; a typed letter thickens it and no more; a scored tile answers
   * in its result's ink; absent keeps a plain drawn border and dims its letter.
   */
  .tile {
    position: relative;
    display: grid;
    place-items: center;
    inline-size: 3rem;
    block-size: 3rem;
    border: var(--rule-w) solid var(--rule);
    border-radius: var(--radius-tile);
    background: transparent;
    color: var(--text);
    font-family: var(--font-board);
    font-size: var(--fs-board);
    font-weight: 600;
    letter-spacing: var(--track-board);
    line-height: 1;
    text-transform: uppercase;
  }

  .pending {
    border: var(--rule-w-strong) solid var(--rule);
  }

  .tile[data-mark='correct'] {
    border: var(--rule-w-strong) solid var(--result-exact);
    background: var(--result-exact-fill);
    color: var(--result-exact);
  }

  .tile[data-mark='present'] {
    border: var(--rule-w-strong) solid var(--result-present);
    background: var(--result-present-fill);
    color: var(--result-present);
  }

  .tile[data-mark='absent'] {
    border: var(--rule-w) solid var(--result-absent);
    color: var(--result-absent-text);
  }

  /*
   * GameBoard.@guarantee MotionRespectsTheReducedMotionPreference. The
   * attribute is written by the route from `Appearance.animations_active`,
   * which is the animations setting and the device's reduced-motion preference
   * taken together — and the device wins. No media query here would be a second
   * opinion on the same question. A fade and a 4px lift, no rotation: the
   * board is calm on purpose.
   */
  :global(:root[data-animations='on']) .tile[data-mark]:not([data-mark='none']) {
    animation: reveal var(--dur-2) var(--ease);
  }

  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(4px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  /*
   * The non-colour indication: exact fills most of the bottom edge, present
   * shows a centred fraction of it, absent shows none at all. The widths only
   * have to differ at a glance; the exact figures are the design system's.
   */
  .marker {
    position: absolute;
    inset-block-end: 4px;
    block-size: 3px;
    border-radius: 1px;
    background: currentColor;
  }

  .tile[data-mark='correct'] .marker {
    inline-size: 62%;
  }

  .tile[data-mark='present'] .marker {
    inline-size: 22%;
  }
</style>
