<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import HeaderBar from '../src/lib/components/HeaderBar.svelte';
  import { MINIMUM_TOUCH_TARGET, NARROWEST_SUPPORTED_WIDTH } from '../src/lib/config';

  // The gutters `.shell` gives the page at every width, so a frame here leaves
  // the header exactly the room the route does.
  const SHELL_GUTTER = '1rem';

  const onopenmodes = fn();
  const onopensettings = fn();
  const onopenstatistics = fn();
  const onopenshare = fn();
  const onopenhelp = fn();

  const OVERVIEW = [
    'The platform chrome: brand lockup left, mode chip and four actions right.',
    '',
    'Governing surfaces: `GameNavigation` in `docs/specs/game.allium` — the chip is its way',
    'in, and the chip’s visible word is the text `CurrentModeIsPerceivable` asks for — and',
    '`Welcome`, whose `AFirstVisitIsExplained` keeps the explanation reachable through the',
    'info button. `AvailableWhetherOrNotAGameExists` holds because the header renders',
    'unconditionally, before hydration included.',
    '',
    'Statistics and Settings keep the old toolbar’s labels, so every query that asks by name',
    'still finds them; Share a game is named for the dialog it opens, and How to play is new.',
    '',
    '`contract DirectManipulation` has no exemption here, so the narrow story is the',
    'executable evidence: at `config.narrowest_supported_width` nothing scrolls sideways and',
    'every control still meets `config.minimum_touch_target` both ways — the wordmark gives',
    'up its words rather than the controls giving up size.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/HeaderBar',
    component: HeaderBar,
    tags: ['autodocs'],
    args: { onopenmodes, onopensettings, onopenstatistics, onopenshare, onopenhelp },
    argTypes: {
      mode: { control: false, description: 'The mode of the game on the board, if any.' },
      status: { control: false, description: 'Whether that game is still being played.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Before any game: the chip says so, and can still start one. -->
<Story name="No game yet" />

<!-- Mid-game: the chip carries the mode word. -->
<Story name="Playing random" args={{ mode: 'random', status: 'in_progress' }} />

<!-- A finished game reads as finished until the next one starts. -->
<Story name="Endless, finished" args={{ mode: 'endless', status: 'won' }} />

<!-- A custom game is named in the chip like any other; starting one is not offered anywhere. -->
<Story name="Playing a custom game" args={{ mode: 'custom', status: 'in_progress' }} />

<!-- Chip first, then the four actions, in reading order. -->
<Story
  name="Every control is reachable by Tab"
  args={{ mode: 'random', status: 'in_progress' }}
  play={async ({ canvasElement }) => {
    // GameNavigation.@guarantee FullyKeyboardOperable — the header half.
    onopenmodes.mockClear();
    const canvas = within(canvasElement);
    const chip = canvas.getByRole('button', { name: 'Playing random — change game' });

    await expect(chip).toHaveAttribute('aria-haspopup', 'dialog');

    await userEvent.tab();
    await expect(chip).toHaveFocus();

    for (const name of ['Share a game', 'Statistics', 'Settings', 'How to play']) {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name })).toHaveFocus();
    }

    chip.focus();
    await userEvent.keyboard('{Enter}');
    await expect(onopenmodes).toHaveBeenCalledTimes(1);
  }}
/>

<!--
  The narrowest viewport the specification supports, framed to exactly that
  width with the gutters the page shell gives. The header has no exemption from
  `EveryControlIsAComfortableTarget`, so the collapse — words hidden, divider
  gone, icon gaps closed — must keep every target whole rather than shrinking
  one.
-->
<Story
  name="At the narrowest supported width"
  args={{ mode: 'random', status: 'in_progress' }}
  parameters={{
    docs: { story: { inline: false } },
    /*
     * The collapse keys on the viewport (`max-width: 26rem`), and the story
     * run's default viewport is 1200px wide. Without this pin the play would
     * measure the uncollapsed header inside a narrow frame, and the state a
     * phone actually renders would be evidence nowhere.
     */
    viewport: {
      viewports: {
        narrowest: {
          name: 'Narrowest supported',
          styles: { width: `${NARROWEST_SUPPORTED_WIDTH}px`, height: '568px' }
        }
      },
      defaultViewport: 'narrowest'
    }
  }}
  play={async ({ canvasElement }) => {
    // DirectManipulation.@invariant EveryControlIsAComfortableTarget
    const frame = canvasElement.querySelector<HTMLElement>('[data-frame]');

    if (frame === null) {
      throw new Error('This story has no frame to measure the header against');
    }

    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);

    for (const control of within(canvasElement).getAllByRole('button')) {
      const box = control.getBoundingClientRect();

      await expect(box.width).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
      await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
    }

    // The wordmark's words leave the layout here, not the accessibility tree:
    // the page's only h1 keeps its name when the lockup collapses to the mark.
    const heading = within(canvasElement).getByRole('heading', {
      level: 1,
      name: 'biscuit games / poodl'
    });

    /*
     * And they do leave it. Measured rather than read off a declaration,
     * because the box is what the viewport pin above decides: at the story
     * run's default 1200px the media query never matches, the words lay out at
     * their natural width, and every other assertion in this play passes
     * anyway — the frame does not overflow, the targets are whole, the heading
     * has its name. Without this line a pin that silently stopped applying
     * would leave the collapse evidence of nothing, and the shape it relies on
     * is the deprecated one.
     */
    await expect(
      within(heading)
        .getByText(/^biscuit/)
        .getBoundingClientRect().width
    ).toBeLessThanOrEqual(1);
  }}
>
  {#snippet template(args)}
    <div
      data-frame
      style="inline-size: {NARROWEST_SUPPORTED_WIDTH}px; padding-inline: {SHELL_GUTTER}"
    >
      <HeaderBar {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Dark theme"
  args={{ mode: 'random', status: 'in_progress' }}
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
