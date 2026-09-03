---
title: "Decision 0001: A static site with no backend"
kind: "decision"
audience: [maintainer, agent]
canonical_for: [decision_no_backend]
requires: []
---

# Decision 0001: A static site with no backend

## Context

Poodl is a single-player word game with no accounts, no leaderboard and no shared state.
The conventions it inherits come from a full-stack template with a Python backend, a
PostgreSQL database and a generated API client.

## Decision

Build a static site. SvelteKit with `@sveltejs/adapter-static`, every route prerendered,
published to GitHub Pages. Drop the backend half of the template entirely: no server, no
database, no API, no generated client, and no `frontend/` subdirectory to be a sibling of
something that does not exist.

## Consequences

Deployment is a directory of files. There is nothing to operate, nothing to scale,
nothing to patch between releases, and no secret to rotate. Hosting is free.

Statistics and settings belong to one browser on one device. Clearing browser data
destroys them and nothing can restore them. That is a real cost borne by the player.

A custom game has nowhere to be recorded, so its answer travels inside the link. See
[Decision 0005](0005-obfuscation-not-security.md).

Prerendering has teeth. Module-scope work runs once, at build time, in Node — so anything
per-visitor must happen in the browser after hydration, and a route that cannot be
rendered at build time fails the build rather than shipping.

The base path becomes configuration. A project site is served from a subdirectory, so
`BASE_PATH` is read at build time into `paths.base`; a custom domain later means deleting
one line from the workflow.

**That last clause is superseded by
[decision 0009](0009-poodl-lives-at-pnut-fans.md).** The custom domain arrived and the line
was not deleted. `BASE_PATH` still names where Poodl sits, because the domain root became a
landing page rather than the game — by choice now, where it had been a constraint.

## What would reopen this

Anything requiring shared state between players: accounts, a synchronised daily word,
leaderboards, or statistics that follow a player between devices. Each of those needs a
server, and none is in scope — see
[Purpose and scope](../project/purpose-and-scope.md).

**The daily word in that list is superseded by
[decision 0012](0012-the-daily-word-is-a-function-of-the-date.md).** A word that is a
function of the date and of data shipped with the site needs no shared state, so Daily
mode arrived without reopening this decision. The rest of the list stands.

## Related pages

- [Architecture](../explanation/architecture.md)
- [Deploy to GitHub Pages](../how-to/deploy-to-github-pages.md)
