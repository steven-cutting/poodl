<script lang="ts">
  import { MAX_ATTEMPTS, WORD_LENGTH } from '$lib/config';
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

  <fieldset class="how">
    <legend>How to play</legend>
    <ul>
      <li>The word is {WORD_LENGTH} letters long and you have {MAX_ATTEMPTS} attempts.</li>
      <li>
        Each letter comes back correct, in the word but in the wrong place, or not in the word.
      </li>
      <li>Every result is named as well as coloured, so nothing depends on seeing a colour.</li>
      <li>Poodl never withholds a game. There is no daily word and no limit.</li>
    </ul>
  </fieldset>

  <ul class="choices">
    {#if canContinue}
      <li>
        <button
          type="button"
          class="primary"
          onclick={() => {
            oncontinue();
          }}>{continueLabel}</button
        >
        <span>{continueDescription}</span>
      </li>
    {/if}
    {#each MODES as choice (choice.mode)}
      <li>
        <button
          type="button"
          onclick={() => {
            onnewgame(choice.mode);
          }}>{choice.label}</button
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
    gap: 1.25rem;
  }

  .lead {
    margin: 0;
    text-align: center;
  }

  .how {
    margin: 0;
    padding: 0.75rem 1rem;
    border: 1px solid var(--tile-border);
    border-radius: 6px;
  }

  legend {
    padding-inline: 0.35rem;
    font-weight: 600;
  }

  .how ul {
    margin: 0;
    padding-inline-start: 1.1rem;
    display: grid;
    gap: 0.35rem;
  }

  .choices {
    display: grid;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .choices li {
    display: grid;
    grid-template-columns: 12rem 1fr;
    gap: 0.75rem;
    align-items: center;
  }

  .choices span {
    color: var(--muted);
  }

  button {
    padding: 0.65rem 0.9rem;
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

  .cost,
  .hint {
    margin: 0;
    color: var(--muted);
    text-align: center;
  }

  .cost {
    font-size: 0.9rem;
  }

  @media (max-width: 30rem) {
    .choices li {
      grid-template-columns: 1fr;
      gap: 0.25rem;
    }
  }
</style>
