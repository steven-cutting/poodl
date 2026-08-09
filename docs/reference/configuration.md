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
| `BASE_PATH` | empty | The subdirectory the site is served from. Read by `svelte.config.js` into `paths.base`. Set to `/poodl` by the Pages workflow; left empty for local builds and for a custom domain. |

That is the whole list. SvelteKit's `PUBLIC_` convention is available but unused: a value
baked into a public static bundle is not configuration, it is a constant, and constants
belong in source where they can be reviewed.

## Configuration files

| File | Governs |
| --- | --- |
| `svelte.config.js` | The static adapter, preprocessing, and the base path. |
| `vite.config.ts` | The dev server, the jsdom unit suite, and the coverage thresholds. |
| `tsconfig.json` | Strict TypeScript, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `isolatedModules` and `checkJs`. |
| `eslint.config.js` | Flat config on `strictTypeChecked`, two documented rule decisions, and the Storybook plugin's preset. |
| `.storybook/main.ts` | Where stories are found, which addons load, the SvelteKit framework, telemetry off, and the dev server's permission to serve `stories/`. |
| `.storybook/preview.ts` | The design tokens, the theme, contrast and motion toolbar globals, and the axe run applied to every story. |
| `vitest.storybook.config.ts` | The story run: browser mode, Chromium, axe. Deliberately separate from `vite.config.ts` so the coverage floor cannot be affected. |
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
changing one here without changing it in the specification is drift.

| Constant | Value | Specification |
| --- | --- | --- |
| `WORD_LENGTH` | 5 | `words.allium`, `config.word_length` |
| `MAX_ATTEMPTS` | 6 | `game.allium`, `config.max_attempts` |

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
