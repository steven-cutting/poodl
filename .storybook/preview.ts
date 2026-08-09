import type { Preview } from '@storybook/sveltekit';

// The design tokens. `app.css` defines the light palette on `:root`, redefines
// it under `prefers-color-scheme: dark`, and again under `[data-theme='dark']`
// and `[data-high-contrast='true']`. Importing it here is what makes a story
// wear the same skin the app does.
import '../src/app.css';

/*
 * Appearance globals.
 *
 * `settings.allium`'s SettingsPanel exposes `settings.theme` and
 * `settings.high_contrast`; its Appearance surface derives `dark_active` and
 * `animations_active` from them and from the device. The toolbar below makes
 * those inputs adjustable so the surfaces can be built and inspected before the
 * settings screen exists.
 *
 * `src/app.css` keys every palette on `:root` — the documentElement of the
 * preview iframe. A decorator that wrapped the story in a
 * `<div data-theme="dark">` would set the attribute on an element none of those
 * selectors match, so the writes go to the document root and nowhere else.
 *
 * This is Storybook infrastructure standing in for the host document, not the
 * application expressing a preference, so it needs no port. When the Appearance
 * surface is built it must read the device through a new
 * `src/lib/ports/preferences.ts` fed from these same globals — see
 * `docs/explanation/layering.md`.
 */

const THEMES = ['system', 'light', 'dark'] as const;
const SWITCHES = ['off', 'on'] as const;
const MOTIONS = ['follow', 'reduce'] as const;

type Theme = (typeof THEMES)[number];
type Switch = (typeof SWITCHES)[number];
type Motion = (typeof MOTIONS)[number];

interface Appearance {
  theme: Theme;
  highContrast: Switch;
  animations: Switch;
  reducedMotion: Motion;
}

const REDUCED_MOTION_STYLE_ID = 'poodl-simulated-reduced-motion';

// Globals reach a story from the toolbar, from the URL and from story
// annotations, so they are read as `unknown` and narrowed rather than trusted.
function choose<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  for (const candidate of allowed) {
    if (candidate === value) {
      return candidate;
    }
  }
  return fallback;
}

function readAppearance(globals: Record<string, unknown>): Appearance {
  return {
    theme: choose(globals['theme'], THEMES, 'system'),
    highContrast: choose(globals['highContrast'], SWITCHES, 'off'),
    animations: choose(globals['animations'], SWITCHES, 'on'),
    reducedMotion: choose(globals['reducedMotion'], MOTIONS, 'follow')
  };
}

/*
 * Simulation, not emulation, and the toolbar item says so.
 *
 * `prefers-reduced-motion` is a media query. Nothing running inside the page can
 * make `matchMedia` report `reduce`; only the browser can, from outside. This
 * freezes declarative motion so a reviewer sees the still frame — the tile
 * reveal is the one thing it has to freeze. It stands in for the device half of
 * `Appearance.animations_active`, and because it is a simulation it is not
 * evidence that the real preference is honoured; `tests/` holds that.
 */
function applySimulatedReducedMotion(active: boolean): void {
  const existing = document.getElementById(REDUCED_MOTION_STYLE_ID);

  if (!active) {
    existing?.remove();
    return;
  }
  if (existing !== null) {
    return;
  }

  const style = document.createElement('style');
  style.id = REDUCED_MOTION_STYLE_ID;
  // 0.001ms rather than 0s, so `animationend` and `transitionend` still fire and
  // anything waiting on one is not left hanging.
  style.textContent = [
    '*, *::before, *::after {',
    '  animation-duration: 0.001ms !important;',
    '  animation-delay: 0ms !important;',
    '  animation-iteration-count: 1 !important;',
    '  transition-duration: 0.001ms !important;',
    '  transition-delay: 0ms !important;',
    '  scroll-behavior: auto !important;',
    '}'
  ].join('\n');
  document.head.append(style);
}

