<script lang="ts">
  import '@steven-cutting/biscuit-games/app.css';

  /*
   * The design system's stylesheet, imported once and nowhere below it. It is
   * the platform's — the token vocabulary, the four palettes, the two faces and
   * the global element rules together — and Poodl's own styles name tokens from
   * it rather than restating values. Two copies of these custom properties
   * would be a cascade question nobody wants to answer twice, which is why the
   * copy that used to sit beside this file is gone rather than kept in step.
   *
   * Only the stylesheet lives here. The header is `HeaderBar`, rendered by
   * `+page.svelte`, because its controls need the page's panel state and the
   * store's callbacks — and callbacks-as-props with no context means the
   * layout could never receive them.
   */
  let { children }: { children?: import('svelte').Snippet } = $props();
</script>

{@render children?.()}
