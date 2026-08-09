import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * The story run: every story rendered in real Chromium, with axe over each one
 * and the play functions executed as interaction tests.
 *
 * This is a separate config file rather than a second project inside
 * `vite.config.ts`, and that is the mechanism that protects the coverage floor.
 * Vitest 4 has no per-project coverage — `coverage` is a `NonProjectOptions`
 * member — and `@vitest/coverage-v8` merges every project that ran into one map
 * before it checks the thresholds. A story project sharing a run with the unit
 * project would therefore raise the number measured over `src/lib/**` without
 * adding an assertion. Here there is no coverage block at all and
 * `npm run coverage` never loads this file, so the question cannot arise.
 *
 * `sveltekit()` is listed explicitly because `storybookTest` supplies no Svelte
 * compiler: it hands the framework presets a bare `{ root }` object, and
 * `@storybook/svelte-vite` only appends a docgen plugin to whatever it is given.
 * The compiler and the `$lib` alias have to come from the config this run loads.
 *
 * `svelteTesting()` is deliberately not listed. It exists to make jsdom behave,
 * and its Vitest-gated hook would push a Testing Library cleanup setup file into
 * a browser run that has no use for it.
 */
export default defineConfig({
  plugins: [
    sveltekit(),
    storybookTest({ configDir: fileURLToPath(new URL('./.storybook', import.meta.url)) })
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      // `just check` re-snapshots the worktree after every recipe, so a failing
      // story may not drop a __screenshots__ directory beside it. The addon
      // would set this for us; saying it here puts the obligation where the
      // reason lives.
      screenshotFailures: false
    }
  }
});
