<script lang="ts">
  import LinkReady from '$lib/components/LinkReady.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Notice from '$lib/components/Notice.svelte';
  import type { Notice as NoticeValue, ShareableView } from '$lib/app/state';
  import { WORD_LENGTH } from '$lib/config';

  /**
   * `sharing.allium` — the `CustomGameCreation` surface.
   *
   * `OnlyAcceptedWordsBecomeCustomGames`: a word Poodl does not accept produces
   * no link, the refusal is perceivable both ways, and the entry stays put for
   * the creator to correct — which is why the field is not cleared on a
   * rejection.
   *
   * `TheWordIsNotReadableInTheLink`: "neither the link nor anything shown
   * alongside it displays the word once the link has been made". The entry is
   * shown alongside it, so it goes as soon as there is a link — the qualifier
   * is about exactly this, since the creator obviously typed the word
   * themselves and the field is the only thing that held it beforehand.
   *
   * `NothingAboutTheLinkIsKept`: the link is state Poodl holds for as long as it
   * is showing it, and none of that is persisted. Closing this loses it, which
   * is the point.
   */
  let {
    notice = null,
    noticeSequence = 0,
    shareable = null,
    oncreate,
    oncopy,
    onclose
  }: {
    notice?: NoticeValue | null;
    /** Advances so that an identical refusal is announced a second time. */
    noticeSequence?: number;
    shareable?: ShareableView | null;
    oncreate: (entry: string) => void;
    oncopy: () => void;
    onclose: () => void;
  } = $props();

  let entry = $state('');

  /*
   * A rejection leaves the field alone — that is the other half of
   * `OnlyAcceptedWordsBecomeCustomGames` — so this reads the link rather than
   * the submission, and only a link empties it.
   */
  $effect(() => {
    if (shareable?.kind === 'custom_link') {
      entry = '';
    }
  });
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

  <Notice {notice} sequence={noticeSequence} />

  {#if shareable?.kind === 'custom_link'}
    <LinkReady url={shareable.text} {oncopy} />
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
