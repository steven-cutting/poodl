<script lang="ts">
  import Announcer from '$lib/components/Announcer.svelte';
  import Board from '$lib/components/Board.svelte';
  import Button from '$lib/components/Button.svelte';
  import Keyboard from '$lib/components/Keyboard.svelte';
  import Notice from '$lib/components/Notice.svelte';
  import PhysicalKeyboard from '$lib/components/PhysicalKeyboard.svelte';
  import ResultsReady from '$lib/components/ResultsReady.svelte';
  import TodaysGame from '$lib/components/TodaysGame.svelte';
  import type { GameState, Notice as NoticeValue, ShareableView } from '$lib/app/state';
  import type { TodaysGameView } from '$lib/app/store.svelte';
  import type { KeyKnowledge } from '$lib/domain/types';

  /**
   * `game.allium` — the `GameBoard` surface, assembled.
   *
   * `AnswerIsNeverExposedWhileInProgress`: the answer is on `game`, and nothing
   * here reads it. What the player has learned reaches the screen through the
   * submitted guesses and the keyboard knowledge derived from them, and by no
   * other route.
   *
   * `FullyKeyboardOperable` holds regardless of the physical keyboard setting,
   * which governs only whether typing goes straight into the board: the
   * on-screen keyboard is always here and always reachable.
   */
  let {
    game,
    keyboard = [],
    physicalKeyboard = true,
    notice = null,
    noticeSequence = 0,
    shareable = null,
    announcement = null,
    announcementSequence = 0,
    todaysGame = null,
    onletter,
    ondelete,
    onsubmit,
    oncopy,
    ondismissnotice,
    onshowresult
  }: {
    game: GameState;
    keyboard?: readonly KeyKnowledge[];
    /** Off while a dialog is open: the keys belong to whatever is in front. */
    physicalKeyboard?: boolean;
    notice?: NoticeValue | null;
    noticeSequence?: number;
    /**
     * The grid Poodl is holding, for as long as it has one. Made in the
     * conclusion, and still here once that is closed: `TheGridIsAvailableAsText`
     * wants the grid where the player is looking. A link is never held here —
     * it lives inside the surface that made it, the share dialog or the
     * conclusion, and goes when that closes.
     */
    shareable?: ShareableView | null;
    announcement?: string | null;
    announcementSequence?: number;
    /**
     * `daily.allium`'s `TodaysGame` surface, passed only for a daily game.
     * `TheDayIsPerceivable` asks for which day's word is on the board to be
     * readable as text while it is being played, not only once it is over.
     */
    todaysGame?: TodaysGameView | null;
    onletter: (letter: string) => void;
    ondelete: () => void;
    onsubmit: () => void;
    oncopy: () => void;
    ondismissnotice: () => void;
    /** Offered only while the conclusion of a finished game is closed. */
    onshowresult?: () => void;
  } = $props();

  const playing = $derived(game.status === 'in_progress');
</script>

{#if physicalKeyboard && playing}
  <PhysicalKeyboard {onletter} {ondelete} {onsubmit} />
{/if}

{#if todaysGame !== null}
  <TodaysGame {todaysGame} />
{/if}

<Board guesses={game.guesses} currentInput={game.currentInput} />

<Notice {notice} sequence={noticeSequence} ondismiss={ondismissnotice} />

{#if shareable?.kind === 'results'}
  <ResultsReady text={shareable.text} {oncopy} />
{/if}

<Keyboard knowledge={keyboard} disabled={!playing} {onletter} {ondelete} {onsubmit} />

<!--
  The way back to a conclusion the player closed. Passing the word on is not
  offered from here: `ShareCurrentAnswer` is reached from the dialog the
  header's share button opens, and from the conclusion while it is showing.
-->
{#if onshowresult !== undefined}
  <p class="share">
    <Button
      onclick={() => {
        onshowresult();
      }}>Show the result again</Button
    >
  </p>
{/if}

<Announcer message={announcement} sequence={announcementSequence} />

<style>
  .share {
    display: flex;
    gap: var(--s-4);
    flex-wrap: wrap;
    justify-content: center;
    margin-block-start: var(--s-7);
  }
</style>
