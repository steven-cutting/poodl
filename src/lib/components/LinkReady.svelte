<script lang="ts">
  /**
   * The link a custom game travels in, ready to be taken away.
   *
   * `TheWordIsNotReadableInTheLink`: nothing shown here says the word, because
   * nothing here has it — only the token. `FullyKeyboardOperable` wants copying
   * doable from the keyboard alone, so the link is a real text box that can be
   * focused and selected, and the button beside it is the shortcut.
   *
   * `NothingAboutTheLinkIsKept`: this exists for as long as the surface that
   * made it — the share dialog or the conclusion — and no longer. Nothing is
   * written anywhere.
   */
  import Button from '$lib/components/Button.svelte';

  let { url, oncopy }: { url: string; oncopy?: () => void } = $props();

  const fieldId = $props.id();
</script>

<div class="link">
  <label for={fieldId}>Custom game link</label>
  <div class="row">
    <input id={fieldId} type="text" readonly value={url} />
    <Button onclick={() => oncopy?.()}>Copy link</Button>
  </div>
</div>

<style>
  .link {
    display: grid;
    gap: var(--s-2);
    margin-block: var(--s-6);
  }

  label {
    font-weight: 600;
  }

  .row {
    display: flex;
    gap: var(--s-4);
  }

  /*
   * A text control's boundary answers the same floor a key's does, so the
   * border is `--key-untried-rule` rather than a decorative rule. `font:
   * inherit` keeps it at the 16px iOS will not zoom on.
   */
  input {
    flex: 1 1 auto;
    min-inline-size: 0;
    padding: 0 var(--s-4);
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-card);
    background: var(--background);
    color: var(--text);
    font: inherit;
  }
</style>
