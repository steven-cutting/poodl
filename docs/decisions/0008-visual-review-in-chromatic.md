---
title: "Decision 0008: Visual review in Chromatic"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_visual_review]
requires: []
---

# Decision 0008: Visual review in Chromatic

## Context

[Decision 0006](0006-component-workshop.md) built the workshop and said, in as many words,
that nothing publishes it. That held while the workshop was a thing to open on a laptop.

It stopped holding for the reason 0006 itself records. Three contrast defects were found
there; the third one — a dark-theme keyboard key at 3.49 to 1 — stayed green in the gate
and was caught by a person flipping a toolbar control. Headless Chromium reports a light
preference, so the automated pass could not reach it. That is the shape of the problem: axe
answers a question about rules, and a rendered pixel answers a question about whether the
thing looks right. The second question has no local answer that survives being forgotten.

A hundred and five stories across nineteen components is also more than anyone re-opens by
hand after a change to a stylesheet.

## Decision

Publish the workshop to Chromatic for visual review.

`chromatic@18.2.0` is a pinned devDependency, `chromatic.config.json` names the build
script and the two behaviours below, and `just chromatic` is the only way it is ever run —
locally or in CI, which is what keeps
[the rule that nothing in CI runs a command you cannot run yourself](../reference/quality-gates.md)
true. The Chromatic GitHub Action was not used: it would be a second, separately versioned
copy of logic the pinned dependency already holds, and its documented `@latest` reference
cannot satisfy this repository's SHA pinning.

The recipe sits outside `just check`, beside `check-links-online`, because it needs the
network and a token. The gate stays offline: nothing `just check` runs needs either. (This
sentence used to count the gates, which was true when it was written and stopped being
true on 2026-08-28, when the two specification gates joined the aggregate.
[Quality gates](../reference/quality-gates.md) owns the list and is the count to trust.)

`.github/workflows/chromatic.yml` has two entry points, and they do different jobs:

- **A push to `main` sets the baseline.** `autoAcceptChanges` is scoped to that branch, so
  what merges becomes what later builds are measured against. Without it the baseline would
  be the last *accepted* build, nothing would ever be accepted, and every build would
  accumulate the same growing diff against a frozen ancestor.
- **A `/chromatic` comment on a pull request publishes that branch for review.** This is
  where a change is actually looked at. It is deliberately a thing you ask for: most pushes
  do not touch a component, and a hundred and five snapshots is a real cost. It publishes
  for a commenter whose effective repository permission is write or better, and only a head
  branch in this repository; a fork's pull request is refused rather than published.

A detected change reports and passes. Chromatic is not a required check.

## Consequences

The question no local tool can answer now has somewhere to be answered, and the answer is a
link on the pull request rather than an intention to look later.

**A third party now holds renders of the interface.** Poodl collects nothing and stores
nothing remotely, and that is still true of the product; it is no longer true of the
development toolchain. The renders contain no data about anyone — they are the components,
in states a story pins — but the claim in
[the security model](../explanation/security-model.md) had to be narrowed from *there are
no credentials* to *there are none in the product*, which is a smaller claim honestly
stated.

**The repository has its first secret.** `CHROMATIC_PROJECT_TOKEN` lives as a GitHub
Actions secret and is read from the environment. It is written into no file here, which is
why `just chromatic` fails rather than publishing when it is missing, and why a contributor
has to set it up rather than finding it already working.

**A regression that reaches `main` is accepted silently.** That is the direct cost of
auto-accepting there. The review gate is the pull request comment and there is no other, so
a change nobody asked to see becomes the baseline it should have been compared against. The
alternative — a human accepting every `main` build in Chromatic's own interface — was
rejected as a step that would be skipped, leaving a baseline that quietly stopped moving.

**The comment trigger is a manual step someone has to remember**, and it does nothing until
this file's workflow is on the default branch, because GitHub runs `issue_comment` from
there. The pull request that introduces it cannot trigger itself.

**`issue_comment` is a known privilege-escalation shape, so a fork's pull request gets no
visual review.** Two questions have to be answered before the token is in reach, and only
one of them is about the person. Who asked is settled by querying the commenter's effective
repository permission and requiring write or better. `author_association` decides nothing,
because it reports a relationship rather than a permission and an organization member or a
triage-level collaborator would pass a check on it; it survives as a prefilter on the job
only because it is a superset of write access, so a stranger cannot start a runner. Whose
code runs is settled by refusing
a cross-repository head, because `just sync` runs the head's `package.json` lifecycle
scripts, and a maintainer deciding after reading the diff is judgement, not isolation. Both
are settled in a job that checks nothing out and holds no secret.

The permission query has never run, and cannot until this workflow is on `main`, so the
claim above is a design and not an observation. It is written to fail closed: the owner is
answered without the call at all, and a call that cannot be made refuses rather than
guessing — which is also what a `GITHUB_TOKEN` holding no more than `contents: read` would
produce if the endpoint turns out to need more than that. The first `/chromatic` from
someone other than the owner is the test. Its notice says only that the call failed rather
than reporting a permission; `gh`'s own error in the run log is what separates a member
with no access here from a token that cannot read the endpoint at all.

**The first `/chromatic` was refused, but not there.** The permission query was never reached
— the commenter was the owner, who is answered without the call — and the run died on the
acknowledging reaction instead, with a 403 to a token holding `issues: write`. A comment on a
pull request sits on `issues/*` endpoints but is weighed against the pull request, so the
workflow holds `pull-requests: write` as well. Both the reaction and the closing reply are now
best-effort: neither is the build, and a note about a hundred and five published snapshots
must not colour them red.

The cost is that a contributor without write access cannot see their own change rendered,
and neither can anyone reviewing it. On a repository with one author that is a cost nobody
pays. It is the first thing to revisit if that changes: publishing a fork under Chromatic's
`owner:branch` form would fix the baseline half of the problem, but the token half needs
the build to stop being the thing that holds the token.

**The workshop is built twice on a push to `main`** — once by the `stories` job, which
proves it and throws it away, and once by Chromatic, which publishes it. That is a minute
of duplicated work kept on purpose, so that a red gate and a published baseline stay
independent of each other.

**The branch name is resolved by hand in the workflow, and the resolution has to hold.** An
`issue_comment` run reports `GITHUB_REF` as the default branch, so without `--branch-name`
a review build would file itself under `main` and be auto-accepted as the baseline it was
meant to be compared against. The step asserts a non-empty name rather than falling back,
and refuses one that is `main` outright — with cross-repository heads already refused there
is no legitimate way for that name to arrive, and the check costs a line.

TurboSnap (`--only-changed`) is not enabled. It would cut the snapshot count sharply, but
it depends on the builder's dependency graph and adds a way for the comparison to be wrong
rather than merely slow. It is the obvious thing to reach for when the count starts to
matter.

## What would reopen this

The snapshot count outgrowing what the plan allows, which would make TurboSnap the next
decision rather than a deferred one. Chromatic's pricing or ownership changing. Or the same
thing that would reopen 0006: the surfaces getting built and the workshop being deleted,
which takes its visual review with it.

## Related pages

- [Decision 0006: A component workshop](0006-component-workshop.md)
- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Quality gates](../reference/quality-gates.md)
- [Security model](../explanation/security-model.md)
