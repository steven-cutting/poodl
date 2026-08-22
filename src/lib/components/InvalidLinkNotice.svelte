<script lang="ts">
  import Button from '$lib/components/Button.svelte';

  /**
   * `sharing.allium` — the refusal half of the `CustomLinkEntry` surface.
   *
   * `InvalidLinksAreExplainedAndSurvivable`: a link that does not decode says
   * so rather than failing silently or starting some other game, and offers a
   * random game as a way out. `role="alert"` because the player did not ask for
   * this and needs to hear it now.
   */
  let { onaccept, ondismiss }: { onaccept: () => void; ondismiss: () => void } = $props();
</script>

<div class="invalid" role="alert">
  <p>
    That is not a Poodl link. It may have been altered on the way, or made by a version of Poodl
    that no longer exists.
  </p>
  <div class="actions">
    <Button
      variant="primary"
      onclick={() => {
        onaccept();
      }}>Play a random game</Button
    >
    <Button
      onclick={() => {
        ondismiss();
      }}>Dismiss</Button
    >
  </div>
</div>

<style>
  .invalid {
    display: grid;
    gap: var(--s-5);
    margin-block: var(--s-6);
    padding: var(--s-5) var(--s-6);
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: var(--radius-card);
    background: var(--surface-raised);
  }

  p {
    margin: 0;
  }

  .actions {
    display: flex;
    gap: var(--s-4);
    flex-wrap: wrap;
  }
</style>
