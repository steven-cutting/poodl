<script lang="ts">
  import HowToPlay from '$lib/components/HowToPlay.svelte';
  import Modal from '$lib/components/Modal.svelte';

  /**
   * The explanation as the dialog the header's info button opens.
   *
   * `Welcome.@guarantee AFirstVisitIsExplained`: "reachable again afterwards
   * rather than being shown once and lost" — this is the afterwards. The words
   * are `HowToPlay`'s, shared with the welcome screen; this is the design
   * system's dialog around them — the same shell and the same Close-first
   * title row as every other panel, and no footer, because the body has no
   * action to commit to. `FullyKeyboardOperable` rides on `Modal`.
   */
  let { onclose }: { onclose: () => void } = $props();
</script>

<Modal title="How to play" {onclose}>
  <HowToPlay />
</Modal>
