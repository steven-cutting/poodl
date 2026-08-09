import { defineConfig } from 'vitest/config';

/**
 * The entry point that names both suites, and the only reason it exists.
 *
 * `@storybook/addon-vitest` finds the configuration for its Testing Module by
 * filename: it looks for `vitest.workspace.*`, `vitest.config.*` and
 * `vite.config.*`, then starts Vitest filtered to a project named
 * `storybook:<configDir>`. `vitest.storybook.config.ts` is not a name it looks
 * for, so before this file the button in the Storybook UI resolved
 * `vite.config.ts` — the jsdom suite, which declares no such project — and
 * failed with `No projects matched the filter`. The CLI path was never affected
 * because `just storybook-test` passes `--config` itself.
 *
 * Both suites keep their own file and their own reasons. This one holds no
 * options of its own, and in particular no `coverage` block: the floor is
 * declared in `vite.config.ts` and `npm run coverage` pins that config, so a
 * story still cannot be measured. See `docs/reference/testing.md`.
 */
export default defineConfig({
  test: {
    projects: ['./vite.config.ts', './vitest.storybook.config.ts']
  }
});
