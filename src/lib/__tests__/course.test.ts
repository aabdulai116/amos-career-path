import { describe, expect, it } from "vitest";
import { courseDays, courseTotals, numberedDays } from "@/data/course";
import {
  TRACK_ORDER,
  courseProofs,
  courseStats,
  formatRuntime,
  trackSummaries,
  type CourseProgressMap,
} from "@/lib/course";
import type { DayProgress } from "@/lib/types";

const watched = (over: Partial<DayProgress> = {}): DayProgress => ({
  watched: true,
  projectDone: false,
  notes: "",
  repoUrl: "",
  lectureUrl: "",
  completedAt: "2026-11-01T00:00:00.000Z",
  ...over,
});

describe("the course data", () => {
  it("covers 100 numbered days plus the two closing sections", () => {
    expect(numberedDays).toHaveLength(100);
    expect(courseDays).toHaveLength(102);
  });

  it("numbers days 1 to 100 with no gaps or repeats", () => {
    expect(numberedDays.map((d) => d.day)).toEqual(
      Array.from({ length: 100 }, (_, i) => i + 1),
    );
  });

  it("matches the run time Udemy advertises", () => {
    // Udemy lists the course as 57 hours.
    expect(Math.round(courseTotals.minutes / 60)).toBe(57);
  });

  it("gives every numbered day a practice project", () => {
    const missing = numberedDays.filter((d) => d.project === null);
    expect(missing.map((d) => d.day)).toEqual([]);
  });

  it("leaves the closing sections without a project", () => {
    expect(courseDays.filter((d) => d.day > 100).every((d) => d.project === null)).toBe(true);
  });

  it("writes a real brief for every project", () => {
    const thin = numberedDays.filter(
      (d) => (d.project?.brief.length ?? 0) < 30 || (d.project?.title.length ?? 0) < 4,
    );
    expect(thin.map((d) => d.day)).toEqual([]);
  });

  it("only uses declared tracks, and every day has lectures", () => {
    const bad = courseDays.filter(
      (d) => !TRACK_ORDER.includes(d.track) || d.lectures < 1,
    );
    expect(bad.map((d) => d.day)).toEqual([]);
  });

  it("keeps the section number aligned with the day number", () => {
    expect(courseDays.filter((d) => d.section !== d.day)).toEqual([]);
  });
});

describe("courseStats", () => {
  it("starts at zero", () => {
    const stats = courseStats(courseDays, {});
    expect(stats).toMatchObject({ totalDays: 100, watched: 0, percent: 0 });
    expect(stats.nextDay).toBe(1);
  });

  it("counts watched days and their run time", () => {
    const progress: CourseProgressMap = { "1": watched(), "2": watched() };
    const stats = courseStats(courseDays, progress);
    expect(stats.watched).toBe(2);
    expect(stats.minutesWatched).toBe(72 + 58);
    expect(stats.percent).toBe(2);
  });

  it("points at the first unwatched day, not the next one after the last", () => {
    const stats = courseStats(courseDays, { "1": watched(), "3": watched() });
    expect(stats.nextDay).toBe(2);
  });

  it("reports nextDay as null once all 100 are watched", () => {
    const all: CourseProgressMap = {};
    for (let d = 1; d <= 100; d += 1) all[String(d)] = watched();
    const stats = courseStats(courseDays, all);
    expect(stats.nextDay).toBeNull();
    expect(stats.percent).toBe(100);
  });

  it("counts projects separately from lectures", () => {
    const stats = courseStats(courseDays, {
      "1": watched({ projectDone: true }),
      "2": watched(),
    });
    expect(stats.projectsDone).toBe(1);
    expect(stats.projectsAvailable).toBe(100);
  });

  it("ignores the closing sections in the day count", () => {
    expect(courseStats(courseDays, { "101": watched() }).watched).toBe(0);
  });
});

describe("trackSummaries", () => {
  it("returns tracks in the declared order", () => {
    const rows = trackSummaries(courseDays, {});
    expect(rows.map((r) => r.id)).toEqual(
      TRACK_ORDER.filter((t) => courseDays.some((d) => d.track === t)),
    );
  });

  it("totals every day exactly once across the tracks", () => {
    const rows = trackSummaries(courseDays, {});
    expect(rows.reduce((n, r) => n + r.total, 0)).toBe(courseDays.length);
  });

  it("scores a track as days watched over days in it", () => {
    const rows = trackSummaries(courseDays, { "1": watched(), "2": watched() });
    const beginner = rows.find((r) => r.id === "Beginner");
    expect(beginner?.done).toBe(2);
    expect(beginner?.total).toBe(14);
  });

  it("drops the hours remaining as days are watched", () => {
    const before = trackSummaries(courseDays, {})[0].hoursRemaining;
    const after = trackSummaries(courseDays, { "1": watched() })[0]
      .hoursRemaining;
    expect(after).toBeLessThan(before);
  });
});

describe("courseProofs", () => {
  it("lists only finished projects that have a repo link, newest first", () => {
    const proofs = courseProofs(courseDays, {
      "3": watched({ projectDone: true, repoUrl: "https://example.com/c" }),
      "9": watched({ projectDone: true, repoUrl: "https://example.com/a" }),
      "5": watched({ projectDone: true, repoUrl: "   " }),
      "7": watched({ projectDone: false, repoUrl: "https://example.com/b" }),
    });
    expect(proofs.map((p) => p.day.day)).toEqual([9, 3]);
  });
});

describe("formatRuntime", () => {
  it("writes minutes under an hour", () => {
    expect(formatRuntime(41)).toBe("41min");
  });

  it("writes whole hours without stray minutes", () => {
    expect(formatRuntime(120)).toBe("2hr");
  });

  it("writes hours and minutes together", () => {
    expect(formatRuntime(72)).toBe("1hr 12min");
  });
});
