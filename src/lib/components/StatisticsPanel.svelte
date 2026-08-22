<script lang="ts">
  import { tick } from 'svelte';

  import Button from '$lib/components/Button.svelte';
  import DistributionChart from '$lib/components/DistributionChart.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { losses, winPercentage } from '$lib/domain/statistics';
  import type { Statistics } from '$lib/domain/statistics';

  /**
   * `statistics.allium` — the `StatisticsPanel` surface.
   *
   * Every number is text, so `DistributionIsReadableWithoutSeeingIt` holds for
   * the panel as well as for the chart. `RecyclingIsVisibleBeforeItSurprises` is
   * why the count of unseen answers is here and why the panel says outright once
   * the pool has started again.
   *
   * `ResettingIsDeliberate`: the reset is a two-step, and the confirmation names
   * what will go rather than asking whether the player is sure.
   *
   * `FullyKeyboardOperable` asks for the confirmation to be "reachable and
   * announced". Each step replaces the control that was pressed, so focus is
   * carried across the swap by hand: onto the confirmation, which announces its
   * legend and its text on arrival, and back onto the reset button when the
   * player backs out. Left alone, focus falls to the body — outside the panel
   * the `Modal` listens on, which is where Escape and the Tab cycle live.
   */
  let {
    statistics,
    answersUnseen,
    answersMayRepeat,
    onreset,
    onclose
  }: {
    statistics: Statistics;
    answersUnseen: number;
    answersMayRepeat: boolean;
    onreset: () => void;
    onclose: () => void;
  } = $props();

  let confirming = $state(false);
  let confirmation: HTMLElement | undefined = $state();
  let resetButton: HTMLButtonElement | undefined = $state();

  /** Arm or disarm the two-step, and take focus to whichever step replaced it. */
  async function setConfirming(next: boolean): Promise<void> {
    confirming = next;
    await tick();
    (next ? confirmation : resetButton)?.focus();
  }

  const numbers = $derived([
    { label: 'Played', value: String(statistics.gamesPlayed) },
    { label: 'Won', value: String(statistics.wins) },
    { label: 'Lost', value: String(losses(statistics)) },
    { label: 'Win rate', value: `${Math.round(winPercentage(statistics))}%` },
    { label: 'Current streak', value: String(statistics.currentStreak) },
    { label: 'Best streak', value: String(statistics.maxStreak) }
  ]);
</script>

<Modal title="Statistics" {onclose}>
  <dl>
    {#each numbers as entry (entry.label)}
      <div>
        <dt>{entry.label}</dt>
        <dd>{entry.value}</dd>
      </div>
    {/each}
  </dl>

  <h3>Guess distribution</h3>
  <DistributionChart distribution={statistics.distribution} />

  <p class="pool">
    {answersUnseen.toLocaleString('en-GB')} answers not yet seen.{answersMayRepeat
      ? ' Every answer has been used once, so answers may repeat from now on.'
      : ''}
  </p>

  {#if confirming}
    <!--
      Focusable but out of the tab order, so arriving here reads the whole group
      and the next Tab is still "Clear everything". `Modal`'s cycle skips
      `[tabindex="-1"]`, so its first and last stops are unchanged.
    -->
    <fieldset class="confirm" tabindex="-1" bind:this={confirmation}>
      <legend>Reset everything?</legend>
      <p>
        This clears the numbers, both streaks, the guess distribution and the record of which
        answers you have seen. None of it can be recovered.
      </p>
      <div class="actions">
        <!--
          Deliberately not a special destructive look: ResettingIsDeliberate
          puts the weight on this two-step and on the sentence above naming
          what will go, not on a colour a colour-blind reader would miss.
        -->
        <Button
          onclick={() => {
            void setConfirming(false);
            onreset();
          }}>Clear everything</Button
        >
        <Button
          onclick={() => {
            void setConfirming(false);
          }}>Keep my statistics</Button
        >
      </div>
    </fieldset>
  {:else}
    <p class="actions">
      <Button
        bind:element={resetButton}
        onclick={() => {
          void setConfirming(true);
        }}>Reset statistics</Button
      >
    </p>
  {/if}
</Modal>

<style>
  dl {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--s-5);
    margin: 0 0 var(--s-7);
  }

  dl div {
    text-align: center;
  }

  /* The design system's stat figure: a big tabular number over a micro label. */
  dt {
    color: var(--text-2);
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
  }

  dd {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--fs-stat);
    font-weight: 600;
    font-variant-numeric: var(--figures-tabular);
  }

  h3 {
    margin-block: 0 var(--s-4);
    font-size: 1rem;
  }

  .pool {
    margin-block: var(--s-6);
    color: var(--text-2);
    font-size: var(--fs-small);
  }

  .confirm {
    margin: 0;
    padding: var(--s-5) var(--s-6);
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: var(--radius-card);
  }

  legend {
    padding-inline: var(--s-2);
    font-weight: 600;
  }

  .confirm p {
    margin-block: 0 var(--s-5);
  }

  .actions {
    display: flex;
    gap: var(--s-4);
    flex-wrap: wrap;
    margin: 0;
  }
</style>
