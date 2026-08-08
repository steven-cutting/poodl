---
title: "Documentation contract"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [documentation_contract]
requires: []
---

# Documentation contract

Enforced by `scripts/validate_docs.py`, run by `just check-docs` and by a pre-commit
hook. It reports every violation at once rather than stopping at the first.

The contract exists so documentation cannot quietly rot: every page is registered once,
owns its topics, repeats its metadata in frontmatter, and is reachable from the index.

## The manifest

`docs/manifest.yml` is the index, and it is parsed as strict JSON despite the extension —
JSON is a subset of YAML. No trailing commas, no comments.

```json
{"path": "reference/commands.md", "title": "Commands", "kind": "reference",
 "audience": ["contributor", "maintainer", "operator", "agent"],
 "canonical_for": ["command_reference"], "requires": []}
```

Every entry carries exactly those six keys — extra keys fail as loudly as missing ones.

## Frontmatter

Every page carries exactly five keys, and each must equal the manifest entry.

```markdown
---
title: "Commands"
kind: "reference"
audience: [contributor, maintainer, operator, agent]
canonical_for: [command_reference]
requires: []
---
```

Two things catch people out. Lists must be inline (`[a, b]`), because the parser is
hand-rolled and does not accept block sequences. And the comparison is **order-sensitive**
— `[maintainer, contributor]` against a manifest saying `["contributor", "maintainer"]`
fails.

## The rules

| Field | Constraint |
| --- | --- |
| `kind` | One of `project`, `tutorial`, `how-to`, `explanation`, `reference`, `operations`, `decision`. |
| `audience` | Non-empty subset of `user`, `contributor`, `maintainer`, `operator`, `agent`. |
| `canonical_for` | At least one topic, and every topic is owned by exactly one page across the whole tree. |
| `requires` | Feature predicates. This project defines none, so every page carries `[]`. |

Beyond the fields:

- The body's **first heading is level one and its text equals the `title`** exactly.
- The body has at least **forty words**.
- No unresolved template delimiters, no unfinished markers, no placeholder prose.
- Every relative link resolves, with **exact case** — which is what catches mistakes on a
  case-insensitive filesystem — and any `#fragment` matches a real heading anchor.
- Every page is **reachable from `docs/README.md`** by following links. Adding a page
  without linking it in fails, even when everything else is correct.
- Nothing under `docs/` may exist unregistered, and nothing registered may be absent.

Only `docs/**/*.md` is in scope. The Allium specifications are not Markdown, so the
contract does not see them; they are still valid link targets.

## Outside the contract

`README.md`, `SECURITY.md`, `CHANGELOG.md`, `AGENTS.md` and `CLAUDE.md` at the repository
root carry no frontmatter and are not in the manifest. They are still checked by
markdownlint, `typos` and the link checker. `AGENTS.md` has its own validator; see
[Agent contract](agent-contract.md).

## Related pages

- [Agent contract](agent-contract.md)
- [Quality gates](quality-gates.md)
- [Documentation map](../README.md)
