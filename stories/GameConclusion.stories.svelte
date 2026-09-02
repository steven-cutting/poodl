<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import GameConclusion from '../src/lib/components/GameConclusion.svelte';
  import { dayStart } from '../src/lib/domain/calendar';
  import { GRID, GRID_MADE, LINK, LINK_MADE } from './fixtures';

  const onstop = fn();
  const onnewgame = fn();
  const onshareresults = fn();
  const onshareanswer = fn();
  const onclose = fn();
  const oncopy = fn();

  const OVERVIEW = [
    'The end-of-game modal. Random waits here indefinitely; endless counts down and moves on',
    'unless the player stops it.',
    '',
    'Governing surface: `GameConclusion` in `docs/specs/game.allium`. The footer’s two share',
    'actions are `ShareCurrentAnswer`’s and `ShareResults`’ in `docs/specs/sharing.allium`: the',
    'modal is one of the two ways in to the first, and the only way in to the second.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee OutcomeAnswerAndAttemptsAreAllShown`, on a win as well as on a loss. Both',
    '  stories below show all three.',
    '- `@guarantee EndlessContinuesUnlessStopped`. The countdown is present only in endless, and',
    '  **Countdown** carries the control itself.',
    '- `@guarantee NothingButDailyIsRationed`. Outside Daily, another game is always one action',
    '  away, whatever the date and however many have been played. Inside it,',
    '  `daily.allium`’s `@guarantee ThereIsNoNewGameInDaily` withholds exactly the repeat control —',
    '  the **Daily, finished for today** story shows **TodaysGame** standing in its place.',
    '- `@guarantee ConclusionIsAnnounced` is **Announcer**’s, not this one’s: the modal shows the',
    '  conclusion and the live region says it.',
    '- `ShareCurrentAnswer.@guarantee FullyKeyboardOperable` and',
    '  `ShareResults.@guarantee TheGridIsAvailableAsText`, for what the footer makes: the link and',
    '  the grid are shown in here, as text, and the keyboard reaches every action.',
    '',
    'It closes, and that is a decision worth stating. The specification gives the modal no',
    'dismissal, but a dialog that trapped the keyboard with no way out would take',
    '`GameNavigation` with it — and that surface carries',
    '`@guarantee FourModesCanBeStartedFromHere`. Nothing is lost by closing, because the board',
    'offers the result again for as long as the finished game is on it, which is what',
    '`@guarantee ContinuingNeverCostsAGame` means by a game coming back with its conclusion still',
    'showing.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Game/GameConclusion',
    component: GameConclusion,
    tags: ['autodocs'],
    args: {
      status: 'won',
      mode: 'random',
      answer: 'apple',
      attemptsUsed: 3,
      secondsRemaining: null,
      repeatMode: 'random',
      todaysGame: null,
      onstop,
      onnewgame,
      onshareresults,
      onshareanswer,
      onclose,
      oncopy,
      notice: null,
      noticeSequence: 0,
      shareable: null
    },
    argTypes: {
      status: { control: false, description: 'Won or lost. Abandoned never reaches a board.' },
      mode: { control: false, description: 'Named only when it is custom.' },
      answer: { control: 'text', description: 'Shown here and nowhere earlier.' },
      attemptsUsed: { control: { type: 'range', min: 1, max: 6 } },
      secondsRemaining: { control: false, description: 'Null in every mode but endless.' },
      todaysGame: { control: false, description: 'The TodaysGame surface. Daily only.' },
      notice: { control: false, description: 'What Poodl is saying about the last copy.' },
      shareable: { control: false, description: 'What either sharing action produced.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- Won on the third attempt, in random. Nothing happens until the player asks. -->
<Story name="Won" />

<!-- Lost, with every attempt spent. The answer is shown either way. -->
<Story name="Lost" args={{ status: 'lost', attemptsUsed: 6 }} />

<!--
  Endless, counting down. Stopping is available while it runs, and closing is
  not: the stop control is in here, so a modal that could be closed out from
  under a running countdown would put it out of reach.
-->
<Story
  name="Endless, counting down"
  args={{ mode: 'endless', repeatMode: 'endless', secondsRemaining: 7 }}
  play={async ({ canvasElement }) => {
    // GameConclusion.@guarantee EndlessContinuesUnlessStopped
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    await expect(canvas.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  }}
/>

<!--
  A custom game. The marker names the mode and nothing else: it says the word
  came from a link rather than from Poodl.
-->
<Story name="A word from a link" args={{ mode: 'custom', attemptsUsed: 4 }} />

<!--
  ThereIsNoNewGameInDaily: no repeat control for a finished daily game — the
  time the next word arrives stands in its place instead.
-->
<Story
  name="Daily, finished for today"
  args={{
    mode: 'daily',
    repeatMode: 'daily',
    todaysGame: {
      today: 2,
      keptDay: 2,
      keptStatus: 'won',
      keptIsCurrent: true,
      isTodays: true,
      nextWordAt: dayStart(3)
    }
  }}
  play={async ({ canvasElement }) => {
    // GameConclusion.@guarantee ThereIsNoNewGameInDaily
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('button', { name: 'New game' })).not.toBeInTheDocument();
    await expect(canvas.getByText(/tomorrow's word arrives/i)).toBeInTheDocument();
  }}
/>

<!--
  The link a share produced, shown in here rather than on the board. This dialog
  keeps the keyboard inside itself, so a link rendered behind it would be
  unreachable until it was closed — and while a countdown runs it cannot be.
-->
<Story
  name="A link, made from here"
  args={{ shareable: LINK_MADE }}
  play={async ({ canvasElement }) => {
    // ShareCurrentAnswer.@guarantee FullyKeyboardOperable
    const dialog = within(canvasElement).getByRole('dialog');

    await expect(within(dialog).getByRole('textbox', { name: /link/i })).toHaveValue(LINK);
  }}
/>

<!--
  The grid a share produced, shown as text rather than only placed on the
  clipboard: a player using a screen reader can read it before they send it, and
  anyone can select it by hand.
-->
<Story
  name="A grid, shared from here"
  args={{ shareable: GRID_MADE }}
  play={async ({ canvasElement }) => {
    // ShareResults.@guarantee TheGridIsAvailableAsText
    const dialog = within(canvasElement).getByRole('dialog');

    await expect(within(dialog).getByRole('textbox', { name: /result/i })).toHaveValue(GRID);
  }}
/>

<!--
  And what a copy reports, in the place the copy was asked for. The grid stays
  put: the message sends the player to text they select themselves, so the text
  has to outlive the attempt.
-->
<Story
  name="A copy that failed"
  args={{ shareable: GRID_MADE, notice: { kind: 'copy_failed' }, noticeSequence: 1 }}
  play={async ({ canvasElement }) => {
    // ShareResults.@guarantee TheGridIsAvailableAsText
    const dialog = within(canvasElement).getByRole('dialog');

    await expect(within(dialog).getByRole('status')).toHaveTextContent(/could not/i);
    await expect(within(dialog).getByRole('textbox', { name: /result/i })).toHaveValue(GRID);
  }}
/>

<!-- Every action reachable from the keyboard, and each one doing what it says. -->
<Story
  name="Every action is reachable by Tab"
  play={async ({ canvasElement }) => {
    // GameConclusion.@guarantee FullyKeyboardOperable
    // GameConclusion.@guarantee NothingButDailyIsRationed
    // ShareCurrentAnswer.@guarantee FullyKeyboardOperable
    onnewgame.mockClear();
    onshareresults.mockClear();
    onshareanswer.mockClear();
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('dialog', { name: /you won/i })).toHaveFocus();

    // Close sits in the dialog's header row, so it is the first stop; the
    // actions ride in the footer after the outcome.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Close' })).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'New game' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onnewgame).toHaveBeenCalledWith('random');

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /share results/i })).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await expect(onshareresults).toHaveBeenCalledTimes(1);

    // The other way in to ShareCurrentAnswer, once the game is over.
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /share the word/i })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onshareanswer).toHaveBeenCalledTimes(1);
  }}
/>
