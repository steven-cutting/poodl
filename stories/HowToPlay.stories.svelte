<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import HowToPlay from '../src/lib/components/HowToPlay.svelte';

  const OVERVIEW = [
    'What Poodl is: the body of the explanation, without a frame.',
    '',
    'Governing surface: `Welcome` in `docs/specs/game.allium`.',
    '`@guarantee AFirstVisitIsExplained` asks for five letters, six attempts and as many games',
    'as they like, "reachable again afterwards rather than being shown once and lost" — this',
    'component is the words, said once. `WelcomeScreen` frames them as a group named "How to',
    'play" on arrival, and `HowToPlayPanel` puts them in the dialog the header’s info button',
    'opens from anywhere; each consumer supplies its own frame and name, which is why there is',
    'none here.',
    '',
    'The example beside each mark is the board’s own `Tile`, so `GameBoard`’s',
    '`@guarantee ResultsAreNeverConveyedByColourAlone` is illustrated with the bar the board',
    'draws — most of the bottom edge for correct, a short centred one for present, none for',
    'absent. The tiles are hidden from assistive technology because the sentence beside each is',
    'the content; `tests/primitives.test.ts` holds the bars through `[data-marker]`, and',
    '`Tile`’s own stories hold their geometry.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/HowToPlay',
    component: HowToPlay,
    tags: ['autodocs'],
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- The body at the width the dialog gives it: 28rem less the panel’s padding. -->
<Story
  name="The explanation"
  asChild
  play={async ({ canvasElement }) => {
    // Welcome.@guarantee AFirstVisitIsExplained
    const canvas = within(canvasElement);

    await expect(canvas.getByText(/6 attempts/)).toHaveTextContent(/5-letter/);
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);

    // GameBoard.@guarantee ResultsAreNeverConveyedByColourAlone — the three
    // tiles are there for the eye and silent to a reader.
    await expect(canvas.queryAllByRole('img')).toHaveLength(0);
    await expect(canvas.getAllByRole('img', { hidden: true })).toHaveLength(3);
  }}
>
  <div class="frame"><HowToPlay /></div>
</Story>

<!-- Dark is home: the frame the design was drawn in. -->
<Story
  name="Dark theme"
  asChild
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
>
  <div class="frame"><HowToPlay /></div>
</Story>

<style>
  .frame {
    inline-size: min(26rem, 100%);
  }
</style>
