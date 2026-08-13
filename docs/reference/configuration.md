---
title: "Configuration"
kind: "reference"
audience: [contributor, maintainer, operator, agent]
canonical_for: [configuration_reference]
requires: []
---

# Configuration

There is no runtime configuration. A static site has no process to configure, so
everything below is read at build time or is a fixed part of the source.

## Build-time environment

| Variable | Default | Effect |
| --- | --- | --- |
| `BASE_PATH` | empty | The subdirectory the site is served from. Read into `paths.base`. Set to `/poodl` by the Pages workflow; left empty for local builds, and for a domain of Poodl's own that would serve it from a root. |

That is the whole list for the site. SvelteKit's `PUBLIC_` convention is available but
unused: a value baked into a public static bundle is not configuration, it is a constant,
and constants belong in source where they can be reviewed.

### The base path

`BASE_PATH` is read twice, not once. `svelte.config.js` reads it into `paths.base` for the
build, and the preview server reads the same value to decide where it mounts the output.
So it belongs on both commands:

```console
BASE_PATH=/poodl just frontend-build
BASE_PATH=/poodl just preview
```

Build with it and preview without it and the site comes up at `/` rather than `/poodl/` —
which is not the path Pages serves, so the preview is not the deployment.

Nothing announces the mistake. A prerendered page references its own assets relatively
(`./_app/…`), so it loads at either mount and no request 404s. Only a path written
absolutely by hand gives the fault away, and only when the preview sits on the
subdirectory. That is why the value has to be set deliberately rather than noticed.

## Tooling environment

One variable is read by a tool rather than by the build, and it never reaches the bundle.

| Variable | Read by | Effect |
| --- | --- | --- |
| `CHROMATIC_PROJECT_TOKEN` | `just chromatic` | Which Chromatic project the workshop publishes to. Export it locally; CI supplies it from the repository secret of the same name. Without it the recipe fails rather than publishing somewhere unexpected. |

It is the only secret this repository has, and it is deliberately not written into a file —
see [Security model](../explanation/security-model.md).

## Configuration files

| File | Governs |
| --- | --- |
| `svelte.config.js` | The static adapter, preprocessing, and the base path. |
| `vite.config.ts` | The dev server, the jsdom unit suite, and the coverage thresholds. |
| `vitest.config.ts` | Names both suites as projects and nothing else. It exists so the Storybook UI's test runner, which finds its configuration by filename, resolves the story project instead of failing on the unit one. |
| `tsconfig.json` | Strict TypeScript, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `isolatedModules` and `checkJs`. |
| `eslint.config.js` | Flat config on `strictTypeChecked`, two documented rule decisions, and the Storybook plugin's preset. |
| `.storybook/main.ts` | Where stories are found, which addons load, the SvelteKit framework, telemetry off, and the dev server's permission to serve `stories/`. |
| `.storybook/preview.ts` | The design tokens, the theme, contrast and motion toolbar globals, and the axe run applied to every story. |
| `vitest.storybook.config.ts` | The story run: browser mode, Chromium, axe. It declares no coverage block, and the run that measures the floor pins `vite.config.ts`, so a story cannot affect the number. |
| `chromatic.config.json` | Visual review: the build script to call, that a change reports rather than fails, and that `main` accepts its own changes as the new baseline. It holds no token. |
| `.prettierrc.json` | 100 columns, single quotes, no trailing commas, Svelte block order. |
| `.prettierignore` | Notably excludes Markdown, which markdownlint owns, and the word lists. |
| `.markdownlint-cli2.jsonc` | Markdown rules, including the exemptions the documentation contract needs. |
| `.editorconfig` | Whitespace. LF, UTF-8, two spaces, four for the `Justfile` and the specifications. |
| `pyproject.toml` | The pinned Python tooling, Ruff's rules, and the `typos` exclusions. |
| `lychee.toml` | Link checking. |
| `.pre-commit-config.yaml` | The read-only gate. Installed as the hook. |
| `.pre-commit-fix.yaml` | The mutating counterpart. Run only by `just fix`. |

