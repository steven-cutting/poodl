<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import WelcomeScreen from '../src/lib/components/WelcomeScreen.svelte';

  const oncontinue = fn();
  const onnewgame = fn();

  const OVERVIEW = [
    'What a player meets on opening.',
    '',
    'Governing surface: `Welcome` in `docs/specs/game.allium`.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee ContinueAndTheFourModesAreEqualChoices`. There is no question to answer and',
    '  nothing to decline. Continue sits alongside Daily, Random, Endless and Practice as one of',
    '  five choices, each one action away, and Continue names the mode it would resume or start.',
    '- `@guarantee AFirstVisitIsExplained`. The explanation is a framed group around the shared',
    '  `HowToPlay` body, present on every visit rather than a paragraph only a first visit sees —',
    '  the specification asks for it to be "reachable again afterwards rather than being shown',
    '  once and lost". The header’s info button opens the same body in **HowToPlayPanel**.',
    '- `@guarantee CustomGamesAreNotRemembered`. A custom game never becomes the remembered mode,',
    '  so after one, Continue offers the last mode the player chose for themselves. The',
    '  **After a custom game** story is that case.',
    '- `@guarantee FullyKeyboardOperable`, proved by the play function below.',
    '- `daily.allium`’s `@guarantee TheDayIsPerceivable` and `@guarantee ANewDayReplacesTheOldGame`,',
    '  on the same terms **GameNavigation** says them: while the daily game waits off the board,',
    '  how it stands is text beside the choice that would bring it back — or, once the date has',
    '  moved on, end it. The **Today’s daily is waiting** story is the first case.',
    '',
    '`@guarantee ThePreviousModeSurvivesBetweenSessions` and',
    '`@guarantee ShownOnEveryArrivalUntilTurnedOff` are not this component’s to keep: the first',
    'belongs to persistence and the second to the arrival rules. Both are covered in `tests/`.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Game/WelcomeScreen',
    component: WelcomeScreen,
    tags: ['autodocs'],
    args: {
      isFirstVisit: true,
      canContinue: false,
      lastMode: null,
      currentMode: null,
      currentStatus: null,
      oncontinue,
      onnewgame
    },
    argTypes: {
      isFirstVisit: { control: 'boolean', description: 'Nothing played and nothing remembered.' },
      canContinue: { control: 'boolean', description: 'A game to resume, or a mode to start in.' },
      lastMode: { control: false, description: 'The mode the player last chose for themselves.' },
      currentMode: { control: false, description: 'The mode of the game on the board, if any.' },
      currentStatus: { control: false, description: 'Whether that game is still being played.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- A first visit: the explanation, the four modes, and nothing to continue. -->
<Story name="A first visit" />

<!-- A game half played. Continue resumes it, and says which one it would resume. -->
<Story
  name="With a game to resume"
  args={{
    isFirstVisit: false,
    canContinue: true,
    lastMode: 'random',
    currentMode: 'random',
    currentStatus: 'in_progress'
  }}
/>

<!-- A finished game comes back with its conclusion rather than being moved on from. -->
<Story
  name="With a finished game to look at again"
  args={{
    isFirstVisit: false,
    canContinue: true,
    lastMode: 'endless',
    currentMode: 'endless',
    currentStatus: 'won'
  }}
/>

<!-- An empty board and a remembered mode: Continue starts a fresh game in it. -->
<Story
  name="With only a mode remembered"
  args={{ isFirstVisit: false, canContinue: true, lastMode: 'practice' }}
/>

<!--
  After a custom game. Its mode was never remembered — it could not be started
  again — so Continue offers the last mode the player picked themselves.
-->
<Story
  name="After a custom game"
  args={{
    isFirstVisit: false,
    canContinue: true,
    lastMode: 'random',
    currentMode: 'custom',
    currentStatus: 'won'
  }}
/>

<!-- Every choice reachable and invocable from the keyboard alone. -->
<Story
  name="Every choice is reachable by Tab"
  args={{ isFirstVisit: false, canContinue: true, lastMode: 'random' }}
  play={async ({ canvasElement }) => {
    // Welcome.@guarantee FullyKeyboardOperable
    // Welcome.@guarantee ContinueAndTheFourModesAreEqualChoices
    onnewgame.mockClear();
    const canvas = within(canvasElement);
    const choices = canvas.getAllByRole('button');

    await expect(choices).toHaveLength(5);

    for (const choice of choices) {
      await userEvent.tab();
      await expect(choice).toHaveFocus();
    }

    await userEvent.keyboard('{Enter}');
    await expect(onnewgame).toHaveBeenCalledWith('practice');
  }}
/>

<!--
  Today's daily game waits off the board behind a random one. Welcome offers
  Daily, so how the daily game stands is text here before the choice is taken.
-->
<Story
  name="Today's daily is waiting"
  args={{
    isFirstVisit: false,
    canContinue: true,
    lastMode: 'random',
    currentMode: 'random',
    currentStatus: 'in_progress',
    todaysDaily: { day: 7, status: 'in_progress', isCurrent: false, isTodays: true, today: 7 }
  }}
  play={async ({ canvasElement }) => {
    // TodaysGame.@guarantee TheDayIsPerceivable
    const canvas = within(canvasElement);

    await expect(canvas.getByText(/day 7/i)).toBeInTheDocument();
    await expect(canvas.getByText(/waiting where you left it/i)).toBeInTheDocument();
  }}
/>
