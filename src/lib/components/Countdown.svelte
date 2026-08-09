<script lang="ts">
  import { describeCountdown } from '$lib/domain/announcements';

  /**
   * The endless countdown, while it runs.
   *
   * `EndlessContinuesUnlessStopped` asks for the remaining time to be
   * perceivable and for stopping to be an action available at any point while
   * it runs. `StoppingTheCountdownIsFinal` is why there is one control and no
   * way back: a stopped countdown does not resume.
   */
  let { seconds, onstop }: { seconds: number; onstop: () => void } = $props();
</script>

<div class="countdown">
  <p>{describeCountdown(seconds)}</p>
  <button
    type="button"
    onclick={() => {
      onstop();
    }}>Stop the countdown</button
  >
</div>

<style>
  .countdown {
    display: grid;
    gap: 0.5rem;
    justify-items: center;
    margin-block: 1rem;
  }

  p {
    margin: 0;
    color: var(--muted);
  }

  button {
    padding: 0.5rem 0.9rem;
    border: 1px solid var(--key-border);
    border-radius: 4px;
    background: var(--key-background);
    color: var(--key-text);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
</style>
