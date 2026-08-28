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

## Moving the Allium binary

`allium` is a checksummed binary, not a package, so no lockfile accounts for it and
`just lock-check` cannot speak for it. `scripts/install_allium.py` holds the version and
the SHA-256 of each supported artefact; see
[decision 0011](../decisions/0011-project-managed-allium-cli.md).

Upstream publishes no checksums for these files — its `SHA256SUMS.txt` covers only the
editor extension and the language server — so all four have to be recomputed by hand:

```console
V=3.5.3
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

A version change can move what the checker reports, and the `-- allium-ignore` waivers
in the modules lean on behaviour upstream documents nowhere, verified against 3.5.3
only. After moving the pin, run `just check-specs` and `just analyse-specs`, drop any
waiver the new version no longer needs, and update the waiver count and shapes in
[Work with the specifications](work-with-the-specs.md) in the same commit.

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
