<script lang="ts">
  import { Explainer, Tile } from '@steven-cutting/biscuit-games';

  import { MAX_ATTEMPTS, WORD_LENGTH } from '$lib/config';
  import { markFor } from '$lib/domain/announcements';

  /**
   * What Poodl is — the body of the explanation, and only the body.
   *
   * `Welcome.@guarantee AFirstVisitIsExplained` asks for five letters, six
   * attempts, as many games as they like and one word a day that everybody
   * shares, "reachable again afterwards rather than being shown once and
   * lost". Two surfaces say it — `WelcomeScreen` inside a framed group on
   * arrival, `HowToPlayPanel` inside the dialog the header's info button opens
   * from anywhere — so the words live here once and each consumer supplies its
   * own frame and its own name.
   *
   * The frame is `Explainer`, the platform's: prose, a list pairing a live
   * example with the sentence that explains it, and a quiet closing note. Every
   * game explains itself and every one of them explains it this way, which is
   * what makes the scaffold the platform's and every word below Poodl's —
   * `Primer.@guarantee TheWordsAreTheGamesAndTheFrameIsThePlatforms`.
   *
   * The example beside each mark is the board's own cell, so the bar a player
   * is told about is the bar the board draws, in every theme and both palettes
   * (`GameBoard.@guarantee ResultsAreNeverConveyedByColourAlone`). The words
   * for the three are that guarantee's own — bar, shorter bar and no bar —
   * because the bar correct draws is most of a tile's bottom edge rather than
   * all of it, and calling it full would set the sentence against the tile
   * beside it.
   *
   * The tiles are hidden from assistive technology by the frame: the sentence
   * beside each one is the whole of the content, and "Position 1, C, correct"
   * read out before it would be noise. That leaves the sentences carrying the
   * explanation on their own, so `tests/primitives.test.ts` holds each one by
   * the row it sits in, and the bars beside them through `[data-marker]` — the
   * structural hook `docs/reference/testing.md` records for exactly this kind
   * of aria-hidden decoration.
   */
</script>

{#snippet correct()}
  <Tile content="C" mark={markFor('correct')} label="Position 1" />
{/snippet}

{#snippet present()}
  <Tile content="R" mark={markFor('present')} label="Position 2" />
{/snippet}

{#snippet absent()}
  <Tile content="N" mark={markFor('absent')} label="Position 3" />
{/snippet}

<Explainer
  rows={[
    { show: correct, says: 'Correct — right letter, right place. Marker bar.' },
    { show: present, says: 'Present — right letter, wrong place. Shorter marker bar.' },
    { show: absent, says: 'Absent — not in the word. No marker bar.' }
  ]}
>
  <p>
    Guess the word in {MAX_ATTEMPTS} attempts. Every guess is a real
    <span class="nowrap">{WORD_LENGTH}-letter</span> word.
  </p>
  {#snippet footnote()}
    <p>
      Play as many as you like, and one word a day that everybody shares. Your statistics are saved
      in this browser.
    </p>
  {/snippet}
</Explainer>

<style>
  /*
   * The frame carries `text-wrap: pretty` and the spacing; what is left here is
   * the intro's own. The word length and its hyphen are kept together so it
   * never breaks after "5-".
   */
  p {
    margin: 0;
  }

  .nowrap {
    white-space: nowrap;
  }
</style>
