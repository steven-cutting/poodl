<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import HowToPlay from '$lib/components/HowToPlay.svelte';
  import type { GameMode, GameStatus, StartableMode } from '$lib/domain/types';

  /**
   * `game.allium` — the `Welcome` surface. What a player meets on opening.
   *
   * `ContinueAndTheFourModesAreEqualChoices`: there is no question to answer
   * and nothing to decline. Continue sits alongside Daily, Random, Endless and
   * Practice as one of five choices, and each is one action away.
   *
   * `AFirstVisitIsExplained`: a player with nothing played is told what Poodl is
   * before being asked to choose, and the explanation stays reachable rather
   * than being shown once and lost — so it is a framed group present on every
   * visit, around the `HowToPlay` body the header's dialog shows from anywhere,
   * rather than a paragraph that only a first visit sees.
   */
  let {
    isFirstVisit,
    canContinue,
    lastMode = null,
    currentMode = null,
    currentStatus = null,
    dailyIsTodays = true,
    todaysDaily = null,
    oncontinue,
    onnewgame
  }: {
    isFirstVisit: boolean;
    canContinue: boolean;
    lastMode?: StartableMode | null;
    currentMode?: GameMode | null;
    currentStatus?: GameStatus | null;
    /**
     * Whether the daily game on the board is today's — `ANewDayReplacesTheOld
     * Game`, said here on the same terms `GameNavigation` says it.
     */
    dailyIsTodays?: boolean;
    /**
     * How the kept daily game stands while it waits off the board, or null when
     * there is none — the sentence `GameNavigation` carries, said here on the
     * same terms because Daily is offered here too: `TheDayIsPerceivable` while
     * today's game waits, and `ANewDayReplacesTheOldGame` once the date has
     * moved on and choosing Daily would discard an earlier day's game.
     */
    todaysDaily?: {
      day: number;
      status: GameStatus;
      isCurrent: boolean;
      isTodays: boolean;
      today: number;
    } | null;
    oncontinue: () => void;
    onnewgame: (mode: StartableMode) => void;
  } = $props();

  const MODES: readonly { mode: StartableMode; label: string; description: string }[] = [
    { mode: 'daily', label: 'Daily', description: 'One word a day, the same for everyone.' },
    { mode: 'random', label: 'Random', description: 'One word at a time, counted.' },
    { mode: 'endless', label: 'Endless', description: 'The next word starts by itself.' },
    { mode: 'practice', label: 'Practice', description: 'Nothing is counted or remembered.' }
  ];

  /*
   * Continue names the mode it would resume or start, so it never acts on a
   * mode the player cannot see. A game on the board is resumed; an empty board
   * starts a fresh game in the mode last chosen.
   */
  const continueLabel = $derived(
    currentMode !== null
      ? `Continue your ${currentMode} game`
      : `Continue with a ${lastMode ?? 'random'} game`
  );

  const continueDescription = $derived(
    currentMode === null
      ? 'A new word, in the mode you played last.'
      : currentStatus === 'in_progress'
        ? 'Exactly as you left it: no attempt spent, no streak broken.'
        : 'The game you finished, with its answer still showing.'
  );
</script>

<div class="welcome">
  <p class="lead">An unlimited-play word game.</p>

  <fieldset class="how">
    <legend>How to play</legend>
    <HowToPlay />
  </fieldset>

  <ul class="choices">
    {#if canContinue}
      <li>
        <Button
          variant="primary"
          size="md"
          onclick={() => {
            oncontinue();
          }}>{continueLabel}</Button
        >
        <span>{continueDescription}</span>
      </li>
    {/if}
    {#each MODES as choice (choice.mode)}
      <li>
        <Button
          size="md"
          onclick={() => {
            onnewgame(choice.mode);
          }}>{choice.label}</Button
        >
        <span>{choice.description}</span>
      </li>
    {/each}
  </ul>

  <!--
    The standing sentence GameNavigation carries, on the same terms: while the
    daily game waits off the board this is a surface that offers Daily, so how
    it stands is text here — and once the date has moved on, that choosing
    Daily ends an earlier day's game is said before the choice is taken.
  -->
  {#if todaysDaily !== null && !todaysDaily.isCurrent}
    <p class="daily-standing">
      {#if todaysDaily.isTodays}
        Today's daily is day {todaysDaily.day}:
        {#if todaysDaily.status === 'won'}
          won.
        {:else if todaysDaily.status === 'lost'}
          lost.
        {:else}
          under way, waiting where you left it.
        {/if}
      {:else if todaysDaily.status === 'in_progress'}
        Day {todaysDaily.day}'s daily game is still waiting, unfinished. Today's word — day
        {todaysDaily.today} — is available: choosing Daily starts it and ends day {todaysDaily.day}'s
        game for good.
      {:else}
        Day {todaysDaily.day}'s daily game is over. Today's word — day {todaysDaily.today} — is available:
        choosing Daily starts it.
      {/if}
    </p>
  {/if}

  <!--
    ContinuingNeverCostsAGame retires the board "on exactly the terms
    GameNavigation states", and those terms end "this is stated where the player
    acts on it, so the cost of switching mode mid-game is never a surprise".
    Choosing a mode here is acting on it, so the same sentence is said here.
  -->
  {#if currentStatus === 'in_progress'}
    <p class="cost">
      {#if currentMode === 'daily' && dailyIsTodays}
        Choosing another mode leaves today's game set aside rather than ending it. Choosing Daily
        again brings it back.
      {:else if currentMode === 'daily'}
        This is an earlier day's game. Choosing Daily starts today's word and ends this one for
        good; choosing another mode sets it aside instead.
      {:else}
        Choosing a mode ends the game on the board. With a guess in it, that counts as a loss in
        random and endless; with none, it goes without trace.
      {/if}
    </p>
  {/if}

  {#if isFirstVisit}
    <p class="hint">Pick any of these to start. Practice keeps no record at all.</p>
  {/if}
</div>

<style>
  .welcome {
    display: grid;
    gap: var(--s-7);
  }

  .lead {
    margin: 0;
    text-align: center;
  }

  .how {
    min-inline-size: 0;
    margin: 0;
    padding: var(--s-5) var(--s-6);
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: var(--radius-card);
  }

  legend {
    padding-inline: var(--s-2);
    font-weight: 600;
  }

  .choices {
    display: grid;
    gap: var(--s-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .choices li {
    display: grid;
    grid-template-columns: 14rem 1fr;
    gap: var(--s-5);
    align-items: center;
  }

  .choices span {
    color: var(--text-2);
    font-size: var(--fs-small);
  }

  .cost,
  .hint,
  .daily-standing {
    margin: 0;
    color: var(--text-2);
    text-align: center;
  }

  .cost,
  .daily-standing {
    font-size: var(--fs-small);
  }

  @media (max-width: 30rem) {
    .choices li {
      grid-template-columns: 1fr;
      gap: var(--s-2);
    }
  }
</style>
