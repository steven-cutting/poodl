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
routes/           assembles pages, and is the only place a store is built
  └── components/ renders and handles interaction
        └── app/     the rules as a pure reducer, and one rune shell
              └── domain/  pure behaviour, no side effects
              └── ports/   every side effect, behind an interface
```

The direction is one way and is described in
[Layering and dependency direction](layering.md).

`app/` is where the specifications live as code. `engine.ts` is
`reduce(state, command, env)`: every rule in `docs/specs/` as one pure function, with the
clock, the randomness and the word lists arriving in `env` rather than being imported.
`store.svelte.ts` is the only rune-bearing file outside a component or a route — it holds the
application's state, wires the ports to the engine, and performs the one effect a reducer
cannot, which is writing to the clipboard.
See [Decision 0007](../decisions/0007-rules-as-a-reducer.md).

## State

There is no server, so every piece of durable state lives in the browser. All of it is one
value, saved under one key with a schema version inside it, and read back defensively —
storage is somewhere other software can write, and somewhere an older Poodl may already have
written, so nothing found there is believed without being checked.

| State | Where it lives | Lost when |
| --- | --- | --- |
| The current game, and the mode last chosen | Device storage, through the storage port | Browser data is cleared |
| Today's daily game, while another mode holds the board | Device storage | A later day's daily game takes its place |
| Statistics, the daily record and the answer pool | Device storage | Browser data is cleared |
| Settings | Device storage | Browser data is cleared |
| A custom game's answer | Inside the link itself | The link is lost |
| A link just made, and whatever Poodl is saying | Nowhere at all | The page is reloaded |

The custom game's row is the interesting one. A custom game has nowhere to be recorded, so
the answer travels in the URL, obfuscated. That is a deliberate trade, not an oversight; see
[Decision 0005](../decisions/0005-obfuscation-not-security.md).

The last row is deliberate in the other direction. A link Poodl has just made is never
recorded, which is what `NothingAboutTheLinkIsKept` requires of it; and an armed endless
countdown is not saved either, because one that outlived the session would elapse on the
next arrival and start a game the player never asked for.

## Side effects

Seven things reach outside the pure core: storage, randomness, the clock, the clipboard,
the word lists, the device's colour-scheme and reduced-motion preferences, and a repeating
timer. The timer serves two: it ticks the endless countdown, and it watches the calendar,
so the day turns on a tab left open across midnight rather than waiting for a keystroke.
Each sits behind a port in `src/lib/ports/` with a real
adapter and an in-memory fake, so the entire application above them is testable without a
browser. The reasoning is in [Decision 0002](../decisions/0002-ports-and-fakes.md).

## What is not here

No API, no database, no authentication, no background jobs, no telemetry. Those are not
deferred; they are out of scope, as
[Purpose and scope](../project/purpose-and-scope.md) records.

## Related pages

- [Layering and dependency direction](layering.md)
- [Decision 0007](../decisions/0007-rules-as-a-reducer.md)
- [Security model](security-model.md)
- [Repository map](../project/repository-map.md)
- [Deploy to GitHub Pages](../how-to/deploy-to-github-pages.md)
