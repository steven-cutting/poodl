<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import type { IconName } from '$lib/components/icons';

  /**
   * A square 44px chrome control: the header actions and a dialog's Close.
   *
   * Ghost by design — the glyph is the affordance — and one variant, because
   * that is all the app consumes; the design system's others are in the
   * porting guide. The accessible name is required, never inferred: these are
   * exactly the controls a shape alone would leave unnamed.
   *
   * Sets no `box-shadow`, so the pressed ring `app.css` owes every control
   * under `ATouchIsAcknowledged` arrives untouched.
   */
  let {
    label,
    icon,
    onclick,
    disabled = false
  }: { label: string; icon: IconName; onclick?: () => void; disabled?: boolean } = $props();
</script>

<button type="button" aria-label={label} {disabled} onclick={() => onclick?.()}>
  <Icon name={icon} />
</button>

<style>
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 44px;
    padding: 0;
    border: 0;
    border-radius: var(--radius-card);
    background: transparent;
    color: var(--text-2);
    font: inherit;
    cursor: pointer;
    transition:
      background-color var(--dur-1) var(--ease),
      color var(--dur-1) var(--ease);
  }

  button:hover:not(:disabled) {
    background: var(--surface-hover);
    color: var(--text);
  }

  button:disabled {
    color: var(--text-disabled);
    cursor: not-allowed;
  }
</style>
