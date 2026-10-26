export const DEFAULT_TIME_ZONE = "UTC";

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function resolveTimeZone(value: string | null | undefined): string {
  return value && isValidTimeZone(value) ? value : DEFAULT_TIME_ZONE;
}

export function todayInTimeZone(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function userToday(timeZone: string | null | undefined, now = new Date()): string {
  return todayInTimeZone(resolveTimeZone(timeZone), now);
}

export function hourInTimeZone(timeZone: string, now = new Date()): number {
  const hour = new Intl.DateTimeFormat("en", { timeZone, hour: "numeric", hourCycle: "h23" })
    .formatToParts(now)
    .find((entry) => entry.type === "hour")?.value;
  return Number(hour ?? 0);
}

export function greetingForTimeZone(timeZone: string | null | undefined, now = new Date()): string {
  const hour = hourInTimeZone(resolveTimeZone(timeZone), now);
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

export const TIME_ZONE_COOKIE = "cv_tz";
