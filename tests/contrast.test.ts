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
 * Axe cannot stand in for this, and the two gates fail differently. Axe checks
 * what it can attribute to painted text, so it never sees the mark glyphs —
 * they are `aria-hidden` — and it has no notion at all of one key state
 * standing off another, which is the pair the whole change is about.
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
 * `--key-text` as the literal string `var(--text)`. A browser would have
 * substituted already, so the chain is walked here rather than every token in
 * `app.css` being written out longhand to suit the test.
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
 * The two tones `app.css` draws the pressed ring in, against one key.
 *
 * The cue is a pair of rings, so the edge the eye catches is the better of the
 * two — asserting both would demand a single tone that stands off every key,
 * which is the thing a two-tone ring exists because no colour does.
 */
function ringEdge(over: string): number {
  return Math.max(ratio(token('--text'), over), ratio(token('--background'), over));
}

interface Combination {
  name: string;
  theme: 'light' | 'dark' | null;
  highContrast: boolean;
}

const COMBINATIONS: readonly Combination[] = [
  { name: 'light, standard', theme: 'light', highContrast: false },
  { name: 'light, high contrast', theme: 'light', highContrast: true },
  { name: 'dark, standard', theme: 'dark', highContrast: false },
  { name: 'dark, high contrast', theme: 'dark', highContrast: true }
];

const MARKS = ['--mark-correct', '--mark-present', '--mark-absent'] as const;

function apply({ theme, highContrast }: Combination): void {
  const root = document.documentElement;

  if (theme === null) {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }

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

      // Every key on the on-screen keyboard is 16px at weight 600, below the
      // large-text threshold, so all of them answer to the 4.5 bar rather than
      // the 3.0 one.
      it('paints legible text on every key', () => {
        expect(ratio(token('--key-text'), token('--key-background'))).toBeGreaterThanOrEqual(
          MINIMUM_TEXT_CONTRAST
        );

        for (const mark of MARKS) {
          expect(ratio(token('--mark-text'), token(mark))).toBeGreaterThanOrEqual(
            MINIMUM_TEXT_CONTRAST
          );
        }
      });

      /*
       * The plainest pair in the stylesheet, and the easiest to leave out of a
       * test about keys. `--text` on `--background` is the letter in an
       * unscored tile and every sentence on the page; `--muted` is the attempt
       * count under the board and the note under a preference, which is text a
       * player reads rather than decoration, so it answers to the same bar.
       */
      it('paints legible text on the page itself', () => {
        expect(ratio(token('--text'), token('--background'))).toBeGreaterThanOrEqual(
          MINIMUM_TEXT_CONTRAST
        );
        expect(ratio(token('--muted'), token('--background'))).toBeGreaterThanOrEqual(
          MINIMUM_TEXT_CONTRAST
        );
      });

      /*
       * The untried key is the one control whose boundary is not its own fill:
       * it hugs the page deliberately, so the border answers for it. A scored
       * key paints its border in its mark, so the fill answers for both — and
       * the same colours are the primary button in `WelcomeScreen`,
       * `GameConclusion`, `GameNavigation` and `InvalidLinkNotice`, and the
       * destructive one in `StatisticsPanel`.
       */
      it('draws every control against the page', () => {
        expect(ratio(token('--key-border'), token('--background'))).toBeGreaterThanOrEqual(
          MINIMUM_BOUNDARY_CONTRAST
        );

        for (const mark of MARKS) {
          expect(ratio(token(mark), token('--background'))).toBeGreaterThanOrEqual(
            MINIMUM_BOUNDARY_CONTRAST
          );
        }
      });

      it('keeps the focus ring visible against the page', () => {
        expect(ratio(token('--focus'), token('--background'))).toBeGreaterThanOrEqual(
          MINIMUM_BOUNDARY_CONTRAST
        );
      });

      // ATouchIsAcknowledged: the ring replaces the platform's tap flash, so it
      // is a state indicator and answers to the non-text bar like any other.
      it('acknowledges a touch on every key it can land on', () => {
        for (const background of ['--key-background', ...MARKS]) {
          expect(ringEdge(token(background))).toBeGreaterThanOrEqual(MINIMUM_BOUNDARY_CONTRAST);
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
       * The pair the whole change answers for. A letter no guess has covered
       * carries no mark, so the glyph that discharges
       * ResultsAreNeverConveyedByColourAlone speaks for none of this: lightness
       * is the only thing left, and it is the one a dimmed screen keeps
       * longest.
       */
      it('holds an untried key apart from each scored one', () => {
        for (const mark of MARKS) {
          expect(ratio(token('--key-background'), token(mark))).toBeGreaterThanOrEqual(
            MINIMUM_STATE_SEPARATION
          );
        }
      });

      // Absent against correct, and that pair only. Present is left to hue and
      // its own glyph, because the range is already spent.
      it('holds absent apart from correct', () => {
        expect(ratio(token('--mark-absent'), token('--mark-correct'))).toBeGreaterThanOrEqual(
          MINIMUM_MARK_SEPARATION
        );
      });
    });
  }
});

describe('the palette these floors are met by', () => {
  /*
   * High contrast "raises the floor nowhere: it is a second palette that has to
   * clear the same bar". Every assertion above already runs against both, so
   * what is left to state is that they are in fact two — a high-contrast
   * palette that quietly resolved to the standard one would satisfy all of it.
   */
  it('changes the marks a colour-blind reader cannot separate by hue', () => {
    for (const theme of ['light', 'dark'] as const) {
      document.documentElement.setAttribute('data-theme', theme);
      const standard = MARKS.map(token);

      document.documentElement.setAttribute('data-high-contrast', 'true');
      const high = MARKS.map(token);

      expect(high[0]).not.toBe(standard[0]);
      expect(high[1]).not.toBe(standard[1]);
      // Absent is the same in both palettes, as it is in the shared emoji grid.
      expect(high[2]).toBe(standard[2]);

      document.documentElement.removeAttribute('data-high-contrast');
    }
  });

  /*
   * The shape stated at the top of `app.css`: the untried key hugs the page and
   * the marks step away from it. Asserted rather than described because it is
   * what makes the separation figures reachable at all — a palette that put the
   * untried key between two marks could not clear 3 to one on both.
   */
  it('keeps the untried key nearer the page than any mark', () => {
    for (const combination of COMBINATIONS) {
      apply(combination);
      const page = token('--background');
      const untried = ratio(token('--key-background'), page);

      for (const mark of MARKS) {
        expect(ratio(token(mark), page)).toBeGreaterThan(untried);
      }
    }
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
});
