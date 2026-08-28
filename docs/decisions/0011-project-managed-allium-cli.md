---
title: "Decision 0011: A project-managed Allium binary"
kind: "decision"
audience: [maintainer, agent]
canonical_for: [decision_allium_cli]
requires: []
---

# Decision 0011: A project-managed Allium binary

## Context

The specifications under `docs/specs/` decide every behaviour in this project, and until
now nothing mechanically confirmed that they parse. `allium` is the tool that checks them,
and it was not installed here, so five modules that outrank the code were read by eye.

`allium` is a Rust binary published by [`juxt/allium-tools`][upstream]. It is not a package
either lockfile can name, which is the whole difficulty: this repository pins every
dependency exactly and proves the pins with `just lock-check`.

Two packages share the name and are not this tool. On PyPI, `allium-cli` is a client for
the Allium *blockchain data* APIs. On npm, `allium` is a Gherkin parser. Neither has any
relationship to the specification language, and adding either would be a supply-chain
mistake wearing the right name.

## Decision

Install the prebuilt release binary, pinned by version and by SHA-256, into a gitignored
`.tools/bin/`. `scripts/install_allium.py` holds the version, the release URL and the
checksum of each supported artefact, and `just install-allium` runs it. `just check-specs`
runs the result.

The pin sits in the script beside the URL it pins, which is the shape
`.pre-commit-config.yaml` already uses for `lychee`: the version travels with the thing it
describes rather than in a manifest with no second reader.

`cargo install allium-cli` was the alternative. It was rejected because it drags a third
toolchain into a repository that already pays deliberately for an unusual second one — see
[decision 0004](0004-python-toolchain.md) — and compiles from source on every cold runner.
A 1.6 MB download with a checksum is cheaper and proves more.

## Consequences

The binary is not in either lockfile, so `just lock-check` cannot speak for it. This is the
same shape as the Chromium build the story tests render in: a versioned artefact that
`just initialize` installs and a documented procedure keeps current. The procedure is in
[Maintain dependencies](../how-to/maintain-dependencies.md).

Checksums have to be produced by hand, because upstream publishes none that cover these
files. The release's own `SHA256SUMS.txt` lists only the editor extension and the language
server, and the Homebrew formula fills in two of the four unix targets and leaves the
`x86_64` entries as empty strings — `x86_64` Linux being exactly what continuous
integration runs on. The four recorded values were computed by downloading each artefact;
the two Homebrew does publish match. Moving the version means recomputing all four.

`.tools/` must stay ignored by Git. `just check` snapshots the worktree between recipes, so
a binary Git could see would abort the run before any recipe's exit code was read.

`just check-specs` sits outside the aggregate gate. `allium check` exits non-zero on
warnings as well as errors, it offers no configuration file, no severity threshold and no
way to waive a diagnostic, and the modules carry a known baseline of warnings. Gating on it
today would fail the build for findings nobody has triaged yet.

> Superseded in part on 2026-08-25. The baseline was triaged and retired: every
> diagnostic is fixed or waived in place, and `allium check` now reports no
> diagnostics and exits 0. The binary turned out to honour an undocumented whole-line
> `-- allium-ignore <code>` comment, so "no way to waive a diagnostic" was wrong — the
> waiver terms are in
> [Work with the specifications](../how-to/work-with-the-specs.md). The recipes still
> sit outside the aggregate: `allium analyse` cannot reach zero while its two remaining
> findings stand, and joining the gate is a follow-up this decision leaves open.
>
> Superseded further on 2026-08-27. `allium analyse` reached zero: its two findings were
> one checker blind spot — a `let`-bound `Game.created` the analyser could not see — and
> unbinding that creation removed both, together with the waiver it had also cost. Both
> recipes now report nothing and exit 0 on a clean checkout. Joining the gate is still
> the open follow-up.

Only the four unix targets are supported. The release also carries a Windows zip; a target
nobody here runs would be a checksum nobody re-verifies.

## What would reopen this

Upstream publishing checksums for the platform binaries, which would remove the hand
computation. A distribution channel that a lockfile can name. The third condition this
section used to carry — the baseline reaching zero — was met on 2026-08-25, so what
remains open is its consequence: `check-specs` joining `just check` and becoming a real
gate.

[upstream]: https://github.com/juxt/allium-tools

## Related pages

- [Work with the specifications](../how-to/work-with-the-specs.md)
- [Maintain dependencies](../how-to/maintain-dependencies.md)
- [Quality gates](../reference/quality-gates.md)
