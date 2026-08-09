<script lang="ts">
  import Announcer from '$lib/components/Announcer.svelte';
  import Board from '$lib/components/Board.svelte';
  import Keyboard from '$lib/components/Keyboard.svelte';
  import LinkReady from '$lib/components/LinkReady.svelte';
  import Notice from '$lib/components/Notice.svelte';
  import PhysicalKeyboard from '$lib/components/PhysicalKeyboard.svelte';
  import type { GameState, Notice as NoticeValue } from '$lib/app/state';
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
    announcement = null,
    announcementSequence = 0,
    onletter,
    ondelete,
    onsubmit,
    onshareanswer,
    oncopylink,
    ondismissnotice
  }: {
    game: GameState;
    keyboard?: readonly KeyKnowledge[];
    physicalKeyboard?: boolean;
    notice?: NoticeValue | null;
    noticeSequence?: number;
    announcement?: string | null;
    announcementSequence?: number;
    onletter: (letter: string) => void;
    ondelete: () => void;
    onsubmit: () => void;
    onshareanswer: () => void;
    oncopylink: () => void;
    ondismissnotice: () => void;
  } = $props();

  const playing = $derived(game.status === 'in_progress');
</script>

{#if physicalKeyboard && playing}
  <PhysicalKeyboard {onletter} {ondelete} {onsubmit} />
{/if}

<Board guesses={game.guesses} currentInput={game.currentInput} />

<Notice {notice} sequence={noticeSequence} ondismiss={ondismissnotice} />

{#if notice?.kind === 'custom_link_ready'}
  <LinkReady url={notice.url} oncopy={oncopylink} />
{/if}

<Keyboard knowledge={keyboard} disabled={!playing} {onletter} {ondelete} {onsubmit} />

<!--
  ShareCurrentAnswer: available in every mode and for as long as the game is on
  the board, from before the first guess through to after the game is over.
  Making a link shows nothing about the word.
-->
<p class="share">
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
    margin-block-start: 1.25rem;
    text-align: center;
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
