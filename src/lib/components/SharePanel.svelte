<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import LinkReady from '$lib/components/LinkReady.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Notice from '$lib/components/Notice.svelte';
  import type { Notice as NoticeValue, ShareableView } from '$lib/app/state';
  import { WORD_LENGTH } from '$lib/config';
  import type { GameMode, GameStatus } from '$lib/domain/types';

  /**
   * `sharing.allium` — the `CustomGameCreation` surface, and the way in to
   * `ShareCurrentAnswer` while a game is on the board. One dialog, because
   * both end in the same thing: a link that hides the word it carries.
   *
   * `ShareCurrentAnswer.AvailableInEveryModeAndForAsLongAsTheGameIsOnTheBoard`:
   * "This game" is offered whenever there is a game on the board, in every
   * mode, from before the first guess through to after the game is over. The
   * caller is who knows whether there is one, which is why `onshareanswer` is
   * optional and its absence removes the section — the `onshowresult` pattern
   * in `GameScreen`. `SharingCostsTheGameNothing` and
   * `TheAnswerIsNeverShownInOrderToShareIt` are the engine's to keep: nothing
   * here is handed the game, let alone its answer.
   *
   * That section's sentence has to stay true across all of that span, so it
   * describes the making of the link and not the state of the word: making one
   * gives nothing away, which is what `TheAnswerIsNeverShownInOrderToShareIt`
   * promises, whereas "the word stays hidden" would be false once the
   * conclusion has shown it. It says a new game rather than this one for the
   * same reason `OpenCustomGameLink` does — the link hands over the answer, not
   * the board, so the recipient starts custom and empty.
   *
   * `ShareCurrentAnswer` exposes the game's mode and status, and a modal dialog
   * is where the header chip that says them stops being reachable: `aria-modal`
   * hides the page behind from assistive technology, and the scrim dims it for
   * everyone else. So the section says which game it would pass on, in the
   * sentence `GameNavigation` uses for the same two facts — "Playing practice."
   * or "Practice game finished." — and nothing more: `mode` and `status` are
   * what the surface exposes, and the answer is still nowhere near this.
   *
   * `OnlyAcceptedWordsBecomeCustomGames`: a word Poodl does not accept produces
   * no link, the refusal is perceivable both ways, and the entry stays put for
   * the creator to correct — which is why the field is not cleared on a
   * rejection.
   *
   * `TheWordIsNotReadableInTheLink`: "neither the link nor anything shown
   * alongside it displays the word once the link has been made". The entry is
   * shown alongside it, so it goes as soon as there is a link — whichever
   * section made the link, because a half-typed word beside any link reads as
   * that link's word.
   *
   * `NothingAboutTheLinkIsKept`: the link is state Poodl holds for as long as it
   * is showing it, and none of that is persisted. Closing this loses it, which
   * is the point.
   *
   * One slot for what was made, below both sections: a link carries no record
   * of which section asked for it, `Shareable` has no origin and needs none,
   * and a refusal then lands right under the field that earned it. The note
   * under it therefore states only what both surfaces guarantee — that the link
   * is not kept. It cannot go on to say the word is unrecoverable: the game on
   * the board is persisted with its answer and `encode` is deterministic, so a
   * link made from "This game" can simply be made again.
   *
   * The field has a placeholder and no visible label, as the design shows it.
   * The label is still here, visually hidden, so the field keeps its name; the
   * section's sentence describes it, and the placeholder is only the shape of
   * what goes in — bound to `WORD_LENGTH` like the `maxlength` beside it, so
   * the two cannot come to disagree. The sentence the field is described by
   * states the length as well, because a description is read out where a
   * placeholder may not be, and it is gone the moment typing starts.
   */
  let {
    notice = null,
    noticeSequence = 0,
    shareable = null,
    mode = null,
    status = null,
    onshareanswer,
    oncreate,
    oncopy,
    onclose
  }: {
    notice?: NoticeValue | null;
    /** Advances so that an identical refusal is announced a second time. */
    noticeSequence?: number;
    shareable?: ShareableView | null;
    /** Which game "This game" is: the two facts `ShareCurrentAnswer` exposes. */
    mode?: GameMode | null;
    status?: GameStatus | null;
    /** Offered only while a game is on the board: there is nothing to pass on otherwise. */
    onshareanswer?: () => void;
    oncreate: (entry: string) => void;
    oncopy: () => void;
    onclose: () => void;
  } = $props();

  let entry = $state('');

  /** The game named the way `GameNavigation` names it, or nothing when there is none. */
  const which = $derived.by(() => {
    if (mode === null) {
      return null;
    }
    return status === 'in_progress'
      ? `Playing ${mode}.`
      : `${mode.charAt(0).toUpperCase()}${mode.slice(1)} game finished.`;
  });

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

<Modal title="Share a game" {onclose}>
  {#if onshareanswer !== undefined}
    <section>
      <h3>This game</h3>
      {#if which !== null}
        <p class="which">{which}</p>
      {/if}
      <p>
        Make a link that sets this game's word for whoever opens it, as a new game of their own.
        Making it gives nothing away — not to you, not to them — and your game carries on untouched.
      </p>
      <Button
        variant="primary"
        size="md"
        onclick={() => {
          onshareanswer();
        }}>Make a link to this game</Button
      >
    </section>
  {/if}

  <section>
    <h3>Your own word</h3>
    <p id={hintId}>
      Make a game from a {WORD_LENGTH}-letter word you choose. It has to be one Poodl would accept
      as a guess.
    </p>
    <form onsubmit={submit}>
      <div class="row">
        <label for={fieldId} class="visually-hidden">Word</label>
        <input
          id={fieldId}
          type="text"
          placeholder={`${WORD_LENGTH}-letter word`}
          bind:value={entry}
          aria-describedby={hintId}
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          maxlength={WORD_LENGTH}
        />
        <Button type="submit">Make a link</Button>
      </div>
    </form>
  </section>

  <Notice {notice} sequence={noticeSequence} />

  {#if shareable?.kind === 'custom_link'}
    <LinkReady url={shareable.text} {oncopy} />
    <p class="note">
      The word is not in the link in any readable form, and Poodl keeps no record of the link
      itself. Close this and it is gone.
    </p>
  {/if}
</Modal>

<style>
  section + section {
    margin-block-start: var(--s-8);
  }

  /* The design system's micro label, worn as the eyebrow over each section. */
  h3 {
    margin: 0 0 var(--s-4);
    color: var(--text-2);
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
  }

  p {
    margin: 0 0 var(--s-5);
    color: var(--text-2);
    font-size: var(--fs-body);
    line-height: 1.45;
  }

  /* Which game, in the reading ink, close under the eyebrow. */
  .which {
    margin-block-end: var(--s-2);
    color: var(--text);
  }

  .note {
    margin: 0;
    font-size: var(--fs-small);
  }

  .row {
    display: flex;
    gap: var(--s-4);
  }

  /*
   * A control's boundary answers the same floor a key's does, and `font:
   * inherit` keeps the field at the 16px iOS will not zoom on.
   */
  input {
    flex: 1 1 auto;
    min-inline-size: 0;
    padding: 0 var(--s-5);
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-card);
    background: var(--background);
    color: var(--text);
    font: inherit;
    text-transform: uppercase;
  }

  /*
   * The shape of what goes in, in a reading ink `tests/contrast.test.ts`
   * already measures on this ground. `opacity: 1` because Firefox would
   * otherwise thin the measured ink on its way to the screen.
   */
  input::placeholder {
    color: var(--text-3);
    letter-spacing: var(--track-label);
    opacity: 1;
  }
</style>
