<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import GameScreen from '../src/lib/components/GameScreen.svelte';
  import { MINIMUM_TOUCH_TARGET, NARROWEST_SUPPORTED_WIDTH } from '../src/lib/config';
  import { keyboardKnowledge } from '../src/lib/domain/keyboard';
  import {
    ANSWER,
    CUSTOM_GAME,
    GRID,
    GRID_MADE,
    LINK,
    LINK_MADE,
    LOST_GAME,
    PLAYING,
    WON_GAME
  } from './fixtures';

  const onletter = fn();
  const ondelete = fn();
  const onsubmit = fn();
  const oncopy = fn();
  const ondismissnotice = fn();
  const onshowresult = fn();

  const OVERVIEW = [
    'The board, the keyboard and everything Poodl says while a game is on.',
    '',
    'Governing surfaces: `GameBoard` and `PhysicalKeyboardInput` in `docs/specs/game.allium`. The',
    'board is `related:` to `ShareCurrentAnswer` in `docs/specs/sharing.allium`, and shows what it',
    'and `ShareResults` made in the conclusion once that is put away; it provides neither action.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee AnswerIsNeverExposedWhileInProgress`. The answer is on the game it is handed',
    '  and nothing here reads it. What the player has learned reaches the screen through the',
    '  submitted guesses and the keyboard knowledge derived from them, and by no other route.',
    '- `@guarantee FullyKeyboardOperable`, which holds regardless of the physical keyboard',
    '  setting: that setting governs only whether typing goes straight into the board. The',
    '  **Physical keyboard surrendered** story is the same board with the whole key channel handed',
    '  back, and the on-screen keyboard is still every action.',
    '- `@guarantee EveryRejectionIsAnnounced`, by way of **Notice**, with the typed letters still',
    '  on the board to be corrected.',
    '- `@guarantee EverySubmittedGuessIsAnnounced`, by way of **Announcer**.',
    '- `ShareCurrentAnswer.@guarantee TheAnswerIsNeverShownInOrderToShareIt`: a link the board is',
    '  holding — made in the conclusion, still here once that is closed — displays nothing about',
    '  the word. Passing the word on is asked for elsewhere: in the share dialog the header opens',
    '  during play, and in the conclusion.',
    '- `ShareResults.@guarantee TheGridIsAvailableAsText`: the grid shared from the conclusion',
    '  stays on the board as text once the conclusion is put away, where the player is looking.',
    '- `game/DirectManipulation`. The keyboard stories measure the keys; the last story here',
    '  measures what the invariant closes on — that the whole screen is playable at',
    '  `config.narrowest_supported_width` without scrolling sideways, and that every control on',
    '  it is one a finger can find: top to bottom without exception, and across for everything',
    '  but the keys the invariant exempts.',
    '',
    'Every board here is scored by the real `scoreGuess`, so no story can show a result the',
    '`GuessScoring` contract would not produce.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Game/GameScreen',
    component: GameScreen,
    tags: ['autodocs'],
    args: {
      game: PLAYING,
      keyboard: keyboardKnowledge(PLAYING.guesses),
      physicalKeyboard: true,
      notice: null,
      noticeSequence: 0,
      shareable: null,
      announcement: null,
      announcementSequence: 0,
      onletter,
      ondelete,
      onsubmit,
      oncopy,
      ondismissnotice
    },
    argTypes: {
      game: { control: false, description: 'The game on the board. Its answer is never read.' },
      keyboard: { control: false, description: 'One entry per letter of the alphabet.' },
      physicalKeyboard: { control: 'boolean', description: 'Whether typing reaches the board.' },
      notice: { control: false, description: 'What Poodl is saying, if anything.' },
      shareable: {
        control: false,
        description: 'The link or the grid the conclusion made, still here after it was put away.'
      },
      onshowresult: { control: false, description: 'Offered only once a conclusion is closed.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Two guesses in, APP typed into the third row, and the keyboard knowing four letters. -->
<Story name="In progress" />

<!--
  A guess Poodl will not take. No attempt is spent and the letters stay on the
  board, which is the half of the guarantee that is easy to get wrong.
-->
<Story
  name="A guess refused"
  args={{
    game: { ...PLAYING, currentInput: 'qqqqq' },
    notice: { kind: 'guess_rejected', reason: 'not_in_dictionary' },
    noticeSequence: 1
  }}
/>

<!-- Won. The keyboard is off, and the conclusion sits over this in the app. -->
<Story name="Won" args={{ game: WON_GAME, keyboard: keyboardKnowledge(WON_GAME.guesses) }} />

<!-- Lost, with the conclusion closed: the board offers the result again. -->
<Story
  name="Lost, with the result put away"
  args={{ game: LOST_GAME, keyboard: keyboardKnowledge(LOST_GAME.guesses), onshowresult }}
/>

<!--
  The physical keyboard surrendered. TurningThisOffSurrendersTheKeysEntirely
  means the listener is not rendered at all rather than filtered, and the play
  function is the evidence: typing reaches nothing.
-->
<Story
  name="Physical keyboard surrendered"
  args={{ physicalKeyboard: false }}
  play={async ({ canvasElement }) => {
    // PhysicalKeyboardInput.@guarantee TurningThisOffSurrendersTheKeysEntirely
    // PhysicalKeyboardInput.@guarantee TurningThisOffLeavesTheGameFullyPlayable
    onletter.mockClear();
    ondelete.mockClear();
    onsubmit.mockClear();

    await userEvent.keyboard('a{Enter}{Backspace}');

    await expect(onletter).not.toHaveBeenCalled();
    await expect(onsubmit).not.toHaveBeenCalled();
    await expect(ondelete).not.toHaveBeenCalled();

    // And the on-screen keyboard still plays the whole game.
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Q' }));
    await expect(onletter).toHaveBeenCalledWith('q');
  }}
/>

<!-- A word somebody else set. Nothing on the board says which. -->
<Story
  name="A word from a link"
  args={{ game: CUSTOM_GAME, keyboard: keyboardKnowledge(CUSTOM_GAME.guesses) }}
  play={async ({ canvasElement }) => {
    // GameBoard.@guarantee AnswerIsNeverExposedWhileInProgress, which holds for
    // custom games too: the creator's word is hidden the moment the game starts.
    await expect(canvasElement.textContent).not.toContain(CUSTOM_GAME.answer.toUpperCase());
  }}
/>

<!--
  A link made in the conclusion, still on the board after the conclusion was put
  away. The board makes none itself any more: during play that is the share
  dialog's, and a link made there closes with it.
-->
<Story
  name="Holding a link to pass on"
  args={{
    game: LOST_GAME,
    keyboard: keyboardKnowledge(LOST_GAME.guesses),
    onshowresult,
    shareable: LINK_MADE
  }}
  play={async ({ canvasElement }) => {
    // ShareCurrentAnswer.@guarantee TheAnswerIsNeverShownInOrderToShareIt
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('textbox', { name: /link/i })).toHaveValue(LINK);
    await expect(canvas.getByRole('button', { name: 'Show the result again' })).toBeInTheDocument();
    await expect(canvasElement.textContent).not.toContain(ANSWER.toUpperCase());
  }}
/>

<!-- The grid shared from the conclusion, still on the board after the conclusion was put away. -->
<Story
  name="Holding a grid to share"
  args={{
    game: WON_GAME,
    keyboard: keyboardKnowledge(WON_GAME.guesses),
    onshowresult,
    shareable: GRID_MADE
  }}
  play={async ({ canvasElement }) => {
    // ShareResults.@guarantee TheGridIsAvailableAsText
    await expect(within(canvasElement).getByRole('textbox', { name: /result/i })).toHaveValue(GRID);
  }}
/>

<!-- The dark palette, board and keyboard together. -->
<Story
  name="Dark theme"
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>

<!--
  The whole screen at the narrowest viewport the specification supports, framed
  to exactly that width with the gutters `.shell` gives the page.

  The keyboard stories measure the keys. This one measures the claim the
  invariant closes on — that at `config.narrowest_supported_width` the game is
  playable without scrolling sideways — over everything the board can put on the
  screen at once: the board with the most controls on it is a finished one whose
  conclusion was shared from and then put away, holding the link, the notice its
  copy left, and the way back to the result. That is where a five-tile row, a
  notice with its control, a link row, a button and a keyboard get to disagree
  about the space they have.
-->
<Story
  name="At the narrowest supported width"
  args={{
    game: LOST_GAME,
    keyboard: keyboardKnowledge(LOST_GAME.guesses),
    onshowresult,
    shareable: LINK_MADE,
    notice: { kind: 'results_copied' },
    noticeSequence: 1
  }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async ({ canvasElement }) => {
    // game/DirectManipulation.@invariant EveryControlIsAComfortableTarget
    const frame = canvasElement.querySelector<HTMLElement>('[data-frame]');

    if (frame === null) {
      throw new Error('This story has no frame to measure the screen against');
    }

    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);

    /*
     * And every control on it is one a finger can find. Top to bottom that is
     * every control without exception; across, the invariant exempts the keys
     * and only the keys, so the keyboard has to be told apart rather than the
     * measurement dropped for everything. `app.css` declares no inline-size
     * floor — deliberately, because one would be wrong for a key — which is
     * exactly why a narrow toolbar button would otherwise pass here unmeasured.
     */
    const keyboard = within(canvasElement).getByRole('group', { name: 'Keyboard' });

    for (const control of within(canvasElement).getAllByRole('button')) {
      const box = control.getBoundingClientRect();

      await expect(box.height).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);

      if (!keyboard.contains(control)) {
        await expect(box.width).toBeGreaterThanOrEqual(MINIMUM_TOUCH_TARGET);
      }
    }
  }}
>
  {#snippet template(args)}
    <div data-frame style="inline-size: {NARROWEST_SUPPORTED_WIDTH}px; padding-inline: 1rem">
      <GameScreen {...args} />
    </div>
  {/snippet}
</Story>
