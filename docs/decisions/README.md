---
title: "Architecture decisions"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_index]
requires: []
---

# Architecture decisions

A record of what was chosen, what it cost, and what would have to change for the choice
to be revisited. Each entry is numbered and never renumbered; a decision that is
superseded is marked rather than deleted, because the reasoning is what makes the
successor legible.

These are decisions about *how* Poodl is built. Decisions about *what* it does belong in
the specifications under `docs/specs/`, and unresolved ones are recorded there as
`open question` blocks — see [Specifications](../explanation/specifications.md).

## The record

| Number | Decision |
| --- | --- |
| [0001](0001-static-site-no-backend.md) | A static site with no backend |
| [0002](0002-ports-and-fakes.md) | Side effects behind ports |
| [0003](0003-specs-are-the-source-of-truth.md) | Specifications decide behaviour |
| [0004](0004-python-toolchain.md) | A Python toolchain in a frontend repository |
| [0005](0005-obfuscation-not-security.md) | Answer obfuscation is not security |
| [0006](0006-component-workshop.md) | A component workshop |

## Writing a new one

Copy the shape of an existing entry: context, the decision, the consequences including
the ones that hurt, and what would reopen it. Add the file, add a manifest entry, add a
row above. A decision nobody can find is not recorded.

## Related pages

- [Documentation map](../README.md)
- [Architecture](../explanation/architecture.md)
