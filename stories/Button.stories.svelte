<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Button from '../src/lib/components/Button.svelte';
  import { MINIMUM_TOUCH_TARGET } from '../src/lib/config';

  const onclick = fn();

  const OVERVIEW = [
    'The one button, replacing the border-and-fill CSS a dozen components each carried.',
    '',
    'Three variants and two sizes — exactly what the app consumes; the design system’s others',
    'are recorded in `docs/how-to/port-a-design-system-component.md`. Primary is the page ink',
    'as a fill. Secondary hugs the page the way an untried key does, and its border is',
    '`--key-untried-rule` because a control’s boundary owes `minimum_boundary_contrast`',
    'against the page — `tests/contrast.test.ts` computes it. Ghost is for the one action',
    'that is truly incidental.',
    '',
    'There is deliberately no destructive variant: `ResettingIsDeliberate` puts the weight on',
    'the two-step confirmation, not on a colour. `current` renders `aria-current` for the mode',
    'dialog, so the selected control and the sentence beside it agree.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Core/Button',
    component: Button,
    tags: ['autodocs'],
    args: { onclick },
    argTypes: {
      variant: { control: 'radio', options: ['primary', 'secondary', 'ghost'] },
      size: { control: 'radio', options: ['sm', 'md'] },
      disabled: { control: 'boolean' },
      current: { control: 'boolean', description: 'Renders aria-current="true".' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- The six shapes the app draws, side by side. -->
<Story
  name="Every variant"
  asChild
  play={async ({ canvasElement }) => {
    // GameBoard and its siblings all promise FullyKeyboardOperable, and every
    // control answers to EveryControlIsAComfortableTarget outright.
    onclick.mockClear();
    const canvas = within(canvasElement);

    for (const name of ['New game', 'Share results', 'Dismiss']) {
      const control = canvas.getByRole('button', { name });
      const box = control.getBoundingClientRect();

      await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
    }

    canvas.getByRole('button', { name: 'New game' }).focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('[Space]');

    await expect(onclick).toHaveBeenCalledTimes(2);
  }}
>
  <div class="row">
    <Button variant="primary" {onclick}>New game</Button>
    <Button variant="secondary" {onclick}>Share results</Button>
    <Button variant="ghost" {onclick}>Dismiss</Button>
  </div>
  <div class="row">
    <Button variant="primary" size="md" {onclick}>Continue your random game</Button>
    <Button variant="secondary" size="md" {onclick}>Practice</Button>
  </div>
</Story>

<!-- The selected mode in the mode dialog: marked, and announced as current. -->
<Story
  name="Current, among its choices"
  asChild
  play={async ({ canvasElement }) => {
    // GameNavigation.@guarantee CurrentModeIsPerceivable — the control half.
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Random' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    await expect(canvas.getByRole('button', { name: 'Endless' })).not.toHaveAttribute(
      'aria-current'
    );
  }}
>
  <div class="row">
    <Button current>Random</Button>
    <Button>Endless</Button>
    <Button>Practice</Button>
  </div>
</Story>

<Story name="Disabled" asChild>
  <div class="row">
    <Button disabled>New game</Button>
    <Button variant="primary" disabled>Continue</Button>
  </div>
</Story>

<!--
  Primary inverts its ink, so the pair worth pinning is the darkest ground under
  the strongest palette. The figures are held by `tests/contrast.test.ts`; this
  story is the standing evidence that the combination renders and is looked at.
-->
<Story
  name="Dark theme, high contrast"
  asChild
  globals={{ theme: 'dark', highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');
  }}
>
  <div class="row">
    <Button variant="primary">New game</Button>
    <Button variant="secondary">Share results</Button>
    <Button variant="ghost">Dismiss</Button>
  </div>
</Story>

<style>
  .row {
    display: flex;
    gap: var(--s-4);
    align-items: center;
    flex-wrap: wrap;
    margin-block-end: var(--s-4);
  }
</style>
