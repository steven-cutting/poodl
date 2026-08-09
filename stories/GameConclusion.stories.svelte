<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import GameConclusion from '../src/lib/components/GameConclusion.svelte';

  const onstop = fn();
  const onnewgame = fn();
  const onshareresults = fn();
  const onshareanswer = fn();
  const onclose = fn();

  const OVERVIEW = [
    'The end-of-game modal. Random waits here indefinitely; endless counts down and moves on',
    'unless the player stops it.',
    '',
    'Governing surface: `GameConclusion` in `docs/specs/game.allium`.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee OutcomeAnswerAndAttemptsAreAllShown`, on a win as well as on a loss. Both',
    '  stories below show all three.',
    '- `@guarantee EndlessContinuesUnlessStopped`. The countdown is present only in endless, and',
    '  **Countdown** carries the control itself.',
    '- `@guarantee NoDailyLimit`. Another game is always one action away, whatever the date and',
    '  however many have been played.',
    '- `@guarantee ConclusionIsAnnounced` is **Announcer**’s, not this one’s: the modal shows the',
    '  conclusion and the live region says it.',
    '',
    'It closes, and that is a decision worth stating. The specification gives the modal no',
    'dismissal, but a dialog that trapped the keyboard with no way out would take',
    '`GameNavigation` with it — and that surface carries',
    '`@guarantee ThreeModesCanBeStartedFromHere`. Nothing is lost by closing, because the board',
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
      onstop,
      onnewgame,
      onshareresults,
      onshareanswer,
      onclose
    },
    argTypes: {
      status: { control: false, description: 'Won or lost. Abandoned never reaches a board.' },
      mode: { control: false, description: 'Named only when it is custom.' },
      answer: { control: 'text', description: 'Shown here and nowhere earlier.' },
      attemptsUsed: { control: { type: 'range', min: 1, max: 6 } },
      secondsRemaining: { control: false, description: 'Null in every mode but endless.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- Won on the third attempt, in random. Nothing happens until the player asks. -->
<Story name="Won" />

<!-- Lost, with every attempt spent. The answer is shown either way. -->
<Story name="Lost" args={{ status: 'lost', attemptsUsed: 6 }} />

<!-- Endless, counting down. Stopping is available while it runs. -->
<Story
  name="Endless, counting down"
  args={{ mode: 'endless', repeatMode: 'endless', secondsRemaining: 7 }}
/>

<!--
  A custom game. The marker names the mode and nothing else: it says the word
  came from a link rather than from Poodl.
-->
<Story name="A word from a link" args={{ mode: 'custom', attemptsUsed: 4 }} />

<!-- Every action reachable from the keyboard, and each one doing what it says. -->
<Story
  name="Every action is reachable by Tab"
  play={async ({ canvasElement }) => {
    // GameConclusion.@guarantee FullyKeyboardOperable
    // GameConclusion.@guarantee NoDailyLimit
    onnewgame.mockClear();
    onshareresults.mockClear();
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('dialog', { name: /you won/i })).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'New game' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onnewgame).toHaveBeenCalledWith('random');

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /share results/i })).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await expect(onshareresults).toHaveBeenCalledTimes(1);
  }}
/>
