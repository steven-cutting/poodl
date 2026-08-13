---
title: "Security model"
kind: "explanation"
audience: [user, contributor, maintainer, operator, agent]
canonical_for: [security_model]
requires: []
---

# Security model

Poodl has no server, no accounts and no data about anyone. That removes most of the
attack surface a web application usually has, and it is worth being precise about what
remains rather than claiming the problem away.

## What there is to protect

Very little, and that is the point.

- **Nothing is collected.** No analytics, no telemetry, no error reporting, no cookies.
  Nothing leaves the browser.
- **Nothing is stored remotely.** Statistics, settings and the current game live in
  device storage and are never uploaded. There is nowhere to upload them to.
- **There are no credentials in the product.** No sign-in, no tokens, nothing secret in
  the build or the bundle. The `ripsecrets` gate exists to keep it that way. The
  repository has exactly one secret and it belongs to the toolchain, not to Poodl: a
  Chromatic project token, held as a GitHub Actions secret and read from the environment,
  written into no file here.

The practical consequence for a user is that clearing browser data destroys their
statistics irrecoverably. That is a real cost of the design and is stated in
[Purpose and scope](../project/purpose-and-scope.md).

## What is deliberately not secure

**The custom-game link is obfuscated, not encrypted.** The answer rides in the URL
because there is no server to keep it on. The obfuscation has to survive idle curiosity
and a glance at the address bar — not a determined attacker, who can always read the code
that decodes it. This is stated as guidance in the specification and recorded in
[Decision 0005](../decisions/0005-obfuscation-not-security.md).

**Nothing prevents a player cheating themselves.** The answer to the current game is in
memory and in device storage. A player with developer tools can read it. There is no
opponent and no leaderboard, so there is nobody to cheat but themselves.

## What the build defends

- **Supply chain.** Every dependency is pinned exactly and locked; `just lock-check`
  fails if a manifest and its lockfile disagree. GitHub Actions are pinned to commit
  SHAs, not to mutable tags.
- **Workflow permissions.** CI runs with `contents: read`. Only the Pages deployment
  holds `pages: write` and `id-token: write`, and only Chromatic holds `issues: write`,
  which it needs to answer the comment that summoned it. Each lives in its own file so the
  scopes are visible rather than inherited.
- **The comment trigger.** `/chromatic` on a pull request starts a job holding the
  Chromatic token, and an `issue_comment` workflow always runs against the base
  repository with its secrets — including when the comment sits on a fork's pull request.
  Two checks stand between the comment and the token, and they answer different questions.
  *Who asked* is the commenter's effective repository permission, queried and required to
  be write or better; `author_association` is not consulted, because it reports a
  relationship and an organization member or a triage-level collaborator reports a value
  that sounds like authority and is not. *Whose code runs* is the head repository: a
  cross-repository head is refused outright, because `just sync` would otherwise run that
  fork's install scripts beside the token, and a person deciding to type the word is not
  isolation. Both are settled in a job that checks nothing out and holds no secret, and
  the publishing job does not start until they pass.
- **Credential leakage.** `ripsecrets` scans every commit, and its output is suppressed so
  a match never copies the matched value into a log.
- **Third-party content at runtime.** There is none. The site loads no external script,
  font, or image, so there is nothing to subvert between the host and the browser.

## What is out of scope

Denial of service against the host, GitHub's own infrastructure, and anything an attacker
can do to their own browser. There is no shared state, so nothing one visitor does can
affect another.

## Reporting

See `SECURITY.md` at the repository root.

## Related pages

- [Architecture](architecture.md)
- [Maintain dependencies](../how-to/maintain-dependencies.md)
- [Quality gates](../reference/quality-gates.md)
