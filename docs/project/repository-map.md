---
title: "Repository map"
kind: "project"
audience: [contributor, maintainer, agent]
canonical_for: [repository_layout]
requires: []
---

# Repository map

The application sits at the repository root. There is no `frontend/` directory because
there is no backend to be a sibling of.

```text
.
├── AGENTS.md            Engineering conventions and the agent working agreement
├── Justfile             Every supported command
├── package.json         The application: Svelte, SvelteKit, Vite, Vitest
├── pyproject.toml       Repository tooling only: prek and ruff
├── src/
│   ├── app.css          Design tokens
│   ├── app.html         The page shell
│   ├── lib/
│   │   ├── components/  PascalCase Svelte components
│   │   ├── config.ts    The values the specifications declare
│   │   ├── data/        The two word lists, one word per line
│   │   ├── domain/      Pure behaviour: scoring, keyboard knowledge
│   │   └── ports/       Every side effect, each with an in-memory fake
│   └── routes/          SvelteKit routes, prerendered
├── tests/               Vitest suites, never colocated with src/
├── static/              Copied verbatim into the build
├── scripts/             The four repository checkers
├── docs/                This handbook, plus specs/
└── .agents/skills/      Canonical agent procedures
```

## What each part is responsible for

| Directory | Responsibility |
| --- | --- |
| `src/lib/domain/` | Behaviour with no side effects. Given the same input it returns the same output, always. |
| `src/lib/ports/` | The only place a browser global is touched. Each port exports an interface, a real adapter, and a fake. |
| `src/lib/components/` | Rendering and interaction. Components take callbacks as props and hold no application state of their own. |
| `src/routes/` | Assembling components into pages. Prerendered, so nothing here may assume a request. |
| `src/lib/data/` | Replaceable data, not code. Excluded from spell-checking, and from Prettier. |
| `tests/` | Vitest suites named for what they cover, not for the file they mirror. |
| `scripts/` | `validate_docs.py`, `validate_agents.py`, `run_project_check.py`, `run_ripsecrets_redacted.py`, and `initialize.sh`. |
| `docs/specs/` | The Allium specifications. Behaviour is decided here, not in code. |

Which of these may import which is not a matter of taste; see
[Layering and dependency direction](../explanation/layering.md).

## Related pages

- [Purpose and scope](purpose-and-scope.md)
- [Architecture](../explanation/architecture.md)
- [Commands](../reference/commands.md)
