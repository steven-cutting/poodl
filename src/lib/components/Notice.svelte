<script lang="ts">
  import type { Notice } from '$lib/app/state';
  import { describeRejection } from '$lib/domain/announcements';

  /**
   * What Poodl is telling the player right now, where the player is looking.
   *
   * `EveryRejectionIsAnnounced` asks for a rejection to be perceivable "both
   * visually and to assistive technology", so this is visible text with
   * `role="status"` — announced by being rendered, rather than duplicated into
   * the live region and heard twice.
   *
   * The custom link is not one of these. It is a thing to copy rather than a
   * sentence to read, so `LinkReady` carries it.
   */
  let {
    notice = null,
    sequence = 0,
    ondismiss
  }: { notice?: Notice | null; sequence?: number; ondismiss?: () => void } = $props();

  const message = $derived.by(() => {
    if (notice === null) {
      return null;
    }
    switch (notice.kind) {
      case 'guess_rejected':
        return describeRejection(notice.reason);
      case 'custom_answer_rejected':
        return `Poodl does not accept “${notice.entry}”. Try a five-letter word it knows.`;
      case 'custom_link_invalid':
        return 'That is not a Poodl link.';
      case 'results_copied':
        return 'Copied to the clipboard.';
      case 'copy_failed':
        return 'Poodl could not reach the clipboard. Select the text and copy it yourself.';
      case 'custom_link_ready':
        return null;
    }
  });
</script>

{#if message !== null}
  {#key sequence}
    <p class="notice" role="status">
      <span>{message}</span>
      {#if ondismiss !== undefined}
        <button
          type="button"
          onclick={() => {
            ondismiss();
          }}>Dismiss</button
        >
      {/if}
    </p>
  {/key}
{/if}

<style>
  .notice {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-block: 1rem;
    padding: 0.6rem 0.9rem;
    border: 1px solid var(--tile-border);
    border-radius: 4px;
    text-align: center;
  }

  button {
    padding: 0.25rem 0.6rem;
    border: 1px solid var(--key-border);
    border-radius: 4px;
    background: var(--key-background);
    color: var(--key-text);
    font: inherit;
    cursor: pointer;
  }
</style>
