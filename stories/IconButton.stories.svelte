<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import IconButton from '../src/lib/components/IconButton.svelte';
  import { MINIMUM_TOUCH_TARGET } from '../src/lib/config';

  const onclick = fn();

  const OVERVIEW = [
    'A square 44px chrome control: the header actions and a dialog Close.',
    '',
    'Consumed by `HeaderBar` and `Modal`, whose surfaces — `GameNavigation`, `Welcome`,',
    '`SettingsPanel`, `StatisticsPanel`, `CustomGameCreation`, `ShareCurrentAnswer`,',
    '`GameConclusion` — all carry',
    '`@guarantee FullyKeyboardOperable`, so the control is a real button and its name is a',
    'required prop rather than an inference from the glyph.',
    '',
    'It meets `DirectManipulation.@invariant EveryControlIsAComfortableTarget` outright, and',
    'the play below measures that here because jsdom has no layout engine. The pressed ring is',
    "`app.css`'s and deliberately not asserted — `tests/directManipulation.test.ts` holds it."
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Core/IconButton',
    component: IconButton,
    tags: ['autodocs'],
    args: { label: 'Settings', icon: 'settings', onclick },
    argTypes: {
      label: { control: 'text', description: 'The accessible name. Required, never inferred.' },
      icon: { control: 'text', description: 'One of the consumed icon names.' },
      disabled: { control: 'boolean' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<Story
  name="Default"
  play={async ({ canvasElement }) => {
    // DirectManipulation.@invariant EveryControlIsAComfortableTarget
    onclick.mockClear();
    const control = within(canvasElement).getByRole('button', { name: 'Settings' });
    const box = control.getBoundingClientRect();

    await expect(box.width).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
    await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);

    await userEvent.click(control);
    await expect(onclick).toHaveBeenCalledTimes(1);
  }}
/>

<Story name="Disabled" args={{ disabled: true }} />
