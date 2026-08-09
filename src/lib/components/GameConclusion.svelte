<script lang="ts">
  import Countdown from '$lib/components/Countdown.svelte';
  import LinkReady from '$lib/components/LinkReady.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Notice from '$lib/components/Notice.svelte';
  import type { Notice as NoticeValue } from '$lib/app/state';
  import { MAX_ATTEMPTS } from '$lib/config';
  import type { GameMode, StartableMode } from '$lib/domain/types';

  /**
   * `game.allium` — the `GameConclusion` surface. Random waits here
   * indefinitely; endless counts down and moves on unless the player stops it.
   *
   * `OutcomeAnswerAndAttemptsAreAllShown` on a win as well as on a loss, and
   * `NoDailyLimit` is why another game is always one action away.
   *
   * It closes, and the board offers it back. The specification gives the modal
   * no dismissal and says the board stays visible behind it, but a dialog that
   * traps the keyboard with no way out would take `GameNavigation` with it —
   * and that surface carries `ThreeModesCanBeStartedFromHere` and
   * `AvailableWhetherOrNotAGameExists`. Nothing is lost by closing, because
   * `GameScreen` offers the result again for as long as the finished game is on
   * the board, which is what `ResumeCurrentGame` means by a game coming back
   * "with its conclusion still showing".
   */
  let {
    status,
    mode,
    answer,
    attemptsUsed,
    secondsRemaining = null,
    repeatMode,
    onstop,
    onnewgame,
    onshareresults,
    onshareanswer,
    onclose,
    notice = null,
    noticeSequence = 0,
    oncopylink
  }: {
    status: 'won' | 'lost';
    mode: GameMode;
    answer: string;
    attemptsUsed: number;
    secondsRemaining?: number | null;
    repeatMode: StartableMode;
    onstop: () => void;
    onnewgame: (mode: StartableMode) => void;
    onshareresults: () => void;
    onshareanswer: () => void;
    onclose: () => void;
    /**
     * What either sharing action produced. It belongs in here rather than on the
     * board, because this dialog keeps the keyboard inside itself: a link
     * rendered behind it would be unreachable until it was closed, and while a
     * countdown runs it cannot be.
     */
    notice?: NoticeValue | null;
    noticeSequence?: number;
    oncopylink: () => void;
  } = $props();

  const title = $derived(status === 'won' ? 'You won' : 'You lost');

  /*
   * `EndlessContinuesUnlessStopped` asks for stopping to be available "at any
   * point while it runs", and the control that does it is in here. So while a
   * countdown is running there is no closing this and leaving it unreachable —
   * stopping first is what makes closing available.
   */
  const mayClose = $derived(secondsRemaining === null);
</script>

<Modal {title} onclose={mayClose ? onclose : undefined}>
  <p class="answer">The word was <strong>{answer.toUpperCase()}</strong>.</p>
  <p class="attempts">
    {attemptsUsed} of {MAX_ATTEMPTS} attempts used{mode === 'custom'
      ? ', on a word from a link'
      : ''}.
  </p>

  {#if secondsRemaining !== null}
    <Countdown seconds={secondsRemaining} {onstop} />
  {/if}

  <Notice {notice} sequence={noticeSequence} />

  {#if notice?.kind === 'custom_link_ready'}
    <LinkReady url={notice.url} oncopy={oncopylink} />
  {/if}

  <div class="actions">
    <button
      type="button"
      class="primary"
      onclick={() => {
        onnewgame(repeatMode);
      }}>New game</button
    >
    <button
      type="button"
      onclick={() => {
        onshareresults();
      }}>Share results</button
    >
    <button
      type="button"
      onclick={() => {
        onshareanswer();
      }}>Share the word</button
    >
  </div>
</Modal>

<style>
  .answer,
  .attempts {
    margin-block: 0 0.5rem;
    text-align: center;
  }

  .attempts {
    color: var(--muted);
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-block-start: 1rem;
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

  .primary {
    border-color: var(--mark-correct);
    background: var(--mark-correct);
    color: var(--mark-text);
  }
</style>
