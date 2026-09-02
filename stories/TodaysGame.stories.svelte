<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import TodaysGame from '../src/lib/components/TodaysGame.svelte';
  import { dayStart } from '../src/lib/domain/calendar';

  const OVERVIEW = [
    'Which day’s word is on the board, how today’s game stands, and when the next word arrives.',
    '',
    'Governing surface: `TodaysGame` in `docs/specs/daily.allium`. Mounted twice — above the board',
    'while a daily game is being played, and inside **GameConclusion** in place of the ordinary',
    'repeat control once it is over.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee TheDayIsPerceivable`. The day number is text, and so is whether today’s game has',
    '  been played and how it ended. Neither is signalled only by a colour or by which control',
    '  looks selected.',
    '- `@guarantee TheNextWordIsAnnouncedInAdvance`. When the next word arrives is text from the',
    '  moment today’s game is over — read off `next_word_at`, always a local midnight, so what',
    '  varies is the zone’s current offset name rather than the clock reading. Once the date has',
    '  moved on, the **An earlier day’s game** story is the case the guarantee singles out: the',
    '  game is said to be that day’s and today’s word is said to be available, rather than being',
    '  left looking like today’s.',
    '',
    '`daily.allium`’s `@guarantee ThereIsNoNewGameInDaily` — "no control offers a second daily',
    'game... Daily offers... the time the next word arrives" — is why **GameConclusion** mounts',
    'this in place of its repeat control. See its "Daily, finished for today" story.'
  ].join('\n');

  const TODAYS = {
    today: 4,
    keptDay: 4,
    keptStatus: 'won' as const,
    keptIsCurrent: true,
    isTodays: true,
    nextWordAt: dayStart(5)
  };

  const { Story } = defineMeta({
    title: 'Game/TodaysGame',
    component: TodaysGame,
    tags: ['autodocs'],
    args: { todaysGame: TODAYS },
    argTypes: {
      todaysGame: { control: false, description: 'The whole TodaysGame surface, as one value.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Today's game, won, and the next word on its way. -->
<Story
  name="Won, and tomorrow's word"
  play={async ({ canvasElement }) => {
    // TodaysGame.@guarantee TheDayIsPerceivable
    // TodaysGame.@guarantee TheNextWordIsAnnouncedInAdvance
    const canvas = within(canvasElement);

    await expect(canvas.getByText(/day 4/i)).toBeInTheDocument();
    await expect(canvas.getByText(/won/i)).toBeInTheDocument();
    await expect(canvas.getByText(/tomorrow's word arrives/i)).toBeInTheDocument();
  }}
/>

<!-- Under way: the day is readable while it is being played, not only after. -->
<Story
  name="Under way"
  args={{ todaysGame: { ...TODAYS, keptStatus: 'in_progress' } }}
  play={async ({ canvasElement }) => {
    // TodaysGame.@guarantee TheDayIsPerceivable
    await expect(within(canvasElement).getByText(/under way/i)).toBeInTheDocument();
  }}
/>

<!-- Lost, which is still "how it ended". -->
<Story name="Lost" args={{ todaysGame: { ...TODAYS, keptStatus: 'lost' } }} />

<!--
  TheNextWordIsAnnouncedInAdvance's second sentence: the date has moved on and
  yesterday's game is still on the board. It is said to be that day's, and
  today's word is said to be available — announcing "tomorrow's word" over it
  would leave it looking like today's, and name a time a day too late.
-->
<Story
  name="An earlier day's game"
  args={{ todaysGame: { ...TODAYS, today: 5, keptDay: 4, isTodays: false } }}
  play={async ({ canvasElement }) => {
    // TodaysGame.@guarantee TheNextWordIsAnnouncedInAdvance
    const canvas = within(canvasElement);

    await expect(canvas.getByText(/day 4/i)).toBeInTheDocument();
    await expect(canvas.getByText(/available now/i)).toBeInTheDocument();
    await expect(canvas.queryByText(/tomorrow's word arrives/i)).not.toBeInTheDocument();
  }}
/>
