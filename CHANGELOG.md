# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

[Unreleased]: https://github.com/steven-cutting/poodl/commits/main/
