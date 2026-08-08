# Security policy

## Reporting a vulnerability

Report suspected vulnerabilities privately, through GitHub's private vulnerability
reporting on this repository. Please do not open a public issue for anything you believe
is exploitable.

Include what you did, what happened, and what you expected. A link that reproduces the
behaviour is worth more than a description of it.

## Supported versions

The deployed site is built from `main`. There are no released versions to support and no
backports: a fix lands on `main` and deploys.

## What is in scope

- Anything that lets one visitor affect another, if such a thing existed.
- Credential material committed to the repository.
- A dependency or GitHub Action that has been tampered with, or a lockfile that does not
  match its manifest.
- A flaw in the workflow permissions that would let a build publish something it should
  not.

## Out of scope

- Reading the answer to your own current game. It is in your browser by necessity; there
  is no opponent to gain an advantage over.
- Decoding a custom-game link. The answer is obfuscated, not encrypted, and this is
  stated rather than claimed otherwise. See
  [Decision 0005](docs/decisions/0005-obfuscation-not-security.md).
- Denial of service against GitHub Pages.
- Anything a person can do to their own browser.

## What this project already does

- No server, no accounts, no database, and no data collected about anyone. Nothing leaves
  the browser.
- No external scripts, fonts or images at runtime.
- Every dependency pinned to an exact version and locked; `just lock-check` fails if a
  manifest and its lockfile disagree.
- Every GitHub Action pinned to a commit SHA rather than a mutable tag.
- Continuous integration runs with `contents: read`. Only the Pages deployment holds
  write scopes, in its own workflow file.
- `ripsecrets` scans every commit, with its output suppressed so a match never copies the
  matched value into a log.

The reasoning behind all of this is in
[Security model](docs/explanation/security-model.md).
