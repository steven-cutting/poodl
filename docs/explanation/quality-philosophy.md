---
title: "Quality philosophy"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [quality_philosophy]
requires: []
---

# Quality philosophy

Gates encode decisions, not taste. Each one exists because someone decided something, and
the gate is what stops the decision quietly reverting. If a gate cannot be traced back to
a decision, it should be deleted rather than tolerated.

## Checks are read-only

Every recipe under `just check` reports and never repairs. `just fix` is the only command
allowed to modify files. `run_project_check.py` enforces this by snapshotting the
worktree and comparing it after every recipe, so a check that rewrites a file fails the
run rather than hiding drift.

This is why the pre-commit configuration is split in two. `.pre-commit-config.yaml` is
the gate and is what gets installed; `.pre-commit-fix.yaml` holds the mutating hooks and
runs only from `just fix`.

## Fix the cause, not the report

A suppression is a last resort: one rule, one line, with a stated reason. Lowering the
coverage threshold, disabling a lint rule at a call site, or loosening an assertion until
it passes are all ways of deleting the signal while keeping the machinery.

Where a rule is genuinely wrong for this project, the fix is to configure it once, in the
config file, with a comment saying why. `eslint.config.js` does this twice: string spread
is allowed because the vocabulary is five ASCII letters, and numbers are allowed in
template literals because accessible names interpolate positions and attempt counts.
Both are project decisions, recorded where the rule lives.

## Unreachable is not untested

Coverage distinguishes two things that look alike. A branch no input can reach is not a
gap in the tests; it is code that should not exist. Three such branches were removed
while building this repository rather than covered by contrived tests — a bounds check
after a modulo, a null fallback after an exhaustive assignment, and a defensive default
that no caller could trigger.

The corollary: do not chase the last few percent. The floor is 90, the suite currently
sits above it, and the remaining uncovered branches are Svelte-compiled update paths for
values that never change.

## Tests inject, they do not stub

A fake is not a mock. It behaves — the fake clock advances, the fake storage remembers,
the fake random walks a sequence you chose. Tests that assert a function was called are
not evidence that anything works.

Stubbing a global is banned outright, and the design makes it unnecessary: every adapter
takes its platform object as a defaulted argument. This turned out to matter more than
expected, because the test environment provides no `localStorage` and no
`navigator.clipboard` at all.

## The specification is the arbiter

When a test and the code disagree, one of them is wrong and the specification says which.
Neither is adjusted until it passes.

## Related pages

- [Quality gates](../reference/quality-gates.md)
- [Testing](../reference/testing.md)
- [Specifications](specifications.md)
