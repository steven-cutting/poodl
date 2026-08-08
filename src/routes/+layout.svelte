<script lang="ts">
  import '../app.css';

  let { children }: { children?: import('svelte').Snippet } = $props();
</script>

<div class="shell">
  <header>
    <h1>Poodl</h1>
  </header>
  <main>
    {@render children?.()}
  </main>
</div>

<style>
  .shell {
    max-inline-size: 34rem;
    margin-inline: auto;
    padding: 1.5rem 1rem 3rem;
  }

  header {
    text-align: center;
    border-block-end: 1px solid var(--tile-border);
    padding-block-end: 0.75rem;
    margin-block-end: 1.5rem;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
</style>
