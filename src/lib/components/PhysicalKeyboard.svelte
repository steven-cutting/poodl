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

  /** Somewhere the player is typing. Every key is theirs. */
  const TEXT_ENTRY = 'input, textarea, select, [contenteditable]';

  /**
   * Something Enter activates. Only Enter is theirs.
   *
   * `FullyKeyboardOperable` invites the player to tab to the on-screen keyboard
   * and press a key there, and a control that has focus must keep its own
   * activation. Letters and Backspace are not activation: taking those as well
   * would stop the board hearing anything for as long as any button held focus,
   * which the `PhysicalKeyboardInput` surface grants unconditionally on the
   * input length alone. Space is absent deliberately — this never intercepts
   * it, so a focused button is activated by the browser as it always was.
   */
  const ACTIVATABLE = 'button, a[href]';

  function handle(event: KeyboardEvent): void {
    // The browser's own shortcuts stay the browser's.
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const target = event.target;
    const within = (selector: string): boolean =>
      target instanceof Element && target.closest(selector) !== null;

    if (within(TEXT_ENTRY)) {
      return;
    }

    if (event.key === 'Enter' && within(ACTIVATABLE)) {
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
