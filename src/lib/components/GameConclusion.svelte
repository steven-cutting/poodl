<script lang="ts">
  import Countdown from '$lib/components/Countdown.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { MAX_ATTEMPTS } from '$lib/config';
  import type { GameMode, StartableMode } from '$lib/domain/types';

  /**
   * `game.allium` — the `GameConclusion` surface. Random waits here
   * indefinitely; endless counts down and moves on unless the player stops it.
   *
   * `OutcomeAnswerAndAttemptsAreAllShown` on a win as well as on a loss, and
   * `NoDailyLimit` is why another game is always one action away.
   *
   * There is deliberately no Close. The specification gives the modal no
   * dismissal, and `ResumeCurrentGame` brings a finished game back "with its
   * conclusion still showing" — so closing it would lose something the player
   * could not ask for again. The board stays visible behind it.
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
    onshareanswer
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
  } = $props();

  const title = $derived(status === 'won' ? 'You won' : 'You lost');
</script>

<Modal {title}>
  <p class="answer">The word was <strong>{answer.toUpperCase()}</strong>.</p>
  <p class="attempts">
    {attemptsUsed} of {MAX_ATTEMPTS} attempts used{mode === 'custom'
      ? ', on a word from a link'
      : ''}.
  </p>

  {#if secondsRemaining !== null}
    <Countdown seconds={secondsRemaining} {onstop} />
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
