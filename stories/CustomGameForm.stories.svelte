<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import CustomGameForm from '../src/lib/components/CustomGameForm.svelte';
  import { LINK } from './fixtures';

  const oncreate = fn();
  const oncopylink = fn();
  const onclose = fn();

  const OVERVIEW = [
    'Setting a word for someone else.',
    '',
    'Governing surface: `CustomGameCreation` in `docs/specs/sharing.allium`.',
    '',
    'Guarantees this component carries:',
    '',
    '- `@guarantee OnlyAcceptedWordsBecomeCustomGames`. A word Poodl does not accept produces no',
    '  link, the refusal is perceivable both visually and to assistive technology, and the entry',
    '  stays put for the creator to correct rather than being cleared.',
    '- `@guarantee TheWordIsNotReadableInTheLink` and `@guarantee TheLinkIsTheWholeGame`, both by',
    '  way of **LinkReady**: the link carries everything the recipient needs and says nothing',
    '  about the word.',
    '- `@guarantee NothingAboutTheLinkIsKept`. The link lives in a notice, and a notice is not',
    '  persisted — closing this loses it, which is the point. A link that is lost is gone.',
    '- `@guarantee FullyKeyboardOperable`. Entering a word, submitting it and copying the',
    '  resulting link, from the keyboard alone.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Sharing/CustomGameForm',
    component: CustomGameForm,
    tags: ['autodocs'],
    args: { notice: null, oncreate, oncopylink, onclose },
    argTypes: {
      notice: { control: false, description: 'The link, the refusal, or nothing yet.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- An empty form, with what Poodl will accept stated before it is typed into. -->
<Story name="Empty" />

<!-- A word Poodl does not accept. The entry is named so it can be corrected. -->
<Story
  name="A word Poodl will not take"
  args={{ notice: { kind: 'custom_answer_rejected', entry: 'qqqqq' } }}
/>

<!-- The link, made. Nothing beside it says the word. -->
<Story name="A link, made" args={{ notice: { kind: 'custom_link_ready', url: LINK } }} />

<!-- Typing a word and submitting it, from the keyboard alone. -->
<Story
  name="Submitted from the keyboard"
  play={async ({ canvasElement }) => {
    // CustomGameCreation.@guarantee FullyKeyboardOperable
    oncreate.mockClear();
    const field = within(canvasElement).getByRole('textbox', { name: /word/i });

    await userEvent.type(field, 'crumb{Enter}');
    await expect(oncreate).toHaveBeenCalledWith('crumb');
  }}
/>
