# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The Allium checker is a project dependency rather than something a contributor is
  assumed to have. `scripts/install_allium.py` pins version 3.5.3 by SHA-256 for each of
  the four supported unix targets and installs the release binary into the gitignored
  `.tools/bin/`; `just install-allium` runs it, `just initialize` calls it, and
  `just check-specs` runs `allium check` over `docs/specs/`. The checksums are computed by
  hand because upstream publishes none for these files, and the two the Homebrew formula
  does publish were cross-checked against them. The recipe reports rather than gates and is
  deliberately absent from `just check`: `allium check` fails on warnings as well as
  errors, offers no way to waive one, and the modules carry a baseline of twenty-five
  diagnostics — recorded in `docs/how-to/work-with-the-specs.md` so a new finding can be
  told from an old one. See
  [decision 0009](docs/decisions/0009-project-managed-allium-cli.md).

- `contract DirectManipulation` from `docs/specs/game.allium` is implemented. A tap performs
  its control's action and nothing besides; pinch-zoom is untouched and the viewport stays
  scalable; every control meets `config.minimum_touch_target` in both directions down to
  `config.narrowest_supported_width`, the on-screen keyboard excepted in the one direction
  the specification exempts it; and a pressed control draws a two-tone ring rather than
  leaving the platform's suppressed tap flash unreplaced. Enter and Delete become glyphs,
  keeping the accessible names they had. Evidence is split across both suites, because
  neither can see the whole contract: `tests/directManipulation.test.ts` measures the
  cascade, and the width stories measure real geometry in Chromium.

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
- Real word lists: 2,394 answers and 11,441 accepted guesses, derived from SCOWL 2020.12.07
  and 12dicts 6.0.2, with their licences carried into the build. `tests/words.test.ts` gains
  the two size floors `words.allium` states, which the placeholders knowingly failed.
- The game's own name is a playable word. `words.allium` names it once, as
  `config.game_name`, and `GameNameIsInTheAnswerList` makes it an ordinary answer: `poodl`
  can be typed, drawn and sent as a custom link. It comes from neither upstream collection,
  so `static/word-lists-NOTICE.txt` says where it does come from.

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
- Storybook as a component workshop, with `storybook-build` and `storybook-test` in
  `just check`, every story rendered in real Chromium with axe over it, and a `stories`
  job in continuous integration. The build the gate makes is proved and discarded.

- Visual review of that workshop in Chromatic, by `just chromatic` and by
  `.github/workflows/chromatic.yml`. A push to `main` sets the baseline; a `/chromatic`
  comment on a pull request publishes that branch for review, for a commenter whose
  effective repository permission is write or better and on a head in this repository. A
  detected change reports and passes, so it is not a required check. See
  [decision 0008](docs/decisions/0008-visual-review-in-chromatic.md).

### Fixed

- The on-screen keyboard scrolled the game sideways on a narrow phone. Width floors of 2rem
  on a letter key and 4rem on Enter and Delete defeat flex-shrink, so the bottom row measured
  416px inside the 320px viewport `game.allium` states as the narrowest supported width. Each
  row now divides its width equally and keeps a gap between keys, and the story run measures
  it at that width rather than trusting that it fits.
- The mark colours failed the WCAG contrast bar against white text, at 3.97, 2.63 and
  4.22 to one. `--mark-text` is now black, measured at 5.29, 7.99 and 4.98, with no hue
  changed. The tile's mark glyph is fully opaque for the same reason.
- The dark-theme plain keyboard key measured 3.49 to one against its text. It is now
  `#6b6d6e`, measured at 4.77 for the text and 3.60 against the page behind it, and a story
  pins the dark theme with a keyboard in it so the gate can see it.
- A key on the on-screen keyboard carried its status in colour and in its accessible name
  but in no shape, which left a sighted colour-blind reader with no assistive technology
  holding only the colour. It carries the same glyph a tile does.
- Closing a panel dropped focus to the document body, so a player who reached Settings by
  keyboard resumed from the top of the page. `Modal` gives focus back to whatever opened it.
- A word Poodl refused left the link made from the previous word on screen beside the
  refusal, still copyable, which read as the link for the word just refused.
  `OnlyAcceptedWordsBecomeCustomGames` says a refused word produces no link.
- The custom-game form was handed the notice and the link the board was showing, so both
  turned up inside a form that made neither — and closing the form threw the board's link
  away. It opens on a surface of its own.
- A stored game was believed about its own marks, so a store that had been written to could
  restore a game that was never won, with a keyboard and a shared grid to match. Every
  stored guess is scored again on load. Stored input is checked for shape as well as length.
- A copy still in flight outlived the text it was copying, so a link or grid put away before
  the clipboard answered reported onto whatever screen the player had moved to — including
  "select the text and copy it yourself" with no text to select. Discarding a shareable
  discards the copy waiting on it.
- The workshop never wrote `data-animations`, so every story rendered the tile reveal's
  off path whatever the toolbar said. It writes it now, from the same derivation the route
  uses, and two Tile stories pin the two paths.
- The whitespace hook was the npm wrapper of `editorconfig-checker`, which carries no binary
  and fetches the newest release on first run — an unpinned dependency inside the gate, and
  a race besides, since `prek` hands a hook's files to several processes at once and the
  wrapper decides whether to download by stat-ing a directory it then creates. On a cold
  cache one process downloaded while its siblings walked into the half-made directory, which
  is how CI failed on a tree nothing had changed. It is the checker's own repository now,
  pinned to v3.11.1 by commit SHA as every other third-party hook is, and built once before
  a file is read.

### Changed

- `DecodeRejectsWhatItDidNotProduce` promised more than a fixed-length token can deliver:
  refusing *every* altered token is not achievable when the tokens that decode are a fixed
  fraction of the strings the alphabet can spell. It now states the three properties that
  hold outright and, in `AlterationIsDetectedToABound`, the bound on the rest. No code
  changed; `tests/links.test.ts` sweeps every single-character alteration of every token
  instead of sampling forty words and tolerating a couple of survivors.

[Unreleased]: https://github.com/steven-cutting/poodl/commits/main/
