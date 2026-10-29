export const APP_TZ = process.env.APP_TIMEZONE || "UTC";
export const DAY_MS = 86_400_000;

/** How far ahead of UTC the timezone is at this instant, in ms */
function offsetMs(date: Date, tz: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    })
      .formatToParts(date)
      .map((x) => [x.type, x.value])
  );
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant a calendar day starts in the given timezone */
export function startOfDayInTz(date: Date, tz = APP_TZ) {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  const guess = new Date(`${ymd}T00:00:00Z`);
  return new Date(guess.getTime() - offsetMs(guess, tz));
}

/** Start instants of the last `count` days, oldest first, ending with today */
export function recentDayStarts(count: number, now = new Date()) {
  const starts = [startOfDayInTz(now)];
  while (starts.length < count) starts.unshift(startOfDayInTz(new Date(starts[0].getTime() - 1)));
  return starts;
}

export const startOfNextDay = (dayStart: Date) => startOfDayInTz(new Date(dayStart.getTime() + 36 * 3_600_000));

export const weekdayShort = (d: Date) => new Intl.DateTimeFormat("en", { weekday: "short", timeZone: APP_TZ }).format(d);