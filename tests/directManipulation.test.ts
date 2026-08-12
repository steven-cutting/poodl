/*
 * `docs/specs/game.allium` — contract DirectManipulation.
 *
 * Ten surfaces fulfil this contract and not one of them owns it, which is why
 * its rules live in `src/app.css` rather than in a component. This file reads
 * that stylesheet, puts it in the document and measures what it resolves to on
 * a real control.
 *
 * What jsdom can answer decides what is asserted here. There is no layout
 * engine, so `getBoundingClientRect()` returns zeros and every figure that
 * depends on layout — the keyboard divided across a 320px screen, a key's
 * measured height — is taken in real Chromium by the stories instead. The
 * cascade is real, though: `touch-action`, `user-select`, the logical size
 * floors and custom properties all resolve.
 *
 * Two properties do not survive jsdom's CSS parser at all, and they are not
 * covered alike. `-webkit-tap-highlight-color` is the story run's to carry.
 * `-webkit-touch-callout` is carried by neither gate: desktop Chromium does not
 * report it and the platform it is declared for is iOS Safari, so it is
 * declared and never verified. `docs/explanation/accessibility.md` states that
 * gap rather than leaving it to be discovered.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MINIMUM_TOUCH_TARGET, NARROWEST_SUPPORTED_WIDTH } from '../src/lib/config';

/*
 * Read from disk rather than imported. `?raw` is the idiom `src/lib/ports/words.ts`
 * uses for the word lists and it works on any file Vite treats as an asset — but
 * a `.css` file is claimed by Vite's stylesheet pipeline first, which hands back
 * a module whose default export is the empty string. A test that injected that
 * would assert against an empty cascade and pass on every property at once, which
 * is exactly the shape of a test that cannot fail.
 *
 * Resolved from the working directory, which Vitest sets to the project root, and
 * not from `import.meta.url` — under the SSR transform that is a served path
 * rooted at `/`, so `new URL('../src/…')` walks out of the repository.
 */
function source(name: string): string {
  return readFileSync(resolve(process.cwd(), 'src', name), 'utf8');
}

const appCss = source('app.css');
const appHtml = source('app.html');

// One of each kind of control the app actually has. No anchors: the game has
// none, and `Modal`'s focus trap is the only place `a[href]` is even named.
const CONTROLS = `
  <button type="button">Play</button>
  <input type="text" />
  <textarea></textarea>
  <label><input type="checkbox" /> High contrast</label>
  <input type="radio" />
`;

let stylesheet: HTMLStyleElement;
let host: HTMLDivElement;

beforeEach(() => {
  stylesheet = document.createElement('style');
  stylesheet.textContent = appCss;
  document.head.append(stylesheet);

  host = document.createElement('div');
  host.innerHTML = CONTROLS;
  document.body.append(host);
});

afterEach(() => {
  stylesheet.remove();
  host.remove();
});

function resolved(selector: string, property: string): string {
  const element = host.querySelector(selector);
  if (element === null) {
    throw new Error(`The fixture has no ${selector}`);
  }
  return getComputedStyle(element).getPropertyValue(property);
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}

/**
 * The rule a selector belongs to, read back from the parsed stylesheet.
 *
 * Matched against each selector in a rule's list rather than against the whole
 * of `selectorText`, because a rule that answers for two kinds of control writes
 * both of them there and an equality test would stop finding either. The split
 * is naive about a comma nested inside `:is()` or `:where()`; this stylesheet
 * has none, and a nested one would fail loudly here rather than quietly pass.
 * Non-style rules — the dark-theme `@media` block — have no `selectorText` at
 * all, which is why the read admits `undefined`.
 *
 * The first match wins, so a selector named here has to be one this stylesheet
 * lists once. `textarea` is named by three rules and is asked for through none
 * of them.
 */
