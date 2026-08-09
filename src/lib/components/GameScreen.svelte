<script lang="ts">
  import Announcer from '$lib/components/Announcer.svelte';
  import Board from '$lib/components/Board.svelte';
  import Keyboard from '$lib/components/Keyboard.svelte';
  import LinkReady from '$lib/components/LinkReady.svelte';
  import Notice from '$lib/components/Notice.svelte';
  import PhysicalKeyboard from '$lib/components/PhysicalKeyboard.svelte';
  import ResultsReady from '$lib/components/ResultsReady.svelte';
  import type { GameState, Notice as NoticeValue, Shareable } from '$lib/app/state';
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
    onletter,
    ondelete,
    onsubmit,
    onshareanswer,
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
    /** The link or the grid Poodl has just made, for as long as it has one. */
    shareable?: Shareable | null;
    announcement?: string | null;
    announcementSequence?: number;
    onletter: (letter: string) => void;
    ondelete: () => void;
    onsubmit: () => void;
    onshareanswer: () => void;
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

<Board guesses={game.guesses} currentInput={game.currentInput} />

<Notice {notice} sequence={noticeSequence} ondismiss={ondismissnotice} />

{#if shareable?.kind === 'custom_link'}
  <LinkReady url={shareable.text} {oncopy} />
{:else if shareable?.kind === 'results'}
  <ResultsReady text={shareable.text} {oncopy} />
{/if}

<Keyboard knowledge={keyboard} disabled={!playing} {onletter} {ondelete} {onsubmit} />

<!--
  ShareCurrentAnswer: available in every mode and for as long as the game is on
  the board, from before the first guess through to after the game is over.
  Making a link shows nothing about the word.
-->
<p class="share">
  {#if onshowresult !== undefined}
    <button
      type="button"
      onclick={() => {
        onshowresult();
      }}>Show the result again</button
    >
  {/if}
  <button
    type="button"
    onclick={() => {
      onshareanswer();
    }}>Share the word as a custom game</button
  >
</p>

<Announcer message={announcement} sequence={announcementSequence} />

<style>
  .share {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-block-start: 1.25rem;
  }

  button {
    padding: 0.45rem 0.8rem;
    border: 1px solid var(--key-border);
    border-radius: 4px;
    background: var(--key-background);
    color: var(--key-text);
    font: inherit;
    cursor: pointer;
  }
</style>