// Absolute state, every run, for every global. Nothing is left as it was found:
// that is what makes one story unable to leak into the next.
function applyAppearance(appearance: Appearance): void {
  const root = document.documentElement;

  // `system` deliberately writes nothing, because app.css reaches the device
  // preference only while the attribute is absent.
  if (appearance.theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', appearance.theme);
  }

  // app.css matches the literal string, so `off` removes the attribute rather
  // than writing 'false'.
  if (appearance.highContrast === 'on') {
    root.setAttribute('data-high-contrast', 'true');
  } else {
    root.removeAttribute('data-high-contrast');
  }

  /*
   * `Appearance.animations_active`, on the same terms the route writes it: the
   * setting and the device's reduced-motion preference taken together, and the
   * device wins. Without this the attribute is never present in the workshop
   * and every story renders the animation-off path, whatever the toolbar says.
   */
  if (appearance.animations === 'on' && appearance.reducedMotion !== 'reduce') {
    root.setAttribute('data-animations', 'on');
  } else {
    root.removeAttribute('data-animations');
  }

  applySimulatedReducedMotion(appearance.reducedMotion === 'reduce');
}

function clearAppearance(): void {
  const root = document.documentElement;
  root.removeAttribute('data-theme');
  root.removeAttribute('data-high-contrast');
  root.removeAttribute('data-animations');
  document.getElementById(REDUCED_MOTION_STYLE_ID)?.remove();
}

/*
 * A named export rather than a key of the object below.
 *
 * Storybook reads project annotations as `xs.default?.[field] ?? xs[field]`, so
 * the two forms are equivalent at runtime, and a named export sidesteps the
 * excess-property check that a typed object literal would apply to a key whose
 * presence on `ProjectAnnotations` is unconfirmed.
 *
 * `beforeEach` rather than a decorator or `beforeAll`: it is the only per-render
 * hook. Storybook re-runs it inside every `render()`, including the rerender a
 * toolbar change triggers, which is not a remount. Its return value is the
 * cleanup.
 */
export function beforeEach(context: { globals: Record<string, unknown> }): () => void {
  applyAppearance(readAppearance(context.globals));
  return clearAppearance;
}

const preview: Preview = {
  initialGlobals: {
    theme: 'system',
    highContrast: 'off',
    animations: 'on',
    reducedMotion: 'follow'
  },

  // Each `description` becomes the toolbar control's accessible name and its
  // tooltip, so it is a label rather than an explanation. The reasoning lives in
  // the comments above and on `docs/reference/configuration.md`.
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'system', title: 'System', icon: 'browser' },
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' }
        ]
      }
    },

    highContrast: {
      name: 'High contrast',
      description: 'High contrast',
      toolbar: {
        title: 'High contrast',
        icon: 'contrast',
        dynamicTitle: true,
        items: [
          { value: 'off', title: 'Off', icon: 'circlehollow' },
          { value: 'on', title: 'On', icon: 'contrast' }
        ]
      }
    },

    animations: {
      name: 'Animations',
      description: 'Animations setting',
      toolbar: {
        title: 'Animations',
        icon: 'lightning',
        dynamicTitle: true,
        items: [
          { value: 'on', title: 'On', icon: 'lightning' },
          { value: 'off', title: 'Off', icon: 'lightningoff' }
        ]
      }
    },

    reducedMotion: {
      name: 'Reduced motion',
      description: 'Reduced motion, simulated',
      toolbar: {
        title: 'Reduced motion',
        icon: 'accessibility',
        dynamicTitle: true,
        items: [
          { value: 'follow', title: 'Follow device', icon: 'play' },
          { value: 'reduce', title: 'Reduce (simulated)', icon: 'stop' }
        ]
      }
    }
  },

  parameters: {
    a11y: {
      // Every surface in `docs/specs/` carries an accessibility `@guarantee`, so
      // a violation is a failure rather than a note nobody reads. The addon's
      // own default is 'todo', which reports and passes. No rule is disabled:
      // decision 0006 records the palette repair that made that possible.
      test: 'error'
    },
    // `app.css` owns the page background through `--background`. A background
    // picker would let a story pass a check against a colour the app never
    // shows.
    backgrounds: { disable: true },
    // Sets `lang` on the story root element so assistive technology announces
    // the content in English. It does not affect axe: the addon's context is
    // `document.body`, so no document-level language rule is ever in scope.
    htmlLang: 'en',
    layout: 'centered'
  }
};

export default preview;
