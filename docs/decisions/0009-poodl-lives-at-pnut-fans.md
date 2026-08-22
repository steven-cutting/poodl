---
title: "Decision 0009: Poodl lives at pnut.fans"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_own_domain]
requires: []
---

# Decision 0009: Poodl lives at pnut.fans

## Context

Poodl was served at `https://stevencutting.com/poodl/`, and that address was a consequence
rather than a choice. The account owns a user site whose `CNAME` is `stevencutting.com`, so
that domain is the root of GitHub Pages for the whole account and a project site is served
from a subdirectory of it. `BASE_PATH=/poodl` existed only to match. The deployment page
said in as many words that only a domain belonging to this repository would serve Poodl
from a root.

The repository now has one. `pnut.fans` was already registered and carried nothing but
Google Workspace mail — five `MX` records and an `SPF` `TXT`, no `A`, no `AAAA`, no `www`.

Two facts about GitHub Pages decided the shape of the change. A repository holds exactly
one custom domain. And a project site that has its own custom domain is served from the
root of that domain, not from a subdirectory of it. Together they mean the new address
could not be a second one alongside the old: it was a move or it was nothing.

## Decision

`pnut.fans` is the custom domain on this repository's Pages site, and what the workflow
uploads is a domain rather than an application.

`site-root/` holds what sits at the root — a landing page and a `.nojekyll`.
`scripts/stage_site.sh`, reached by `just stage` and by `npm run stage`, copies it into
`site/`, copies `src/app.css` beside it, and moves `build/` to `site/poodl/`. The workflow
uploads `site/`. `just stage-preview` serves the result, because `just preview` mounts
`build/` and knows nothing about the root around it.

`BASE_PATH` stays `/poodl`, and it is now a decision rather than a constraint. Emptying it
would move the game to the root and leave the landing page with no address of its own.

The landing page is deliberately the smallest honest thing: the platform's name, one
sentence, and one link. It wears `src/app.css` rather than a palette of its own, and its
link is relative rather than rooted.

The directory is called `site-root/` and not `domain/`, because `domain` already means
pure behaviour in `src/lib/domain/` and a vocabulary that forks is worse than a long name.

## Consequences

**Every link Poodl hands out changes host, and nothing had to change for that to happen.**
`src/lib/domain/links.ts` builds a custom game's URL from the page it is running on, so a
link copied at `pnut.fans` says `pnut.fans`. That was already true and is now load-bearing.

**Mail was the risk and mail was not touched.** The change adds `A`, `AAAA`, `CNAME` and
`TXT` records to a name that already carried `MX` and `SPF`; different record types on the
same name coexist. The failure mode this avoided is not a subtle one — it is replacing a
record set wholesale — which is why
[the deployment page](../how-to/deploy-to-github-pages.md) writes the records down and says
so in bold rather than assuming the next person will infer it.

**The old address now depends on a behaviour GitHub does not document.** A project site's
former addresses redirect to its custom domain, and that is reported rather than specified
for the case that matters here, where the former address was a path under the account's
user domain. It is checked after the change instead of assumed, and a redirect page in the
user-site repository is the fix if it ever stops holding. This is a promise made about
somebody else's software.

**It was checked, and it holds with a wrinkle.** `stevencutting.com/poodl/<path>` returns
`301` to `https://pnut.fans/<path>`: the prefix is stripped and the path is mapped to the
root of the new domain rather than to `/poodl/` inside it. So an old bare link lands on the
landing page — one click from the game — and an old custom game link arrives at the root
with its token intact but no app to read it, which loses the word. A forwarder on the
landing page would rescue those, and was declined: it would put behaviour on the one page
nothing here renders or tests, which is the cost this decision already names. The
measurement is recorded in
[the deployment page](../how-to/deploy-to-github-pages.md).

**The landing page is outside every gate that means anything.** `just storybook-test` runs
axe over each story; the landing page has no story and no component, so nothing renders it,
nothing measures its contrast, and nothing types at it. Linking `src/app.css` instead of
inlining a palette is what buys back the part that could be bought back — the colours are
the ones `tests/contrast.test.ts` enumerates — but the layout, the markup and the link are
proved by a person looking at them. That is the real cost of this decision and the first
thing to fix if the page grows.

`scripts/stage_site.sh` is unproven for the same reason and a different one. `just check`
cannot run it: `stage` refuses an empty `BASE_PATH`, the gate builds without one, and
choosing a value inside the runner would put a second copy of `/poodl` somewhere the
workflow does not read. So the staging is exercised by the deploy and by whoever runs
`just stage` before handing work back, and a break in it surfaces on `main` rather than on
a pull request. Teaching the gate to build and stage at a path it is told about is the
obvious repair, and it was left undone rather than done badly.

**`src/app.css` ships twice**, once at the domain root and once inside the app's bundle.
It is a few kilobytes and it buys a single palette; a second palette in a `style` block
would have cost nothing to serve and everything to keep true.

Since [decision 0010](0010-biscuit-games-design-system.md) the three font files ship twice
as well, and they are not a few kilobytes. The copy at the root is unhashed and uncached
across the two addresses, so a visitor who lands on the front door and then opens the game
fetches both faces again. That is the price of the same trade one level up — the landing
page is set in the product's type rather than in a stack of system fallbacks — and it is
paid by one page that most visitors see once. It stops being a fair price if the root grows
a second page, which is already the thing that reopens this decision.

**The repository now owns an address larger than itself.** Poodl is one game and
`pnut.fans` is a platform's front door, so a change to the front door is a change to the
game's repository, its gate and its review. That is the wrong shape the moment there is
anything else behind the door.

## What would reopen this

A second Biscuit Games game. The domain root would belong to its own repository then, this
one would go back to owning `/poodl/` alone, and the staging step would become somebody
else's problem — which is the version of this that was rejected today only because there is
one game and a second repository would have been machinery with nothing to carry.

A landing page that stops being tiny would reopen it sooner, because the argument for
leaving a page outside the gates rests entirely on there being almost nothing to get wrong.

## Related pages

- [Deploy to GitHub Pages](../how-to/deploy-to-github-pages.md)
- [Configuration](../reference/configuration.md)
- [Design direction](../design/direction.md)
- [Decision 0001: A static site with no backend](0001-static-site-no-backend.md)
- [Decision 0010: The Biscuit Games design system](0010-biscuit-games-design-system.md)
