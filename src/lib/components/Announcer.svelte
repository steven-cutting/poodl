<script lang="ts">
  /**
   * The live region.
   *
   * `EverySubmittedGuessIsAnnounced` and `ConclusionIsAnnounced` both ask for
   * something to be said, and neither wants it on screen: the board already
   * shows the marks and the modal already shows the conclusion. So this is
   * visually hidden and read aloud.
   *
   * The `{#key}` is what makes a repeat heard. A live region reacts to its text
   * changing, so the same sentence twice would be announced once; keying on the
   * sequence the engine advances replaces the node instead.
   */
  let { message = null, sequence = 0 }: { message?: string | null; sequence?: number } = $props();
</script>

<p class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
  {#key sequence}{message ?? ''}{/key}
</p>

<style>
  p {
    margin: 0;
  }
</style>
