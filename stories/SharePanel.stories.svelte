<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, fn, userEvent, within } from 'storybook/test';

  import SharePanel from '../src/lib/components/SharePanel.svelte';
  import { LINK_MADE } from './fixtures';

  const onshareanswer = fn();
  const oncreate = fn();
  const oncopy = fn();
  const onclose = fn();

  const OVERVIEW = [
    'Sharing a game: the one on the board, or one built on a word of your own.',
    '',
    'Governing surfaces: `CustomGameCreation` and, while a game is on the board,',
    '`ShareCurrentAnswer`, both in `docs/specs/sharing.allium`. The end-of-game modal keeps its',
    'own way in to `ShareCurrentAnswer`; this is the way in during play.',
    '',
    'Guarantees this component carries:',
    '',
    '- `ShareCurrentAnswer.@guarantee AvailableInEveryModeAndForAsLongAsTheGameIsOnTheBoard`.',
    '  **This game** is offered whenever the caller says there is a game — in every mode, from',
    '  before the first guess through to after the game is over — and withdrawn, section and',
    '  all, when there is none. The **No game to pass on** story is that state.',
    '- `ShareCurrentAnswer.@guarantee TheAnswerIsNeverShownInOrderToShareIt`. Nothing here is',
    '  handed the game, let alone its answer; asking for a link displays nothing about the word.',
    '- `@guarantee OnlyAcceptedWordsBecomeCustomGames`. A word Poodl does not accept produces no',
    '  link, the refusal is perceivable both visually and to assistive technology, and the entry',
    '  stays put for the creator to correct rather than being cleared.',
    '- `@guarantee TheWordIsNotReadableInTheLink` and `@guarantee TheLinkIsTheWholeGame`, both by',
    '  way of **LinkReady**: the link carries everything the recipient needs and says nothing',
    '  about the word.',
    '- `@guarantee NothingAboutTheLinkIsKept`. The link is state Poodl holds for as long as it is',
    '  showing it, and none of that is persisted — closing this loses it, which is the point. A',
    '  link that is lost is gone.',
    '- `@guarantee FullyKeyboardOperable`, on both surfaces. Asking for a link, entering a word,',
    '  submitting it and copying the resulting link, from the keyboard alone.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Sharing/SharePanel',
    component: SharePanel,
    tags: ['autodocs'],
    args: { notice: null, shareable: null, onshareanswer, oncreate, oncopy, onclose },
    argTypes: {
      notice: { control: false, description: 'The refusal, or nothing yet.' },
      shareable: { control: false, description: 'The link, once there is one.' },
      onshareanswer: { control: false, description: 'Offered only while a game is on the board.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- Both sections, with nothing made yet: a game on the board, and an empty field. -->
<Story name="Empty" />

<!-- No game on the board, so nothing to pass on: only a word of your own is offered. -->
<Story name="No game to pass on">
  {#snippet template(args)}
    <SharePanel {...args} onshareanswer={undefined} />
  {/snippet}
</Story>

<!-- A word Poodl does not accept. The entry is named so it can be corrected. -->
<Story
  name="A word Poodl will not take"
  args={{ notice: { kind: 'custom_answer_rejected', entry: 'qqqqq' } }}
/>

<!-- The link, made. Nothing beside it says the word. -->
<Story name="A link, made" args={{ shareable: LINK_MADE }} />

<!-- Asking for a link to the game on the board. -->
<Story
  name="Passing the word on"
  play={async ({ canvasElement }) => {
    // ShareCurrentAnswer.@guarantee FullyKeyboardOperable
    onshareanswer.mockClear();
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: /make a link to this game/i }));
    await expect(onshareanswer).toHaveBeenCalledTimes(1);
  }}
/>

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
