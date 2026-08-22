<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect } from 'storybook/test';

  const OVERVIEW = [
    'The Biscuit Games design tokens, as specimens: the palette, the type ramp, the spacing',
    'scale and the radii, rendered from the same `src/app.css` every component wears.',
    '',
    'This file documents tokens rather than a component, which is a stated deviation from the',
    'one-file-per-component rule — `docs/how-to/work-in-the-component-workshop.md` records it.',
    'No figure here is evidence: `tests/contrast.test.ts` computes every measured pair against',
    'the floors `game.allium` states, in all four combinations of theme and high contrast.',
    'What a specimen is for is looking — which is why the palette is pinned in its dark and',
    'high-contrast forms below, where the values were designed first.',
    '',
    'Provenance: decision 0010, from the Claude Design project this system was ported from,',
    'itself generated from `docs/design/direction.md`.'
  ].join('\n');

  /** The measured semantic colours, grouped so the sheet reads without the file. */
  const PALETTE: readonly { title: string; names: readonly string[] }[] = [
    {
      title: 'Grounds',
      names: ['--background', '--background-sunk', '--surface', '--surface-raised']
    },
    { title: 'Inks', names: ['--text', '--text-2', '--text-3', '--text-disabled'] },
    {
      title: 'Rules and focus',
      names: ['--rule', '--rule-strong', '--key-untried-rule', '--focus']
    },
    {
      title: 'Results and brand',
      names: [
        '--result-exact',
        '--result-present',
        '--result-absent',
        '--result-absent-text',
        '--brand-warm',
        '--brand-warm-ink'
      ]
    }
  ];

  const { Story } = defineMeta({
    title: 'Foundations/Tokens',
    tags: ['autodocs'],
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Every measured colour, on the ground it is measured against. -->
<Story
  name="Palette"
  asChild
  play={async () => {
    // The sheet is drawn from the live tokens, so an unresolved one would
    // render an empty swatch: assert the load-bearing ground resolves.
    const resolved = getComputedStyle(document.documentElement).getPropertyValue('--background');

    await expect(resolved.trim()).not.toBe('');
  }}
>
  <div class="sheet">
    {#each PALETTE as group (group.title)}
      <h3>{group.title}</h3>
      <ul class="swatches">
        {#each group.names as name (name)}
          <li>
            <span class="swatch" style:background="var({name})" aria-hidden="true"></span>
            <code>{name}</code>
          </li>
        {/each}
      </ul>
    {/each}
  </div>
</Story>

<!-- The same palette where it was designed first. -->
<Story
  name="Palette, dark"
  asChild
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
>
  <div class="sheet">
    {#each PALETTE as group (group.title)}
      <h3>{group.title}</h3>
      <ul class="swatches">
        {#each group.names as name (name)}
          <li>
            <span class="swatch" style:background="var({name})" aria-hidden="true"></span>
            <code>{name}</code>
          </li>
        {/each}
      </ul>
    {/each}
  </div>
</Story>

<Story
  name="Palette, dark, high contrast"
  asChild
  globals={{ theme: 'dark', highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
  }}
>
  <div class="sheet">
    {#each PALETTE as group (group.title)}
      <h3>{group.title}</h3>
      <ul class="swatches">
        {#each group.names as name (name)}
          <li>
            <span class="swatch" style:background="var({name})" aria-hidden="true"></span>
            <code>{name}</code>
          </li>
        {/each}
      </ul>
    {/each}
  </div>
</Story>

<!-- The two faces and the ramp they are set on. -->
<Story name="Type" asChild>
  <div class="sheet">
    <p class="spec display-1">Poodl</p>
    <p class="spec display-3">Bricolage Grotesque carries display and the board</p>
    <p class="spec title">Instrument Sans carries the interface</p>
    <p class="spec body">
      Body copy at --fs-body, which never reaches a text control: 16px is what iOS will not zoom on,
      so inputs inherit the page's figure instead.
    </p>
    <p class="spec small">Small print at --fs-small, for notes and captions.</p>
    <p class="spec micro">Micro labels at --fs-micro, tracked wide</p>
    <p class="spec stat">123 456</p>
  </div>
</Story>

<!-- The spacing scale and the three radii, drawn to size. -->
<Story name="Space and radii" asChild>
  <div class="sheet">
    <h3>Space</h3>
    <ul class="spaces">
      {#each ['--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-7', '--s-8', '--s-9', '--s-10', '--s-11', '--s-12', '--s-13'] as step (step)}
        <li>
          <code>{step}</code>
          <span class="bar" style:inline-size="var({step})" aria-hidden="true"></span>
        </li>
      {/each}
    </ul>
    <h3>Radii</h3>
    <ul class="radii">
      {#each ['--radius-tile', '--radius-key', '--radius-card', '--radius-max'] as radius (radius)}
        <li>
          <span class="box" style:border-radius="var({radius})" aria-hidden="true"></span>
          <code>{radius}</code>
        </li>
      {/each}
    </ul>
  </div>
</Story>

<style>
  .sheet {
    display: grid;
    gap: var(--s-5);
    min-inline-size: min(28rem, 80vw);
    color: var(--text);
  }

  h3 {
    margin: var(--s-4) 0 0;
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
    color: var(--text-2);
  }

  .swatches,
  .spaces,
  .radii {
    display: grid;
    gap: var(--s-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .swatches {
    grid-template-columns: repeat(2, minmax(10rem, 1fr));
  }

  .swatches li,
  .radii li {
    display: flex;
    gap: var(--s-4);
    align-items: center;
  }

  .swatch {
    inline-size: var(--s-9);
    block-size: var(--s-7);
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: var(--radius-tile);
  }

  code {
    font-size: var(--fs-mono-label);
  }

  .spaces li {
    display: grid;
    grid-template-columns: 6rem 1fr;
    gap: var(--s-4);
    align-items: center;
  }

  .bar {
    display: block;
    block-size: var(--s-4);
    background: var(--text-3);
  }

  .radii {
    grid-template-columns: repeat(2, minmax(10rem, 1fr));
  }

  .box {
    inline-size: var(--s-9);
    block-size: var(--s-9);
    border: var(--rule-w-strong) solid var(--text);
  }

  .spec {
    margin: 0;
  }

  .display-1 {
    font-family: var(--font-display);
    font-size: var(--fs-display-1);
    font-weight: 600;
    letter-spacing: var(--track-display);
    line-height: 1.1;
  }

  .display-3 {
    font-family: var(--font-display);
    font-size: var(--fs-display-3);
    font-weight: 600;
    letter-spacing: var(--track-display);
    line-height: 1.2;
  }

  .title {
    font-family: var(--font-display);
    font-size: var(--fs-title);
    font-weight: 600;
    letter-spacing: var(--track-title);
  }

  .body {
    font-size: var(--fs-body);
  }

  .small {
    color: var(--text-2);
    font-size: var(--fs-small);
  }

  .micro {
    color: var(--text-2);
    font-size: var(--fs-micro);
    font-weight: 600;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
  }

  .stat {
    font-family: var(--font-display);
    font-size: var(--fs-stat);
    font-weight: 600;
    font-variant-numeric: var(--figures-tabular);
  }
</style>
