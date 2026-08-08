---
name: plan-change
description: Plan a change when the scope, affected specifications, risks, or validation need evidence before any code is written.
---

# Plan a change

1. Read `AGENTS.md` and the specification modules the change touches. Separate what you read from what you are guessing.
2. Inspect the worktree before proposing anything, and preserve work you did not author.
3. Write down the observable outcome, and the explicit non-goals. A plan that does not say what it will not do cannot be reviewed for scope.
4. Identify whether behaviour changes. If it does, the specification changes first — hand off to the `spec-change` skill rather than planning code against an unchanged spec.
5. Identify the boundaries crossed: a new side effect needs a port and a fake; a new surface needs its `@guarantee` clauses honoured; a new topic needs an owning documentation page.
6. Name the risks and the evidence that would settle them, and say which actions need authorization the agent does not already have.
7. Split into steps that can each be verified on their own, each pairing behaviour with its test and its documentation.
8. Present the plan with open questions marked as open. Confirm the plan runs green with `just check` before treating it as done.
