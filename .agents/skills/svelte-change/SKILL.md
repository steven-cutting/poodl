---
name: svelte-change
description: Implement or review a Svelte route or component change with accessibility, rendering, and port-boundary evidence.
---

# Change a route or component

1. Read `AGENTS.md` and `docs/explanation/architecture.md`. Identify which state is derived at build time by prerendering and which is client state held in a rune.
2. Inspect the route, the component, the ports under `src/lib/ports/`, and the existing tests before editing. Never reach for `localStorage`, `crypto`, `Date`, or `navigator.clipboard` outside a port adapter.
3. Use Svelte 5 runes: `$props` for inputs, `$state` for local state, `$derived` for computed values. Pass callbacks as props rather than dispatching events.
4. Preserve semantic HTML, labels bound to controls, keyboard operation, visible focus, and a non-colour indication for every letter result and key state.
5. Add Testing Library evidence in `tests/`. Render against the fakes from `src/lib/ports/` rather than stubbing globals, and assert through accessible roles and names.
6. Keep the coverage floor: `src/lib/**` is measured, so a new component needs a test in the same change.
7. Run `just frontend-static` and `just frontend-unit`, then `just check` before handoff.
