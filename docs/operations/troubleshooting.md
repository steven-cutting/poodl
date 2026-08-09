---
title: "Troubleshooting"
kind: "operations"
audience: [contributor, maintainer, operator, agent]
canonical_for: [troubleshooting]
requires: []
---

# Troubleshooting

Symptoms as headings, causes and fixes as bodies.

## `just check` reports that a recipe changed the worktree

The recipe is the defect, not your change. Checks are read-only; anything that writes
belongs in `.pre-commit-fix.yaml` and runs from `just fix`. The report names which paths
moved. Move the offending hook, or add the generated path to the ignore rules.

## `docs validation: frontmatter <field> disagrees with the manifest`

Almost always list order. The comparison between `docs/manifest.yml` and a page's
frontmatter is order-sensitive, so `[maintainer, contributor]` fails against
`["contributor", "maintainer"]`. Copy the order from the manifest.

If the field is `title`, check for a stray difference in punctuation — the level-one
heading must match it byte for byte as well.

## `docs validation: not reachable from docs/README.md`

The page exists and is registered, but nothing links to it. Add it to
[the documentation map](../README.md), or to a page that is already reachable.

## `agent validation: unexpected managed file`

Something appeared under `.agents/`, `.claude/` or `.codex/` that is neither a declared
skill nor `.claude/settings.json`. If it is local tool state, add it to `.gitignore` —
the inventory reads Git, so an ignored file is invisible to it. If it is real content, it
belongs in `.agents/skills/` with bridges, or somewhere else entirely.

## `agent validation: must stay a thin pointer to the canonical skill`

A bridge under `.claude/` or `.codex/` has grown content, or its frontmatter has drifted
from the canonical skill. Regenerate it: the canonical frontmatter verbatim, one blank
line, one sentence pointing at the canonical path, under forty words.

## Coverage fails but everything is tested

Distinguish two cases. If a real path is untested, add the test. If the uncovered branch
cannot be reached by any input — a bounds check after a modulo, a fallback after an
exhaustive assignment — delete the branch. Do not lower the threshold.

Svelte compiles text interpolation into update branches that only run on re-render, so a
component tested only with fresh renders shows uncovered branches. A test that updates
props covers them, and is worth having on its own merits.

## `just check` stops because Playwright cannot start Chromium

The story gate renders in a real browser, and the browser is in neither lockfile, so
`just sync` does not install it — `just sync` installs exactly what the lockfiles say. Run
`just storybook-browsers` once per machine, and again after the `playwright` pin moves. On
Linux, run `just storybook-browsers-deps` first. `just initialize` does both for you on a
fresh clone.

## Tests fail on `localStorage` or `navigator.clipboard`

They are not available. Node ships its own experimental `localStorage` that shadows the
one jsdom would provide and stays undefined; `navigator.clipboard` is absent entirely.

This is not something to work around with a stub. Every adapter takes its platform object
as a defaulted argument — pass one in. See [Testing](../reference/testing.md).

## The site works locally but assets 404 once deployed

The base path. A project site is served from a subdirectory, so serve it from one before
concluding anything:

```console
BASE_PATH=/poodl just frontend-build
BASE_PATH=/poodl just preview
```

The second command matters as much as the first. Left off, the preview mounts the site at
`/` instead of `/poodl/`, and an asset referenced by an absolute path — the usual cause of
this symptom — resolves there and returns 200. The reproduction has to sit on the
subdirectory or it cannot show the fault.

## The Pages deployment fails with a 404

`Failed to create deployment (status: 404)`, with the build job green and its artefact
uploaded. Pages has not been switched to the GitHub Actions source in the repository
settings. The workflow cannot do that for itself; see
[Deploy to GitHub Pages](../how-to/deploy-to-github-pages.md).

## Something works under `just dev` but not in the build

Prerendering. Module-scope work runs once, in Node, at build time — so a value computed
there is baked into the output for every visitor. Anything that must vary per visitor has
to happen in the browser.

## Related pages

- [Test and debug](../how-to/test-and-debug.md)
- [Quality gates](../reference/quality-gates.md)
- [Maintenance](maintenance.md)
