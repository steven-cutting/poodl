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
5. Run `just check-specs` and confirm it reports no diagnostics and exits 0. A
   diagnostic is a regression: fix it, or — for a verified checker gap — waive it on the terms below.
   Then run `just analyse-specs` and confirm it reports no findings; a finding is a
   regression too, and findings cannot be waived.
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

### Diagnostics and waivers

Neither recipe is part of `just check`; gating them is the follow-up
[decision 0011](../decisions/0011-project-managed-allium-cli.md) leaves open. Both are
clean on an untouched checkout: `allium check` reports no diagnostics and `allium analyse`
reports no findings, and each exits 0 — still printing one JSON block per module, each
with an empty array.

Either recipe reporting anything at all is therefore a regression in the change under
review. Fix it at the root. A finding cannot be waived. A diagnostic can, but only when the
diagnostic itself is wrong — the construct is valid Allium that the pinned checker cannot
resolve — and then it is waived in place:

```text
-- Why the checker is wrong here, in a sentence.
-- allium-ignore allium.reference.unknownName
```

The directive is a whole-line comment holding the full diagnostic code and nothing else —
prose on the directive line disables it, which is why the reason sits on its own line
above — and it covers only the line directly beneath it. One rule, one line, one stated
reason. Upstream documents none of this: the directive was found in the 3.5.3 binary and
verified against it, so every waiver must be re-verified whenever the pinned version
moves — see [Maintain dependencies](maintain-dependencies.md). The nine waivers currently
in the modules cover two shapes of checker gap, each a construct the language reference
sanctions: cross-module `config` references, and a definition whose only use sits in
another module.

A third shape used to sit beside them and was retired rather than waived. `sharing.allium`
named `game.allium`'s `GameBoard` and `GameConclusion` in `related:` clauses, which 3.5.3
cannot resolve across a module alias — but neither can the language reference be read to
sanction it: rule 31 asks only that a surface in `related:` be defined, and no example
anywhere qualifies a surface name with an alias. Where a waiver would have asserted the
checker was wrong, the honest form was prose, so the adjacency now sits in the guarantees
of `ShareCurrentAnswer` and `ShareResults`. Prefer that reading of a gap: waive only what
the reference plainly permits.

One gap is worth knowing about because it is fixed by restructuring rather than waived:
3.5.3 sees a `.created(...)` call only when it stands alone as an ensures statement. Bind
the creation — `let game = Game.created(...)`, or assign it straight into a field — and
both the status it sets and every literal it carries vanish from the checker's status
scan and from the analyser's producer search. `MakeNewGameCurrent` in `game.allium` exists
for this reason: `BeginGame` used to bind its creation so that the next clause could make
the new game current, and that single `let` cost one waiver and the last two `analyse`
findings. Create unbound, and let a `.created` rule pick the entity up.

## Related pages

- [Specifications](../explanation/specifications.md)
- [Terminology](../project/terminology.md)
- [Accessibility](../explanation/accessibility.md)
