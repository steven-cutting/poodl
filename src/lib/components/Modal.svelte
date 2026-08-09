<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  /**
   * The shell every panel and the end-of-game modal sit in.
   *
   * Four surfaces carry `FullyKeyboardOperable`, so this is where it is made
   * true once: the dialog takes focus when it opens, Escape closes it, and Tab
   * cycles inside rather than wandering out to the board behind.
   *
   * Not a native `<dialog>`. jsdom implements neither `showModal` nor `close`,
   * so a component built on it could not be tested where the rest of the suite
   * runs — and an untestable accessible shell is the wrong trade when the
   * behaviour it provides is this small.
   */
  let { title, onclose, children }: { title: string; onclose?: () => void; children?: Snippet } =
    $props();

  const titleId = $props.id();
  let panel: HTMLElement | undefined = $state();

  const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  onMount(() => {
    panel?.focus();
  });

  function focusable(): HTMLElement[] {
    return panel === undefined ? [] : [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
  }

  function onkeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      onclose?.();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }

    const stops = focusable();
    const first = stops.at(0);
    const last = stops.at(-1);

    if (first === undefined || last === undefined) {
      return;
    }

    // The panel itself is the starting point, so shift-tabbing off it wraps to
    // the end rather than escaping to whatever is behind the dialog.
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
</script>

<div class="overlay">
  <!--
    A dialog is not an interactive element, so it takes no role of its own from
    the browser; the role, the modal flag and the name are stated here, and the
    negative tabindex is what lets it be focused without joining the tab order.
  -->
  <div
    class="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
    tabindex="-1"
    bind:this={panel}
    {onkeydown}
  >
    <h2 id={titleId}>{title}</h2>
    {@render children?.()}
    {#if onclose !== undefined}
      <div class="close">
        <button
          type="button"
          onclick={() => {
            onclose();
          }}>Close</button
        >
      </div>
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgb(0 0 0 / 55%);
    z-index: 10;
  }

  .panel {
    inline-size: min(28rem, 100%);
    max-block-size: 90vh;
    overflow-y: auto;
    padding: 1.25rem;
    border: 1px solid var(--tile-border);
    border-radius: 8px;
    background: var(--background);
    color: var(--text);
  }

  h2 {
    margin-block: 0 1rem;
    font-size: 1.25rem;
  }

  .close {
    margin-block-start: 1.25rem;
    text-align: end;
  }

  button {
    padding: 0.5rem 0.9rem;
    border: 1px solid var(--key-border);
    border-radius: 4px;
    background: var(--key-background);
    color: var(--key-text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
</style>
