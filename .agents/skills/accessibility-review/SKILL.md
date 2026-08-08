---
name: accessibility-review
description: Review a change against the accessibility guarantees the specifications state for every surface.
---

# Review a change for accessibility

The `@guarantee` clauses in `docs/specs/` are the acceptance criteria, not aspirations. Each one names an obligation that a change can break silently.

1. Read `AGENTS.md` and `docs/explanation/accessibility.md`. Identify which surface in `docs/specs/` the change touches, and read that surface's guarantees.
2. Check the colour obligation. Every letter result and key state carries a shape and an accessible description as well as a colour, so the board is readable without colour vision.
3. Check keyboard operation. Every control the surface `provides` is reachable and invocable from the keyboard alone, with visible focus, whatever the physical-keyboard setting says.
4. Check what is announced. Submitted guesses, rejections, and the end of a game all reach assistive technology, and say the attempt number and how many attempts remain.
5. Check what is not exposed. `GameBoard` deliberately omits the answer while a game is in progress; nothing added may leak it, including in a DOM attribute.
6. Check motion. Animation runs only when the setting allows it and the operating system expresses no reduced-motion preference; the operating system wins.
7. Report findings by severity with `file:line` references, then run `just frontend-static` and `just check`.
