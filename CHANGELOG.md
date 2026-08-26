# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- The Biscuit Games design system, ported from its Claude Design project per
  [decision 0010](docs/decisions/0010-biscuit-games-design-system.md). `src/app.css`
  carries the full token vocabulary — pure neutrals and the biscuit ramp, result hues
  chosen dark-first, type, space, form and motion scales — with Bricolage Grotesque and
  Instrument Sans committed as latin-subset variable woff2 files and 22 restroked Lucide
  icons under `src/lib/assets/`. New primitives (`Icon`, `IconButton`, `Button`,
  `Wordmark`, `HeaderBar`, `HowToPlay`) land with their tests and stories; `Modal` takes
  the dialog shape with Close first and a rule-separated footer, `Notice` the toast shape,
  and every component draws from tokens rather than its own border-and-fill CSS. The page
  gains the platform header — brand lockup, mode chip, and the four actions — and
  `GameNavigation` becomes the dialog the chip opens, keeping its surface and its
  guarantees. A `Foundations` story documents the tokens, and
  [Port a design system component](docs/how-to/port-a-design-system-component.md) records
  the procedure and the ledger of what remains. The landing page at the domain root moves
  with it: it already wore `src/app.css`, so it takes the new tokens and the display face,
  and `scripts/stage_site.sh` copies the three font files beside the stylesheet it copies.

- The Allium checker is a project dependency rather than something a contributor is
  assumed to have. `scripts/install_allium.py` pins version 3.5.3 by SHA-256 for each of
  the four supported unix targets and installs the release binary into the gitignored
  `.tools/bin/`, staging the download beside the installed copy and swapping it in only
  once both its checksum and the version it reports agree with the pin, so a failed install
  leaves a working one alone; `just install-allium` runs it, `just initialize` calls it,
  `just check-specs` runs `allium check` over `docs/specs/`, and `just analyse-specs` runs
  `allium analyse` over them for process completeness — data flow, reachability, deadlocks
  and conflicts. The checksums are computed by hand because upstream publishes none for
  these files, and the two the Homebrew formula does publish were cross-checked against
  them. Both recipes report rather than gate and are deliberately absent from `just check`:
  `allium check` fails on warnings as well as errors and `allium analyse` fails while any
  finding remains, neither offers a way to waive one, and the modules carry a baseline of
  twenty-five diagnostics and four findings — recorded in
  `docs/how-to/work-with-the-specs.md` so a new one can be told from an old one. See
  [decision 0011](docs/decisions/0011-project-managed-allium-cli.md).

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
- The share dialog (then the custom-game form) was handed the notice and the link the board
  was showing, so both turned up inside a dialog that made neither — and closing the dialog
  threw the board's link away. It opens on a surface of its own.
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

- The Allium diagnostic baseline is retired. Every structural diagnostic the five modules
  carried is fixed or waived in place: `StatisticsPanel` exposes the losses it already
  showed, the dead `Player.games` and `Game.is_complete` fields are gone, practice and
  the answer pool draw from `WordListSource`'s own `answer_words()` rather than filtering
  a collection the checker cannot resolve, `GameAbandoned` leads its ensures block and
  carries the eligibility verdict so statistics stops re-deciding which modes count, a
  new `Arrival` surface provides `PlayerOpensPoodl`, and the fourteen remaining checker
  gaps carry reasoned whole-line `-- allium-ignore` waivers — a directive the 3.5.3
  binary honours but documents nowhere, which corrects this log's earlier "neither offers
  a way to waive one". `just check-specs` now reports no diagnostics and exits 0;
  `just analyse-specs` still reports the two `missing_producer` findings the analyser
  cannot trace through `Game.created`. Both recipes stay outside `just check` — gating is
  the follow-up [decision 0011](docs/decisions/0011-project-managed-allium-cli.md) leaves
  open — and [Work with the specifications](docs/how-to/work-with-the-specs.md) carries
  the waiver terms. No observable behaviour changes.
- The default answer list is an easier one: 1,122 words supplied by the maintainer, trimmed
  by hand (duplicates, entries that were not five letters, one trademark, fifteen obscure
  words and one ethnic slur, which stays in the append-only guess dictionary and is simply
  never drawn) and carrying `poodl`. The 2,394-word SCOWL/12dicts curation stays in the
  repository as `src/lib/data/answers-scowl.txt`, unimported and unbundled, so it can be
  restored by swapping the file names. `words.allium` lowers `config.min_answer_words` from
  2,000 to 1,000 and restates its design intent as roughly 1,100 answers and roughly 15,000
  dictionary words; `src/lib/config.ts` and the configuration reference mirror it.
- The guess dictionary grows from 11,441 to 15,029 words: everything it held, every new
  answer, and a 14,855-word list of accepted guesses the maintainer supplied. Nothing was
  withdrawn. Both supplied lists were copied from a version of the game built with Replit,
  which neither provided nor recorded their source; `static/word-lists-NOTICE.txt` and
  [Replace the word lists](docs/how-to/replace-the-word-lists.md) record that as a known
  gap rather than a resolved provenance.
