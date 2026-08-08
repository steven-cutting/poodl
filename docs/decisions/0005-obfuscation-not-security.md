---
title: "Decision 0005: Answer obfuscation is not security"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_obfuscation_not_security]
requires: []
---

# Decision 0005: Answer obfuscation is not security

## Context

A custom game is a word one player chooses for another, delivered as a link. There is no
server, so there is nowhere to keep the word: it has to travel in the URL. Anyone who
receives the link holds the answer, and anyone who reads the code holds the means to
decode it.

## Decision

Obfuscate the answer in the link, and say plainly that this is obfuscation rather than
encryption. The `AnswerObfuscation` contract in `sharing.allium` states what it must
achieve:

- Decoding what was encoded returns the original word.
- The token does not contain the answer as text and cannot be read off by eye.
- The link says nothing else about the word — not a letter, not a hint.
- Decoding rejects a token the scheme did not produce, or one that has been altered, and
  never invents a word.

The threat model is idle curiosity and a glance at the address bar. It is not a
determined attacker, and no claim is made that it withstands one.

## Consequences

The guarantee that can be kept is kept: a recipient who opens the link and plays does not
have the word spoiled, and neither does a bystander who sees the URL. The guarantee that
cannot be kept is not claimed.

A player determined to cheat can always read the code that decodes the token. There is no
opponent and no leaderboard, so there is nobody to cheat but themselves.

An altered or malformed link must fail cleanly. The specification requires it to say so
and to offer a random game rather than leaving the player at a dead end, and requires that
decoding never invents a word — a token that decodes to arbitrary letters would be worse
than one that fails.

## What would reopen this

A server. With somewhere to keep the word, the link becomes an identifier rather than a
carrier, and the answer stops travelling at all. That would be a different product; see
[Decision 0001](0001-static-site-no-backend.md).

## Related pages

- [Security model](../explanation/security-model.md)
- [Purpose and scope](../project/purpose-and-scope.md)
