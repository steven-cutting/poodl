import { describe, expect, it } from 'vitest';

import { dayOf, dayStart, dailyAnswer, describeNextWord } from '../src/lib/domain/calendar';

const HOUR_MS = 60 * 60 * 1000;

/*
 * daily.allium — the `DailyCalendar` contract. `EPOCH_DATE`/`CALENDAR_ZONE` are
 * fixed config (`src/lib/config.ts`), so these are pure functions of a moment
 * or a day number — no port, no fake, exactly as the architecture review
 * recommended.
 */
describe('the daily calendar', () => {
  // DaysAreCountedFromTheEpoch: day 1 begins at the epoch.
  it('counts day 1 from the epoch date, in the calendar zone', () => {
    const epochNoonPdt = Date.UTC(2026, 8, 1, 19, 0, 0);
    const nextDayNoonPdt = Date.UTC(2026, 8, 2, 19, 0, 0);

    expect(dayOf(epochNoonPdt)).toBe(1);
    expect(dayOf(nextDayNoonPdt)).toBe(2);
  });

  // DaysAreCountedFromTheEpoch: a moment before the epoch is day 1.
  it('treats a moment before the epoch as day 1', () => {
    expect(dayOf(Date.UTC(2020, 0, 1, 12, 0, 0))).toBe(1);
  });

  /*
   * TheDayTurnsAtLocalMidnight: the same UTC calendar date gives two different
   * days here, because the zone's midnight does not line up with UTC's.
   * 23:00 PDT on 1 Sept is still day 1; 01:00 PDT on 2 Sept is day 2, even
   * though both moments fall within the same UTC calendar day (2 Sept UTC).
   */
  it('turns at local midnight in the calendar zone, not at UTC midnight', () => {
    const elevenPmPdtSept1 = Date.UTC(2026, 8, 2, 6, 0, 0);
    const oneAmPdtSept2 = Date.UTC(2026, 8, 2, 8, 0, 0);

    expect(dayOf(elevenPmPdtSept1)).toBe(1);
    expect(dayOf(oneAmPdtSept2)).toBe(2);
  });

  // DayStartIsTheBoundary: day_start(d) is the earliest moment whose day is d.
  it('marks the boundary a day starts at, round-tripping with dayOf', () => {
    for (let day = 1; day <= 5; day += 1) {
      expect(dayOf(dayStart(day))).toBe(day);
    }
    expect(dayOf(dayStart(2) - 1)).toBe(1);
    expect(dayOf(dayStart(3) - 1)).toBe(2);
  });

  /*
   * The zone observes daylight saving, so a day is not always 24 hours
   * (`@guidance` on DailyCalendar). A test asserting a flat 24h gap would pass
   * for the wrong reason and hide a DST bug — these two fixtures are the exact
   * dates America/Los_Angeles changes offset in the window after the epoch.
   */
  it('is 23 hours long on the day the zone springs forward', () => {
    const springForwardDay = dayOf(Date.UTC(2027, 2, 14, 20, 0, 0));

    expect(dayStart(springForwardDay + 1) - dayStart(springForwardDay)).toBe(23 * HOUR_MS);
  });

  it('is 25 hours long on the day the zone falls back', () => {
    const fallBackDay = dayOf(Date.UTC(2026, 10, 1, 20, 0, 0));

    expect(dayStart(fallBackDay + 1) - dayStart(fallBackDay)).toBe(25 * HOUR_MS);
  });
});

/*
 * daily.allium — the `DailyAnswer` contract's TheDayPlaysItsEntry invariant.
 * The data-shape obligations on the schedule itself belong to words.allium,
 * asserted in tests/words.test.ts against the bundled data.
 */
describe('dailyAnswer', () => {
  const SCHEDULE = ['abase', 'befit', 'crumb'];

  it('plays the schedule entry for the day, one-indexed', () => {
    expect(dailyAnswer(1, SCHEDULE)).toBe('abase');
    expect(dailyAnswer(2, SCHEDULE)).toBe('befit');
    expect(dailyAnswer(3, SCHEDULE)).toBe('crumb');
  });

  // NoRepeatWithinOnePass, then it wraps: day 4 plays entry 1 again.
  it('wraps to the start once the schedule is exhausted', () => {
    expect(dailyAnswer(4, SCHEDULE)).toBe('abase');
    expect(dailyAnswer(6, SCHEDULE)).toBe('crumb');
  });
});

/*
 * TheNextWordIsAnnouncedInAdvance: when the next word arrives is text. Always
 * midnight by definition — day_start is exactly that — so what varies across
 * these two fixtures is the zone's offset name, not the clock reading.
 */
describe('describeNextWord', () => {
  it('reads the moment as midnight in the calendar zone, named by its current offset', () => {
    expect(describeNextWord(dayStart(1))).toBe("Tomorrow's word arrives at 12:00 AM PDT.");

    const fallBackDay = dayOf(Date.UTC(2026, 10, 1, 20, 0, 0));
    expect(describeNextWord(dayStart(fallBackDay + 1))).toBe(
      "Tomorrow's word arrives at 12:00 AM PST."
    );
  });
});
