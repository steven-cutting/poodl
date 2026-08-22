<script lang="ts">
  import { ICONS } from '$lib/components/icons';
  import type { IconName } from '$lib/components/icons';

  /**
   * One inline icon, always decorative.
   *
   * `aria-hidden` is unconditional: an icon never carries a name of its own,
   * because the control it sits in does — an `IconButton`'s `aria-label`, a
   * key's, a toast's sentence. An icon that named itself would say everything
   * twice or, worse, differently.
   */
  let { name, size = 20 }: { name: IconName; size?: number } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- repo-owned static SVG assets from src/lib/assets/icons, never user input -->
<span class="icon" style:--icon-size="{size}px" aria-hidden="true">{@html ICONS[name]}</span>

<style>
  .icon {
    display: inline-flex;
  }

  .icon :global(svg) {
    display: block;
    inline-size: var(--icon-size);
    block-size: var(--icon-size);
  }
</style>
