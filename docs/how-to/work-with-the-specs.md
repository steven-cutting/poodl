---
title: "Work with the specifications"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [specification_workflow]
requires: []
---

# Work with the specifications

The five Allium modules under `docs/specs/` decide what the game does. This page is the
procedure; [Specifications](../explanation/specifications.md) is the reasoning.

## Find the module that owns the behaviour

| Module | Owns |
| --- | --- |
| [`words.allium`](../specs/words.allium) | The two word lists and what any list must satisfy. |
| [`game.allium`](../specs/game.allium) | One game: modes, input, scoring, the attempt limit, abandonment. |
| [`settings.allium`](../specs/settings.allium) | Preferences, and when each may change. |
| [`statistics.allium`](../specs/statistics.allium) | What is remembered across games, and the answer pool. |
| [`sharing.allium`](../specs/sharing.allium) | Custom links and the shared results grid. |

Each module opens with `Scope`, `Includes` and `Excludes`. If your change falls under
another module's `Excludes`, it belongs there.

## Change behaviour

1. Change the specification first. Add or amend the rule, its triggers, its guards and
   its outcomes.
2. Check the modules that depend on it. `game.allium` is depended on by the other three.
3. Derive tests from the changed clauses and confirm they fail before implementing. A
   test that is green before you write any code is either already covered or vacuous.
4. Implement until they pass, without weakening any test.
5. Run `just check-specs` and confirm the count below has not risen.
6. Run `just frontend-unit`, then `just check`.

## Handle an open question

An `open question` block records a product decision nobody has made yet, so the gap is
visible rather than silently filled in. None are outstanding: the twenty the modules
started with have all been answered. Treat that as the settled state, not as a reason to
stop adding them.

- If your change depends on one, raise it. Do not answer it in code.
- If your change creates a new gap, add an `open question` rather than picking an answer.
- Answering one is a real change: edit the specification to state the decision and delete
  the question in the same commit.

## Tooling

The `allium` command-line tool validates and analyses these files, and this project owns a
pinned copy of it. `just initialize` installs it; afterwards, or after a version change,
`just install-allium` puts it in the gitignored `.tools/bin/`. It is a checksummed binary
rather than a package in either lockfile — see
[decision 0011](../decisions/0011-project-managed-allium-cli.md).

```console
just check-specs
just analyse-specs
```

The first runs `allium check` over every module, which reports on structure: syntax,
references, and names a module reaches for that no import defines. The second runs
`allium analyse`, which repeats every one of those diagnostics and adds process-level
findings on top — data flow, edge reachability, deadlocks, conflicts and invariants. The
`spec-change` skill in `.agents/skills/` carries the procedure for agents.

### The current baseline

Neither recipe is part of `just check`. `allium check` exits non-zero on warnings as well
as errors, and offers no configuration file, no severity threshold and no way to waive a
diagnostic; `allium analyse` exits non-zero while any finding remains. So both report
rather than gate until the counts below reach zero.

| Module | Diagnostics | Findings |
| --- | --- | --- |
| `words.allium` | 0 | 0 |
| `settings.allium` | 0 | 0 |
| `statistics.allium` | 5 | 0 |
| `sharing.allium` | 3 | 0 |
| `game.allium` | 17 | 4 |

Twenty-five diagnostics in total: sixteen warnings and nine informational. Fourteen are
`allium.reference.unknownName`, where a module reaches for a name its import does not
define — half of those against `words/config`, the rest against `words/Words`,
`game/config`, `game/GameBoard` and `game/GameConclusion`.

Four findings, all of them in `game.allium`. Two are `missing_producer`: nothing
establishes `Game.mode = endless`, which `ArmEndlessCountdown` and
`EndlessCountdownElapses` both require. Two are `unreachable_trigger`: no surface provides
`GameAbandoned` or `PlayerOpensPoodl`, though rules listen for both.

**Read the count, not the exit code.** A change to a specification should add no new
diagnostic and no new finding. If a module's number goes up, the change caused it; if one
goes down, say so, because that is progress worth recording here.

## Related pages

- [Specifications](../explanation/specifications.md)
- [Terminology](../project/terminology.md)
- [Accessibility](../explanation/accessibility.md)
