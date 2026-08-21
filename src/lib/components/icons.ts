/**
 * The icons the app consumes, inlined through the Vite import graph.
 *
 * `?raw` hands back the SVG source as a string, so the markup ships inside the
 * bundle: no runtime URL, nothing for the `/poodl/` base path to break, and a
 * real `<svg>` in the DOM for a test to find. Each file is a Lucide icon
 * restroked to 1.5 — see `src/lib/assets/icons/LICENSE-lucide.txt` — and uses
 * `stroke="currentColor"`, so an icon is always the ink of the control it sits
 * in.
 *
 * Only what the app renders is imported; the other shipped SVGs stay out of
 * the bundle. Adding one is a file in `src/lib/assets/icons/`, an import here,
 * and a key — `docs/how-to/port-a-design-system-component.md` walks it.
 */
import chartColumn from '$lib/assets/icons/chart-column.svg?raw';
import check from '$lib/assets/icons/check.svg?raw';
import chevronDown from '$lib/assets/icons/chevron-down.svg?raw';
import circleAlert from '$lib/assets/icons/circle-alert.svg?raw';
import cornerDownLeft from '$lib/assets/icons/corner-down-left.svg?raw';
import del from '$lib/assets/icons/delete.svg?raw';
import info from '$lib/assets/icons/info.svg?raw';
import settings from '$lib/assets/icons/settings.svg?raw';
import share from '$lib/assets/icons/share.svg?raw';
import x from '$lib/assets/icons/x.svg?raw';

export const ICONS = {
  'chart-column': chartColumn,
  check,
  'chevron-down': chevronDown,
  'circle-alert': circleAlert,
  'corner-down-left': cornerDownLeft,
  delete: del,
  info,
  settings,
  share,
  x
} as const;

export type IconName = keyof typeof ICONS;
