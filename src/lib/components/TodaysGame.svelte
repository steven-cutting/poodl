<script lang="ts">
  import type { TodaysGameView } from '$lib/app/store.svelte';
  import { describeNextWord } from '$lib/domain/calendar';

  /**
   * `daily.allium` — the `TodaysGame` surface.
   *
   * `TheDayIsPerceivable`: which day's word is on the board, and whether
   * today's game has been played and how it ended, are both text here — never
   * a colour or which control looks selected.
   *
   * `TheNextWordIsAnnouncedInAdvance`: when the next word arrives is text from
   * the moment today's game is over. Once the date has moved on, the game
   * still on the board is said to be the earlier day's and today's word is
   * said to be available — announcing "tomorrow's word" over it would leave it
   * looking like today's, which is exactly what the guarantee forbids.
   *
   * `ThereIsNoNewGameInDaily` is why `GameConclusion` mounts this in place of
   * its repeat control: Daily offers the time the next word arrives and the
   * way back to the welcome screen, not a second go at the same word. The time
   * is this component's; the way back is `GameConclusion`'s own control.
   */
  let { todaysGame }: { todaysGame: TodaysGameView } = $props();

  const outcome = $derived.by(() => {
    switch (todaysGame.keptStatus) {
      case 'won':
        return "Today's game is won.";
      case 'lost':
        return "Today's game is lost.";
      case 'in_progress':
        return "Today's game is under way.";
      default:
        return "Today's game has not been played.";
    }
  });
</script>

<div class="todays-game">
  {#if todaysGame.isTodays}
    <p>Day {todaysGame.keptDay}. {outcome}</p>
    {#if todaysGame.keptStatus === 'won' || todaysGame.keptStatus === 'lost'}
      <p>{describeNextWord(todaysGame.nextWordAt)}</p>
    {/if}
  {:else if todaysGame.keptDay !== null}
    <!--
      An earlier day's game, still on the board. Said to be that day's, and
      today's word said to be available — the two things the guarantee asks
      for in place of a next-word time that would be a day too late.
    -->
    <p>Day {todaysGame.keptDay}'s word, not today's.</p>
    <p>Today's word — day {todaysGame.today} — is available now.</p>
  {:else}
    <p>Day {todaysGame.today}'s word is available now.</p>
  {/if}
</div>

<style>
  .todays-game {
    color: var(--text-2);
    text-align: center;
  }

  p {
    margin: 0;
  }

  p + p {
    margin-block-start: var(--s-2);
  }
</style>
