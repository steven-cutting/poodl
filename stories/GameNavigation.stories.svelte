<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import GameNavigation from '../src/lib/components/GameNavigation.svelte';

  const onnewgame = fn();
  const onclose = fn();

  const OVERVIEW = [
    'Starting and switching games: the dialog the header’s mode chip opens. The one surface',
    'that is not scoped to a game.',
    '',
    'Governing surface: `GameNavigation` in `docs/specs/game.allium`.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee AvailableWhetherOrNotAGameExists`. The chip that opens this is in the header',
    '  unconditionally — see **HeaderBar** — so the **No game yet** story is a first visit: no',
    '  game, no history, and it can still start one.',
    '- `@guarantee ThreeModesCanBeStartedFromHere`. Random, endless and practice. Custom is not',
    '  among them — a custom game exists only because someone made a link — which the',
    '  **Playing a custom game** story shows by offering no control for it.',
    '- `@guarantee CurrentModeIsPerceivable`. Which mode is being played, and whether a game is',
    '  under way at all, are a sentence here and the chip’s word in the header, rather than a',
    '  control that looks selected. The selected control is `aria-current` as well, so they',
    '  agree.',
    '- `@guarantee StartingAGameEndsTheOneUnderWay`, stated beside the mode buttons and only',
    '  while there is something to lose.',
    '- `@guarantee FullyKeyboardOperable`, by way of **Modal**: focus arrives inside, Escape',
    '  closes, Tab cycles, and closing returns focus to the chip. The play below walks it.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Game/GameNavigation',
    component: GameNavigation,
    tags: ['autodocs'],
    args: { mode: null, status: null, repeatMode: 'random', onnewgame, onclose },
    argTypes: {
      mode: { control: false, description: 'The mode of the game on the board, if any.' },
      status: { control: false, description: 'Whether that game is still being played.' },
      repeatMode: { control: false, description: 'What New game repeats. Never custom.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- A first visit. Nothing to lose, so nothing is said about the cost. -->
<Story name="No game yet" />

<!-- Mid-game: the mode is stated, and so is what starting another would cost. -->
<Story name="Playing random" args={{ mode: 'random', status: 'in_progress' }} />

<!-- A game that is over. The cost is gone with it. -->
<Story name="A finished game" args={{ mode: 'endless', status: 'won', repeatMode: 'endless' }} />

<!-- A custom game: named in the sentence, absent from the controls. -->
<Story name="Playing a custom game" args={{ mode: 'custom', status: 'in_progress' }} />

<!-- Close first, then every mode and New game, and the last one doing what it says. -->
<Story
  name="Every control is reachable by Tab"
  args={{ mode: 'endless', status: 'won', repeatMode: 'endless' }}
  play={async ({ canvasElement }) => {
    // GameNavigation.@guarantee FullyKeyboardOperable
    onnewgame.mockClear();
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('dialog', { name: 'Games' })).toHaveFocus();

    for (const name of ['Close', 'Random', 'Endless', 'Practice', 'New game']) {
      await userEvent.tab();
      await expect(canvas.getByRole('button', { name })).toHaveFocus();
    }

    await userEvent.keyboard('[Space]');
    await expect(onnewgame).toHaveBeenCalledWith('endless');
  }}
/>
