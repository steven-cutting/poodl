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
  import Button from '$lib/components/Button.svelte';

  let { text, oncopy }: { text: string; oncopy?: () => void } = $props();

  const fieldId = $props.id();
  const rows = $derived(text.split('\n').length);
</script>

<div class="result">
  <label for={fieldId}>Shared result</label>
  <textarea id={fieldId} readonly {rows} value={text}></textarea>
  <div class="row">
    <Button onclick={() => oncopy?.()}>Copy result</Button>
  </div>
</div>

<style>
  .result {
    display: grid;
    gap: var(--s-2);
    margin-block: var(--s-6);
  }

  label {
    font-weight: 600;
  }

  /*
   * A control's boundary, not a decorative rule, and `font: inherit` on
   * purpose twice over: 16px is what iOS will not zoom on, and the grid stays
   * selectable by hand — `TheGridIsAvailableAsText` is why nothing here
   * suppresses selection.
   */
  textarea {
    inline-size: 100%;
    padding: var(--s-4);
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-card);
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
</style>
