<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import { describeNextWord } from '$lib/domain/calendar';
  import type { GameMode, GameStatus, StartableMode } from '$lib/domain/types';

  /**
   * `game.allium` — the `GameNavigation` surface. Starting and switching
   * games, opened from the header's mode chip and presented as a dialog.
   *
   * `AvailableWhetherOrNotAGameExists`: the chip that opens this is in the
   * header unconditionally, so the surface is reachable on a first visit with
   * no game and no history — and can still start one.
   *
   * `FourModesCanBeStartedFromHere`: custom is not among them, because a
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
    dailyIsTodays = true,
    todaysDaily = null,
    onnewgame,
    onclose
  }: {
    mode?: GameMode | null;
    status?: GameStatus | null;
    /** The mode "New game" repeats. Custom is not startable, so it never lands here. */
    repeatMode: StartableMode;
    onnewgame: (mode: StartableMode) => void;
    /**
     * Whether the daily game on the board is today's. Once the date has moved
     * on it is not, and choosing Daily discards it rather than resuming it —
     * `ANewDayReplacesTheOldGame`, which is why the cost sentence branches.
     */
    dailyIsTodays?: boolean;
    /**
     * How the kept daily game stands while it waits off the board, or null when
     * there is none. `TheDayIsPerceivable` asks for whether today's game has
     * been played and how it ended to be readable as text, and while the daily
     * game is set aside behind another mode's there is nowhere else to read it.
     * Once the date has moved on the kept game is an earlier day's, and
     * choosing Daily discards it rather than bringing it back —
     * `ANewDayReplacesTheOldGame` asks for that to be said before the choice is
     * taken, so `isTodays` and `today` come with it.
     */
    todaysDaily?: {
      day: number;
      status: GameStatus;
      isCurrent: boolean;
      isTodays: boolean;
      today: number;
      /**
       * `next_word_at`. Required rather than optional so that dropping it from
       * the route's projection is a type error: no test rendering this
       * component can see what the route hands it.
       */
      nextWordAt: number;
    } | null;
    onclose: () => void;
  } = $props();

  // Daily first, on the order FourModesCanBeStartedFromHere names them in and
  // that Welcome offers them in.
  const MODES: readonly StartableMode[] = ['daily', 'random', 'endless', 'practice'];

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
    <!--
      ThereIsNoNewGameInDaily: no control offers a second daily game. When the
      mode New game would repeat is Daily, the Daily control above already does
      all that asking again could — return to today's game, or start a new
      day's — so a repeat control would offer a game it cannot give.
    -->
    {#if repeatMode !== 'daily'}
      <Button
        onclick={() => {
          onnewgame(repeatMode);
        }}>New game</Button
      >
    {/if}
  </div>
  <!--
    TheDayIsPerceivable, for the case no other surface can carry: while the
    daily game waits off the board, this is where a player looks before
    choosing Daily, so how today's game stands is said here as text. Once the
    date has moved on the kept game is an earlier day's, and choosing Daily
    discards it rather than bringing it back — ANewDayReplacesTheOldGame asks
    for that to be said before the choice is taken, where calling it "today's
    daily" would promise the opposite.
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
    <!--
      TheNextWordIsAnnouncedInAdvance, which asks for the time from the moment
      today's game is over. The game that would otherwise carry it is off the
      board, and coming back to it costs whatever is on the board instead, so
      the announcement is made here rather than sold at that price. An earlier
      day's game says nothing: its next word is today's, and the sentence above
      has already said today's is available.
    -->
    {#if todaysDaily.isTodays && todaysDaily.status !== 'in_progress'}
      <p class="daily-next">{describeNextWord(todaysDaily.nextWordAt)}</p>
    {/if}
  {/if}

  <!--
    StartingAGameEndsTheOneUnderWay, stated where the player acts on it so the
    cost of switching mode mid-game is never a surprise: beside the mode
    buttons, exactly while there is something to lose. Daily is the one
    exception the guarantee names: it is set aside rather than retired, so the
    ordinary cost sentence would misstate it.
  -->
  {#if status === 'in_progress'}
    <p class="cost">
      {#if mode === 'daily' && dailyIsTodays}
        Choosing another mode leaves today's game set aside rather than ending it. Choosing Daily
        again brings it back.
      {:else if mode === 'daily'}
        This is an earlier day's game. Choosing Daily starts today's word and ends this one for
        good; choosing another mode sets it aside instead.
      {:else}
        Starting a game ends this one. With a guess in it, that counts as a loss in random and
        endless; with none, it goes without trace.
      {/if}
    </p>
  {/if}
</Modal>

<style>
  .daily-standing {
    margin-block: var(--s-4) 0;
    color: var(--text-2);
    font-size: var(--fs-small);
  }

  .daily-next {
    margin-block: var(--s-2) 0;
    color: var(--text-2);
    font-size: var(--fs-small);
  }

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
