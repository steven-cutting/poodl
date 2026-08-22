<script lang="ts">
  import '../app.css';

  /*
   * Only the stylesheet lives here. The header is `HeaderBar`, rendered by
   * `+page.svelte`, because its controls need the page's panel state and the
   * store's callbacks — and callbacks-as-props with no context means the
   * layout could never receive them.
   */
  let { children }: { children?: import('svelte').Snippet } = $props();
</script>

{@render children?.()}
