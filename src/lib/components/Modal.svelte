<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  import IconButton from '$lib/components/IconButton.svelte';

  /**
   * The shell every panel and the end-of-game modal sit in.
   *
   * Four surfaces carry `FullyKeyboardOperable`, so this is where it is made
   * true once: the dialog takes focus when it opens, Escape closes it, and Tab
   * cycles inside rather than wandering out to the board behind.
   *
   * All three depend on focus staying inside the panel, because the handler is
   * on the panel. A child that removes the control the player just used — the
   * countdown's stop button, the statistics confirmation — leaves focus on the
   * body, and from there Escape reaches nothing and Tab walks the page the
   * dialog has declared hidden. There is no catching that from here: removing a
   * focused element fires no `focusout` for a handler to answer. So each such
   * child carries focus across its own swap, and `GameConclusion` and
   * `StatisticsPanel` both do.
   *
   * Close sits in the header row, which makes it the dialog's first tab stop:
   * the way out is the first thing the keyboard meets, and every story that
   * walks a panel's tab order counts it first. A caller that supplies no
   * `onclose` still gets no control that pretends otherwise.
   *
   * `footer` is where a caller's actions go — rule-separated from the body, so
   * a dialog reads as content and then commitment. Optional, because most
   * panels have no action row.
   *
   * Not a native `<dialog>`. jsdom implements neither `showModal` nor `close`,
   * so a component built on it could not be tested where the rest of the suite
   * runs — and an untestable accessible shell is the wrong trade when the
   * behaviour it provides is this small.
   */
  let {
    title,
    onclose,
    children,
    footer
  }: { title: string; onclose?: () => void; children?: Snippet; footer?: Snippet } = $props();

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

  /*
   * Focus goes in on arrival and comes back on the way out. Without the second
   * half, dismissing a panel destroys the element focus was on and the browser
   * falls back to the body: `FullyKeyboardOperable` gets the player into the
   * dialog and then loses their place in the page behind it, so the next Tab
   * starts again from the top.
   *
   * The opener is checked for still being in the document, because the control
   * that opened a dialog is not always there when it closes — the conclusion's
   * "New game" replaces the board it was on.
   */
  onMount(() => {
    const opener = document.activeElement;

    panel?.focus();

    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
      }
    };
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
    <div class="head">
      <h2 id={titleId}>{title}</h2>
      {#if onclose !== undefined}
        <IconButton icon="x" label="Close" onclick={onclose} />
      {/if}
    </div>
    <div class="body">
      {@render children?.()}
    </div>
    {#if footer !== undefined}
      <div class="foot">
        {@render footer()}
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
    padding: var(--s-6);
    background: var(--scrim);
    z-index: 10;
  }

  .panel {
    inline-size: min(28rem, 100%);
    max-block-size: 90vh;
    overflow-y: auto;
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: var(--radius-card);
    background: var(--surface);
    color: var(--text);
    box-shadow: var(--lift-dialog);
  }

  /*
   * `GameConclusion.@guarantee`s ride on this dialog being calm: a fade and a
   * 4px lift, no scale and no spring, and only while the route says animations
   * are on. The gate is the attribute rather than a zeroed duration, because a
   * 0ms animation still fires its events and can flash its from-frame.
   */
  :global(:root[data-animations='on']) .panel {
    animation: enter var(--dur-3) var(--ease) both;
  }

  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(4px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  .head {
    display: flex;
    gap: var(--s-5);
    align-items: center;
    justify-content: space-between;
    padding: var(--s-5) var(--s-5) var(--s-5) var(--s-6);
    border-block-end: var(--rule-w) solid var(--rule);
  }

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--fs-title);
    font-weight: 600;
    letter-spacing: var(--track-title);
  }

  .body {
    padding: var(--s-6);
  }

  .foot {
    display: flex;
    gap: var(--s-4);
    flex-wrap: wrap;
    justify-content: flex-end;
    padding: var(--s-5) var(--s-6);
    border-block-start: var(--rule-w) solid var(--rule);
  }
</style>
