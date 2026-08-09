<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Countdown from '../src/lib/components/Countdown.svelte';

  const onstop = fn();

  const OVERVIEW = [
    'The endless countdown, while it runs.',
    '',
    'Governing surface: `GameConclusion` in `docs/specs/game.allium`.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee EndlessContinuesUnlessStopped`. The remaining time is text rather than a',
    '  shrinking bar, so it can be read by ear, and stopping is available at any point while it',
    '  runs.',
    '- `@guarantee StoppingTheCountdownIsFinal`. There is one control and no way back. A stopped',
    '  countdown does not resume and cannot be restarted for this game, which is why nothing here',
    '  offers to.',
    '',
    'The seconds arrive as a prop. The store counts them down against the clock port, so a test',
    'never waits ten real seconds to watch one expire.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Game/Countdown',
    component: Countdown,
    tags: ['autodocs'],
    args: { seconds: 7, onstop },
    argTypes: {
      seconds: { control: { type: 'range', min: 0, max: 10 }, description: 'Whole seconds left.' },
      onstop: { description: 'Called once, and finally.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Freshly armed. -->
<Story name="Ten seconds" args={{ seconds: 10 }} />

<!-- Part way through. -->
<Story name="Seven seconds" />

<!-- The last one, which has to read as "1 second" rather than "1 seconds". -->
<Story name="One second" args={{ seconds: 1 }} />

<!-- Stopping, from the keyboard alone. -->
<Story
  name="Stopped from the keyboard"
  play={async ({ canvasElement }) => {
    // GameConclusion.@guarantee EndlessContinuesUnlessStopped
    // GameConclusion.@guarantee FullyKeyboardOperable
    onstop.mockClear();
    const stop = within(canvasElement).getByRole('button', { name: /stop/i });

    await userEvent.tab();
    await expect(stop).toHaveFocus();

    await userEvent.keyboard('[Space]');
    await expect(onstop).toHaveBeenCalledTimes(1);
  }}
/>
