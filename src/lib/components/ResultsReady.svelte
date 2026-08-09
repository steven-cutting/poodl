<script lang="ts">
  /**
   * The grid of a finished game, ready to be taken away.
   *
   * `TheGridIsAvailableAsText` wants the text itself and not only a clipboard
   * write: readable by assistive technology before it is sent, and selectable by
   * hand when the clipboard cannot be reached. So this is a real text box, on
   * the same terms as `LinkReady` — focusable, selectable, labelled — with the
   * button beside it as the shortcut.
   *
   * `SharedTextGivesNothingAway`: what is shown is exactly what is copied, and
   * the grid names no letter of any word.
   */
  let { text, oncopy }: { text: string; oncopy?: () => void } = $props();

  const fieldId = $props.id();
  const rows = $derived(text.split('\n').length);
</script>

<div class="result">
  <label for={fieldId}>Shared result</label>
  <textarea id={fieldId} readonly {rows} value={text}></textarea>
  <div class="row">
    <button type="button" onclick={() => oncopy?.()}>Copy result</button>
  </div>
</div>

<style>
  .result {
    display: grid;
    gap: 0.35rem;
    margin-block: 1rem;
  }

  label {
    font-weight: 600;
  }

  textarea {
    inline-size: 100%;
    padding: 0.5rem;
    border: 1px solid var(--tile-border);
    border-radius: 4px;
    background: var(--background);
    color: var(--text);
    font: inherit;
    line-height: 1.4;
    resize: vertical;
  }

  .row {
    display: flex;
    justify-content: flex-end;
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
