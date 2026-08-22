<script lang="ts">
  import Tile from '$lib/components/Tile.svelte';
  import { MAX_ATTEMPTS, WORD_LENGTH } from '$lib/config';
  import { describeAttempt } from '$lib/domain/announcements';
  import type { LetterMark, ScoredGuess } from '$lib/domain/types';

  let {
    guesses = [],
    currentInput = ''
  }: { guesses?: readonly ScoredGuess[]; currentInput?: string } = $props();

  interface Cell {
    letter: string;
    mark: LetterMark | null;
  }

  interface Row {
    attempt: number;
    label: string;
    cells: Cell[];
  }

  function blanks(count: number): Cell[] {
    return Array.from({ length: count }, () => ({ letter: '', mark: null }));
  }

  const rows = $derived.by(() => {
    const built: Row[] = guesses.map((guess, index) => ({
      attempt: index + 1,
      label: describeAttempt(index + 1, guess.results),
      cells: guess.results.map((result) => ({ letter: result.letter, mark: result.mark }))
    }));

    if (built.length < MAX_ATTEMPTS) {
      const typed = [...currentInput];
      built.push({
        attempt: built.length + 1,
        label:
          typed.length === 0
            ? `Attempt ${built.length + 1}: empty`
            : `Attempt ${built.length + 1}: ${typed.join('').toUpperCase()}, not yet submitted`,
        cells: [
          ...typed.map((letter) => ({ letter, mark: null })),
          ...blanks(WORD_LENGTH - typed.length)
        ]
      });
    }

    while (built.length < MAX_ATTEMPTS) {
      built.push({
        attempt: built.length + 1,
        label: `Attempt ${built.length + 1}: empty`,
        cells: blanks(WORD_LENGTH)
      });
    }

    return built;
  });

  const remaining = $derived(MAX_ATTEMPTS - guesses.length);
</script>

<div class="board">
  <ol aria-label="Board">
    {#each rows as row (row.attempt)}
      <li aria-label={row.label}>
        {#each row.cells as cell, index (index)}
          <Tile letter={cell.letter} mark={cell.mark} position={index + 1} />
        {/each}
      </li>
    {/each}
  </ol>
  <p class="attempts">
    {guesses.length} of {MAX_ATTEMPTS} attempts used, {remaining} remaining
  </p>
</div>

<style>
  ol {
    display: grid;
    gap: var(--gap-row);
    margin: 0;
    padding: 0;
    list-style: none;
    justify-content: center;
  }

  li {
    display: flex;
    gap: var(--gap-tile);
  }

  .attempts {
    margin-block: 1rem 0;
    color: var(--text-2);
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: var(--track-label);
    text-align: center;
    text-transform: uppercase;
  }
</style>
