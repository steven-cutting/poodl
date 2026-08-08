---
title: "Deploy to GitHub Pages"
kind: "how-to"
audience: [maintainer, operator, agent]
canonical_for: [deployment_procedure]
requires: []
---

# Deploy to GitHub Pages

Poodl publishes to GitHub Pages from `.github/workflows/pages.yml` on every push to
`main`. The workflow builds the static site and hands the directory to the Pages
deployment action; nothing is committed to a branch.

## One-time setup

1. In the repository settings, under Pages, set the source to **GitHub Actions**. The
   workflow cannot do this for itself.
2. Confirm the `github-pages` environment exists. The deploy job references it, and
   GitHub creates it on the first run.

Until step 1 is done, the deploy job fails with a permissions error even though the
workflow itself is correct.

## What the workflow does

- Builds with `BASE_PATH` set to `/` plus the repository name, because a project site is
  served from a subdirectory rather than from the root of the domain.
- Uploads `build/` as a Pages artefact.
- Deploys it in a second job that holds the `pages: write` and `id-token: write` scopes.
  Every other workflow in this repository is `contents: read` only.

Deployments are serialised by a concurrency group and are never cancelled mid-flight: a
half-published site is worse than a slightly stale one.

## Reproduce a deployment locally

```console
BASE_PATH=/poodl just frontend-build
just preview
```

The output should contain `index.html`, `.nojekyll` and an `_app/` directory. The
`.nojekyll` file comes from `static/` and stops Pages treating the underscore-prefixed
directory as a Jekyll internal.

## Moving to a custom domain

A custom domain serves from the root, so the base path goes away:

1. Delete the `env` block that sets `BASE_PATH` in `.github/workflows/pages.yml`.
2. Add a `CNAME` file containing the domain to `static/`, so it is copied into the build.
3. Point the domain's DNS at GitHub Pages and set the domain in the repository settings.

Nothing in the application changes. `paths.base` in `svelte.config.js` already defaults
to empty, which is what a root-served site wants.

## Rolling back

Re-run the last good deployment from the Actions tab, or revert the commit and let the
push trigger a fresh build. There is no state to migrate and no cache to clear beyond the
browser's.

## Related pages

- [Architecture](../explanation/architecture.md)
- [Configuration](../reference/configuration.md)
- [Maintenance](../operations/maintenance.md)
