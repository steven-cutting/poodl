<script lang="ts">
  /**
   * How many games were won in how many guesses.
   *
   * `DistributionIsReadableWithoutSeeingIt`: each bucket's attempt number and
   * count are text, so the distribution can be read rather than inferred from
   * the length of a bar. The bar is decoration on top of the sentence, and is
   * hidden from assistive technology because it says nothing the text does not.
   */
  let { distribution = [] }: { distribution?: readonly number[] } = $props();

  const most = $derived(Math.max(1, ...distribution));

  function label(guesses: number, wins: number): string {
    const attempts = guesses === 1 ? '1 guess' : `${guesses} guesses`;
    return `${attempts}: ${wins === 1 ? '1 win' : `${wins} wins`}`;
  }
</script>

<ol aria-label="Guess distribution">
  {#each distribution as wins, index (index)}
    <li>
      <span>{label(index + 1, wins)}</span>
      <span class="bar" aria-hidden="true" style:inline-size="{(wins / most) * 100}%"></span>
    </li>
  {/each}
</ol>

<style>
  ol {
    display: grid;
    gap: 0.35rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: 0.5rem;
    align-items: center;
  }

  /*
   * Rule-drawn, like every other decoration in this design: the count is in
   * the sentence, so the bar owes no hue and carries no meaning of its own.
   */
  .bar {
    display: block;
    block-size: 0.75rem;
    min-inline-size: 2px;
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: 1px;
    background: transparent;
  }
</style>
