<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Countdown from '$lib/components/Countdown.svelte';
  import LinkReady from '$lib/components/LinkReady.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Notice from '$lib/components/Notice.svelte';
  import ResultsReady from '$lib/components/ResultsReady.svelte';
  import TodaysGame from '$lib/components/TodaysGame.svelte';
  import type { Notice as NoticeValue, ShareableView } from '$lib/app/state';
  import type { TodaysGameView } from '$lib/app/store.svelte';
  import { MAX_ATTEMPTS } from '$lib/config';
  import type { GameMode, StartableMode } from '$lib/domain/types';

  /**
   * `game.allium` — the `GameConclusion` surface. Random waits here
   * indefinitely; endless counts down and moves on unless the player stops it.
   *
   * `OutcomeAnswerAndAttemptsAreAllShown` on a win as well as on a loss, and
   * `NothingButDailyIsRationed` is why another game is always one action away
   * outside Daily. Inside it, `ThereIsNoNewGameInDaily` withholds exactly the
   * repeat control: `TodaysGame` takes its place, saying when the next word
   * arrives rather than offering a second go at the same one.
   *
   * It closes, and the board offers it back. The specification gives the modal
   * no dismissal and says the board stays visible behind it, but a dialog that
   * traps the keyboard with no way out would take `GameNavigation` with it —
   * and that surface carries `FourModesCanBeStartedFromHere` and
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
    todaysGame = null,
    onstop,
    onnewgame,
    onshareresults,
    onshareanswer,
    onclose,
    notice = null,
    noticeSequence = 0,
    shareable = null,
    oncopy
  }: {
    status: 'won' | 'lost';
    mode: GameMode;
    answer: string;
    attemptsUsed: number;
    secondsRemaining?: number | null;
    repeatMode: StartableMode;
    /** `daily.allium`'s `TodaysGame` surface, relevant only while `mode` is `daily`. */
    todaysGame?: TodaysGameView | null;
    onstop: () => void;
    onnewgame: (mode: StartableMode) => void;
    onshareresults: () => void;
    onshareanswer: () => void;
    onclose: () => void;
    /**
     * What either sharing action produced. Both belong in here rather than on
     * the board, because this dialog keeps the keyboard inside itself: a link or
     * a grid rendered behind it would be unreachable until it was closed, and
     * while a countdown runs it cannot be.
     */
    notice?: NoticeValue | null;
    noticeSequence?: number;
    shareable?: ShareableView | null;
    oncopy: () => void;
  } = $props();

  const title = $derived(status === 'won' ? 'You won' : 'You lost');

  /*
   * `EndlessContinuesUnlessStopped` asks for stopping to be available "at any
   * point while it runs", and the control that does it is in here. So while a
   * countdown is running there is no closing this and leaving it unreachable —
   * stopping first is what makes closing available.
   */
  const mayClose = $derived(secondsRemaining === null);

  let outcome: HTMLElement | undefined = $state();
  let wasCountingDown = false;

  /*
   * Stopping the countdown removes the control that stopped it, and a removed
   * element leaves focus on the body — outside the panel `Modal` listens on, so
   * Escape stops closing and Tab walks the page behind. Nothing replaces the
   * countdown, so focus goes to the outcome, which reads the answer and the
   * count again on arrival: useful, and nothing a stray Enter can act on.
   *
   * Written as a transition rather than as `mayClose`, which starts true in
   * every other mode and would take focus off the panel the moment the dialog
   * opened.
   */
  $effect(() => {
    const running = secondsRemaining !== null;

    if (wasCountingDown && !running) {
      outcome?.focus();
    }
    wasCountingDown = running;
  });
</script>

<Modal {title} onclose={mayClose ? onclose : undefined}>
  <!-- Focusable, but out of the tab order: `Modal`'s cycle skips it. -->
  <div class="outcome" tabindex="-1" bind:this={outcome}>
    <p class="answer">The word was <strong>{answer.toUpperCase()}</strong>.</p>
    <p class="attempts">
      {attemptsUsed} of {MAX_ATTEMPTS} attempts used{mode === 'custom'
        ? ', on a word from a link'
        : ''}.
    </p>
  </div>

  {#if secondsRemaining !== null}
    <Countdown seconds={secondsRemaining} {onstop} />
  {/if}

  <Notice {notice} sequence={noticeSequence} />

  {#if shareable?.kind === 'custom_link'}
    <LinkReady url={shareable.text} {oncopy} />
  {:else if shareable?.kind === 'results'}
    <ResultsReady text={shareable.text} {oncopy} />
  {/if}

  <!--
    The action row rides in the dialog's footer, rule-separated from the
    outcome: content first, then commitment.
  -->
  {#snippet footer()}
    {#if mode === 'daily'}
      {#if todaysGame !== null}
        <TodaysGame {todaysGame} />
      {/if}
    {:else}
      <Button
        variant="primary"
        onclick={() => {
          onnewgame(repeatMode);
        }}>New game</Button
      >
    {/if}
    <Button
      onclick={() => {
        onshareresults();
      }}>Share results</Button
    >
    <Button
      onclick={() => {
        onshareanswer();
      }}>Share the word</Button
    >
  {/snippet}
</Modal>

<style>
  .outcome {
    margin: 0;
  }

  .answer,
  .attempts {
    margin-block: 0 0.5rem;
    text-align: center;
  }

  .answer strong {
    font-family: var(--font-display);
    font-size: var(--fs-display-3);
    font-weight: 600;
    letter-spacing: var(--track-title);
  }

  .attempts {
    color: var(--text-2);
  }
</style>
