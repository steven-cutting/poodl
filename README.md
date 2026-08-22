# Poodl

An unlimited-play, Wordle-style word guessing game. Guess a five-letter word in six
attempts; play again immediately, however many times you like.

**Play it at <https://pnut.fans/poodl/>.**

Poodl is a single-page static site with no backend, no accounts and no telemetry. It runs
entirely in the browser and is published to GitHub Pages.

**Status: playable.** Four modes — random, endless, practice, and a custom game somebody
sets for you with a link — hard mode, statistics that persist, settings for theme, contrast,
motion and keyboard handling, and results you can share as squares that give nothing away.
Every rule comes from the specifications in `docs/specs/`.

## Quick start

```console
just initialize
just dev
```

`just initialize` creates both lockfiles, installs both toolchains, downloads the browser
the story gate needs, normalises formatting and installs the pre-commit hook. It never
stages, commits, tags or pushes.

## Check your work

```console
just fix      # the only command that modifies files
just check    # every gate, read-only, proving the worktree is unchanged
```

`just --list` prints every recipe. Each one is described in
[Commands](docs/reference/commands.md).

## Layout

```text
src/lib/domain/   Pure behaviour: scoring, keyboard knowledge
src/lib/ports/    Every side effect, each with an in-memory fake
src/lib/components/  Svelte 5 components, runes only
src/routes/       Prerendered routes
tests/            Vitest suites, never colocated
stories/          Svelte CSF stories, one per component
docs/             The handbook
docs/specs/       Allium specifications — the source of truth for behaviour
```

## Documentation

Start at [the documentation map](docs/README.md).

- [Purpose and scope](docs/project/purpose-and-scope.md) — what Poodl is, and is not
- [Make your first change](docs/tutorials/first-change.md) — clone to green gate
- [Architecture](docs/explanation/architecture.md) — how a site with no server fits together
- [Specifications](docs/explanation/specifications.md) — why behaviour is written down first

Engineering conventions and the agent working agreement are in [AGENTS.md](AGENTS.md).

## Boundaries

Behaviour is decided in `docs/specs/`, not in code. When the two disagree, the
specification is right and the code is a defect. Changing what the game does means
changing a specification first.

Statistics and settings live in one browser on one device and are never uploaded.
Clearing browser data destroys them. See
[Security model](docs/explanation/security-model.md).
