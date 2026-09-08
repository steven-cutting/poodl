---
title: "Maintenance"
kind: "operations"
audience: [maintainer, operator, agent]
canonical_for: [maintenance_routine]
requires: []
---

# Maintenance

There is no service to operate. Nothing runs between deployments, nothing accumulates,
and there is no on-call. What follows is upkeep of the repository and of the published
site.

## Routine

**Weekly.** Read any failing scheduled run. Nothing is scheduled yet, so this is
currently just the state of `main`.

**Monthly.** Review dependency versions. Every pin is exact, so nothing moves on its own
and nothing is picked up by accident either. Follow
[Maintain dependencies](../how-to/maintain-dependencies.md), and check compatibility
before choosing a version — the repository already holds TypeScript back a major version
because the linter does not support the newer one.

**Monthly.** Run `just check-links-online`. It is not part of the gate because it needs
the network, so external links rot silently until someone looks.

**Per release of the word lists.** See
[Replace the word lists](../how-to/replace-the-word-lists.md). Replacing them can
invalidate an in-progress game and any outstanding custom link, so do it on its own
rather than alongside a behaviour change.

## Deploying

Pushing to `main` deploys. There is no staging environment, because there is nothing to
stage: the artefact is a directory of files, and the only way it can differ between
environments is the base path.

Before pushing anything that changes the build, reproduce it:

```console
BASE_PATH=/poodl just frontend-build
BASE_PATH=/poodl just preview
```

The base path goes on both commands; see [Configuration](../reference/configuration.md)
for why, and [Deploy to GitHub Pages](../how-to/deploy-to-github-pages.md) for the rest of
the procedure.

## Rolling back

Re-run the last good deployment from the Actions tab, or revert and push. There is no
database to migrate, no cache to invalidate beyond the browser's, and no in-flight
request to drain.

One caveat with real consequences: a player's statistics live in their browser. A
rollback cannot restore data a bad release destroyed, because the release never had it.
Treat any change to how state is stored as one-way, and read
[Architecture](../explanation/architecture.md) before making one.

## Secrets

One is stored: Chromatic's project token, held as a repository secret. Nothing else — no
API keys, no service accounts. The Pages deployment authenticates with a workflow identity
token that GitHub issues per run, so there is nothing to rotate there.

The registry credential is not stored and is not this repository's to rotate: on a laptop
it is the contributor's own `read:packages` token in `~/.npmrc`, and in continuous
integration it is the token GitHub mints for the run. What can be withdrawn is the
package's grant of read access to this repository, which is a setting on the package. If it
ever is, every workflow fails at the install — see
[Troubleshooting](troubleshooting.md).

## Related pages

- [Deploy to GitHub Pages](../how-to/deploy-to-github-pages.md)
- [Troubleshooting](troubleshooting.md)
- [Security model](../explanation/security-model.md)
