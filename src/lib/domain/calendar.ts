import { CALENDAR_ZONE, EPOCH_DATE } from '$lib/config';

/**
 * `daily.allium` — the `DailyCalendar` contract, and `DailyAnswer.day_of_entry`.
 *
 * `day_of`/`day_start` are deterministic functions of a moment (or a day
 * number) and the fixed `EPOCH_DATE`/`CALENDAR_ZONE` config — one correct
 * answer for any given input, unlike storage, the clock or randomness. That
 * makes this a pure domain module rather than a port: there is nothing a fake
 * would ever need to disagree with the real implementation about.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * A numeric field of a formatted date, read from its parts.
 *
 * Never a locale string parsed back apart. What a formatter puts between the
 * fields, and what order it puts them in, belong to the locale's data; the
 * parts are named, so reading them is the same on every engine.
 */
function fieldOf(parts: readonly Intl.DateTimeFormatPart[], type: string): number {
  return Number(parts.find((part) => part.type === type)?.value);
}

/**
 * The UTC instant of midnight on a `YYYY-MM-DD` calendar date.
 *
 * Only ever handed a date Poodl wrote itself — `EPOCH_DATE` from config, or an
 * ISO instant sliced by `addCalendarDays` — never one a formatter produced.
 */
function utcMidnightOf(dateString: string): number {
  const fields = dateString.split('-');

  return Date.UTC(Number(fields[0]), Number(fields[1]) - 1, Number(fields[2]));
}

/** A `YYYY-MM-DD` calendar date, `days` calendar days after another. */
function addCalendarDays(dateString: string, days: number): string {
  const isoInstant = new Date(utcMidnightOf(dateString) + days * DAY_MS).toISOString();
  return isoInstant.slice(0, 10);
}

/**
 * The calendar date `moment` falls on in `CALENDAR_ZONE`, as the UTC instant
 * of that date's midnight — a number to subtract, not a string to read.
 *
 * Built from `formatToParts` rather than from `format`. A formatted date is
 * display text: the locale's data decides the order of the fields and what
 * sits between them, so a build whose ICU resolved `en-CA` differently would
 * hand back something no split on `-` could read, and every day number after
 * it would be `NaN`.
 */
function zonedDateAsUtc(moment: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CALENDAR_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(moment);

  return Date.UTC(fieldOf(parts, 'year'), fieldOf(parts, 'month') - 1, fieldOf(parts, 'day'));
}

/**
 * How far `CALENDAR_ZONE`'s wall clock sits from UTC at `moment`, in
 * milliseconds (positive when the zone is ahead of UTC).
 *
 * Read through `fieldOf` and rebuilt with `Date.UTC`, for the reason stated
 * there.
 */
function offsetAt(moment: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CALENDAR_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(moment);
  const wallClockAsUtc = Date.UTC(
    fieldOf(parts, 'year'),
    fieldOf(parts, 'month') - 1,
    fieldOf(parts, 'day'),
    fieldOf(parts, 'hour'),
    fieldOf(parts, 'minute'),
    fieldOf(parts, 'second')
  );
  return wallClockAsUtc - moment;
}

/** `DailyCalendar.day_of`: `DaysAreCountedFromTheEpoch`, `TheDayTurnsAtLocalMidnight`. */
export function dayOf(moment: number): number {
  const momentDate = zonedDateAsUtc(moment);
  const epochDate = utcMidnightOf(EPOCH_DATE);
  const daysSinceEpoch = Math.round((momentDate - epochDate) / DAY_MS);

  return Math.max(0, daysSinceEpoch) + 1;
}

/**
 * `DailyCalendar.day_start`: the earliest moment whose day is `day`.
 *
 * Resolving a calendar date to the UTC instant of its local midnight needs a
 * guess-and-correct pass: the zone's offset at the *target* instant is what
 * matters, but the offset can only be read by asking the zone about an
 * instant — so a first guess (treating the date as if it were UTC) is
 * corrected once, then re-checked, so a DST transition landing near midnight
 * does not throw the answer off by an hour.
 */
export function dayStart(day: number): number {
  const targetDate = addCalendarDays(EPOCH_DATE, day - 1);
  const guess = utcMidnightOf(targetDate);
  const corrected = guess - offsetAt(guess);

  return guess - offsetAt(corrected);
}

/** `DailyAnswer.daily_answer`: `TheDayPlaysItsEntry`, wrapping past the end. */
export function dailyAnswer(day: number, schedule: readonly string[]): string {
  return schedule[(day - 1) % schedule.length] as string;
}

/**
 * `TodaysGame.next_word_at`, made readable — `TheNextWordIsAnnouncedInAdvance`.
 *
 * `next_word_at` is always a local midnight (`day_start` is defined as
 * exactly that), so the clock reading is always midnight; what changes is the
 * zone's current offset name, which `timeZoneName: 'short'` supplies rather
 * than a hardcoded "Pacific" that a future `CALENDAR_ZONE` change would leave
 * wrong.
 */
export function describeNextWord(nextWordAt: number): string {
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: CALENDAR_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(nextWordAt);

  return `Tomorrow's word arrives at ${time}.`;
}
