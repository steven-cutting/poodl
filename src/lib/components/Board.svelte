<script lang="ts">
  import { Tile } from '@steven-cutting/biscuit-games';

  import { MAX_ATTEMPTS, WORD_LENGTH } from '$lib/config';
  import { describeAttempt, markFor } from '$lib/domain/announcements';
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
          <!--
            The cell is the platform's; where it sits and what its mark means
            are Poodl's, so the label and the sentence are composed here. The
            content is upper-cased on the way in because the platform draws it
            exactly as given: `text-transform` would rewrite "ß" to "SS" and
            disagree with the name beside it.
          -->
          <Tile
            content={cell.letter.toUpperCase()}
            mark={cell.mark === null ? null : markFor(cell.mark)}
            label={`Position ${index + 1}`}
          />
        {/each}
      </li>
    {/each}
  </ol>
  <p class="attempts">
    {guesses.length} of {MAX_ATTEMPTS} attempts used, {remaining} remaining
  </p>
</div>

<style>
  /*
   * GameBoard.@guarantee MotionRespectsTheReducedMotionPreference, which is the
   * board's rather than the cell's. The platform draws a still `Tile`; how a
   * row of them arrives is an arrangement, and the arrangement is Poodl's — so
   * the reveal lives here, where the rule that six rows of five is a game of
   * Poodl already lives.
   *
   * The attribute is written by the route from `Appearance.animations_active`,
   * which is the animations setting and the device's reduced-motion preference
   * taken together — and the device wins. No media query here would be a second
   * opinion on the same question. A fade and a 4px lift, no rotation: the board
   * is calm on purpose.
   *
   * `[data-mark]` is the platform's own hook, and it is absent until a cell is
   * marked, so this selects exactly the cells a submitted guess just scored.
   */
  li :global([data-mark]) {
    animation: none;
  }

  :global(:root[data-animations='on']) li :global([data-mark]) {
    animation: reveal var(--dur-2) var(--ease);
  }

  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(4px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

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
