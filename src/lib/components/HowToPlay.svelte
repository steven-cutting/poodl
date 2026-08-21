<script lang="ts">
  import { MAX_ATTEMPTS, WORD_LENGTH } from '$lib/config';

  /**
   * What Poodl is, in four sentences.
   *
   * Extracted from `WelcomeScreen` so the header's info button can offer the
   * same explanation from anywhere — `Welcome.@guarantee AFirstVisitIsExplained`
   * asks for it to be "reachable again afterwards rather than being shown once
   * and lost". The fieldset keeps the `group` role and the "How to play" name
   * the tests and the welcome screen already rely on.
   */
</script>

<fieldset class="how">
  <legend>How to play</legend>
  <ul>
    <li>The word is {WORD_LENGTH} letters long and you have {MAX_ATTEMPTS} attempts.</li>
    <li>Each letter comes back correct, in the word but in the wrong place, or not in the word.</li>
    <li>Every result is named as well as coloured, so nothing depends on seeing a colour.</li>
    <li>Poodl never withholds a game. There is no daily word and no limit.</li>
  </ul>
</fieldset>

<style>
  .how {
    margin: 0;
    padding: var(--s-5) var(--s-6);
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: var(--radius-card);
  }

  legend {
    padding-inline: var(--s-2);
    font-weight: 600;
  }

  .how ul {
    display: grid;
    gap: var(--s-3);
    margin: 0;
    padding-inline-start: var(--s-6);
  }
</style>