function ruleFor(selector: string): CSSStyleRule {
  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      const styleRule = rule as CSSStyleRule;
      const selectors = (styleRule.selectorText as string | undefined)?.split(',') ?? [];

      if (selectors.some((one) => one.trim() === selector)) {
        return styleRule;
      }
    }
  }
  throw new Error(`No rule for ${selector}`);
}

describe('ATapDoesOnlyWhatTheControlDoes', () => {
  it('sends a tap to the control rather than to the platform', () => {
    expect(resolved('button', 'touch-action')).toBe('manipulation');
    expect(resolved('input[type="checkbox"]', 'touch-action')).toBe('manipulation');
    expect(resolved('input[type="radio"]', 'touch-action')).toBe('manipulation');
  });

  /*
   * A text control included, and by a rule of its own. Two fast taps in the link
   * field are a caret placed twice rather than a zoom, which is this invariant
   * exactly — what a text control cannot take is the rest of that rule, for the
   * reason the third case below measures.
   */
  it('sends a tap in a text control there too', () => {
    expect(resolved('input[type="text"]', 'touch-action')).toBe('manipulation');
    expect(resolved('textarea', 'touch-action')).toBe('manipulation');
  });

  /*
   * The label included, not only the control: where a checkbox is wrapped in
   * one the row is the target, so the row is where a held finger would
   * otherwise start selecting text.
   */
  it('does not select a control label', () => {
    expect(resolved('button', 'user-select')).toBe('none');
    expect(resolved('button', '-webkit-user-select')).toBe('none');
    expect(resolved('label', 'user-select')).toBe('none');
    expect(resolved('input[type="checkbox"]', 'user-select')).toBe('none');
  });

  /*
   * The invariant says the *label* is not selected, which is as far as it goes.
   * `ShareResults` fulfils DirectManipulation and is bound by
   * `sharing.allium`'s TheGridIsAvailableAsText, which asks for the grid to be
   * "selected by hand before it is sent" — so `ResultsReady`'s textarea and
   * `LinkReady`'s input have to stay selectable. A blanket rule would satisfy
   * one passage by breaking the other.
   */
  it('leaves text the player has to select alone', () => {
    expect(resolved('textarea', 'user-select')).not.toBe('none');
    expect(resolved('input[type="text"]', 'user-select')).not.toBe('none');
  });
});

describe('DeliberateZoomIsNeverTakenAway', () => {
  /*
   * The one assertion in this file that reads source text rather than a
   * resolved value, because the artefact is a static file: `app.html` is
   * copied into the build, and there is no cascade to ask.
   */
  it('never refuses to be zoomed', () => {
    const viewport = /<meta name="viewport" content="([^"]*)"/u.exec(appHtml)?.[1] ?? '';

    expect(viewport).toContain('width=device-width');
    expect(viewport).not.toContain('user-scalable');
    expect(viewport).not.toContain('maximum-scale');
  });

  // `manipulation` drops the platform's double-tap guess and keeps the pinch.
  // `none` would take both, which is the trap this invariant names.
  it('asks only for what the previous invariant needs', () => {
    expect(resolved('button', 'touch-action')).not.toBe('none');
  });

  /*
   * Below 16px iOS Safari zooms the page when an input takes focus — the
   * platform magnifying on its own initiative, which is the thing this invariant
   * protects the player from. `font: inherit` on every text control is what
   * holds it, and the declaration is asserted rather than the resolved figure:
   * jsdom's own default input font is already 16px, so a computed measurement
   * here would pass whether or not the stylesheet said anything at all. The
   * figure is measured on a real input in Chromium by
   * `stories/LinkReady.stories.svelte`, where the user agent's smaller default
   * is the one being overridden.
   */
  it('does not make the platform zoom to read an input', () => {
    const inherited = ruleFor('input');

    expect(inherited.style.getPropertyValue('font')).toBe('inherit');
    expect(inherited.selectorText).toContain('textarea');
  });
});