- The How to play explanation takes the design system's dialog shape and says less, more
  plainly. `HowToPlay` is now the body alone — one sentence for the attempts and the word
  length, the board's own `Tile` beside each of the three marks with its marker bar, and a
  muted closing line — shared by the welcome screen, which frames it as the group it always
  was, and by the new `HowToPlayPanel`, the dialog the header's info button opens, in the
  same shell as every other panel. The example tiles are hidden from assistive technology
  because the sentence beside each is the content, so each sentence is held by the row it
  sits in, and the three describe their bars in the words the guarantee itself uses — bar,
  shorter bar and no bar. `tests/contrast.test.ts` measures those tiles against the dialog
  surface, the one ground they had not been drawn on: every border there, and every letter
  the surface is in fact behind — which in the light themes is absent's alone, the two hue
  letters sitting on their own fills and answering to those instead.
- Passing on the word of the game being played moves from a button under the keyboard into
  the dialog the header's share action opens, renamed "Share a game" from "Set a word". The
  dialog now holds both ways of making a link — **This game**, offered for as long as a game
  is on the board and saying which game it means, and **Your own word** — restyled to the
  design system's eyebrows, copy and filled primary. A link a section makes is shown inside
  the dialog and goes when it closes, and a link made in the end-of-game modal now goes the
  same way when the modal is closed; the modal keeps its own "Share results" and "Share the
  word", and the board no longer shows a custom-game link at all — only the shared grid, once
  the conclusion is put away. `CustomGameForm` is `SharePanel`. `sharing.allium`'s rules and
  guarantees are unchanged; the prose naming the way in moved with the control, and
  `CustomGameCreation` now relates to `ShareCurrentAnswer`.
- The non-colour indication on results is a marker bar rather than a corner glyph:
  correct fills most of a tile or key's bottom edge, present shows a short centred
  fraction, absent carries no bar beside a dimmed letter. `game.allium`'s
  `ResultsAreNeverConveyedByColourAlone` and `AnUntriedKeyIsDistinguishableFromAScoredOne`
  were amended first, and the palette's separation carriers moved with them: the untried
  key hugs the page, hue results answer with their ink off that shared ground, absent
  answers letter to letter, and the mark separation rides the drawn borders as a distance
  with no direction. `tests/contrast.test.ts` was reworked to the new pairs — proven
  against the old palette first, where it fails — and every floor holds in all four
  combinations of theme and high contrast, with the tight pairs named in the `app.css`
  header. Enter and Delete show icons rather than text glyphs, wider than a letter key and
  never narrower, under the equal-division wording the spec now scopes to letter keys.
- `settings.allium`'s `Appearance` gained `AnUnavailableControlIsExempt`: a control the
  player cannot operate is held to none of the contrast figures
  `EveryCombinationMeetsTheLegibilityFloor` states, adopting the carve-out WCAG 2.2 already
  makes at 1.4.3 and 1.4.11 for an inactive component. Dimming is *how* unavailability
  reads, and a dim held to a live control's bar would not read as one — the keyboard a
  finished game leaves behind is the case it is written for. The exemption is only from the
  figures: a dimmed control still reports its state to the accessibility tree and still
  keeps every non-colour indication its live form carried, so a switched-off scored key
  keeps its marker bar and its description. `tests/components.test.ts` holds that half,
  which is not a ratio and so has no place in `tests/contrast.test.ts`.

- The disabled ink goes back to the value the design system states. `--text-disabled` had
  been ported lighter than its source on three of the four palettes — neutral-9 for
  neutral-8 in light, neutral-9 for neutral-7 in light high contrast, neutral-6 for
  neutral-7 in dark high contrast — which no decision recorded, so it was drift. The
  disabled ink now measures 2.31–4.62 against the page and the raised surface where it
  measured 1.36–2.48. Visible on every disabled control: the two settings rows that switch
  themselves off, and the `Button` and `IconButton` disabled states the workshop shows.

- `EveryCombinationMeetsTheLegibilityFloor` says what it always meant about a control that
  draws no boundary. A control is identifiable by the boundary it draws or, where it draws
  none, by its own words — so the `ghost` button, which is transparent on transparent in
  the design system too, answers with the `--text-2` its words are painted in rather than
  with an edge that does not exist. No pixel moved.
- `DecodeRejectsWhatItDidNotProduce` promised more than a fixed-length token can deliver:
  refusing *every* altered token is not achievable when the tokens that decode are a fixed
  fraction of the strings the alphabet can spell. It now states the three properties that
  hold outright and, in `AlterationIsDetectedToABound`, the bound on the rest. No code
  changed; `tests/links.test.ts` sweeps every single-character alteration of every token
  instead of sampling forty words and tolerating a couple of survivors.

[Unreleased]: https://github.com/steven-cutting/poodl/commits/main/
