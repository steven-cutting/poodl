---
title: "Decision 0004: A Python toolchain in a frontend repository"
kind: "decision"
audience: [maintainer, agent]
canonical_for: [decision_python_toolchain]
requires: []
---

# Decision 0004: A Python toolchain in a frontend repository

## Context

Poodl ships no Python. The hook gate it inherits from the template runs on `prek` under
`uv`, and the documentation and agent contracts are enforced by two Python scripts. A
frontend repository could avoid Python entirely by moving the hook runner to a Node
equivalent and rewriting both validators in TypeScript.

## Decision

Keep the Python toolchain. `pyproject.toml` declares a virtual project — `package = false`
— whose only dependencies are `prek` and `ruff`, both pinned exactly and locked in
`uv.lock`.

Ruff is added on top of the template's gate list because the scripts under `scripts/` are
real Python that would otherwise go unlinted in a repository that gates everything else.

## Consequences

Contributors need `uv` as well as Node. `just initialize` installs both, and neither the
application nor the published site contains any Python.

The two contracts stay as they are, rather than being rewritten and re-debugged. That is
most of the value: `validate_docs.py` and `validate_agents.py` are ported from a working
implementation, so their behaviour is known rather than newly invented.

`prek` brings pinned third-party hooks with it — `typos`, `lychee`, `shellcheck`,
`actionlint`, `ripsecrets`, `editorconfig-checker` — each locked to a commit SHA. Assembling
an equivalent set on Node would be a project in itself.

The cost is an extra toolchain to install, keep current, and explain. It is accepted
deliberately rather than by drift.

## What would reopen this

A Node-native hook runner with the same pinned-hook ecosystem, or the two validators
becoming so simple that rewriting them is cheaper than keeping Python around.

## Related pages

- [Quality gates](../reference/quality-gates.md)
- [Maintain dependencies](../how-to/maintain-dependencies.md)
