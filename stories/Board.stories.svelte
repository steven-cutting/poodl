<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Board from '../src/lib/components/Board.svelte';
  import { IN_PROGRESS, LOST, WON, played } from './fixtures';

  const OVERVIEW = [
    'The grid: one row per attempt whether played or not, and the only place that says how many',
    'attempts are left.',
    '',
    'Governing surface: `GameBoard` in `docs/specs/game.allium`. Every board below is built by',
    '`played()`, which runs the real `scoreGuess` from `src/lib/domain/scoring.ts`, so no story',
    'can show a result the `GuessScoring` contract would not produce.',
    '',
    'Guarantees this component carries today:',
    '',
    '- `@guarantee EverySubmittedGuessIsAnnounced`. Each row is a list item labelled with the',
    '  attempt number and its per-letter results in reading order, and a counter states how many',
    '  attempts are used and how many remain.',
    '- `@guarantee AnswerIsNeverExposedWhileInProgress`. The board is handed guesses and typed',
    '  letters, never the answer. The **In progress** story asserts that unreached rows stay',
    '  empty.',
    '- `@guarantee ResultsAreNeverConveyedByColourAlone`, carried by **Tile**, one per position.',
    '',
    'Also `GameBoard` guarantees, undischarged because the behaviour is unimplemented rather',
    'than because they belong elsewhere: `@guarantee EveryRejectionIsAnnounced`,',
    '`@guarantee InProgressGameSurvivesReload` and',
    '`@guarantee MotionRespectsTheReducedMotionPreference`.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Game/Board',
    component: Board,
    tags: ['autodocs'],
    argTypes: {
      guesses: {
        control: false,
        description: 'Guesses submitted so far, already scored by the real scoreGuess.'
      },
      currentInput: {
        control: 'text',
        description: 'Letters typed into the next row and not yet submitted.'
      }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Before the first guess: six empty rows, six attempts remaining. -->
<Story name="Empty" />

<!--
  Two guesses in, with APP typed into the third row. That row carries letters and
  no marks, because nothing about it has been scored yet — the difference between
  "typed" and "submitted" is visible without reading any colour.
-->
<Story
  name="In progress"
  args={{ guesses: played(IN_PROGRESS), currentInput: 'app' }}
  play={async ({ canvasElement }) => {
    // GameBoard.@guarantee AnswerIsNeverExposedWhileInProgress
    // Rows the player has not reached stay empty. A letter or a mark on an
    // unplayed row would be the answer arriving before it was earned.
    const rows = within(canvasElement).getAllByRole('listitem');

    for (const row of rows.slice(3)) {
      await expect(row).toHaveAccessibleName(/empty$/);
    }
  }}
/>

<!-- Won on the third attempt: every position of the last played row is correct. -->
<Story name="Won on the third attempt" args={{ guesses: played(WON) }} />

<!--
  Lost: all six attempts spent, so there is no unsubmitted row left to type into.
  APPLY misses APPLE by its final letter, which is the losing board worth looking
  at.
-->
<Story name="Lost, every attempt spent" args={{ guesses: played(LOST) }} />

<!--
  The same losing board in the dark theme. Pinned, and rendered in its own iframe
  on the docs page, because the appearance globals are written to the shared
  documentElement.
-->
<Story
  name="Lost, dark theme"
  args={{ guesses: played(LOST) }}
  globals={{ theme: 'dark' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async () => {
    // The appearance globals are only useful if they reach the element
    // `src/app.css` keys on. Nothing else in this suite would notice if they
    // stopped: both palettes pass the accessibility check, so a global that
    // silently did nothing would leave every story green.
    await expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  }}
/>
