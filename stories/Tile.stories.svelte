<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';

  import Tile from '../src/lib/components/Tile.svelte';

  const OVERVIEW = [
    'One position of one row of the board: a letter, what scoring made of it, and nothing else.',
    '',
    'Governing surface: `GameBoard` in `docs/specs/game.allium`. The specification is a source',
    'file rather than a page this Storybook serves, so it is named here rather than linked, and',
    'its clauses are cited by name so there is only ever one copy of the words.',
    '',
    'Guarantees this component carries today:',
    '',
    '- `@guarantee ResultsAreNeverConveyedByColourAlone`. A tile says the same thing three ways:',
    '  a colour, a glyph, and an accessible name ending in *correct*, *in the word, wrong place*',
    '  or *not in the word*. The **Every mark side by side** story is the only place all three',
    '  sit together, which is the only way to see that the difference is not the colour.',
    '- `@guarantee EverySubmittedGuessIsAnnounced`, in part. The tile is an image whose',
    '  accessible name carries the position, the letter and the mark. The row label and the',
    '  attempt count belong to **Board**.',
    '- `@guarantee AnswerIsNeverExposedWhileInProgress`, structurally. A tile is never handed',
    '  the answer, only its own letter and mark.',
    '',
    '- `@guarantee MotionRespectsTheReducedMotionPreference`, which names tile animations',
    '  explicitly. The reveal runs only while `:root` carries `data-animations="on"`, which the',
    '  route writes from `Appearance.animations_active` — the animations setting and the',
    "  device's reduced-motion preference taken together, and the device wins. The **Animations**",
    '  toolbar control writes the same attribute here, so the two stories below are the two',
    '  paths. The **Reduced motion** control is a simulation of the device half and is evidence',
    '  for nothing; `tests/appearance.test.ts` holds the derivation itself.'
  ].join('\n');

  const { Story } = defineMeta({
    title: 'Game/Tile',
    component: Tile,
    tags: ['autodocs'],
    args: { position: 1 },
    argTypes: {
      letter: {
        control: 'text',
        description: 'The letter to show. Empty means nothing has been typed here yet.'
      },
      mark: {
        control: 'radio',
        options: ['correct', 'present', 'absent'],
        description: 'What scoring made of the letter. Unset until the guess has been submitted.'
      },
      position: {
        control: { type: 'number', min: 1, max: 5 },
        description: 'The 1-based position in the row, spoken as part of the accessible name.'
      }
    },
    parameters: { docs: { description: { component: OVERVIEW } } }
  });
</script>

<!-- A position nobody has typed into. Its accessible name is "Position 3, empty". -->
<Story name="Empty" args={{ position: 3 }} />

<!-- Typed but not submitted: a letter, no mark, no glyph, no colour. -->
<Story name="Typed, not yet scored" args={{ position: 1, letter: 'a' }} />

<!-- The letter is in the answer at this position. -->
<Story name="Correct" args={{ position: 1, letter: 'a', mark: 'correct' }} />

<!-- In the answer, but elsewhere. -->
<Story name="Present" args={{ position: 2, letter: 'p', mark: 'present' }} />

<!-- Not in the answer at all. -->
<Story name="Absent" args={{ position: 3, letter: 't', mark: 'absent' }} />

<!--
  All three marks at once. Read this story in greyscale and it stays readable:
  each tile carries a different glyph, and each says what it is when read aloud.
  One mark on its own proves nothing; three side by side is what makes the
  guarantee visible.
-->
<Story
  name="Every mark side by side"
  asChild
  play={async ({ canvasElement }) => {
    // GameBoard.@guarantee ResultsAreNeverConveyedByColourAlone
    // The accessible names are covered by tests/components.test.ts. What only a
    // rendered story can show is the second, visual signal.
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('img', { name: 'Position 1, A, correct' })).toHaveTextContent(
      '■'
    );
    await expect(
      canvas.getByRole('img', { name: 'Position 2, P, in the word, wrong place' })
    ).toHaveTextContent('▲');
    await expect(
      canvas.getByRole('img', { name: 'Position 3, T, not in the word' })
    ).toHaveTextContent('×');
  }}
>
  <div class="marks">
    <Tile position={1} letter="a" mark="correct" />
    <Tile position={2} letter="p" mark="present" />
    <Tile position={3} letter="t" mark="absent" />
  </div>
</Story>

<!--
  The same three marks under the high-contrast palette, which `settings.allium`
  puts behind one preference. `Appearance.@guarantee AppearanceNeverCarriesMeaningAlone`:
  swapping the palette changes the colours and nothing else — the glyphs and the
  accessible names are unchanged, because they were never the colour.

  Pinned with `globals`, which beats the toolbar and disables the matching
  control while this story is selected. `docs.story.inline` is false so the docs
  page renders it in its own iframe: several stories on one page share a
  documentElement, and the appearance globals are written there.
-->
<Story
  name="Every mark side by side, high contrast"
  asChild
  globals={{ highContrast: 'on' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async ({ canvasElement }) => {
    // Appearance.@guarantee AppearanceNeverCarriesMeaningAlone
    // The palette reaches :root, and swapping it changes the colours and
    // nothing else — the same glyphs and the same names as the story above.
    await expect(document.documentElement).toHaveAttribute('data-high-contrast', 'true');

    const canvas = within(canvasElement);

    await expect(canvas.getByRole('img', { name: 'Position 1, A, correct' })).toHaveTextContent(
      '■'
    );
    await expect(
      canvas.getByRole('img', { name: 'Position 3, T, not in the word' })
    ).toHaveTextContent('×');
  }}
>
  <div class="marks">
    <Tile position={1} letter="a" mark="correct" />
    <Tile position={2} letter="p" mark="present" />
    <Tile position={3} letter="t" mark="absent" />
  </div>
</Story>

<!--
  `GameBoard.@guarantee MotionRespectsTheReducedMotionPreference`, both ways.

  A scored tile reveals itself with a rotation, and the reveal is gated on the
  attribute the route derives rather than on a media query of its own. These two
  stories pin the attribute either way, so the workshop renders both paths — and
  without the pin every story would silently take whichever one the toolbar was
  left on. What the play function can check is the gate; whether the frames are
  pleasant is what the story is for.
-->
<Story
  name="Scored, with motion"
  args={{ position: 1, letter: 'a', mark: 'correct' }}
  globals={{ animations: 'on', reducedMotion: 'follow' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async ({ canvasElement }) => {
    await expect(document.documentElement).toHaveAttribute('data-animations', 'on');

    const tile = within(canvasElement).getByRole('img', { name: 'Position 1, A, correct' });

    // Svelte scopes the keyframes name, so the assertion is that one is running
    // rather than which one it is called this build.
    await expect(getComputedStyle(tile).animationName).not.toBe('none');
  }}
/>

<Story
  name="Scored, motion reduced"
  args={{ position: 1, letter: 'a', mark: 'correct' }}
  globals={{ animations: 'on', reducedMotion: 'reduce' }}
  parameters={{ docs: { story: { inline: false } } }}
  play={async ({ canvasElement }) => {
    // The device wins: the attribute is absent even with the setting on.
    await expect(document.documentElement).not.toHaveAttribute('data-animations');

    const tile = within(canvasElement).getByRole('img', { name: 'Position 1, A, correct' });

    await expect(getComputedStyle(tile).animationName).toBe('none');
  }}
/>

<style>
  .marks {
    display: flex;
    gap: 0.35rem;
  }
</style>
