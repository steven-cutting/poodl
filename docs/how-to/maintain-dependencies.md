---
title: "Maintain dependencies"
kind: "how-to"
audience: [maintainer, agent]
canonical_for: [dependency_maintenance]
requires: []
---

# Maintain dependencies

Every dependency is pinned to an exact version, in `package.json` and in
`pyproject.toml`. No `^`, no `~`. Both lockfiles are committed and marked
`linguist-generated`. Nothing updates them for you.

One of them comes from a second registry: `@steven-cutting/biscuit-games` is read from
GitHub Packages through the committed `.npmrc`, which scopes `@steven-cutting` there and
holds no token. Moving it is its own section below, because what it carries is not only
code.

## Check that the lockfiles still match

```console
just lock-check
```

This runs `uv lock --check` and an npm install dry run. It is part of `just check`, so a
manifest edited without relocking fails the gate rather than drifting.

## Update deliberately

```console
just lock            # relock at the versions the manifests already state
just lock-upgrade    # move to newer versions within the manifests' constraints
```

Because the manifests pin exact versions, `just lock-upgrade` on its own changes very
little. Moving a dependency forward means editing the version in the manifest and then
relocking.

## Upgrading a package

1. Check what it is compatible with before choosing a version. This bites: the current
   TypeScript major is ahead of what `typescript-eslint` supports, so the repository
   pins the 6.x line deliberately, not by neglect.

   ```console
   npm view typescript-eslint peerDependencies
   ```

2. Edit the exact version in `package.json` or `pyproject.toml`.
3. Run `just lock`, then read the lockfile diff before accepting it.
4. Run `just check`. A type-checker or linter upgrade usually surfaces new findings; fix
   them rather than pinning back, unless the finding is wrong for this project.
5. If the change moved `playwright`, reinstall the browser with `just storybook-browsers`.
   The binary is versioned by that pin and is in neither lockfile — see
   [Work in the component workshop](work-in-the-component-workshop.md).

## Moving the design system package

`@steven-cutting/biscuit-games` carries the stylesheet Poodl wears, the components it
renders and the specifications it restates, so a bump is read before it is taken.

1. See what is published, which needs the token
   [Develop locally](develop-locally.md) describes:

   ```console
   npm view @steven-cutting/biscuit-games versions
   ```

2. Read what moved. The package ships its own changelog, so after installing it is at
   `node_modules/@steven-cutting/biscuit-games/CHANGELOG.md`; before installing, the
   platform's repository has both that and a handover page naming every consumer-visible
   change — [The platform upstream](../project/platform.md) links them.
3. Edit the exact version, run `just lock`, and read the lockfile diff: one dependency line
   and one entry, and anything else is a stop-and-read.
4. Run `just frontend-coverage` before anything else. Two gates fail by design here:
   `tests/platformSpecs.test.ts` on a clause whose wording moved, and
   `tests/contrast.test.ts` on a token whose value did. Each failure is the moment somebody
   decides whether the platform's meaning moved — a reworded clause is amended upstream and
   taken, never reworded here.
5. Update the installed version on [The platform upstream](../project/platform.md), and add
   a `CHANGELOG.md` entry naming what a reader would see.
6. Run `just check`, then review the workshop in Chromatic: a rendered change upstream
   arrives as a diff in Poodl's own stories.

Nothing proposes this bump for you. There is no Dependabot here, and one would need the
registry credential as a stored secret of its own.

## Moving the Allium binary

`allium` is a checksummed binary, not a package, so no lockfile accounts for it and
`just lock-check` cannot speak for it. `scripts/install_allium.py` holds the version and
the SHA-256 of each supported artefact; see
[decision 0011](../decisions/0011-project-managed-allium-cli.md).

Upstream publishes no checksums for these files — its `SHA256SUMS.txt` covers only the
editor extension and the language server — so all four have to be recomputed by hand:

```console
V=3.6.1
for t in aarch64-apple-darwin x86_64-apple-darwin \
         aarch64-unknown-linux-gnu x86_64-unknown-linux-gnu; do
  printf '%s  ' "$t"
  curl -sL "https://github.com/juxt/allium-tools/releases/download/v$V/allium-$t.tar.gz" \
    | shasum -a 256 | awk '{print $1}'
done
```

Replace `VERSION` and all four entries in `CHECKSUMS`, then reinstall and confirm:

```console
just install-allium
just check-specs
```

Reinstalling is always safe to retry. The download lands beside the installed copy under a
temporary name and is asked for both its checksum and its version there, so a failed
download, a mismatched checksum or a binary that will not run leaves the working
installation exactly where it was. `just install-allium` also replaces a binary that no
longer runs, so an installation damaged by other means repairs itself rather than needing
`.tools/` cleared by hand.

A version change can move what the checker reports, in both directions. After moving the
pin, run `just check-specs` and `just analyse-specs`: a new version can report something
the modules were clean of, and it can also stop needing a waiver they carry. The modules
carry none at present, but the directive leans on behaviour upstream documents nowhere and
was verified against 3.6.1 only, so any waiver added later must be re-verified on the
commit that moves the pin, dropped where the new version no longer needs it, and its count
and shape updated in [Work with the specifications](work-with-the-specs.md) in that same
commit. Editing `scripts/install_allium.py` is itself a trigger for both specification
hooks, so the gate re-reads the modules against the new version on the commit that moves
the pin — but only after `just install-allium` has actually installed it.

## Actions in the workflows

GitHub Actions are pinned to commit SHAs with a version comment, not to tags. To move
one, resolve the new tag and replace both the SHA and the comment:

```console
gh api repos/actions/checkout/git/ref/tags/v7.0.1 --jq .object.sha
```

`actionlint` runs inside `just lint`, so a malformed workflow fails locally.

## Related pages

- [Configuration](../reference/configuration.md)
- [Quality gates](../reference/quality-gates.md)
- [Maintenance](../operations/maintenance.md)
