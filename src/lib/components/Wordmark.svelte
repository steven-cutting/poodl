<script lang="ts">
  /**
   * The brand lockup: the placeholder mark and the words, together.
   *
   * The mark is the brand initial in a ruled square whose fourth corner is the
   * one soft break — `docs/design/direction.md`'s "perfect, broken once" — set
   * in type until an illustrator draws the real one. It is `aria-hidden`, so
   * the accessible text of the lockup is exactly "biscuit games / poodl" with
   * no stray "b" in front of it.
   *
   * The mark is folded in rather than a component of its own because nothing
   * else consumes one; extracting it later is a one-move refactor the porting
   * guide records.
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
