import type { ThemeChoice } from '$lib/domain/types';

/**
 * How Poodl looks, decided jointly by the player's settings and the device.
 *
 * `docs/specs/settings.allium` — the `Appearance` surface. Both derivations are
 * one line each, and both are here rather than inline in a component because
 * the negotiation between a setting and a device preference is behaviour, and
 * behaviour that a test can read.
 */

/**
 * `Appearance.dark_active`. While the theme is `system` Poodl matches the
 * device and keeps matching it as it changes; once the player picks a side the
 * device is no longer consulted.
 */
export function darkActive(theme: ThemeChoice, prefersDark: boolean): boolean {
  return theme === 'system' ? prefersDark : theme === 'dark';
}

/**
 * `Appearance.animations_active`. The device preference wins: a player who
 * asked their system for less motion gets none from Poodl, whatever the
 * setting says.
 */
export function animationsActive(animations: boolean, prefersReducedMotion: boolean): boolean {
  return animations && !prefersReducedMotion;
}

/**
 * `Settings.high_contrast_active`. The device wins the same way it does for
 * motion, and for the same reason: a player who asked their system for more
 * contrast should not have to find the setting and ask a second time.
 *
 * It never writes back. The player's own answer stays exactly as they left it,
 * which is what lets `SettingsPanel` say which of the two is speaking. That
 * also leaves `settings.allium`'s open question genuinely open: there is no way
 * yet to turn the palette off while the device is asking for it.
 */
export function highContrastActive(highContrast: boolean, prefersMoreContrast: boolean): boolean {
  return highContrast || prefersMoreContrast;
}
