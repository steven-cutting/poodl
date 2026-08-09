/*
 * Fail fast, and legibly, when the browser the story tests render in is missing.
 *
 * Playwright downloads browsers into a per-user cache outside the repository,
 * once, on request. Without this check a missing download surfaces as a launch
 * stack trace from inside Vitest's bootstrap, which says nothing about the fix.
 *
 * It launches rather than stats a path on purpose. `executablePath()` names the
 * headed build, while a headless run may start `chromium-headless-shell` — a
 * separate entry in Playwright's registry — so a cache holding one and not the
 * other would pass a file check and then fail opaquely. Launching costs about a
 * second and answers the question that is actually being asked.
 *
 * ESM, because package.json declares `"type": "module"`. Named `.js` so
 * ESLint's existing `**\/*.js` disableTypeChecked entry covers it and the
 * project service does not demand a TypeScript project for it.
 */

import process from 'node:process';

const ADVICE = [
  'Playwright cannot start Chromium, so the story tests cannot run.',
  'Run `just storybook-browsers` once. It downloads a browser over the network',
  'into a cache outside the repository; every run after that is offline.'
].join('\n');

try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  await browser.close();
} catch (cause) {
  console.error(ADVICE);
  console.error(`\n${cause instanceof Error ? cause.message : String(cause)}`);
  process.exit(2);
}
