import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * Poodl is a static site with no server, so every route is prerendered and the
 * build output is a directory of files a host can serve as-is.
 *
 * `paths.base` is empty by default, which is what local development and a
 * future custom domain both want. The GitHub Pages workflow sets BASE_PATH to
 * `/poodl` because a project site is served from a subdirectory; moving to a
 * custom domain later means deleting that one line from the workflow.
 */

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
    paths: { base: process.env.BASE_PATH ?? '' }
  }
};

export default config;
