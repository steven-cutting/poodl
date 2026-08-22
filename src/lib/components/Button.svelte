<script lang="ts">
  import type { Snippet } from 'svelte';

  /**
   * The one button, replacing the block of border-and-fill CSS a dozen
   * components each carried.
   *
   * Three variants, which is all the app consumes. Primary is the page's ink
   * as a fill; secondary hugs the page the way an untried key does, which is
   * why its border is `--key-untried-rule` — a control's boundary owes
   * `minimum_boundary_contrast` against the page, and `--rule-strong` does not
   * pay it in the dark themes. Ghost is for the one action that is truly
   * incidental. There is deliberately no destructive variant: "Clear
   * everything" is a secondary button whose two-step confirmation carries the
   * weight, exactly as `ResettingIsDeliberate` asks.
   *
   * `current` renders `aria-current` for the mode dialog, where the selected
   * mode must agree with the sentence beside it. No `box-shadow` and no
   * transition on one: the pressed ring is `app.css`'s alone.
   *
   * `element` is bindable for the one caller that must move focus by hand:
   * `StatisticsPanel` carries the keyboard across its confirmation swap, and a
   * removed control leaves focus nowhere a wrapper can reach.
   */
  let {
    variant = 'secondary',
    size = 'sm',
    type = 'button',
    disabled = false,
    current = false,
    onclick,
    children,
    element = $bindable()
  }: {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md';
    type?: 'button' | 'submit';
    disabled?: boolean;
    current?: boolean;
    onclick?: () => void;
    children: Snippet;
    element?: HTMLButtonElement;
  } = $props();
</script>

<button
  {type}
  {disabled}
  class={variant}
  class:md={size === 'md'}
  aria-current={current ? 'true' : undefined}
  bind:this={element}
  onclick={() => onclick?.()}
>
  {@render children()}
</button>

<style>
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--s-4);
    padding: 0 var(--s-5);
    border: var(--rule-w) solid transparent;
    border-radius: var(--radius-card);
    font: inherit;
    font-size: var(--fs-small);
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color var(--dur-1) var(--ease),
      color var(--dur-1) var(--ease),
      border-color var(--dur-1) var(--ease);
  }

  .md {
    min-block-size: 48px;
    padding: 0 var(--s-7);
    font-size: var(--fs-body);
  }

  .primary {
    border-color: var(--text);
    background: var(--text);
    color: var(--text-inverse);
  }

  /*
   * The hover ground is `--text-2` rather than the design system's fixed
   * neutral, because the fill has to stay darker than its ink in light and
   * lighter in dark — a theme decides which end of the range the ink came
   * from, and `--text-2` moves with it.
   */
  .primary:hover:not(:disabled) {
    border-color: var(--text-2);
    background: var(--text-2);
  }

  .secondary {
    border-color: var(--key-untried-rule);
    background: transparent;
    color: var(--text);
  }

  .secondary:hover:not(:disabled) {
    background: var(--surface-hover);
  }

  .ghost {
    background: transparent;
    color: var(--text-2);
  }

  .ghost:hover:not(:disabled) {
    background: var(--surface-hover);
    color: var(--text);
  }

  button[aria-current='true'] {
    border-color: var(--text);
    font-weight: 600;
  }

  button:disabled {
    border-color: var(--rule);
    background: transparent;
    color: var(--text-disabled);
    cursor: not-allowed;
  }
</style>
