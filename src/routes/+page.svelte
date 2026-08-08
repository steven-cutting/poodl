<script lang="ts">
  import Board from '$lib/components/Board.svelte';
  import Keyboard from '$lib/components/Keyboard.svelte';
  import { keyboardKnowledge } from '$lib/domain/keyboard';
  import { scoreGuess } from '$lib/domain/scoring';
  import type { ScoredGuess } from '$lib/domain/types';

  /*
   * A fixed position, scored by the real scoring function and rendered by the
   * real components. It is deliberately not a game: none of `game.allium`'s
   * rules exist yet, so there is nothing to submit a guess to.
   *
   * The answer and guesses are constants rather than a draw through the random
   * and word-list ports, because this route is prerendered — module-scope work
   * runs in Node at build time, where a per-visitor draw would be baked into
   * the output. Wiring the ports in belongs with the rules that need them.
   */
  const ANSWER = 'apple';
  const PLAYED = ['adopt', 'alarm'];

  const guesses: ScoredGuess[] = PLAYED.map((word) => ({ results: scoreGuess(word, ANSWER) }));
  const knowledge = keyboardKnowledge(guesses);
</script>

<svelte:head>
  <title>Poodl</title>
  <meta name="description" content="An unlimited-play, Wordle-style word guessing game." />
</svelte:head>

<Board {guesses} currentInput="app" />

<Keyboard {knowledge} disabled />

<p class="note">
  Scaffolding: the board, tiles and keyboard are real, and so is the scoring behind them. The rules
  that turn this into a game are specified in <code>docs/specs/game.allium</code> and not yet implemented.
</p>

<style>
  .note {
    margin-block-start: 2rem;
    color: var(--muted);
    font-size: 0.9rem;
    text-align: center;
  }
</style>
