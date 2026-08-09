# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The game. Every rule in `docs/specs/` is implemented: four modes, the welcome screen and
  the remembered mode, guess submission with its three rejections, hard mode read live at
  submission with both of its guards, the endless countdown, statistics and the no-repeat
  answer pool, settings for theme, contrast, motion, keyboard handling and arrival, custom
  game links, passing on the word in play, and sharing a result as squares that give
  nothing away.
- `src/lib/app/`: the rules as one pure reducer over one state value, plus the single rune
  shell that wires the ports to it. See
  [decision 0007](docs/decisions/0007-rules-as-a-reducer.md).
- Ports for the device's colour-scheme and reduced-motion preferences, and for a repeating
  timer, each with an in-memory fake.
- Ten components for the ten surfaces that had none, each with its test and its story.
- Persistence for the game, the settings, the statistics and the answer pool, under one key
  with a schema version, tolerant of a store it cannot read.
- Real word lists: 2,393 answers and 11,440 accepted guesses, derived from SCOWL 2020.12.07
  and 12dicts 6.0.2, with their licences carried into the build. `tests/words.test.ts` gains
  the two size floors `words.allium` states, which the placeholders knowingly failed.

- Project scaffolding: SvelteKit with the static adapter, TypeScript in strict mode,
  Vitest under jsdom, ESLint, Prettier and `svelte-check`.
- A walking skeleton: guess scoring and keyboard knowledge implementing their contracts
  from `docs/specs/game.allium`, rendered by the Tile, Board and Keyboard components.
- Ports for storage, randomness, the clock, the clipboard and the word lists, each with
  an in-memory fake.
- Placeholder word lists satisfying every `WordListSource` obligation, with a documented
  replacement procedure.
- `Justfile` task runner and a two-file `prek` hook gate, split into a read-only
  configuration and a mutating counterpart.
- Continuous integration and a GitHub Pages deployment workflow, with every action pinned
  to a commit SHA.
- The documentation handbook, enforced by `scripts/validate_docs.py`.
- The agent contract, enforced by `scripts/validate_agents.py`, with nine skills and
  their provider bridges.
- Storybook as a local component workshop, with `storybook-build` and `storybook-test` in
  `just check`, every story rendered in real Chromium with axe over it, and a `stories`
  job in continuous integration. It is built locally and published nowhere.

### Fixed

- The mark colours failed the WCAG contrast bar against white text, at 3.97, 2.63 and
  4.22 to one. `--mark-text` is now black, measured at 5.29, 7.99 and 4.98, with no hue
  changed. The tile's mark glyph is fully opaque for the same reason.
- The dark-theme plain keyboard key measured 3.49 to one against its text. It is now
  `#6b6d6e`, measured at 4.77 for the text and 3.60 against the page behind it, and a story
  pins the dark theme with a keyboard in it so the gate can see it.
- A key on the on-screen keyboard carried its status in colour and in its accessible name
  but in no shape, which left a sighted colour-blind reader with no assistive technology
  holding only the colour. It carries the same glyph a tile does.

[Unreleased]: https://github.com/steven-cutting/poodl/commits/main/
