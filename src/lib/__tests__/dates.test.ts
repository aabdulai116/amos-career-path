import { describe, expect, it } from "vitest";
import {
  addDays,
  currentStreak,
  dayKey,
  hoursByWeek,
  isActiveDay,
  longestStreak,
  weekKey,
} from "@/lib/dates";

const log = (hours: number, resources = 0) => ({ hours, resources });

describe("day keys", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(dayKey(new Date("2026-03-05T23:30:00"))).toBe("2026-03-05");
  });

  it("pads single-digit months and days", () => {
    expect(dayKey(new Date("2026-01-02T08:00:00"))).toBe("2026-01-02");
  });

  it("rolls over month boundaries when adding days", () => {
    expect(dayKey(addDays(new Date("2026-01-31T10:00:00"), 1))).toBe("2026-02-01");
  });

  it("snaps a week key back to Monday", () => {
    // 2026-11-24 is a Tuesday.
    expect(weekKey(new Date("2026-11-24T10:00:00"))).toBe("2026-11-23");
    expect(weekKey(new Date("2026-11-29T10:00:00"))).toBe("2026-11-23");
    expect(weekKey(new Date("2026-11-30T10:00:00"))).toBe("2026-11-30");
  });
});

describe("isActiveDay", () => {
  it("counts a day with logged hours", () => {
    expect(isActiveDay(log(0.5))).toBe(true);
  });

  it("counts a day where only a resource was checked off", () => {
    expect(isActiveDay(log(0, 1))).toBe(true);
  });

  it("does not count an empty or missing day", () => {
    expect(isActiveDay(log(0, 0))).toBe(false);
    expect(isActiveDay(undefined)).toBe(false);
  });
});

describe("currentStreak", () => {
  const today = new Date("2026-11-24T12:00:00");

  it("is zero with no activity", () => {
    expect(currentStreak({}, today)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(
      currentStreak(
        {
          "2026-11-22": log(1),
          "2026-11-23": log(0, 2),
          "2026-11-24": log(2),
        },
        today,
      ),
    ).toBe(3);
  });

  it("still counts a streak when today has not been logged yet", () => {
    expect(
      currentStreak({ "2026-11-22": log(1), "2026-11-23": log(1) }, today),
    ).toBe(2);
  });

  it("breaks once two days are missed", () => {
    expect(
      currentStreak({ "2026-11-21": log(1), "2026-11-22": log(1) }, today),
    ).toBe(0);
  });

  it("stops at a gap rather than counting earlier days", () => {
    expect(
      currentStreak(
        { "2026-11-20": log(5), "2026-11-23": log(1), "2026-11-24": log(1) },
        today,
      ),
    ).toBe(2);
  });
});

describe("longestStreak", () => {
  it("finds the best run anywhere in the history", () => {
    expect(
      longestStreak({
        "2026-11-01": log(1),
        "2026-11-02": log(1),
        "2026-11-03": log(1),
        "2026-11-10": log(1),
      }),
    ).toBe(3);
  });

  it("ignores empty days", () => {
    expect(longestStreak({ "2026-11-01": log(0, 0) })).toBe(0);
  });
});

describe("hoursByWeek", () => {
  const today = new Date("2026-11-24T12:00:00");

  it("returns one bucket per week, oldest first", () => {
    const weeks = hoursByWeek({}, 4, today);
    expect(weeks.map((w) => w.week)).toEqual([
      "2026-11-02",
      "2026-11-09",
      "2026-11-16",
      "2026-11-23",
    ]);
  });

  it("sums the days inside a week", () => {
    const weeks = hoursByWeek(
      { "2026-11-23": log(1.5), "2026-11-24": log(2) },
      2,
      today,
    );
    expect(weeks[1]).toEqual({ week: "2026-11-23", hours: 3.5 });
  });

  it("drops days outside the window", () => {
    const weeks = hoursByWeek({ "2026-01-05": log(40) }, 2, today);
    expect(weeks.every((w) => w.hours === 0)).toBe(true);
  });
});
