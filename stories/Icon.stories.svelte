<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect } from 'storybook/test';

  import Icon from '../src/lib/components/Icon.svelte';
  import { ICONS } from '../src/lib/components/icons';
  import type { IconName } from '../src/lib/components/icons';

  const NAMES = Object.keys(ICONS) as IconName[];

  const OVERVIEW = [
    'The ten icons the app consumes, inlined from `src/lib/assets/icons/` through the Vite',
    'import graph. Lucide, restroked to 1.5 — the licence sits beside the files.',
    '',
    'No governing surface: an icon is decoration, which is the point. Every one is',
    '`aria-hidden`, draws in `currentColor`, and takes its name from the control it sits in —',
    'an `IconButton` label, a keyboard key, a toast sentence. Adopted by decision 0010; adding',
    'an icon is walked in `docs/how-to/port-a-design-system-component.md`.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Core/Icon',
    component: Icon,
    tags: ['autodocs'],
    args: { name: 'check' },
    argTypes: {
      name: { control: 'select', options: NAMES, description: 'Which of the consumed icons.' },
      size: { control: { type: 'number', min: 12, max: 48 }, description: 'Square size in px.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Every consumed icon, named beside itself so the sheet reads without hovering. -->
<Story
  name="Every icon"
  asChild
  play={async ({ canvasElement }) => {
    // Decorative by construction: real SVGs, none of them in the accessibility tree.
    const drawn = canvasElement.querySelectorAll('svg');
    const hidden = canvasElement.querySelectorAll('[aria-hidden="true"] svg');

    await expect(drawn.length).toBe(NAMES.length);
    await expect(hidden.length).toBe(NAMES.length);
  }}
>
  <ul class="sheet">
    {#each NAMES as name (name)}
      <li>
        <Icon {name} />
        <span>{name}</span>
      </li>
    {/each}
  </ul>
</Story>

<!-- The three sizes the app draws: 16 in a toast, 20 on chrome, 18 on a key. -->
<Story name="Sizes" asChild>
  <div class="sizes">
    <Icon name="settings" size={16} />
    <Icon name="settings" size={18} />
    <Icon name="settings" size={20} />
  </div>
</Story>

<style>
  .sheet {
    display: grid;
    grid-template-columns: repeat(2, minmax(9rem, 1fr));
    gap: var(--s-5);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .sheet li {
    display: flex;
    gap: var(--s-4);
    align-items: center;
  }

  .sheet span {
    color: var(--text-2);
    font-size: var(--fs-small);
  }

  .sizes {
    display: flex;
    gap: var(--s-5);
    align-items: center;
  }
</style>