describe('EveryControlIsAComfortableTarget', () => {
  /*
   * Top to bottom, which every control meets outright. Across is measured in
   * Chromium by the stories: the on-screen keyboard is the one place the figure
   * cannot be met in that direction, so a declared floor would be wrong for the
   * keys and redundant for everything else, whose text already carries it past
   * 44px.
   */
  it('gives every control the figure the specification states, top to bottom', () => {
    const floor = `${MINIMUM_TOUCH_TARGET}px`;

    expect(resolved('button', 'min-block-size')).toBe(floor);
    expect(resolved('input[type="text"]', 'min-block-size')).toBe(floor);
    expect(resolved('textarea', 'min-block-size')).toBe(floor);
  });

  /*
   * Both figures, because the invariant closes on the second: every target holds
   * "down to config.narrowest_supported_width". Only the stories consume that
   * one, and a story frames itself to whatever the constant says — so raising it
   * would widen the frame, keep the run green and leave `config.ts` drifted from
   * `game.allium` with no gate noticing. Pinned here instead.
   */
  it('states the two figures once, where the specification can be checked against them', () => {
    expect(MINIMUM_TOUCH_TARGET).toBe(44);
    expect(NARROWEST_SUPPORTED_WIDTH).toBe(320);
  });
});

describe('ATouchIsAcknowledged', () => {
  /*
   * Suppressing the platform's tap highlight without replacing it is the defect
   * the invariant names, so the replacement is asserted here rather than the
   * suppression — jsdom's parser drops `-webkit-tap-highlight-color` entirely,
   * and the story run holds that half.
   *
   * Two tones, because a key is not one colour: no single tone stands off a
   * plain key, five mark colours and two palettes at once. And no transition
   * and no animation, because the acknowledgement "owes nothing to whether
   * animations are running" — `data-animations` must not reach it.
   */
  it.each([
    ['a button', 'button:active:not(:disabled)'],
    ['a labelled preference row', 'label:has(input:not(:disabled)):active']
  ])('replaces the platform feedback on %s rather than only removing it', (_what, selector) => {
    const pressed = ruleFor(selector).style;
    const ring = pressed.getPropertyValue('box-shadow');

    expect(ring).toContain('var(--text)');
    expect(ring).toContain('var(--background)');
    expect(pressed.getPropertyValue('transition')).toBe('');
    expect(pressed.getPropertyValue('animation')).toBe('');
  });

  /*
   * Every control the suppression reaches, and no more. Removing the platform's
   * flash is what creates the debt, so the two lists have to answer to each
   * other: `SettingsPanel`'s rows are suppressed and were once left with nothing
   * in exchange. A text control is on neither list, because nothing takes its
   * flash away in the first place.
   */
  it('owes an acknowledgement to every control it took one from', () => {
    const suppressed = ruleFor("input[type='radio']").selectorText;
    const acknowledged = ruleFor('button:active:not(:disabled)').selectorText;

    expect(suppressed).toContain('label');
    expect(acknowledged).toContain('label');
  });

  /*
   * A filter would have been the cheaper cue and it is deliberately absent: it
   * dims the letter along with the key, and on the absent mark that costs
   * GameBoard.@guarantee ResultsAreNeverConveyedByColourAlone more than this
   * invariant gains. A shadow paints under the content instead.
   */
  it('does not dim the letter it is acknowledging', () => {
    expect(ruleFor('button:active:not(:disabled)').style.getPropertyValue('filter')).toBe('');
  });

  // Ink and paper, so the cue turns over with the palette rather than carrying
  // a colour of its own that one of the two would have to accommodate.
  it('turns over with the palette', () => {
    const light = { text: token('--text'), background: token('--background') };

    document.documentElement.setAttribute('data-theme', 'dark');
    try {
      expect(token('--text')).not.toBe(light.text);
      expect(token('--background')).not.toBe(light.background);
    } finally {
      document.documentElement.removeAttribute('data-theme');
    }
  });
});
