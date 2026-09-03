---
title: "Purpose and scope"
kind: "project"
audience: [user, contributor, maintainer, agent]
canonical_for: [project_purpose, project_non_goals]
requires: []
---

# Purpose and scope

Poodl is an unlimited-play, Wordle-style word guessing game. A player guesses a
five-letter word in up to six attempts; each submitted guess comes back marked letter by
letter, and the marks are the only information the game gives away.

It runs entirely in the browser as a static site. There is no server, no account and no
database, which is what makes "unlimited" straightforward: nothing rations a game,
because nothing is tracking one. The one word a day that Daily mode plays needs no server
either: it is a function of the date and of data shipped with the site — see
[decision 0012](../decisions/0012-the-daily-word-is-a-function-of-the-date.md).

## What it does

- Five modes. Daily plays one word a day, the same for everyone, once; random and endless
  draw from a curated answer list and count towards statistics; practice draws freely and
  records nothing; custom games come from a link someone made.
- Statistics that persist on the device: games played, wins, current and maximum streak,
  and the distribution of winning guess counts — and a separate daily record, whose
  streak counts consecutive days won.
- Results shared as a grid of coloured squares that names no letter and no word.
- Custom games shared as a link that carries the answer obfuscated, because there is no
  server to keep it on.
- A welcome screen on opening: an introduction the first time, and afterwards the mode
  last played offered alongside the four a player can start.
- Settings for theme, high contrast, hard mode, animations, physical-keyboard input and
  whether the welcome screen appears.

The precise behaviour of each is specified in `docs/specs/`, not here. See
[Specifications](../explanation/specifications.md).

## What it deliberately does not do

- **No daily limit outside Daily.** Daily is one word a day by design, and it is the only
  mode the date touches: Poodl never withholds a random, endless or practice game because
  of the date or because of how many have been played.
- **No accounts, no sync.** Statistics and settings belong to one browser on one device.
  Clearing browser data clears them, and nothing can restore them.
- **No server.** Nothing is uploaded, and nothing about a custom game is recorded
  anywhere its recipient could reach. A link that is lost is gone.
- **No analytics or telemetry.** See [Security model](../explanation/security-model.md).
- **No multiplayer, no leaderboards, no timed events.** Sharing is a grid of squares
  someone pastes into a message, and nothing more.

## Who it is for

A single player, on their own device, who wants another game without waiting until
tomorrow — and, once a day, one word to compare with everyone else's. Everything else
follows from that.

## Related pages

- [Repository map](repository-map.md)
- [Terminology](terminology.md)
- [Architecture](../explanation/architecture.md)
