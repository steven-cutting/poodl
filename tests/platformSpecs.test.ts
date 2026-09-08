import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { platformFile, platformPath } from './platform';

/*
 * The clauses Poodl restates from the platform's specifications, held equal to
 * the text the platform ships.
 *
 * Nothing else anywhere compares the two. Allium has no cross-repository
 * import, and putting a module inside `node_modules` does not give it one:
 * `just check-specs` reads Poodl's six modules alone and the hub's gate reads
 * its three, and both stay green while the clauses drift apart. Only a person
 * diffing the texts side by side would notice, which is to say nobody would.
 *
 * It is meant to be over-sensitive. A reworded comma fails it, and that failure
 * is the one moment somebody is required to say whether the platform's meaning
 * moved. When it did, the clause is amended in the hub and taken here as a
 * version — never reworded here, which is what the failure is for.
 *
 * Two things this deliberately does not do.
 *
 * It compares clauses by the surface or contract that states them, not by name.
 * `FullyKeyboardOperable` is stated once by the platform, for its own
 * `Operation` surface, and seven times by Poodl under seven different surfaces,
 * each with the wording that surface needs; `Deterministic` is stated three
 * times here. A register keyed by bare name would compare one of those to the
 * platform's and demand Poodl reword six more clauses nobody asked it to.
 *
 * And it says nothing about the platform clauses Poodl never restates —
 * `EveryKeyIsAControl`, the marking invariants, the dialog and typed-input
 * guarantees. Those are inherited by rendering the platform's own components,
 * not by copying their words, so there is nothing here to hold equal.
 */

/** How a clause body reads once the shape of the comment is taken off it. */
function flatten(body: readonly string[]): string {
  return body
    .map((line) => line.trim().replace(/^--[ ]?/u, ''))
    .join(' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

/**
 * Every clause in a module, by the surface or contract stating it and its name.
 *
 * A body runs to the first line that is not a comment. The platform separates
 * the paragraphs of its longer clauses with lines that are exactly `--`, which
 * are part of the body and not the end of it.
 */
function clauses(text: string): Map<string, string> {
  const found = new Map<string, string>();
  const lines = text.split('\n');
  let scope = '';

  for (const [index, line] of lines.entries()) {
    const opens = /^[ \t]*(?:surface|contract)[ \t]+(?<name>\w+)[ \t]*\{/u.exec(line);

    if (opens?.groups?.['name'] !== undefined) {
      scope = opens.groups['name'];
      continue;
    }

    const clause = /^[ \t]*@(?:guarantee|invariant)[ \t]+(?<name>\w+)[ \t]*$/u.exec(line);

    if (clause?.groups?.['name'] === undefined) {
      continue;
    }

    const body: string[] = [];

    for (const following of lines.slice(index + 1)) {
      if (!following.trim().startsWith('--')) {
        break;
      }
      body.push(following);
    }

    found.set(`${scope}.${clause.groups['name']}`, flatten(body));
  }

  return found;
}

/** Every figure a `config` block states as a number. `Duration` is not one. */
function figures(text: string): Map<string, number> {
  const found = new Map<string, number>();
  const pattern =
    /^[ \t]*(?<name>\w+)[ \t]*:[ \t]*(?:Integer|Decimal)[ \t]*=[ \t]*(?<value>[0-9.]+)/gmu;

  for (const match of text.matchAll(pattern)) {
    if (match.groups?.['name'] !== undefined && match.groups['value'] !== undefined) {
      found.set(match.groups['name'], Number(match.groups['value']));
    }
  }

  return found;
}

function poodlModule(name: string): string {
  return readFileSync(resolve(process.cwd(), 'docs', 'specs', name), 'utf8');
}

/**
 * What Poodl restates, and where.
 *
 * `settings.allium` declares no `config` block and reaches `game.allium`'s
 * through the `game` alias, so its two references carry a prefix the platform's
 * root module has no need of. That prefix is the whole of the normalisation,
 * and it is declared here rather than applied quietly.
 */
const RESTATED = [
  {
    module: 'appearance.allium',
    theirs: 'Appearance',
    file: 'settings.allium',
    ours: 'Appearance',
    prefixed: true,
    clauses: [
      'SystemFollowsTheDeviceAsItChanges',
      'ReducedMotionOverridesTheAnimationSetting',
      'MoreContrastFromTheDeviceTurnsHighContrastOn',
      'AppearanceNeverCarriesMeaningAlone',
      'EveryCombinationMeetsTheLegibilityFloor',
      'AnUnavailableControlIsExempt'
    ]
  },
  {
    module: 'operation.allium',
    theirs: 'DirectManipulation',
    file: 'game.allium',
    ours: 'DirectManipulation',
    prefixed: false,
    clauses: [
      'ATapDoesOnlyWhatTheControlDoes',
      'DeliberateZoomIsNeverTakenAway',
      'EveryControlIsAComfortableTarget',
      'ATouchIsAcknowledged'
    ]
  }
] as const;

/** Which module states each figure `game.allium` also declares. */
const FIGURES = [
  { figure: 'minimum_text_contrast', module: 'appearance.allium' },
  { figure: 'minimum_boundary_contrast', module: 'appearance.allium' },
  { figure: 'minimum_touch_target', module: 'operation.allium' },
  { figure: 'narrowest_supported_width', module: 'operation.allium' },
  { figure: 'minimum_state_separation', module: 'play-surfaces.allium' },
  { figure: 'minimum_mark_separation', module: 'play-surfaces.allium' }
] as const;

const MODULES = ['appearance.allium', 'operation.allium', 'play-surfaces.allium'] as const;

describe('the platform specifications Poodl restates', () => {
  it.each(MODULES)('reads %s from the installed package', (module) => {
    expect(platformPath(`specs/${module}`)).toContain('node_modules');
  });

  it.each(RESTATED.flatMap((entry) => entry.clauses.map((name) => ({ ...entry, name }))))(
    '$file states $name exactly as $module does',
    ({ module, theirs, file, ours, prefixed, name }) => {
      const platform = clauses(platformFile(`specs/${module}`)).get(`${theirs}.${name}`);
      const poodl = clauses(poodlModule(file)).get(`${ours}.${name}`);

      expect(platform, `${module} no longer states ${theirs}.${name}`).toBeDefined();
      expect(poodl, `${file} no longer states ${ours}.${name}`).toBeDefined();
      expect(prefixed ? (poodl ?? '').replaceAll('game/config.', 'config.') : poodl).toBe(platform);
    }
  );

  it.each(FIGURES)('agrees with $module on config.$figure', ({ figure, module }) => {
    const platform = figures(platformFile(`specs/${module}`)).get(figure);

    expect(platform, `${module} no longer states ${figure}`).toBeDefined();
    expect(figures(poodlModule('game.allium')).get(figure)).toBe(platform);
  });

  /*
   * The version is what makes drift visible, and a lockfile alone would not
   * say it: this asserts the tree these comparisons just read is the one
   * `package.json` pins, so a stale `node_modules` reports itself rather than
   * quietly proving the wrong thing.
   */
  it('reads the version package.json pins', () => {
    const installed = JSON.parse(platformFile('package.json')) as { version: string };
    const pinned = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
    };

    expect(pinned.dependencies['@steven-cutting/biscuit-games']).toBe(installed.version);
  });
});
