<script lang="ts">
  import type { GameMode, GameStatus, StartableMode } from '$lib/domain/types';

  /**
   * `game.allium` — the `GameNavigation` surface. Starting and switching games.
   *
   * `AvailableWhetherOrNotAGameExists`: nothing here depends on a game being
   * under way, so it is present on a first visit and can still start one.
   *
   * `ThreeModesCanBeStartedFromHere`: custom is not among them, because a custom
   * game exists only because someone made a link.
   *
   * `CurrentModeIsPerceivable`: which mode is being played, and whether a game
   * is under way at all, are readable as text rather than signalled only by
   * which control looks selected.
   */
  let {
    mode = null,
    status = null,
    repeatMode,
    onnewgame
  }: {
    mode?: GameMode | null;
    status?: GameStatus | null;
    /** The mode "New game" repeats. Custom is not startable, so it never lands here. */
    repeatMode: StartableMode;
    onnewgame: (mode: StartableMode) => void;
  } = $props();

  const MODES: readonly StartableMode[] = ['random', 'endless', 'practice'];

  const current = $derived.by(() => {
    if (mode === null) {
      return 'No game under way.';
    }
    return status === 'in_progress'
      ? `Playing ${mode}.`
      : `${mode.charAt(0).toUpperCase()}${mode.slice(1)} game finished.`;
  });

  function label(startable: StartableMode): string {
    return `${startable.charAt(0).toUpperCase()}${startable.slice(1)}`;
  }
</script>

<nav aria-label="Games">
  <p class="current">{current}</p>
  <div class="controls">
    {#each MODES as startable (startable)}
      <button
        type="button"
        aria-current={mode === startable ? 'true' : undefined}
        onclick={() => {
          onnewgame(startable);
        }}>{label(startable)}</button
      >
    {/each}
    <button
      type="button"
      onclick={() => {
        onnewgame(repeatMode);
      }}>New game</button
    >
  </div>
  <!--
    StartingAGameEndsTheOneUnderWay, stated where the player acts on it so the
    cost of switching mode mid-game is never a surprise.
  -->
  {#if status === 'in_progress'}
    <p class="cost">
      Starting a game ends this one. With a guess in it, that counts as a loss in random and
      endless; with none, it goes without trace.
    </p>
  {/if}
</nav>

<style>
  nav {
    display: grid;
    gap: 0.5rem;
    justify-items: center;
    margin-block-end: 1.25rem;
  }

  .current {
    margin: 0;
    font-weight: 600;
  }

  .controls {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .cost {
    margin: 0;
    max-inline-size: 30rem;
    color: var(--muted);
    font-size: 0.9rem;
    text-align: center;
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

  button[aria-current='true'] {
    border-color: var(--mark-correct);
    background: var(--mark-correct);
    color: var(--mark-text);
  }
</style>
