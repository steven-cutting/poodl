<script lang="ts">
  import Button from '$lib/components/Button.svelte';
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
  <Button
    onclick={() => {
      onstop();
    }}>Stop the countdown</Button
  >
</div>

<style>
  .countdown {
    display: grid;
    gap: var(--s-4);
    justify-items: center;
    margin-block: var(--s-6);
  }

  p {
    margin: 0;
    color: var(--text-2);
  }
</style>
