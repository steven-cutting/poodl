---
title: "Deploy to GitHub Pages"
kind: "how-to"
audience: [maintainer, operator, agent]
canonical_for: [deployment_procedure]
requires: []
---

# Deploy to GitHub Pages

Poodl publishes to GitHub Pages from `.github/workflows/pages.yml` on every push to
`main`. The workflow builds the static site, assembles the domain around it, and hands the
directory to the Pages deployment action; nothing is committed to a branch.

The site is served at <https://pnut.fans/poodl/>, and the bare domain is a landing page.

## One-time setup

All of it is already done for this repository. It is recorded because a fork starts from
nothing, and because the domain half of it is not visible in any file here.

1. In the repository settings, under Pages, set the source to **GitHub Actions**. The
   workflow cannot do this for itself.
2. Confirm the `github-pages` environment exists. The deploy job references it, and GitHub
   creates it on the first run.
3. Point the domain's DNS at GitHub Pages, then set the domain in the repository settings.
   The records are below.

Until step 1 is done, the build job succeeds and uploads its artefact but the deploy job
fails with `Failed to create deployment (status: 404)`, even though the workflow itself is
correct.

## Where the site is served from

The domain belongs to this repository. `pnut.fans` is set as the custom domain on the
`poodl` repository's Pages site, so Pages serves this repository from the root of that
domain rather than from a subdirectory of the account's.

That root is a landing page, and Poodl sits beneath it at `/poodl/`. Nothing forces that
arrangement — it is [decision 0009](../decisions/0009-poodl-lives-at-pnut-fans.md), and it
is why `BASE_PATH` is still `/poodl` on a domain that no longer requires a base path at
all. The account's user site keeps `stevencutting.com`, which is a separate Pages site on a
separate repository; a repository holds one custom domain and this one holds `pnut.fans`.

## The DNS records

Held at the registrar, not here, so this is the only place they are written down. The apex
carries four `A` records and four `AAAA` records:

| Type | Host | Value |
| --- | --- | --- |
| `A` | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `AAAA` | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| `CNAME` | `www` | `steven-cutting.github.io.` |
| `TXT` | `_github-pages-challenge-steven-cutting` | The token GitHub shows under *Verified domains* |

The domain also carries `MX` and `SPF` records for mail, which none of the above touches:
different record types on the same name coexist. **Never replace the record set wholesale.**
Changing web hosting means changing the `A` and `AAAA` records and nothing else.

The `TXT` record is what stops another GitHub account claiming the domain while it points
at GitHub's addresses. Verify before pointing, not after.

No `CNAME` file is committed. A workflow-based deployment ignores one — the domain lives in
the repository settings, and a file claiming otherwise would be a second answer that could
disagree with the first.

## What the workflow does

- Reads `BASE_PATH` from the workflow's own `env` block, so the build and the staging
  cannot drift apart on where the app goes.
- Builds with `npm run build`, which is `just frontend-build`.
- Stages with `npm run stage`, which is `just stage`: `site-root/` becomes the domain root,
  `src/app.css` and the three font files it names are copied beside the landing page, and
  `build/` is moved to `site/poodl/`.
- Uploads `site/` — the whole domain — as a Pages artefact.
- Deploys it in a second job that holds the `pages: write` and `id-token: write` scopes.
  Every other workflow in this repository is `contents: read` only.

Deployments are serialised by a concurrency group and are never cancelled mid-flight: a
half-published site is worse than a slightly stale one.

## Reproduce a deployment locally

```console
BASE_PATH=/poodl just frontend-build
BASE_PATH=/poodl just stage
just stage-preview
```

The base path goes on the build and on the staging, or the app is built for one mount and
moved to another. `just stage-preview` needs none: it serves `site/` whole, on port 4174,
which is the deployment and not just the app. See
[Configuration](../reference/configuration.md).

`site/` should contain `index.html`, `app.css`, `.nojekyll`, a `lib/assets/fonts/` holding
the three `.woff2` files, and a `poodl/` directory holding the build. The `.nojekyll` files
come from `site-root/` and `static/` and stop Pages treating an underscore-prefixed
directory as a Jekyll internal.

The fonts sit at `lib/assets/fonts/` because that is the path `src/app.css` names, and the
copy beside the landing page is raw rather than built. A landing page that renders in the
system sans has that copy missing; nothing else about the page will look wrong, which is
why it is worth checking for deliberately.

`just preview` still works and still serves only `build/`. It is the right tool for a change
to the game and the wrong one for a change to the domain.

## The address Poodl used to have

Poodl was served at `https://stevencutting.com/poodl/`, as a project site under the
account's user domain. GitHub redirects a project site's former addresses to its custom
domain, and what that means exactly was measured on 2026-08-21 rather than assumed, because
GitHub documents it nowhere for the user-domain path:

`https://stevencutting.com/poodl/<path>` returns `301` to `https://pnut.fans/<path>`.
**The `/poodl/` prefix is stripped and the path is mapped to the root of the custom domain,
not to `/poodl/` within it.** `https://steven-cutting.github.io/poodl/` behaves the same.

Two consequences follow, and neither is a defect to fix:

- The bare old address lands on the landing page rather than on the game. That is one click
  from where it was going, and the landing page exists to make that click obvious.
- An old custom game link — `stevencutting.com/poodl/?g=TOKEN` — arrives as
  `pnut.fans/?g=TOKEN`, where the root is a landing page and not the app, so the word is
  lost. Rescuing those would mean a forwarder on the landing page, which was declined: it
  would put behaviour on the one page nothing in this repository renders or tests. See
  [decision 0009](../decisions/0009-poodl-lives-at-pnut-fans.md).

If the redirect ever stops holding altogether, a redirect page at `poodl/index.html` in the
`steven-cutting.github.io` repository is the fix.

## Rolling back

Re-run the last good deployment from the Actions tab, or revert the commit and let the push
trigger a fresh build. There is no state to migrate and no cache to clear beyond the
browser's.

A change to the domain is not covered by either. Rolling that back means putting the
previous domain back in the repository settings and waiting for a fresh certificate.

## Related pages

- [Decision 0009: Poodl lives at pnut.fans](../decisions/0009-poodl-lives-at-pnut-fans.md)
- [Architecture](../explanation/architecture.md)
- [Configuration](../reference/configuration.md)
- [Maintenance](../operations/maintenance.md)
