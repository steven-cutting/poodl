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
   * Composing costs a request. Storybook checks a ref while it builds by
   * fetching the address's `iframe.html`, and again as JSON if it answers, so
   * that a workshop can be told from a login page; an address it cannot reach
   * becomes a ref marked unknown rather than a failure, and the build passes
   * either way. That is why the entry is opt-in rather than always on: a
   * build nobody sets `COMPOSE_PLATFORM_WORKSHOP=1` for makes no request at
   * all, which keeps gate 6 of `just check` local, as AGENTS.md wants every
   * check to be by default. The Justfile sets the flag on the two recipes a
   * person looks at the result of — `just storybook` and `just chromatic`,
   * whose build inherits it — so the sidebar is composed where it is seen and
   * silent where it is thrown away. Read here, when Storybook applies the
   * preset, rather than at import, so nothing decides ahead of the build.
   * The story run never fetches at all: `getRefs` returns nothing under the
   * test runner before any address is read.
   * `docs/reference/quality-gates.md` states the flag, and decision 0013 is
   * why the composition was taken.
   */
  refs: (refs) =>
    process.env['COMPOSE_PLATFORM_WORKSHOP'] === '1'
      ? {
          ...refs,
          'biscuit-games': {
            title: 'Biscuit Games',
            url: 'https://main--6a99fd20afcb187c61d773f1.chromatic.com',
            expanded: false
          }
        }
      : refs,
  // Resolved relative to this directory. `static/` holds only `.nojekyll`
  // today, but Storybook strips the SvelteKit plugin that would otherwise point
  // Vite's publicDir at it, so anything added there later would 404 silently.
  staticDirs: ['../static'],
  core: {
    // AGENTS.md prefers local evidence to remote calls. The `refs` entry above
    // reaches out only when asked to; telemetry would do so unasked, and this
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
