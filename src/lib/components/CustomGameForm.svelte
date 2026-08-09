<script lang="ts">
  import LinkReady from '$lib/components/LinkReady.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Notice from '$lib/components/Notice.svelte';
  import type { Notice as NoticeValue } from '$lib/app/state';
  import { WORD_LENGTH } from '$lib/config';

  /**
   * `sharing.allium` — the `CustomGameCreation` surface.
   *
   * `OnlyAcceptedWordsBecomeCustomGames`: a word Poodl does not accept produces
   * no link, the refusal is perceivable both ways, and the entry stays put for
   * the creator to correct — which is why the field is not cleared on a
   * rejection.
   *
   * `NothingAboutTheLinkIsKept`: the link lives in a notice, and a notice is not
   * persisted. Closing this loses it, which is the point.
   */
  let {
    notice = null,
    oncreate,
    oncopylink,
    onclose
  }: {
    notice?: NoticeValue | null;
    oncreate: (entry: string) => void;
    oncopylink: () => void;
    onclose: () => void;
  } = $props();

  let entry = $state('');
  // One identifier per component, suffixed: `$props.id()` may be called once.
  const uid = $props.id();
  const fieldId = `${uid}-word`;
  const hintId = `${uid}-hint`;

  function submit(event: SubmitEvent): void {
    event.preventDefault();
    oncreate(entry);
  }
</script>

<Modal title="Set a word for someone" {onclose}>
  <form onsubmit={submit}>
    <label for={fieldId}>Word</label>
    <p id={hintId}>
      {WORD_LENGTH} letters, and one Poodl accepts as a guess — otherwise whoever opens the link could
      never type it.
    </p>
    <div class="row">
      <input
        id={fieldId}
        type="text"
        bind:value={entry}
        aria-describedby={hintId}
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
        maxlength={WORD_LENGTH}
      />
      <button type="submit">Make a link</button>
    </div>
  </form>

  <Notice {notice} />

  {#if notice?.kind === 'custom_link_ready'}
    <LinkReady url={notice.url} oncopy={oncopylink} />
    <p class="hidden-word">
      The word is not in the link in any readable form, and Poodl keeps no record of it. Lose the
      link and it is gone.
    </p>
  {/if}
</Modal>

<style>
  label {
    display: block;
    font-weight: 600;
  }

  #hint,
  p {
    margin-block: 0.25rem 0.5rem;
    color: var(--muted);
    font-size: 0.9rem;
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
    text-transform: uppercase;
  }

  button {
    padding: 0.5rem 0.9rem;
    border: 1px solid var(--key-border);
    border-radius: 4px;
    background: var(--key-background);
    color: var(--key-text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
</style>
