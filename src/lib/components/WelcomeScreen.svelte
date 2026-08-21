<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import HowToPlay from '$lib/components/HowToPlay.svelte';
  import type { GameMode, GameStatus, StartableMode } from '$lib/domain/types';

  /**
   * `game.allium` — the `Welcome` surface. What a player meets on opening.
   *
   * `ContinueAndTheThreeModesAreEqualChoices`: there is no question to answer
   * and nothing to decline. Continue sits alongside Random, Endless and
   * Practice as one of four choices, and each is one action away.
   *
   * `AFirstVisitIsExplained`: a player with nothing played is told what Poodl is
   * before being asked to choose, and the explanation stays reachable rather
   * than being shown once and lost — which is why it is a disclosure that starts
   * open on a first visit rather than a paragraph that only a first visit sees.
   */
  let {
    isFirstVisit,
    canContinue,
    lastMode = null,
    currentMode = null,
    currentStatus = null,
    oncontinue,
    onnewgame
  }: {
    isFirstVisit: boolean;
    canContinue: boolean;
    lastMode?: StartableMode | null;
    currentMode?: GameMode | null;
    currentStatus?: GameStatus | null;
    oncontinue: () => void;
    onnewgame: (mode: StartableMode) => void;
  } = $props();

  const MODES: readonly { mode: StartableMode; label: string; description: string }[] = [
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
  <p class="lead">An unlimited-play word game. Guess the word; play as many as you like.</p>

  <HowToPlay />

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
    ContinuingNeverCostsAGame retires the board "on exactly the terms
    GameNavigation states", and those terms end "this is stated where the player
    acts on it, so the cost of switching mode mid-game is never a surprise".
    Choosing a mode here is acting on it, so the same sentence is said here.
  -->
  {#if currentStatus === 'in_progress'}
    <p class="cost">
      Choosing a mode ends the game on the board. With a guess in it, that counts as a loss in
      random and endless; with none, it goes without trace.
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
  .hint {
    margin: 0;
    color: var(--text-2);
    text-align: center;
  }

  .cost {
    font-size: var(--fs-small);
  }

  @media (max-width: 30rem) {
    .choices li {
      grid-template-columns: 1fr;
      gap: var(--s-2);
    }
  }
</style>
