<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import type { GameMode, GameStatus, StartableMode } from '$lib/domain/types';

  /**
   * `game.allium` — the `GameNavigation` surface. Starting and switching
   * games, opened from the header's mode chip and presented as a dialog.
   *
   * `AvailableWhetherOrNotAGameExists`: the chip that opens this is in the
   * header unconditionally, so the surface is reachable on a first visit with
   * no game and no history — and can still start one.
   *
   * `ThreeModesCanBeStartedFromHere`: custom is not among them, because a
   * custom game exists only because someone made a link.
   *
   * `CurrentModeIsPerceivable`: which mode is being played, and whether a game
   * is under way at all, are readable as text — the chip's word in the header
   * and the sentence here — rather than signalled only by which control looks
   * selected. The selected mode carries `aria-current` too, so the two agree.
   *
   * `FullyKeyboardOperable` rides on `Modal`: focus arrives inside, Escape
   * closes, Tab cycles, and closing returns focus to the chip that opened it.
   */
  let {
    mode = null,
    status = null,
    repeatMode,
    onnewgame,
    onclose
  }: {
    mode?: GameMode | null;
    status?: GameStatus | null;
    /** The mode "New game" repeats. Custom is not startable, so it never lands here. */
    repeatMode: StartableMode;
    onnewgame: (mode: StartableMode) => void;
    onclose: () => void;
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

<Modal title="Games" {onclose}>
  <p class="current">{current}</p>
  <div class="controls">
    {#each MODES as startable (startable)}
      <Button
        current={mode === startable}
        onclick={() => {
          onnewgame(startable);
        }}>{label(startable)}</Button
      >
    {/each}
    <Button
      onclick={() => {
        onnewgame(repeatMode);
      }}>New game</Button
    >
  </div>
  <!--
    StartingAGameEndsTheOneUnderWay, stated where the player acts on it so the
    cost of switching mode mid-game is never a surprise: beside the mode
    buttons, exactly while there is something to lose.
  -->
  {#if status === 'in_progress'}
    <p class="cost">
      Starting a game ends this one. With a guess in it, that counts as a loss in random and
      endless; with none, it goes without trace.
    </p>
  {/if}
</Modal>

<style>
  .current {
    margin-block: 0 var(--s-5);
    font-weight: 600;
  }

  .controls {
    display: flex;
    gap: var(--s-4);
    flex-wrap: wrap;
  }

  .cost {
    margin-block: var(--s-5) 0;
    color: var(--text-2);
    font-size: var(--fs-small);
  }
</style>
