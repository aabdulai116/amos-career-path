/** Local-time date helpers. All day keys are YYYY-MM-DD in the user's timezone. */

export const dayKey = (d: Date = new Date()): string => {
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const parseDayKey = (key: string): Date => new Date(`${key}T00:00:00`);

export const addDays = (d: Date, days: number): Date => {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
};

/** Monday-based week key, e.g. "2026-11-23". */
export const weekKey = (d: Date = new Date()): string => {
  const copy = new Date(d);
  const dow = (copy.getDay() + 6) % 7; // Monday = 0
  copy.setDate(copy.getDate() - dow);
  return dayKey(copy);
};

export const isActiveDay = (log: { hours: number; resources: number } | undefined): boolean =>
  log !== undefined && (log.hours > 0 || log.resources > 0);

/**
 * Consecutive active days ending today, or yesterday if today is not logged yet
 * (so the streak is not reported as broken before the day is over).
 */
export const currentStreak = (
  dayLogs: Record<string, { hours: number; resources: number }>,
  today: Date = new Date(),
): number => {
  let cursor = today;
  if (!isActiveDay(dayLogs[dayKey(cursor)])) {
    cursor = addDays(cursor, -1);
    if (!isActiveDay(dayLogs[dayKey(cursor)])) return 0;
  }
  let streak = 0;
  while (isActiveDay(dayLogs[dayKey(cursor)])) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
};

export const longestStreak = (
  dayLogs: Record<string, { hours: number; resources: number }>,
): number => {
  const active = Object.entries(dayLogs)
    .filter(([, log]) => isActiveDay(log))
    .map(([key]) => key)
    .sort();
  let best = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const key of active) {
    const current = parseDayKey(key);
    run =
      previous !== null && dayKey(addDays(previous, 1)) === key ? run + 1 : 1;
    best = Math.max(best, run);
    previous = current;
  }
  return best;
};

/** Hours per Monday-based week, oldest first. */
export const hoursByWeek = (
  dayLogs: Record<string, { hours: number }>,
  weeks = 12,
  today: Date = new Date(),
): { week: string; hours: number }[] => {
  const buckets = new Map<string, number>();
  for (let i = weeks - 1; i >= 0; i -= 1) {
    buckets.set(weekKey(addDays(today, -7 * i)), 0);
  }
  for (const [key, log] of Object.entries(dayLogs)) {
    const wk = weekKey(parseDayKey(key));
    if (buckets.has(wk)) buckets.set(wk, (buckets.get(wk) ?? 0) + log.hours);
  }
  return [...buckets.entries()].map(([week, hours]) => ({
    week,
    hours: Math.round(hours * 100) / 100,
  }));
};