### Storybook appearance globals

Set from the workshop toolbar, or pinned by a story with a `globals` prop. The attributes
go on the preview document's root element, because `src/app.css` keys every palette on
`:root`.

| Global | Values | Effect |
| --- | --- | --- |
| `theme` | `system`, `light`, `dark` | `system` removes `data-theme` so the device preference decides; the other two set it. |
| `highContrast` | `off`, `on` | `on` sets `data-high-contrast="true"`, which swaps the correct and present colours. |
| `reducedMotion` | `follow`, `reduce` | `reduce` injects a stylesheet that freezes declarative motion. A simulation: nothing inside the page can change what `prefers-reduced-motion` reports. |

## Values the specifications decide

`src/lib/config.ts` mirrors the `config` blocks in `docs/specs/`. These are not tunables:
changing one here without changing it in the specification is drift. All fifteen are below,
and the file holds nothing else — a constant that appears there without a `config` entry to
name is drift in the other direction.

| Constant | Value | Specification |
| --- | --- | --- |
| `WORD_LENGTH` | 5 | `words.allium`, `config.word_length` |
| `GAME_NAME` | `poodl` | `words.allium`, `config.game_name`. The one word a specification names, and an ordinary answer word. Not the same entry as `SHARE_HEADING`. |
| `MIN_ANSWER_WORDS` | 2000 | `words.allium`, `config.min_answer_words` |
| `MIN_GUESS_WORDS` | 10000 | `words.allium`, `config.min_guess_words` |
| `MAX_ATTEMPTS` | 6 | `game.allium`, `config.max_attempts` |
| `ENDLESS_COUNTDOWN_MS` | 10000 | `game.allium`, `config.endless_countdown`, stated there as `10.seconds` |
| `MINIMUM_TOUCH_TARGET` | 44 | `game.allium`, `config.minimum_touch_target`, in CSS pixels |
| `NARROWEST_SUPPORTED_WIDTH` | 320 | `game.allium`, `config.narrowest_supported_width`, in CSS pixels |
| `SHARE_HEADING` | `Poodl` | `sharing.allium`, `config.share_heading` |
| `CUSTOM_MARKER` | `custom` | `sharing.allium`, `config.custom_marker` |
| `STANDARD_CORRECT_TILE` | 🟩 | `sharing.allium`, `config.standard_correct_tile` |
| `STANDARD_PRESENT_TILE` | 🟨 | `sharing.allium`, `config.standard_present_tile` |
| `HIGH_CONTRAST_CORRECT_TILE` | 🟧 | `sharing.allium`, `config.high_contrast_correct_tile` |
| `HIGH_CONTRAST_PRESENT_TILE` | 🟦 | `sharing.allium`, `config.high_contrast_present_tile` |
| `ABSENT_TILE` | ⬛ | `sharing.allium`, `config.absent_tile` |

The last two are the only ones whose real consumer is a stylesheet, and CSS cannot import a
TypeScript constant. So `44px` is written out in `src/app.css` and `20rem` in
`Keyboard.svelte`, and the tests are what hold them to the constants: the jsdom suite
compares the resolved `min-block-size` against `MINIMUM_TOUCH_TARGET`, and the story run
frames the keyboard at `NARROWEST_SUPPORTED_WIDTH` and measures it there. Change the
specification and the constant, and the gate names the stylesheet that did not follow.

## Version pins

Exact versions, no ranges. Node and npm are additionally constrained by `engines` and
recorded in `volta` in `package.json`; Python by `.python-version`. See
[Maintain dependencies](../how-to/maintain-dependencies.md).

One dependency is outside that scheme. The browser the story run drives is a binary
Playwright downloads into a cache outside the repository; its version follows the
`playwright` pin and appears in neither lockfile.

## Related pages

- [Commands](commands.md)
- [Deploy to GitHub Pages](../how-to/deploy-to-github-pages.md)
- [Quality gates](quality-gates.md)
