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
│   │   ├── app/         The rules as a pure reducer, plus the rune shell
│   │   ├── assets/      Committed fonts and icons, with their licence texts
│   │   ├── components/  PascalCase Svelte components
│   │   ├── config.ts    The values the specifications declare
│   │   ├── data/        The two word lists, one word per line
│   │   ├── domain/      Pure behaviour: scoring, keyboard knowledge
│   │   └── ports/       Every side effect, each with an in-memory fake
│   └── routes/          SvelteKit routes, prerendered
├── tests/               Vitest suites, never colocated with src/
├── stories/             Svelte CSF stories, one per component plus the token specimens
├── static/              Copied verbatim into the build
├── scripts/             The repository checkers, and the browser preflight
├── docs/                This handbook, plus specs/
├── .agents/skills/      Canonical agent procedures
└── .storybook/          The component workshop, served and built locally
```

## What each part is responsible for

| Directory | Responsibility |
| --- | --- |
| `src/lib/app/` | The rules, as one pure reducer over one state value, plus the single rune shell that wires the ports to it. |
| `src/lib/domain/` | Behaviour with no side effects. Given the same input it returns the same output, always. |
| `src/lib/ports/` | The only place a browser global is touched. Each port exports an interface, a real adapter, and a fake. |
| `src/lib/components/` | Rendering and interaction. Components take callbacks as props and hold no application state of their own. |
| `src/routes/` | Assembling components into pages, and the only place a store is built. Prerendered, so nothing here may assume a request. |
| `src/lib/data/` | Replaceable data, not code. Excluded from spell-checking, and from Prettier. |
| `src/lib/assets/` | Vendored fonts and icons with their licence texts, per [decision 0009](../decisions/0009-biscuit-games-design-system.md); provenance sits in the `src/app.css` header. |
| `tests/` | Vitest suites named for what they cover, not for the file they mirror. |
| `stories/` | Every state of a component, as something that can be looked at. Rendered in Chromium with axe over each. |
| `scripts/` | `validate_docs.py`, `validate_agents.py`, `run_project_check.py`, `run_ripsecrets_redacted.py`, `check_playwright_browsers.js`, and `initialize.sh`. |
| `docs/specs/` | The Allium specifications. Behaviour is decided here, not in code. |
| `.storybook/` | The workshop's configuration. Served locally, and built both by the gate, which discards it, and by `just chromatic`, which publishes it. |

Which of these may import which is not a matter of taste; see
[Layering and dependency direction](../explanation/layering.md).

## Related pages

- [Purpose and scope](purpose-and-scope.md)
- [Architecture](../explanation/architecture.md)
- [Commands](../reference/commands.md)
