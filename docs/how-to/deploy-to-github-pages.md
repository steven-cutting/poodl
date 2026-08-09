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

The site is served at <https://stevencutting.com/poodl/>.

## One-time setup

Both steps are already done for this repository. They are recorded because a fork starts
from nothing.

1. In the repository settings, under Pages, set the source to **GitHub Actions**. The
   workflow cannot do this for itself.
2. Confirm the `github-pages` environment exists. The deploy job references it, and
   GitHub creates it on the first run.

Until step 1 is done, the build job succeeds and uploads its artefact but the deploy job
fails with `Failed to create deployment (status: 404)`, even though the workflow itself is
correct.

## Where the site is served from

The account owns a user site — the `steven-cutting.github.io` repository, whose `CNAME` is
`stevencutting.com` — so that domain is the root of GitHub Pages for the whole account. A
project site is not served from the root of its own domain but from a subdirectory of the
account's: `https://stevencutting.com/poodl/`. `https://steven-cutting.github.io/poodl/`
redirects there.

This is why `BASE_PATH` is `/poodl`, and it does not change because a custom domain is in
play. The subdirectory comes from the repository name, and the workflow derives it that
way rather than hard-coding it.

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
BASE_PATH=/poodl just preview
```

Set it on both commands. The preview server reads `paths.base` too, and it is what decides
where the site is mounted: without it the build is served from `/` rather than `/poodl/`,
which is not the path Pages serves.

The site still loads either way, because a prerendered page references its assets
relatively (`./_app/…`) and so is portable between mount points. That is exactly why the
base path has to be set deliberately: a path that is wrong for production will not
announce itself here.

The output should contain `index.html`, `.nojekyll` and an `_app/` directory. The
`.nojekyll` file comes from `static/` and stops Pages treating the underscore-prefixed
directory as a Jekyll internal.

## Giving Poodl its own domain

The account already has a custom domain, and Poodl is still served from a subdirectory of
it. Only a domain belonging to this repository serves from a root, and then the base path
goes away:

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
