<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Wordmark from '../src/lib/components/Wordmark.svelte';

  const OVERVIEW = [
    'The brand lockup: the placeholder mark and "biscuit games / poodl", always lowercase,',
    'always in the display face.',
    '',
    'No governing surface — this is brand, from `docs/design/direction.md` by way of decision',
    '0010. The mark is the brand initial in a ruled square whose fourth corner is the one soft',
    'break ("perfect, broken once"), set in type until an illustrator draws the real one, and',
    'it is `aria-hidden`: the words are the whole accessible text, which the play holds.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Brand/Wordmark',
    component: Wordmark,
    tags: ['autodocs'],
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="Lockup"
  play={async ({ canvasElement }) => {
    // The mark's "b" is hidden, so nothing reads "b biscuit games / poodl".
    const words = within(canvasElement).getByText(/biscuit/);

    await expect(words).toHaveTextContent(/^biscuit games \/ poodl$/);
  }}
/>

<Story
  name="Dark theme"
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
