# AGENTS.md

Poodl is an unlimited-play, Wordle-style word guessing game: a single-page static
web app with no backend, deployed to GitHub Pages.

This file is the single source of truth for engineering conventions. Behavioral
requirements live in the Allium specifications under `docs/specs/` — when deciding
*what* the game should do, the specs win; when deciding *how* to build it, this
file wins. Check spec/implementation drift with the `allium weed` skill.

**Repo status:** specification phase. The conventions below bind the future
implementation; the scaffolding does not exist yet. When scaffolding, materialize
these conventions rather than inventing alternatives.

## Stack

- Svelte 5 with SvelteKit and Vite. **Runes only** (`$props`, `$state`,
  `$derived`) — no legacy reactivity, no `createEventDispatcher`; child-to-parent
  communication uses callbacks passed as props.
- `@sveltejs/adapter-static` with full prerendering (deviation from the source
  template, which uses `adapter-node` — this app has no server).
- TypeScript everywhere (`<script lang="ts">`), strict mode plus
  `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`,
  `isolatedModules`, `checkJs`.
- npm as package manager. Every dependency pinned to an **exact version** (no `^`
  or `~`), with `packageManager`, `engines`, and `volta` blocks in `package.json`.

## Code style

- **Prettier** with `prettier-plugin-svelte`: `printWidth: 100`,
  `singleQuote: true`, `trailingComma: "none"`,
  `svelteSortOrder: "options-scripts-markup-styles"`.
- **ESLint flat config**: `eslint.configs.recommended` +
  `tseslint.configs.strictTypeChecked` (type-aware, `projectService: true`) +
  `eslint-plugin-svelte` recommended. Type-checked linting disabled for `**/*.js`
  and `*.config.ts`.
- **EditorConfig**: LF, UTF-8, 2-space indent (4 for `Justfile`), final newline,
  trimmed trailing whitespace.
- Markdown linted with `markdownlint-cli2` (long lines allowed; `<br>` is the
  only permitted inline HTML).
- Components are PascalCase `.svelte` files under `src/lib/components/`. Semantic
  HTML first: real buttons, labels, keyboard and focus handling, visible loading
  and error states.

## Testing

- **Vitest** in jsdom with `globals: true`; setup imports
  `@testing-library/jest-dom/vitest`.
- Tests live in `tests/`, **not colocated** with `src/`. Naming: `*.test.ts` for
  Vitest, `*.spec.ts` for Playwright e2e.
- Component tests use `@testing-library/svelte` + `@testing-library/user-event`,
  querying by **accessible role and name** — never by class or test id.
- Side effects are isolated behind small ports with in-memory fakes injected in
  tests (the template's `Api` port pattern, adapted here to this app's real
  boundaries: persistent storage, random word selection, clock, clipboard).
  Tests never stub globals directly.
- Coverage (v8): **90% floor** on branches, functions, lines, and statements over
  `src/lib/**`.
- `svelte-check` runs with `--fail-on-warnings`.
- A new component lands with its test in the same change.

## Workflow

- **Just** is the task runner. Recipe names follow the template idiom: `dev`,
  `format`, `fix`, `lint`, `check` (the aggregate gate), `frontend-static`
  (eslint + prettier check + svelte-check), `frontend-unit`,
  `frontend-coverage`, `frontend-build`. Justfiles use
  `set shell := ["sh", "-eu", "-c"]` and a `default` recipe that lists recipes.
- **Pre-commit via prek** (run through uv), with the template's two-file split:
  `.pre-commit-config.yaml` is the read-only gate (reports, never mutates; this
  is what gets installed), `.pre-commit-fix.yaml` is the mutating counterpart
  run only by `just fix`. Third-party hooks pinned to commit SHAs with a version
  comment. Gate hooks include `typos`, `editorconfig-checker`, `shellcheck`,
  `actionlint`, `ripsecrets`, and `lychee` (offline).
  This keeps a small Python toolchain (uv) in a frontend repo — accepted
  trade-off, decided at planning.
- Git: LF everywhere (`* text=auto eol=lf`); lockfiles marked
  `linguist-generated`.

## CI and deployment

- GitHub Actions CI: actions pinned to commit SHAs, `permissions: contents:
  read`, concurrency with cancel-in-progress, `persist-credentials: false`,
  per-job `timeout-minutes`. The frontend job runs install → lockfile dry-run
  check → `frontend-static` → `frontend-coverage` → `frontend-build`.
- Deployment: a GitHub Pages workflow (written for this repo; the source
  template has none) publishes the static build from `main`.

## Provenance

Conventions distilled from the copier template at
`/Users/scutting/projects/foo/www` (its generated frontend + Justfile + CI).
Deliberate deviations for this repo: `adapter-static` instead of
`adapter-node`; no backend/OpenAPI/Python application code; ports/fakes adapted
from the HTTP `Api` boundary to storage/RNG/clock/clipboard; a Pages deploy
workflow added.
