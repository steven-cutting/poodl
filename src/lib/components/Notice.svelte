<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import type { Notice } from '$lib/app/state';
  import { describeRejection } from '$lib/domain/announcements';

  /**
   * What Poodl is telling the player right now, where the player is looking.
   *
   * `EveryRejectionIsAnnounced` asks for a rejection to be perceivable "both
   * visually and to assistive technology", so this is visible text with
   * `role="status"` — the sentence itself is the announcement, rather than
   * being duplicated into `Announcer` and heard twice.
   *
   * The region is mounted whether or not there is anything to say, and only its
   * contents come and go. A live region is heard when the text inside it
   * changes; one that arrives already carrying its text has not changed, and is
   * not reliably announced at all. Empty it is a paragraph with nothing in it.
   *
   * Neither the custom link nor the shared grid is one of these. They are things
   * to copy rather than sentences to read, so `LinkReady` and `ResultsReady`
   * carry them — and they outlive the sentence that reports the copy.
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
    }
  });

  // A shape beside the sentence, never instead of it: the toast's meaning is
  // its words, so the icon is decoration and the good-news kind is the only
  // one that earns the tick.
  const icon = $derived(notice?.kind === 'results_copied' ? 'check' : 'circle-alert');
</script>

<p class="notice" class:silent={message === null} role="status">
  {#if message !== null}
    <!--
      Keyed so a repeat is heard. The same sentence twice would leave the text
      unchanged, and a live region reacts to nothing else; replacing the nodes
      is what makes the second one announce as well as the first.
    -->
    {#key sequence}
      <Icon name={icon} size={16} />
      <span>{message}</span>
      {#if ondismiss !== undefined}
        <Button variant="ghost" onclick={ondismiss}>Dismiss</Button>
      {/if}
    {/key}
  {/if}
</p>

<style>
  .notice {
    display: flex;
    gap: var(--s-4);
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-block: var(--s-6);
    padding: var(--s-2) var(--s-5);
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: var(--radius-card);
    background: var(--surface-raised);
    min-block-size: 40px;
    font-size: var(--fs-small);
    text-align: center;
  }

  /* Present for the sake of being heard, and taking up nothing while silent. */
  .silent {
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    min-block-size: 0;
  }
</style>
