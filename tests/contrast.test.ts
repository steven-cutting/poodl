/*
 * `docs/specs/settings.allium` — Appearance.@guarantee
 * EveryCombinationMeetsTheLegibilityFloor, and the two figures
 * `docs/specs/game.allium` — GameBoard.@guarantee
 * AnUntriedKeyIsDistinguishableFromAScoredOne names.
 *
 * The guarantee is about enumeration as much as about ratios: the floor holds
 * "in all four combinations of theme and high contrast, not only the one a
 * change happened to be looked at in". So this reads `src/app.css` from disk,
 * puts it in the document, drives each combination through the root attributes
 * and recomputes every pair. No figure quoted in a comment or a documentation
 * page is trusted; each is derived here from the colours that actually resolve.
 *
 * The pairs follow the shape the amended guarantee states. The untried key
 * hugs the page, so the ground it hugs is what a hue result must stand off;
 * absent has no hue and no bar, so its letter answers to the untried letter;
 * and the mark separation between absent and correct rides the border each of
 * the two draws — a distance, not a direction. What the marker bars carry —
 * shape, not lightness — is asserted where the bars are rendered, in the
 * component tests and stories, because a stylesheet cannot say whether a bar
 * exists.
 *
 * Axe cannot stand in for this, and the two gates fail differently. Axe checks
 * what it can attribute to painted text, so it never sees a marker bar — they
 * are `aria-hidden` — and it has no notion at all of one key state standing
 * off another, which is the pair the whole palette is built around.
 *
 * What is deliberately absent below is any disabled pair.
 * `Appearance.@guarantee AnUnavailableControlIsExempt` holds a control the
 * player cannot operate to none of these figures, exactly as WCAG 2.2 exempts
 * an inactive component from 1.4.3 and 1.4.11 — so `--text-disabled`, the
 * disabled button's `--rule` border and the keyboard a finished game dims are
 * measured nowhere here, and adding them would assert a floor the
 * specification does not state. The half of that guarantee which does bind is
 * not a ratio at all, so it is held where the keys are rendered instead:
 * `tests/components.test.ts` proves a switched-off key still reports as
 * disabled and still carries the marker bar its live form carried.
 *
 * All four combinations are covered; what is not is one of the two *routes* to
 * one of them. jsdom answers no media query, so the ratios below are all taken
 * with the dark theme reached by attribute, and `app.css` declares the same
 * palette a second time for the device-preference route. That duplication is
 * the only drift this palette introduced, so the last describe block reads both
 * blocks as text and holds them equal — which is what makes every figure here
 * cover both routes rather than the one it can drive.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  MINIMUM_BOUNDARY_CONTRAST,
  MINIMUM_MARK_SEPARATION,
  MINIMUM_STATE_SEPARATION,
  MINIMUM_TEXT_CONTRAST
} from '../src/lib/config';

// Read from disk rather than imported, for the reason
// `tests/directManipulation.test.ts` records: Vite claims `.css` and hands back
// a module whose default export is the empty string, which would assert against
// an empty cascade and pass on everything at once.
const appCss = readFileSync(resolve(process.cwd(), 'src', 'app.css'), 'utf8');

let stylesheet: HTMLStyleElement;

beforeEach(() => {
  stylesheet = document.createElement('style');
  stylesheet.textContent = appCss;
  document.head.append(stylesheet);
});

afterEach(() => {
  stylesheet.remove();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-high-contrast');
});

/**
 * A token's value, following `var()` to whatever it names.
 *
 * jsdom resolves the cascade but not custom-property substitution: it reports
 * `--key-untried-bg` as the literal string `var(--background)`. A browser
 * would have substituted already, so the chain is walked here rather than
 * every token in `app.css` being written out longhand to suit the test.
 */
