import type { StorybookConfig } from '@storybook/sveltekit';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

/**
 * The component workshop.
 *
 * Storybook renders one component at a time, in every state its surface names,
 * with axe over each render — which is how a component gets built when the
 * route that will host it does not exist yet, and how every state of one that
 * does gets looked at without playing until the game produces it.
 *
 * `just storybook` serves it and `just storybook-build` proves it still
 * compiles; `.github/workflows/pages.yml` never sees it, and `just chromatic`
 * is what publishes a build of it for visual review.
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
  /*
   * The platform's own workshop, shown beside this one rather than rebuilt
   * here: its components, and the token sheet Poodl no longer keeps. Its
   * address is the one thing about it recorded upstream — pasted here because
   * this block has to run as it stands — and `docs/project/platform.md` is the
   * way to the page that records it.
   *
   * `expanded: false` because Poodl's own components belong at the top of
   * Poodl's own sidebar.
   *
   * This is the one thing in `just check` that reaches the network. Storybook
   * checks a ref while it builds, by fetching the address's `iframe.html`, and
   * an address it cannot reach becomes a ref marked unknown rather than a
   * failure — so gate 6 makes one outbound request, degrades to a sidebar entry
   * that does not open, and passes either way. The story run never fetches at
   * all: Storybook skips refs under its test runner.
   * `docs/reference/quality-gates.md` states the exception, and decision 0013
   * is why it was taken.
   */
  refs: {
    'biscuit-games': {
      title: 'Biscuit Games',
      url: 'https://main--6a99fd20afcb187c61d773f1.chromatic.com',
      expanded: false
    }
  },
  // Resolved relative to this directory. `static/` holds only `.nojekyll`
  // today, but Storybook strips the SvelteKit plugin that would otherwise point
  // Vite's publicDir at it, so anything added there later would 404 silently.
  staticDirs: ['../static'],
  core: {
    // AGENTS.md prefers local evidence to remote calls. The `refs` entry above
    // is the one exception and it is a stated one; telemetry is not, and this
    // turns it off. It gates both the CLI's own and the Vitest
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
