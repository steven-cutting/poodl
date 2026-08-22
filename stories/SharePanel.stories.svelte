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
    '- `ShareCurrentAnswer` exposes `current_game.mode` and `current_game.status`, and the section',
    '  says them — "Playing random." or "Practice game finished." — because the header chip that',
    '  carries them is outside the dialog. The **This game, finished** story is the other',
    '  phrasing.',
    '- `ShareCurrentAnswer.@guarantee TheAnswerIsNeverShownInOrderToShareIt`. Nothing here is',
    '  handed the game — its mode and status only — let alone its answer; asking for a link',
    '  displays nothing about the word.',
    '- `@guarantee OnlyAcceptedWordsBecomeCustomGames`. A word Poodl does not accept produces no',
    '  link, the refusal is perceivable both visually and to assistive technology, and the entry',
    '  stays put for the creator to correct rather than being cleared.',
    '- `@guarantee TheWordIsNotReadableInTheLink` and `@guarantee TheLinkIsTheWholeGame`, both by',
    '  way of **LinkReady**: the link carries everything the recipient needs and says nothing',
    '  about the word.',
    '- `@guarantee NothingAboutTheLinkIsKept`. The link is state Poodl holds for as long as it is',
    '  showing it, and none of that is persisted — closing this loses it, which is the point. It',
    '  is the link that is not kept, and only that: the game on the board is persisted with its',
    '  answer, so a link made from **This game** can be made again.',
    '- `@guarantee FullyKeyboardOperable`, on both surfaces. Asking for a link, entering a word,',
    '  submitting it and copying the resulting link, from the keyboard alone.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Sharing/SharePanel',
    component: SharePanel,
    tags: ['autodocs'],
    args: {
      notice: null,
      shareable: null,
      mode: 'random',
      status: 'in_progress',
      onshareanswer,
      oncreate,
      oncopy,
      onclose
    },
    argTypes: {
      notice: { control: false, description: 'The refusal, or nothing yet.' },
      shareable: { control: false, description: 'The link, once there is one.' },
      mode: { control: false, description: 'The mode of the game on the board, if any.' },
      status: { control: false, description: 'Whether that game is still being played.' },
      onshareanswer: { control: false, description: 'Offered only while a game is on the board.' }
    },
    parameters: { docs: { description: { component: OVERVIEW }, story: { inline: false } } }
  });
</script>

<!-- Both sections, with nothing made yet: a game on the board, and an empty field. -->
<Story name="Empty" />

<!-- A finished game, its conclusion put away: the section says so, in the other phrasing. -->
<Story
  name="This game, finished"
  args={{ mode: 'practice', status: 'won' }}
  play={async ({ canvasElement }) => {
    // ShareCurrentAnswer exposes current_game.mode and current_game.status.
    await expect(within(canvasElement).getByRole('dialog')).toHaveTextContent(
      'Practice game finished.'
    );
  }}
/>

<!-- No game on the board, so nothing to pass on: only a word of your own is offered. -->
<Story name="No game to pass on">
  {#snippet template(args)}
    <SharePanel {...args} mode={null} status={null} onshareanswer={undefined} />
  {/snippet}
</Story>

<!-- A word Poodl does not accept. The entry is named so it can be corrected. -->
<Story
  name="A word Poodl will not take"
  args={{ notice: { kind: 'custom_answer_rejected', entry: 'qqqqq' } }}
/>

<!-- The link, made. Nothing beside it says the word. -->
<Story name="A link, made" args={{ shareable: LINK_MADE }} />

<!--
  Asking for a link to the game on the board, from the keyboard alone. Close is
  the dialog's first stop, and This game comes before the field, as the design
  orders it.
-->
<Story
  name="Passing the word on"
  play={async ({ canvasElement }) => {
    // ShareCurrentAnswer.@guarantee FullyKeyboardOperable
    onshareanswer.mockClear();
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('dialog', { name: 'Share a game' })).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Close' })).toHaveFocus();

    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Make a link to this game' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
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
