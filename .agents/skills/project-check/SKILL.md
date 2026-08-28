---
name: project-check
description: Bring a workspace to a state where the full gate runs, and interpret what it reports.
---

# Run the full gate

1. Read `AGENTS.md`. The `Justfile` is the only supported interface to the checks; do not assemble an equivalent pipeline by hand.
2. Check the prerequisites exist: `uv.lock`, `package-lock.json`, `node_modules/` and the pinned checker at `.tools/bin/allium`. If any is missing, run `just initialize` — it creates them, normalises formatting and installs the hook, and it never stages, commits, tags or pushes. The checker alone is `just install-allium`; it is gitignored and per-worktree, so a fresh worktree needs it before gates 2, 10 and 11 can pass.
3. Run `just check`. It runs each recipe in order and snapshots the worktree between them.
4. Read only the first failure. The gates are ordered so that a later failure is often a consequence of an earlier one.
5. A report that a recipe changed the worktree is a defect in that recipe, not in the change under test. Checks are read-only; `just fix` is where mutation belongs.
6. Hand a failing gate to the `fix-quality` skill rather than working around it.
7. Confirm with `just check-clean` that the worktree is unchanged before reporting success.
