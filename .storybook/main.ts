import type { StorybookConfig } from '@storybook/sveltekit';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

/**
 * The component workshop.
 *
 * Poodl's specifications name thirteen surfaces and three components exist, so
 * ten have to be built with no route to host them. Storybook renders one
 * component at a time, in every state its surface names, with axe over each
 * render. It is local: `just storybook` serves it, `just storybook-build`
 * proves it still compiles, and `.github/workflows/pages.yml` never sees it.
 *
 * Stories live in a root-level `stories/` directory rather than beside the
 * components, for the same reason `tests/` does: a component's source stays one
 * file, and evidence of a given kind is found where that kind of evidence
 * lives.
 */
const config: StorybookConfig = {
  framework: '@storybook/sveltekit',
  stories: ['../stories/**/*.stories.svelte'],
  addons: [
    // Indexes and compiles `*.stories.svelte`. Without it the glob above finds
    // files that nothing turns into stories.
    '@storybook/addon-svelte-csf',
    // Prop tables and the autodocs pages. Storybook 10 does not bundle this
    // into the core package, so it is a real dependency, pinned like the rest.
    '@storybook/addon-docs',
    // Runs axe on every story. `preview.ts` decides that a violation fails.
    '@storybook/addon-a11y',
    // Replays the stories as Vitest browser tests in real Chromium.
    '@storybook/addon-vitest'
  ],
  // Resolved relative to this directory. `static/` holds only `.nojekyll`
  // today, but Storybook strips the SvelteKit plugin that would otherwise point
  // Vite's publicDir at it, so anything added there later would 404 silently.
  staticDirs: ['../static'],
  core: {
    // AGENTS.md prefers local evidence to remote calls, and `just check` runs
    // `storybook build`. This gates both the CLI's telemetry and the Vitest
    // plugin's `test-run` event, which read the same resolved core preset. The
    // separate version check is disabled by `--no-version-updates` in the dev
    // script, and the Justfile exports STORYBOOK_DISABLE_TELEMETRY as a belt.
    disableTelemetry: true,
    disableWhatsNewNotifications: true
  },
  /*
   * `stories/` sits at the repository root, so the dev server has to be told it
   * may serve it. SvelteKit's Vite plugin narrows `server.fs.allow` to `src`,
   * `.svelte-kit`, its own runtime and `node_modules`; everything outside that
   * list is a 403, and a story that will not load is a workshop that shows
   * nothing. Storybook's builder appends this `configDir` itself, which is why
   * `.storybook/preview.ts` already served and `stories/` did not.
   *
   * `mergeConfig` concatenates arrays, so this entry survives the config
   * SvelteKit's plugin merges on top of it. A directory rather than a file,
   * which covers `fixtures.ts` as well as the `*.stories.svelte`.
   *
   * Dev only: `fs.allow` guards nothing else. `storybook build` bundles the same
   * files through Rollup and the story run resolves them through Vitest, which
   * allows the project root, so both gates stayed green while `just storybook`
   * served none of them.
   */
  viteFinal: (config) =>
    mergeConfig(config, {
      server: { fs: { allow: [fileURLToPath(new URL('../stories', import.meta.url))] } }
    })
};

export default config;
