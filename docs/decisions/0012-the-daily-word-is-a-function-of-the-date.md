---
title: "Decision 0012: The daily word is a function of the date"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_daily_word]
requires: []
---

# Decision 0012: The daily word is a function of the date

## Context

The purpose page listed "no daily word" among the things Poodl deliberately does not do,
and [decision 0001](0001-static-site-no-backend.md) named a synchronised daily word as
something that would need a server. Both said the same thing: without shared state there
is nothing to hand every player the same word.

That was true of a word chosen at random and false of a word chosen by rule. A static
site cannot coordinate players, but it does not need to if every copy of it reaches the
same answer from the same inputs: the date, and data shipped in the bundle. Daily mode
asks for exactly that — one word a day, the same for everyone, changing at midnight on
the Pacific coast, playable once — and [`daily.allium`](../specs/daily.allium) specifies
it.

## Decision

The word for a day is read from a schedule: the answer list in a fixed order, shipped as
a third data file beside the two lists. Days are numbered from an epoch date, day n plays
entry n, and the schedule wraps when it runs out. The day turns at local midnight in
`America/Los_Angeles`, daylight saving included, wherever the player is.

The schedule's positions are frozen across releases. New answer words are appended; a
word withdrawn from the answer list is replaced in place; nothing is inserted, removed or
reordered. [`words.allium`](../specs/words.allium) states this as an obligation on
whatever supplies the lists, beside the append-only dictionary.

Two alternatives were weighed and declined.

- **A seeded shuffle** of the sorted answer list, indexed by day, needs no file and no
  maintenance. But any edit to the list reshuffles every future day: a release landing
  mid-day gives the two halves of the day different words, and a word played last week
  can come straight back. That fails the one property asked for, robustness to adding
  words.
- **Rendezvous hashing** — hash the day against every answer word and take the highest —
  needs no file either, and adding a word changes only the days that word wins, about one
  in eleven hundred. But each day is an independent draw, so repeats are inherent: the
  first is expected within about six weeks, and about sixty a year. A daily game whose
  players compare notes cannot afford that.

The schedule is the only option that is both robust to additions and free of repeats. It
is also the original Wordle design, so it is what players expect.

## Consequences

There is a third data file, and appending to it is part of adding an answer word. The
word-list tests are to hold the schedule to being a permutation of the answer list, so a
word added to one file and not the other fails the gate, and to pin the frozen prefix, so
a stray sort fails too. The word-list procedure gains a step and loses the freedom to
sort that file.

Anyone who reads the bundle can find tomorrow's word. That is the same trade the custom
links make — see [decision 0005](0005-obfuscation-not-security.md) — and there is nobody
to cheat but oneself.

A release that replaces today's slot in place splits the day between the two builds.
Repairs should avoid the current slot, or accept the split knowingly.

After the schedule wraps, which at 1,122 entries is about three years away, an append
shifts every later day by one. The specification says so rather than hiding it; the
intended maintenance is to append before the wrap.

The day boundary is a time zone's rules, not an offset. The implementation will need the
platform's zone data, and tests around the two daylight-saving transitions.

Two documents changed their minds: the purpose page no longer lists a daily word among
the non-goals, and decision 0001's reopening clause no longer counts a daily word among
the things that need a server.

## What would reopen this

A server, which would make the schedule a thing to fetch rather than to ship. The
schedule running out with nobody to extend it, which would argue for a scheme that needs
no file. Or the maintenance proving heavier than it looks, at which point rendezvous
hashing is the fallback, at the cost of repeats.

## Related pages

- [Purpose and scope](../project/purpose-and-scope.md)
- [Replace the word lists](../how-to/replace-the-word-lists.md)
- [Specifications](../explanation/specifications.md)
