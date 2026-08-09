<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import DistributionChart from '../src/lib/components/DistributionChart.svelte';

  const OVERVIEW = [
    'How many games were won in how many guesses.',
    '',
    'Governing surface: `StatisticsPanel` in `docs/specs/statistics.allium`.',
    '',
    'Guarantee this component carries: `@guarantee DistributionIsReadableWithoutSeeingIt`. Each',
    'bucket\'s attempt number and count are a sentence — "3 guesses: 2 wins" — so the',
    'distribution is read rather than inferred from the length of a bar. The bar is decoration on',
    'top of that sentence and is hidden from assistive technology, because it says nothing the',
    'text does not.',
    '',
    'The list is the buckets themselves: one entry per attempt number, so a bucket cannot go',
    'missing and `@invariant BucketIsAnAttemptNumber` holds by construction.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Statistics/DistributionChart',
    component: DistributionChart,
    tags: ['autodocs'],
    argTypes: {
      distribution: {
        control: false,
        description: 'One count per attempt number, from one to six.'
      }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Nothing won yet: six buckets, every one of them zero and every one of them still stated. -->
<Story
  name="Nothing won yet"
  args={{ distribution: [0, 0, 0, 0, 0, 0] }}
  play={async ({ canvasElement }) => {
    // StatisticsPanel.@guarantee DistributionIsReadableWithoutSeeingIt
    // An empty bucket is still a bucket, and still says so.
    const rows = within(canvasElement).getAllByRole('listitem');

    await expect(rows).toHaveLength(6);
    await expect(rows[3]).toHaveTextContent('4 guesses: 0 wins');
  }}
/>

<!-- A player who is getting there. -->
<Story name="A run of games" args={{ distribution: [1, 3, 9, 14, 7, 2] }} />

<!-- One win, in one guess. The singular has to read properly. -->
<Story name="One lucky win" args={{ distribution: [1, 0, 0, 0, 0, 0] }} />
