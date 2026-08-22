<script lang="ts">
  import Tile from '$lib/components/Tile.svelte';
  import { MAX_ATTEMPTS, WORD_LENGTH } from '$lib/config';
  import type { LetterMark } from '$lib/domain/types';

  /**
   * What Poodl is — the body of the explanation, and only the body.
   *
   * `Welcome.@guarantee AFirstVisitIsExplained` asks for five letters, six
   * attempts and as many games as they like, "reachable again afterwards
   * rather than being shown once and lost". Two surfaces say it — `WelcomeScreen`
   * inside a framed group on arrival, `HowToPlayPanel` inside the dialog the
   * header's info button opens from anywhere — so the words live here once and
   * each consumer supplies its own frame and its own name.
   *
   * The example beside each mark is the board's own `Tile`, so the bar a player
   * is told about is the bar the board draws, in every theme and both palettes
   * (`GameBoard.@guarantee ResultsAreNeverConveyedByColourAlone`). The tiles are
   * hidden from assistive technology: the sentence beside each one is the
   * content, and "Position 1, C, correct" read out before it would be noise.
   * The bars they carry are held by `tests/primitives.test.ts` through
   * `[data-marker]`, the structural hook `docs/reference/testing.md` records
   * for exactly this kind of aria-hidden decoration.
   */
  const MARKS: readonly { mark: LetterMark; letter: string; sentence: string }[] = [
    {
      mark: 'correct',
      letter: 'c',
      sentence: 'Correct — right letter, right place. Full marker bar.'
    },
    {
      mark: 'present',
      letter: 'r',
      sentence: 'Present — right letter, wrong place. Short marker bar.'
    },
    { mark: 'absent', letter: 'n', sentence: 'Absent — not in the word. No marker bar.' }
  ];
</script>

<div class="how">
  <p>
    Guess the word in {MAX_ATTEMPTS} attempts. Every guess is a real
    <span class="nowrap">{WORD_LENGTH}-letter</span> word.
  </p>
  <ul class="marks">
    {#each MARKS as example, index (example.mark)}
      <li>
        <span class="example" aria-hidden="true">
          <Tile position={index + 1} letter={example.letter} mark={example.mark} />
        </span>
        <span>{example.sentence}</span>
      </li>
    {/each}
  </ul>
  <p class="note">Play as many as you like. Your statistics are saved in this browser.</p>
</div>

<style>
  /*
   * `text-wrap: pretty` is inherited by every sentence here. At the dialog's
   * width a row's sentence runs to two lines, and without it the second line
   * is as likely as not to be one word; where the browser does not know the
   * value it wraps as it always did. The word length and its hyphen are kept
   * together so the intro never breaks after "5-".
   */
  .how {
    display: grid;
    gap: var(--s-6);
    text-wrap: pretty;
  }

  p {
    margin: 0;
  }

  .nowrap {
    white-space: nowrap;
  }

  .marks {
    display: grid;
    gap: var(--s-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .marks li {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--s-5);
    align-items: center;
  }

  .note {
    color: var(--text-2);
  }
</style>
