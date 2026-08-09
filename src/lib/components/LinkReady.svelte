<script lang="ts">
  /**
   * The link a custom game travels in, ready to be taken away.
   *
   * `TheWordIsNotReadableInTheLink`: nothing shown here says the word, because
   * nothing here has it — only the token. `FullyKeyboardOperable` wants copying
   * doable from the keyboard alone, so the link is a real text box that can be
   * focused and selected, and the button beside it is the shortcut.
   *
   * `NothingAboutTheLinkIsKept`: this exists for as long as the notice does and
   * no longer. Nothing is written anywhere.
   */
  let { url, oncopy }: { url: string; oncopy?: () => void } = $props();

  const fieldId = $props.id();
</script>

<div class="link">
  <label for={fieldId}>Custom game link</label>
  <div class="row">
    <input id={fieldId} type="text" readonly value={url} />
    <button type="button" onclick={() => oncopy?.()}>Copy link</button>
  </div>
</div>

<style>
  .link {
    display: grid;
    gap: 0.35rem;
    margin-block: 1rem;
  }

  label {
    font-weight: 600;
  }

  .row {
    display: flex;
    gap: 0.5rem;
  }

  input {
    flex: 1 1 auto;
    min-inline-size: 0;
    padding: 0.5rem;
    border: 1px solid var(--tile-border);
    border-radius: 4px;
    background: var(--background);
    color: var(--text);
    font: inherit;
  }

  button {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--key-border);
    border-radius: 4px;
    background: var(--key-background);
    color: var(--key-text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
</style>
