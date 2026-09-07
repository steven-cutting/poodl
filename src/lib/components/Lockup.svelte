<script lang="ts">
  /**
   * Poodl's own lockup: the platform's words, and then its own.
   *
   * The platform ships a `Wordmark` that says "biscuit games", and a game whose
   * heading said only that would not name the page. So this is Poodl's, handed
   * to the platform's `HeaderBar` as its `brand` snippet, and the page's `h1`
   * reads "biscuit games / poodl".
   *
   * The words sit in an element of class `words` because that class is the
   * whole of the contract for the header's collapse: below about 26rem the
   * platform hides them and leaves the mark, and it reaches into whatever the
   * `brand` snippet drew to do it. A lockup that spelt the class differently
   * would simply keep its words and overflow a phone.
   *
   * The mark is the brand initial in a ruled square whose fourth corner is the
   * one soft break — "perfect, broken once", which the platform's design
   * direction states — set in type until an illustrator draws the real one. It
   * is `aria-hidden`, so the accessible text is exactly the words with no stray
   * "b" in front of them.
   */
</script>

<span class="lockup">
  <span class="mark" aria-hidden="true">b</span>
  <span class="words">biscuit <span class="dim">games /</span> poodl</span>
</span>

<style>
  .lockup {
    display: inline-flex;
    align-items: center;
    gap: var(--s-4);
  }

  .mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: 20px;
    block-size: 20px;
    padding-block-end: 1px;
    border: var(--rule-w-strong) solid var(--text);
    /* Three machined corners, one animal one. */
    border-radius: 2px 2px 8px 2px;
    color: var(--text);
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .words {
    color: var(--text);
    font-family: var(--font-display);
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1;
    letter-spacing: var(--track-display);
  }

  .dim {
    color: var(--text-3);
    font-weight: 400;
  }
</style>
