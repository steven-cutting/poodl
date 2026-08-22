import { describe, expect, it } from 'vitest';

import { animationsActive, darkActive, highContrastActive } from '../src/lib/domain/appearance';

/*
 * settings.allium — the `Appearance` surface. It applies everywhere, not only
 * inside the settings panel, and it is where the player's settings and the
 * device's preferences negotiate.
 */
describe('darkActive', () => {
  // SystemFollowsTheDeviceAsItChanges.
  it('follows the device while the theme is system', () => {
    expect(darkActive('system', true)).toBe(true);
    expect(darkActive('system', false)).toBe(false);
  });

  it('stops consulting the device once the player picks a side', () => {
    expect(darkActive('dark', false)).toBe(true);
    expect(darkActive('light', true)).toBe(false);
  });
});

describe('animationsActive', () => {
  // ReducedMotionOverridesTheAnimationSetting: the device preference wins.
  it('runs only when the setting is on and the device asks for no less motion', () => {
    expect(animationsActive(true, false)).toBe(true);
  });

  it('gives no motion to a player whose system asked for less, whatever the setting says', () => {
    expect(animationsActive(true, true)).toBe(false);
    expect(animationsActive(false, true)).toBe(false);
  });

  it('gives no motion when the setting is off', () => {
    expect(animationsActive(false, false)).toBe(false);
  });
});

describe('highContrastActive', () => {
  // MoreContrastFromTheDeviceTurnsHighContrastOn: the device wins the same way
  // it does for motion, and without having to be asked a second time.
  it('applies when the device asks, whatever the setting says', () => {
    expect(highContrastActive(false, true)).toBe(true);
    expect(highContrastActive(true, true)).toBe(true);
  });

  it('applies when the player asks and the device is silent', () => {
    expect(highContrastActive(true, false)).toBe(true);
  });

  it('applies when neither asks', () => {
    expect(highContrastActive(false, false)).toBe(false);
  });
});
