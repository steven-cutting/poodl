---
name: fix-quality
description: Diagnose and repair a failing quality gate at its root instead of suppressing the finding.
---

# Fix a failing gate

1. Read `AGENTS.md`, then reproduce with the narrowest recipe rather than the whole gate. `just check` names the recipe that failed; run that one alone.
2. Dispatch on which gate failed:
   - Prettier or Ruff formatting — run `just fix`; never hand-format to match.
   - ESLint — fix the code. A rule that is wrong for this project is changed in `eslint.config.js` with a comment saying why, not disabled at the call site.
   - `svelte-check` — fix the types. It runs with `--fail-on-warnings`, so a warning is a failure.
   - Coverage below the floor — add the missing test. Never lower the threshold in `vite.config.ts`.
   - `check-docs` — a frontmatter list that disagrees with `docs/manifest.yml` is usually list order; the comparison is order-sensitive.
   - `check-agents` — a bridge under `.claude/` or `.codex/` has grown content, or a managed file is missing from the inventory.
   - `lock-check` — run `just lock`, and read the lockfile diff before accepting it.
3. Distinguish an unreachable branch from an untested one. Defensive code no input can reach should be removed, not covered by a contrived test.
4. Never disable a gate to make a run green. A suppression is a last resort: one rule, one line, with a stated reason.
5. If a recipe changed the worktree, that is a defect in the recipe — checks are read-only. Fix the recipe.
6. Run the narrow recipe, then `just check` to confirm nothing else moved.
