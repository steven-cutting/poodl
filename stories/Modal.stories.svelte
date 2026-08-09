<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Modal from '../src/lib/components/Modal.svelte';

  const onclose = fn();

  const OVERVIEW = [
    'The shell every panel and the end-of-game modal sit in.',
    '',
    'Governing surfaces: `SettingsPanel` in `docs/specs/settings.allium`, `StatisticsPanel` in',
    '`docs/specs/statistics.allium`, `CustomGameCreation` in `docs/specs/sharing.allium` and',
    '`GameConclusion` in `docs/specs/game.allium`. All four carry',
    '`@guarantee FullyKeyboardOperable`, so this is where it is made true once.',
    '',
    'It takes focus when it opens, closes on Escape, and cycles Tab inside itself rather than',
    'letting the keyboard wander out to the board behind. The play functions below are the',
    'evidence for each of those.',
    '',
    'Not a native `<dialog>`: jsdom implements neither `showModal` nor `close`, so a component',
    'built on one could not be tested where the rest of the suite runs, and an untestable',
    'accessible shell is the wrong trade for behaviour this small.',
    '',
    'A caller that supplies no `onclose` gets no close control and no Escape. `GameConclusion`',
    'uses that deliberately — see its own page.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/Modal',
    component: Modal,
    tags: ['autodocs'],
    args: { title: 'Settings', onclose },
    argTypes: {
      title: { control: 'text', description: 'Becomes the dialog’s accessible name.' },
      onclose: { description: 'Omit it and the dialog offers no way out of its own.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- The shell, with something inside it. -->
<Story name="Open">
  {#snippet template(args)}
    <Modal {...args}>
      <p>Whatever the panel puts here.</p>
      <button type="button">A control</button>
    </Modal>
  {/snippet}
</Story>

<!-- Focus arrives inside, and Escape closes it. -->
<Story
  name="Closes on Escape"
  play={async ({ canvasElement }) => {
    // FullyKeyboardOperable, on all four surfaces that use this shell.
    onclose.mockClear();
    await expect(within(canvasElement).getByRole('dialog')).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect(onclose).toHaveBeenCalledTimes(1);
  }}
>
  {#snippet template(args)}
    <Modal {...args}>
      <button type="button">A control</button>
    </Modal>
  {/snippet}
</Story>

<!--
  Tab cycles inside. Two stops here — the control and Close — so a third Tab has
  to land back on the first rather than on the board behind the dialog.
-->
<Story
  name="Keeps the keyboard inside"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('button', { name: 'A control' });
    const close = canvas.getByRole('button', { name: 'Close' });

    await userEvent.tab();
    await expect(control).toHaveFocus();

    await userEvent.tab();
    await expect(close).toHaveFocus();

    await userEvent.tab();
    await expect(control).toHaveFocus();
  }}
>
  {#snippet template(args)}
    <Modal {...args}>
      <button type="button">A control</button>
    </Modal>
  {/snippet}
</Story>

<!-- A dialog a caller keeps open offers no control that pretends otherwise. -->
<Story name="No way out, by design" args={{ onclose: undefined, title: 'You won' }}>
  {#snippet template(args)}
    <Modal {...args}>
      <p>The word was APPLE.</p>
      <button type="button">New game</button>
    </Modal>
  {/snippet}
</Story>
