<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import Notice from '../src/lib/components/Notice.svelte';

  const ondismiss = fn();

  const OVERVIEW = [
    'What Poodl is telling the player right now, where the player is looking.',
    '',
    'Governing surfaces: `GameBoard` in `docs/specs/game.allium` for',
    '`@guarantee EveryRejectionIsAnnounced`, `CustomGameCreation` in `docs/specs/sharing.allium`',
    'for `@guarantee OnlyAcceptedWordsBecomeCustomGames`, and `ShareResults` for',
    '`@guarantee TheGridIsAvailableAsText`, which asks the copy to report whether it worked.',
    '',
    'It is visible text inside a `role="status"` region, so the sentence itself is the',
    'announcement rather than being duplicated into `Announcer` and heard twice. That split is the',
    'reason a rejection never reaches `Announcer`.',
    '',
    'The region is mounted whether or not there is anything to say, and only its contents come and',
    'go: a live region is heard when the text inside it changes, and one that arrives already',
    'carrying its text has not changed. `sequence` covers the other half — the same sentence twice',
    'changes no text either, so the nodes are replaced instead.',
    '',
    'The custom link is not one of these. It is a thing to copy rather than a sentence to read,',
    'so **LinkReady** carries it.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Shell/Notice',
    component: Notice,
    tags: ['autodocs'],
    args: { ondismiss },
    argTypes: {
      notice: { control: false, description: 'The one thing Poodl is currently saying.' },
      sequence: { control: 'number', description: 'Advances so a repeat is announced again.' },
      ondismiss: { description: 'Omit it and no dismiss control is offered.' }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- Fewer than five letters. No attempt is spent and the letters stay put. -->
<Story
  name="Incomplete guess"
  args={{ notice: { kind: 'guess_rejected', reason: 'incomplete' } }}
/>

<!-- Five letters, but not a word Poodl accepts. -->
<Story
  name="Unknown word"
  args={{ notice: { kind: 'guess_rejected', reason: 'not_in_dictionary' } }}
/>

<!-- A real word that drops a letter the player has already been shown. -->
<Story
  name="Hard mode violation"
  args={{ notice: { kind: 'guess_rejected', reason: 'hard_mode_violation' } }}
/>

<!--
  A word somebody tried to set for a friend that Poodl does not accept. The entry
  is named so it can be corrected rather than retyped from memory.
-->
<Story
  name="Custom answer refused"
  args={{ notice: { kind: 'custom_answer_rejected', entry: 'qqqqq' } }}
/>

<!-- A link that does not decode. CustomLinkEntry offers the way out, not this. -->
<Story name="Link not recognised" args={{ notice: { kind: 'custom_link_invalid' } }} />

<!-- Both outcomes of a copy, because the action has to report either one. -->
<Story name="Copied" args={{ notice: { kind: 'results_copied' } }} />

<Story name="Copy failed" args={{ notice: { kind: 'copy_failed' } }} />

<!-- Dismissal is a control the caller opts into, and it is keyboard reachable. -->
<Story
  name="Dismissed from the keyboard"
  args={{ notice: { kind: 'results_copied' } }}
  play={async ({ canvasElement }) => {
    // GameBoard.@guarantee FullyKeyboardOperable
    ondismiss.mockClear();
    const dismiss = within(canvasElement).getByRole('button', { name: 'Dismiss' });

    await userEvent.tab();
    await expect(dismiss).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    await expect(ondismiss).toHaveBeenCalledTimes(1);
  }}
/>
