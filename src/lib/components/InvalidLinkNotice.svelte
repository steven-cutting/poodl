<script lang="ts">
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
    <button
      type="button"
      class="primary"
      onclick={() => {
        onaccept();
      }}>Play a random game</button
    >
    <button
      type="button"
      onclick={() => {
        ondismiss();
      }}>Dismiss</button
    >
  </div>
</div>

<style>
  .invalid {
    display: grid;
    gap: 0.75rem;
    margin-block: 1rem;
    padding: 0.9rem 1rem;
    border: 1px solid var(--mark-absent);
    border-radius: 6px;
  }

  p {
    margin: 0;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  button {
    padding: 0.45rem 0.8rem;
    border: 1px solid var(--key-border);
    border-radius: 4px;
    background: var(--key-background);
    color: var(--key-text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .primary {
    border-color: var(--mark-correct);
    background: var(--mark-correct);
    color: var(--mark-text);
  }
</style>
