<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Announcer from '../src/lib/components/Announcer.svelte';

  const OVERVIEW = [
    'The live region. It has nothing to show and everything to say.',
    '',
    'Governing surfaces: `GameBoard` in `docs/specs/game.allium`, for',
    '`@guarantee EverySubmittedGuessIsAnnounced`, and `GameConclusion` for',
    '`@guarantee ConclusionIsAnnounced`.',
    '',
    'It is visually hidden on purpose. Everything it says is already on the screen in another',
    'form — the marks are on the board, the conclusion is in the modal — so repeating it in',
    'sight would be noise, and omitting it would leave a reader without the board.',
    '',
    'The sequence number is the whole of the design. A live region is heard when its text',
    'changes, so the same sentence twice would be announced once; the `{#key}` replaces the node',
    'instead. Nothing on this page can show that, which is why the engine suite owns it — see',
    '`tests/gameplay.test.ts`, "says the same thing again when the same rejection repeats".'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/Announcer',
    component: Announcer,
    tags: ['autodocs'],
    argTypes: {
      message: { control: 'text', description: 'What the region says next, or null for nothing.' },
      sequence: {
        control: 'number',
        description: 'Advances on every announcement, so a repeat is heard again.'
      }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Nothing to say yet. The region exists so that it is there when there is. -->
<Story name="Silent" args={{ message: null, sequence: 0 }} />

<!-- What a submitted guess sounds like: the results, the attempt, what is left. -->
<Story
  name="A submitted guess"
  args={{
    message: 'Attempt 1: A correct, D absent, O absent, P present, T absent. 5 attempts remaining.',
    sequence: 1
  }}
  play={async ({ canvasElement }) => {
    // GameBoard.@guarantee EverySubmittedGuessIsAnnounced. The region is
    // hidden, so this is the only place its content can be checked by eye.
    const region = within(canvasElement).getByRole('status');

    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(region).toHaveTextContent('5 attempts remaining');
  }}
/>

<!-- And what the end of a game sounds like. -->
<Story
  name="A conclusion"
  args={{
    message:
      'Attempt 3: A correct, P correct, P correct, L correct, E correct. 3 attempts remaining. You won in 3 attempts. The answer was APPLE.',
    sequence: 2
  }}
/>
