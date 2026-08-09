<script lang="ts">
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
    <fieldset class="confirm">
      <legend>Reset everything?</legend>
      <p>
        This clears the numbers, both streaks, the guess distribution and the record of which
        answers you have seen. None of it can be recovered.
      </p>
      <div class="actions">
        <button
          type="button"
          class="danger"
          onclick={() => {
            confirming = false;
            onreset();
          }}>Clear everything</button
        >
        <button type="button" onclick={() => (confirming = false)}>Keep my statistics</button>
      </div>
    </fieldset>
  {:else}
    <p class="actions">
      <button type="button" onclick={() => (confirming = true)}>Reset statistics</button>
    </p>
  {/if}
</Modal>

<style>
  dl {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin: 0 0 1.25rem;
  }

  dl div {
    text-align: center;
  }

  dt {
    color: var(--muted);
    font-size: 0.85rem;
  }

  dd {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  h3 {
    margin-block: 0 0.5rem;
    font-size: 1rem;
  }

  .pool {
    margin-block: 1rem;
    color: var(--muted);
    font-size: 0.9rem;
  }

  .confirm {
    margin: 0;
    padding: 0.75rem 1rem;
    border: 1px solid var(--tile-border);
    border-radius: 6px;
  }

  legend {
    padding-inline: 0.35rem;
    font-weight: 600;
  }

  .confirm p {
    margin-block: 0 0.75rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin: 0;
  }

  button {
    padding: 0.45rem 0.8rem;
    border: 1px solid var(--key-border);
    border-radius: 4px;
    background: var(--key-background);
    color: var(--key-text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .danger {
    border-color: var(--mark-absent);
    background: var(--mark-absent);
    color: var(--mark-text);
  }
</style>
