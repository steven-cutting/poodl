---
title: "Testing"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [testing_reference]
requires: []
---

# Testing

## Framework

Vitest in jsdom, with `globals: true` so Testing Library registers its automatic cleanup
hook. Setup is one line: `tests/setup.ts` imports `@testing-library/jest-dom/vitest`.
Configuration lives in `vite.config.ts`.

## Layout

Tests live in `tests/`, never colocated with `src/`.

| Suffix | Runner |
| --- | --- |
| `*.test.ts` | Vitest. Everything currently in the repository. |
| `*.spec.ts` | Playwright. Reserved; no end-to-end suite exists yet. |

Files are named for what they cover rather than mirroring a source path:
`scoring.test.ts`, `keyboard.test.ts`, `ports.test.ts`, `words.test.ts`,
`components.test.ts`.

## Conventions

**Query by accessible role and name.** Never by class, never by test id. A query that
fails because a name is missing has found a real defect: it is the same information a
screen reader uses.

```ts
screen.getByRole('button', { name: 'A, correct' });
screen.getByRole('listitem', { name: /^Attempt 1:/ });
```

**Inject fakes; never stub a global.** Each port in `src/lib/ports/` exports an in-memory
fake alongside the real adapter, and every adapter takes its platform object as a
defaulted argument. This is not a stylistic preference: the test environment provides no
`localStorage` and no `navigator.clipboard`, so injection is the only thing that works.

**Callbacks are asserted through the props.** Components take callbacks as props, so a
test passes `vi.fn()` and asserts on the call.

**A new component lands with its test in the same change.**

## Coverage

v8 provider, measured over `src/lib/**`, with a 90% floor on branches, functions, lines
and statements. Below the floor the run fails.

Distinguish an untested branch from an unreachable one. Defensive code no input can reach
should be deleted rather than covered; see
[Quality philosophy](../explanation/quality-philosophy.md).

## What the current suite proves

| Suite | Covers |
| --- | --- |
| `scoring.test.ts` | The `GuessScoring` contract, including the duplicate-letter cases and the invariants over the whole answer list. |
| `keyboard.test.ts` | The `KeyboardKnowledge` contract: full alphabet coverage, strongest mark wins, knowledge never weakens. |
| `ports.test.ts` | Every port, real adapter and fake, including the failure paths. |
| `words.test.ts` | Every `WordListSource` obligation, against the bundled data. |
| `components.test.ts` | Tile, Board and Keyboard through accessible names. |

## Related pages

- [Test and debug](../how-to/test-and-debug.md)
- [Quality gates](quality-gates.md)
- [Accessibility](../explanation/accessibility.md)