function token(name: string): string {
  const root = document.documentElement;
  let value = getComputedStyle(root).getPropertyValue(name).trim();

  for (let hops = 0; value.startsWith('var('); hops += 1) {
    if (hops > 4) {
      throw new Error(`${name} does not settle: ${value}`);
    }
    value = getComputedStyle(root).getPropertyValue(value.slice('var('.length, -1).trim()).trim();
  }

  if (!/^#[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`${name} is ${JSON.stringify(value)}, which is not a six-digit hex colour`);
  }
  return value;
}

/** WCAG 2.2 relative luminance. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((at) => Number.parseInt(hex.slice(at, at + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

/** WCAG 2.2 contrast, which is symmetric: the order of the pair says nothing. */
function ratio(one: string, other: string): number {
  const [lo, hi] = [luminance(one), luminance(other)].sort((a, b) => a - b);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

/**
 * The two tones `app.css` draws the pressed ring in, against one ground.
 *
 * The cue is a pair of rings, so the edge the eye catches is the better of the
 * two — asserting both would demand a single tone that stands off every
 * ground, which is the thing a two-tone ring exists because no colour does.
 */
function ringEdge(over: string): number {
  return Math.max(ratio(token('--text'), over), ratio(token('--background'), over));
}

interface Combination {
  name: string;
  theme: 'light' | 'dark';
  highContrast: boolean;
}

const COMBINATIONS: readonly Combination[] = [
  { name: 'light, standard', theme: 'light', highContrast: false },
  { name: 'light, high contrast', theme: 'light', highContrast: true },
  { name: 'dark, standard', theme: 'dark', highContrast: false },
  { name: 'dark, high contrast', theme: 'dark', highContrast: true }
];

// The two inks a scored key or tile is painted in. Absent is deliberately not
// here: it has no ink of its own, and the two assertions it answers — its
// letter against the untried letter, its border against correct's — are
// stated individually below.
const HUE_RESULTS = ['--result-exact', '--result-present'] as const;

function apply({ theme, highContrast }: Combination): void {
  const root = document.documentElement;

  root.setAttribute('data-theme', theme);

  if (highContrast) {
    root.setAttribute('data-high-contrast', 'true');
  } else {
    root.removeAttribute('data-high-contrast');
  }
}

describe('EveryCombinationMeetsTheLegibilityFloor', () => {
  for (const combination of COMBINATIONS) {
    describe(combination.name, () => {
      beforeEach(() => {
        apply(combination);
      });

      /*
       * The plainest pairs in the stylesheet, and the easiest to leave out of
       * a test about keys. `--text` on `--background` is every sentence on the
       * page; `--text-2` is the attempt count under the board and the note
       * under a preference; `--text-3` is the absent letter's grey doing duty
       * as tertiary text. All of it is text a player reads rather than
       * decoration, on the page and on the raised surfaces the dialogs and
       * scored keys sit on, so it all answers to the same bar.
       */
      it('paints legible text on the page and its surfaces', () => {
        for (const ink of ['--text', '--text-2', '--text-3'] as const) {
          expect(ratio(token(ink), token('--background'))).toBeGreaterThanOrEqual(
            MINIMUM_TEXT_CONTRAST
          );
        }
        for (const ink of ['--text', '--text-2'] as const) {
          expect(ratio(token(ink), token('--surface-raised'))).toBeGreaterThanOrEqual(
            MINIMUM_TEXT_CONTRAST
          );
        }
      });

      /*
       * Every key letter is 16px at weight 600, below the large-text
       * threshold, so all of them answer to the 4.5 bar rather than the 3.0
       * one. The tile fills are held to the same 4.5 although a tile's letter
       * is 24px at 600 — WCAG large text, where 3.0 would be the honest bar —
       * so a future palette pinned by a fill may re-derive that pair at 3.0
       * rather than quietly weakening this file.
       */
      it('paints legible text on every key', () => {
        expect(ratio(token('--text'), token('--key-untried-bg'))).toBeGreaterThanOrEqual(
          MINIMUM_TEXT_CONTRAST
        );

        for (const ink of [...HUE_RESULTS, '--result-absent-text'] as const) {
          expect(ratio(token(ink), token('--key-scored-bg'))).toBeGreaterThanOrEqual(
            MINIMUM_TEXT_CONTRAST
          );
        }

        for (const result of HUE_RESULTS) {
          expect(ratio(token(`${result}-ink`), token(result))).toBeGreaterThanOrEqual(
            MINIMUM_TEXT_CONTRAST
          );
        }

        expect(ratio(token('--brand-warm-ink'), token('--brand-warm'))).toBeGreaterThanOrEqual(
          MINIMUM_TEXT_CONTRAST
        );

        // The fills are light-only: the dark themes stay fill-free, the
        // tokens resolve to `transparent` there, and `token()` would rightly
        // refuse to measure a colour that is not one.
        if (combination.theme === 'light') {
          for (const result of HUE_RESULTS) {
            expect(ratio(token(result), token(`${result}-fill`))).toBeGreaterThanOrEqual(
              MINIMUM_TEXT_CONTRAST
            );
          }
        }
      });

      /*
       * The untried key is the one control whose boundary is not its own fill:
       * it hugs the page deliberately, so `--key-untried-rule` answers for it —
       * and for every other control drawn as a hairline on the page, which is
       * why no control may borrow `--rule` or `--rule-strong` instead. A hue
       * result's border is its ink, and absent's is the one border it draws.
       */
      it('draws every control against the page', () => {
        for (const boundary of ['--key-untried-rule', ...HUE_RESULTS, '--result-absent'] as const) {
          expect(ratio(token(boundary), token('--background'))).toBeGreaterThanOrEqual(
            MINIMUM_BOUNDARY_CONTRAST
          );
        }
      });

      /*
       * `HowToPlay` draws one example tile per mark on a dialog's `--surface`,
       * the one ground no tile had sat on: the board is on the page, a scored
       * key on its raised ground. The dark themes have no fills, so there the
       * letter sits straight on the surface and answers to the text bar; and
       * the border, which with the bar is the shape that carries the result,
       * answers to the non-text bar on every theme.
       */
      it('paints the example tiles legibly on a dialog', () => {
        for (const ink of [...HUE_RESULTS, '--result-absent-text'] as const) {
          expect(ratio(token(ink), token('--surface'))).toBeGreaterThanOrEqual(
            MINIMUM_TEXT_CONTRAST
          );
        }
        for (const boundary of [...HUE_RESULTS, '--result-absent'] as const) {
          expect(ratio(token(boundary), token('--surface'))).toBeGreaterThanOrEqual(
            MINIMUM_BOUNDARY_CONTRAST
          );
        }
      });

      it('keeps the focus ring visible against the page', () => {
        expect(ratio(token('--focus'), token('--background'))).toBeGreaterThanOrEqual(
          MINIMUM_BOUNDARY_CONTRAST
        );
      });

      // ATouchIsAcknowledged: the ring replaces the platform's tap flash, so
      // it is a state indicator and answers to the non-text bar like any
      // other. Two grounds, because every key sits on one of the two.
      it('acknowledges a touch on every key it can land on', () => {
        for (const ground of ['--key-untried-bg', '--key-scored-bg'] as const) {
          expect(ringEdge(token(ground))).toBeGreaterThanOrEqual(MINIMUM_BOUNDARY_CONTRAST);
        }
      });
    });
  }
});

describe('AnUntriedKeyIsDistinguishableFromAScoredOne', () => {
  for (const combination of COMBINATIONS) {
    describe(combination.name, () => {
      beforeEach(() => {
        apply(combination);
      });

      /*
       * The pair with no hue and no bar on either side, which is why lightness
       * alone must carry it: an untried key and an absent key are both a
       * bordered letter, and the letters are what differ. This is the wall the
       * app.css header names — 3.28 against 3.0 in the dark themes — and the
       * figure `--n-75`'s constraint window exists to hold.
       */
      it('holds the untried letter apart from the absent letter', () => {
        expect(ratio(token('--text'), token('--result-absent-text'))).toBeGreaterThanOrEqual(
          MINIMUM_STATE_SEPARATION
        );
      });

      // A hue result answers with its ink — letter, border and bar together —
      // standing off the ground the untried key hugs, which is the page.
      it('holds each hue result off the ground the untried key hugs', () => {
        for (const result of HUE_RESULTS) {
          expect(ratio(token(result), token('--key-untried-bg'))).toBeGreaterThanOrEqual(
            MINIMUM_STATE_SEPARATION
          );
        }
      });

      // Absent against correct, and that pair only, carried by the border
      // each of the two draws. A distance, not a direction: absent's border is
      // the lighter of the pair in dark and the darker in light, and the
      // symmetric ratio is indifferent to which.
      it('holds absent apart from correct by the border each draws', () => {
        expect(ratio(token('--result-absent'), token('--result-exact'))).toBeGreaterThanOrEqual(
          MINIMUM_MARK_SEPARATION
        );
      });
    });
  }
});

describe('the palette these floors are met by', () => {
  /*
   * The shape stated at the top of `app.css`, asserted rather than described
   * because it is what makes the separation figures reachable at all. The
   * untried key does not sit near the page: it sits on it, which is what
   * lets a hue result's distance from that ground be the same figure as its
   * boundary against the page.
   */
  it('keeps the untried key on the page itself', () => {
    for (const combination of COMBINATIONS) {
      apply(combination);
      expect(token('--key-untried-bg')).toBe(token('--background'));
    }
  });

  /*
   * A scored key is a quiet ground marked by a loud ink, never the other way
   * around. If the ground shouted — a filled key in the old manner — the ink
   * would have nowhere to stand, and the state separations above would be
   * paid twice.
   */
  it('keeps every scored ground nearer the page than the ink that marks it', () => {
    for (const combination of COMBINATIONS) {
      apply(combination);
      const page = token('--background');
      const ground = ratio(token('--key-scored-bg'), page);

      for (const result of HUE_RESULTS) {
        expect(ratio(token(result), page)).toBeGreaterThan(ground);
      }
    }
  });

  /*
   * High contrast "raises the floor nowhere: it is a second palette that has
   * to clear the same bar". Every assertion above already runs against both,
   * so what is left to state is that they are in fact two — a high-contrast
   * palette that quietly resolved to the standard one would satisfy all of
   * it. Absent changes too, because its borders and greys are pinned by the
   * same windows; nothing outside this file depends on any of these hexes,
   * since the shared emoji grid follows the setting rather than the board's
   * colours.
   */
  it('changes the hue results when high contrast asks', () => {
    for (const theme of ['light', 'dark'] as const) {
      document.documentElement.setAttribute('data-theme', theme);
      const standard = HUE_RESULTS.map(token);

      document.documentElement.setAttribute('data-high-contrast', 'true');
      const high = HUE_RESULTS.map(token);

      expect(high[0]).not.toBe(standard[0]);
      expect(high[1]).not.toBe(standard[1]);

      document.documentElement.removeAttribute('data-high-contrast');
    }
  });

  /*
   * The warm family is the one colour rationed to the brand, and the pair is
   * measured at 6.93 above in every palette. A measured token nothing renders
   * is a figure that cannot regress where anyone would see it, though — which
   * is how this pair reached the branch defined, tested and unspent — so what
   * is left to state is that the stylesheet still spends it. Read as text for
   * the reason the drift check below records: a rule the engine declined to
   * parse becomes an empty declaration list, and an empty block agrees with
   * anything.
   */
  it('spends the warm family on the selection', () => {
    const stripped = appCss.replaceAll(/\/\*[\s\S]*?\*\//g, '');
    const at = stripped.indexOf('::selection');
    if (at === -1) {
      throw new Error('app.css no longer spends the warm family on ::selection');
    }

    const opens = stripped.indexOf('{', at);
    const body = stripped.slice(opens + 1, stripped.indexOf('}', opens));

    expect(body).toContain('var(--brand-warm)');
    expect(body).toContain('var(--brand-warm-ink)');
  });
});

/*
 * The one drift path this palette created, closed.
 *
 * The dark theme is reached two ways — by the device while no choice is
 * recorded, and by an explicit choice — and `app.css` declares the values twice
 * because a media query and an attribute cannot be one selector. Every
 * assertion above drives the attribute, because jsdom answers no media query;
 * so what is checked here is not a ratio but that the pair of blocks says the
 * same thing. Every figure in this file therefore covers both paths, rather
 * than the one it can reach.
 *
 * Read as text, from the stylesheet on disk. jsdom parses the `@media` rule, so
 * this could be done through `document.styleSheets` — but a rule the engine
 * declined to parse would silently become an empty declaration list and two
 * empty blocks agree perfectly, which is the shape of a check that cannot fail.
 */
describe('the two ways the dark theme is reached', () => {
  /*
   * Comments first, and not as tidiness. A declaration that follows one sits in
   * the same span between two semicolons as the comment does, so a naive split
   * drops it — which is exactly how this check first passed the wrong palette
   * and then failed on a token that was in fact present. `app.css` also quotes
   * its own selectors in prose, so stripping before searching is what keeps a
   * sentence about a rule from being found as the rule.
   */
  const withoutComments = appCss.replaceAll(/\/\*[\s\S]*?\*\//g, '');

  /** The custom properties one rule declares, given the text of its selector. */
  function declarationsAfter(selector: string): Record<string, string> {
    const at = withoutComments.indexOf(selector);
    if (at === -1) {
      throw new Error(`app.css no longer has a rule for ${selector}`);
    }

    const opens = withoutComments.indexOf('{', at);
    const body = withoutComments.slice(opens + 1, withoutComments.indexOf('}', opens));
    const declarations: Record<string, string> = {};

    for (const line of body.split(';')) {
      const [name, ...rest] = line.split(':');
      if (name?.trim().startsWith('--')) {
        declarations[name.trim()] = rest.join(':').trim();
      }
    }
    return declarations;
  }

  it('declares the same palette down each', () => {
    const byMediaQuery = declarationsAfter(":root:not([data-theme='light']) {");
    const byChoice = declarationsAfter(":root[data-theme='dark'] {");

    // `color-scheme` rather than a token, and only the explicit choice needs it:
    // the media path is what the user agent was already doing.
    delete byChoice['color-scheme'];

    expect(Object.keys(byMediaQuery).length).toBeGreaterThan(0);
    expect(byMediaQuery).toEqual(byChoice);
  });

  it('declares the same high-contrast pair down each', () => {
    expect(
      declarationsAfter(":root:not([data-theme='light'])[data-high-contrast='true'] {")
    ).toEqual(declarationsAfter(":root[data-theme='dark'][data-high-contrast='true'] {"));
  });

  /*
   * Set parity between the two high-contrast palettes, which is load-bearing
   * rather than tidy. The light block is (0,2,0) and sits later in the sheet
   * than the media-path dark base at the same weight, so any token it alone
   * declared would leak into a device-dark player who asked for high
   * contrast. The values differ by design; the names must not.
   */
  it('declares the same tokens down both high-contrast palettes', () => {
    const light = Object.keys(declarationsAfter(":root[data-high-contrast='true'] {")).sort();
    const dark = Object.keys(
      declarationsAfter(":root[data-theme='dark'][data-high-contrast='true'] {")
    ).sort();

    expect(light.length).toBeGreaterThan(0);
    expect(light).toEqual(dark);
  });
});
