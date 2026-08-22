<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import HowToPlay from '../src/lib/components/HowToPlay.svelte';

  const OVERVIEW = [
    'What Poodl is, in four sentences, inside a group named "How to play".',
    '',
    'Governing surface: `Welcome` in `docs/specs/game.allium`.',
    '`@guarantee AFirstVisitIsExplained` asks for the explanation to be "reachable again',
    'afterwards rather than being shown once and lost" — this component is that explanation,',
    'rendered by `WelcomeScreen` on arrival and by the header’s info button from anywhere.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/HowToPlay',
    component: HowToPlay,
    tags: ['autodocs'],
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="The explanation"
  play={async ({ canvasElement }) => {
    // Welcome.@guarantee AFirstVisitIsExplained
    const explanation = within(canvasElement).getByRole('group', { name: /how to play/i });

    await expect(explanation).toHaveTextContent(/5 letters/);
    await expect(explanation).toHaveTextContent(/6 attempts/);
  }}
/>
