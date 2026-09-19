/**
 * Timezone-aware calling-hours window, using only Node's built-in Intl/ICU —
 * no date library dependency. The trick: format a UTC instant's wall-clock
 * parts in the target IANA zone, then diff that (mis)interpreted-as-UTC value
 * against the real UTC instant to get the zone's current offset in minutes.
 * That offset is exact for the day it was computed on; a DST transition that
 * falls between "now" and the computed target instant (at most ~24h away in
 * this module's usage) can be off by up to an hour, which is an acceptable
 * tradeoff for a calling-hours scheduler versus pulling in a full tz database.
 */

function offsetMinutes(date: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour === '24' ? '0' : parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asIfUtc - date.getTime()) / 60000;
}

function parseHHMM(value: string): { hours: number; minutes: number } {
  const [h, m] = value.split(':').map((n) => Number(n));
  return { hours: h || 0, minutes: m || 0 };
}

/** "HH:mm" wall-clock time of `date` inside `timezone`. */
export function localTimeOfDay(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Is `date` within the [start, end) calling window, local to `timezone`? No window configured = always allowed. */
export function isWithinCallingHours(
  date: Date,
  timezone: string,
  start?: string | null,
  end?: string | null,
): boolean {
  if (!start || !end) {
    return true;
  }
  const local = localTimeOfDay(date, timezone);
  return start <= end ? local >= start && local < end : local >= start || local < end;
}

/**
 * The next instant at/after `after` that falls inside the calling window.
 * Returns `after` unchanged if already inside the window or no window is configured.
 */
export function nextWithinCallingHours(
  after: Date,
  timezone: string,
  start?: string | null,
  end?: string | null,
): Date {
  if (!start || !end || isWithinCallingHours(after, timezone, start, end)) {
    return after;
  }

  const { hours, minutes } = parseHHMM(start);
  const offset = offsetMinutes(after, timezone);
  // Build "today's start time, expressed in `timezone`" as a UTC instant by
  // taking after's local calendar date and applying the zone's current offset.
  const localNow = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .formatToParts(after)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  let candidate = new Date(
    Date.UTC(Number(localNow.year), Number(localNow.month) - 1, Number(localNow.day), hours, minutes) -
      offset * 60000,
  );

  if (candidate <= after) {
    candidate = new Date(candidate.getTime() + 24 * 60 * 60 * 1000);
  }

  return candidate;
}
