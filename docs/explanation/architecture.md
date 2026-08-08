---
title: "Architecture"
kind: "explanation"
audience: [contributor, maintainer, operator, agent]
canonical_for: [system_architecture]
requires: []
---

# Architecture

Poodl is a static site. The build produces a directory of files; a host serves them
unchanged; everything after that happens in the browser. There is no request the
application can make to itself, no session, and no origin it trusts.

That constraint is not a limitation working around a missing backend — it is the
architecture. See
[Decision 0001](../decisions/0001-static-site-no-backend.md).

## Build

SvelteKit with `@sveltejs/adapter-static`, prerendering every route. `+layout.ts` sets
`prerender = true` for the whole tree, so a route that could not be rendered at build
time fails the build rather than shipping broken.

Prerendering has one consequence worth stating plainly: **module-scope work runs once, at
build time, in Node.** Anything that must differ per visitor — drawing an answer, reading
stored statistics, looking at the clock — happens in the browser after hydration, not
while the page is being generated.

The build is portable across base paths. SvelteKit emits relative asset URLs, and
`paths.base` is read from `BASE_PATH` at build time, so the same source produces a
project-site build and a custom-domain build without a code change.

## Runtime shape

```text
routes/           assembles pages
  └── components/ renders and handles interaction
        └── domain/  pure behaviour, no side effects
        └── ports/   every side effect, behind an interface
```

The direction is one way and is described in
[Layering and dependency direction](layering.md).

## State

There is no server, so every piece of durable state lives in the browser:

| State | Where it lives | Lost when |
| --- | --- | --- |
| The current game | Device storage, through the storage port | Browser data is cleared |
| Statistics and the answer pool | Device storage | Browser data is cleared |
| Settings | Device storage | Browser data is cleared |
| A custom game's answer | Inside the link itself | The link is lost |

The last row is the interesting one. A custom game has nowhere to be recorded, so the
answer travels in the URL, obfuscated. That is a deliberate trade, not an oversight; see
[Decision 0005](../decisions/0005-obfuscation-not-security.md).

## Side effects

Five things reach outside the pure core: storage, randomness, the clock, the clipboard,
and the word lists. Each sits behind a port in `src/lib/ports/` with a real adapter and
an in-memory fake, so the entire application above them is testable without a browser.
The reasoning is in [Decision 0002](../decisions/0002-ports-and-fakes.md).

## What is not here

No API, no database, no authentication, no background jobs, no telemetry. Those are not
deferred; they are out of scope, as
[Purpose and scope](../project/purpose-and-scope.md) records.

## Related pages

- [Layering and dependency direction](layering.md)
- [Security model](security-model.md)
- [Repository map](../project/repository-map.md)
- [Deploy to GitHub Pages](../how-to/deploy-to-github-pages.md)
