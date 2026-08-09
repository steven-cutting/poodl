<script lang="ts">
  /**
   * `game.allium` — the `PhysicalKeyboardInput` surface.
   *
   * This component renders nothing. It exists so that
   * `TurningThisOffSurrendersTheKeysEntirely` can be true in the strongest
   * sense: with the setting off the parent does not render this at all, so
   * there is no listener to filter and no key press Poodl sees. A handler that
   * checked the setting and returned early would still be a handler, and
   * `<svelte:window>` cannot live inside an `{#if}`.
   *
   * `EnterSubmitsAndBackspaceDeletes`, and letter keys enter that letter
   * whatever case they arrive in — the engine lowercases it.
   */
  let {
    onletter,
    ondelete,
    onsubmit
  }: {
    onletter: (letter: string) => void;
    ondelete: () => void;
    onsubmit: () => void;
  } = $props();

  /** Anything that takes keys of its own keeps them. */
  const INTERACTIVE = 'input, textarea, select, button, a[href], [contenteditable]';

  function handle(event: KeyboardEvent): void {
    // The browser's own shortcuts stay the browser's.
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const target = event.target;

    if (target instanceof Element && target.closest(INTERACTIVE) !== null) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      onsubmit();
      return;
    }
    if (event.key === 'Backspace') {
      event.preventDefault();
      ondelete();
      return;
    }
    if (/^[a-z]$/i.test(event.key)) {
      event.preventDefault();
      onletter(event.key);
    }
  }
</script>

<svelte:window onkeydown={handle} />
