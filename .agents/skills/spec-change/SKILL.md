---
name: spec-change
description: Change an Allium specification and carry the change through the tests and the implementation.
---

# Change a specification

The specifications under `docs/specs/` decide behaviour. Code that disagrees with one is wrong until the specification is changed to say otherwise, so the specification moves first and the implementation follows.

1. Read `AGENTS.md` and `docs/explanation/specifications.md`. Identify which module owns the behaviour: `words`, `game`, `settings`, `statistics` or `sharing`.
2. Read the whole module before editing, including its `Scope`, `Excludes` and `open question` blocks. A change that belongs in another module's scope goes there instead.
3. Edit the specification: state the rule as a trigger, its guards and its outcomes. Record what you could not decide as a new `open question` rather than guessing at a product decision.
4. Check that dependent modules still hold. `game.allium` is depended on by the other three, so a change to a trigger or an entity ripples.
5. Derive the tests from the changed clauses before writing implementation, and confirm they fail first. A test that is already green proves nothing about the new behaviour.
6. Implement until the tests pass. Never weaken a test to make it pass — fix the specification and re-derive instead.
7. Run `just check-specs`. It asserts that every module reports an empty `diagnostics` array — it reads the JSON rather than the exit code, so an `info` diagnostic fails it too — and an untouched checkout is clean, so anything it reports is a regression your change introduced. Fix it at the root; only a construct the pinned checker is verifiably wrong about may be waived, as a whole-line `-- allium-ignore <code>` comment directly above the diagnosed line with its reason on the comment line above it — the terms are in `docs/how-to/work-with-the-specs.md`. Then run `just analyse-specs`, which asserts the `findings` array is empty as well; a finding cannot be waived, so any finding is a regression to fix at the root. Both are gates now: they run as pre-commit hooks and inside `just check`, and both need `just install-allium` in a fresh worktree.
8. Run `just frontend-unit`, then `just check` before handoff.
