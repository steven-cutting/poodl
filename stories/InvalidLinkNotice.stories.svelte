<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import InvalidLinkNotice from '../src/lib/components/InvalidLinkNotice.svelte';

  const onaccept = fn();
  const ondismiss = fn();

  const OVERVIEW = [
    'A link that does not decode.',
    '',
    'Governing surface: `CustomLinkEntry` in `docs/specs/sharing.allium`.',
    '',
    'Guarantee this component carries: `@guarantee InvalidLinksAreExplainedAndSurvivable`. It',
    'says the link is not a Poodl link rather than failing silently or starting some other game,',
    'and offers a random game as a way out rather than leaving the player on a dead end. The',
    'explanation is perceivable both visually and to assistive technology, which is what the',
    '`alert` role is for here: the player did not ask for this and needs to hear it now.',
    '',
    'It never guesses. `@invariant DecodeRejectsWhatItDidNotProduce` means a token this scheme',
    'did not produce decodes to nothing at all, so this is the only thing there is to say.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Sharing/InvalidLinkNotice',
    component: InvalidLinkNotice,
    tags: ['autodocs'],
    args: { onaccept, ondismiss },
    argTypes: {
      onaccept: { description: 'Starts a random game — the way out.' },
      ondismiss: { description: 'Leaves the player where they were.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- The refusal, and the way out beside it. -->
<Story name="A link that did not decode" />

<!-- Both actions reachable from the keyboard. -->
<Story
  name="The way out is reachable by Tab"
  play={async ({ canvasElement }) => {
    // CustomLinkEntry.@guarantee InvalidLinksAreExplainedAndSurvivable
    onaccept.mockClear();
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('alert')).toHaveTextContent(/not a poodl link/i);

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /random game/i })).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(onaccept).toHaveBeenCalledTimes(1);
  }}
/>
