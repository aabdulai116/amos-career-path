import { describe, expect, it } from "vitest";
import { courseDays } from "@/data/course";
import {
  PRIORITY_BLURB,
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  dayExercises,
  exerciseCode,
  exerciseTotals,
  isExerciseDone,
  nextCoreDay,
  prioritySummaries,
  type CourseProgressMap,
} from "@/lib/course";
import type { DayPriority, DayProgress } from "@/lib/types";

const day = (over: Partial<DayProgress> = {}): DayProgress => ({
  watched: false,
  projectDone: false,
  exercisesDone: [],
  exerciseCode: {},
  notes: "",
  repoUrl: "",
  lectureUrl: "",
  completedAt: null,
  ...over,
});

const numbered = courseDays.filter((d) => d.day <= 100);

/* -------------------------------------------------------------- the content */

describe("day priorities", () => {
  it("gives every day a priority and a reason", () => {
    courseDays.forEach((d) => {
      expect(PRIORITY_ORDER, `day ${d.day}`).toContain(d.priority);
      expect(d.priorityNote.trim(), `day ${d.day}`).not.toBe("");
      // A note that does not say anything is worse than no note.
      expect(d.priorityNote.length, `day ${d.day}`).toBeGreaterThan(25);
    });
  });

  it("uses all three priorities, with core a minority", () => {
    const used = new Set(courseDays.map((d) => d.priority));
    expect([...used].sort()).toEqual([...PRIORITY_ORDER].sort());
    const core = courseDays.filter((d) => d.priority === "core").length;
    // If most of the course were core the signal would mean nothing.
    expect(core).toBeGreaterThan(20);
    expect(core).toBeLessThan(courseDays.length / 2);
  });

  it("marks the days that carry the career paths as core", () => {
    // Named explicitly: a reshuffle upstream should fail here, loudly.
    const mustBeCore = [
      9, // dictionaries - hash maps, the most-used interview structure
      16, // OOP
      24, // files
      25, // pandas
      26, // comprehensions
      63, // SQL
      70, // git
      72, // pandas on real data
      74, // groupby and merge
      75, // time series
      77, // NumPy
      78, // linear regression
      80, // statistics
      81, // end-to-end model
    ];
    mustBeCore.forEach((n) => {
      const match = courseDays.find((d) => d.day === n);
      expect(match?.priority, `day ${n} (${match?.title})`).toBe("core");
    });
  });

  it("does not waste core on the turtle-graphics days", () => {
    [18, 20, 22, 23].forEach((n) => {
      expect(courseDays.find((d) => d.day === n)?.priority).toBe("skim");
    });
  });

  it("has a label and a blurb for every priority", () => {
    PRIORITY_ORDER.forEach((p: DayPriority) => {
      expect(PRIORITY_LABEL[p]).toBeTruthy();
      expect(PRIORITY_BLURB[p].length).toBeGreaterThan(20);
    });
  });
});

describe("day exercises", () => {
  it("gives every day at least one exercise", () => {
    courseDays.forEach((d) => {
      expect(d.exercises.length, `day ${d.day}`).toBeGreaterThan(0);
    });
  });

  it("gives the core days more drills than the skim days", () => {
    const mean = (p: DayPriority): number => {
      const days = courseDays.filter((d) => d.priority === p);
      return days.reduce((n, d) => n + d.exercises.length, 0) / days.length;
    };
    expect(mean("core")).toBeGreaterThan(mean("useful"));
    expect(mean("useful")).toBeGreaterThan(mean("skim"));
  });

  it("has a unique id for every exercise, namespaced by its day", () => {
    const ids = courseDays.flatMap((d) => d.exercises.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    courseDays.forEach((d) => {
      d.exercises.forEach((e, index) => {
        expect(e.id).toBe(`${d.day}-${index + 1}`);
      });
    });
  });

  it("gives every exercise a title and a prompt that says something", () => {
    courseDays.flatMap((d) => d.exercises).forEach((e) => {
      expect(e.title.trim(), e.id).not.toBe("");
      expect(e.prompt.trim().length, e.id).toBeGreaterThan(30);
    });
  });

  it("only attaches starter code to runnable exercises", () => {
    // A starter you cannot run is a confusing thing to put in an editor.
    courseDays
      .flatMap((d) => d.exercises)
      .filter((e) => e.starter !== null)
      .forEach((e) => expect(e.runnable, e.id).toBe(true));
  });

  it("keeps most exercises runnable in the page", () => {
    const all = courseDays.flatMap((d) => d.exercises);
    const runnable = all.filter((e) => e.runnable).length;
    expect(runnable / all.length).toBeGreaterThan(0.75);
  });

  it("marks the GUI, browser and network exercises as not runnable", () => {
    // The in-page interpreter has no window and no socket; claiming otherwise
    // would send me chasing an error that is not mine.
    const offline = courseDays
      .flatMap((d) => d.exercises)
      .filter((e) => !e.runnable);
    expect(offline.length).toBeGreaterThan(10);
  });
});

/* ---------------------------------------------------------------- the maths */

describe("dayExercises", () => {
  const first = numbered[0];

  it("counts nothing done for an untouched day", () => {
    expect(dayExercises(first, {})).toEqual({
      done: 0,
      total: first.exercises.length,
    });
  });

  it("counts only this day's finished exercises", () => {
    const progress: CourseProgressMap = {
      [String(first.day)]: day({ exercisesDone: [first.exercises[0].id] }),
    };
    expect(dayExercises(first, progress).done).toBe(1);
  });

  it("ignores an id that is not one of this day's", () => {
    const progress: CourseProgressMap = {
      [String(first.day)]: day({ exercisesDone: ["99-9"] }),
    };
    expect(dayExercises(first, progress).done).toBe(0);
  });
});

describe("exerciseTotals", () => {
  it("adds up to every exercise in the course", () => {
    const totals = exerciseTotals(courseDays, {});
    expect(totals.total).toBe(
      courseDays.reduce((n, d) => n + d.exercises.length, 0),
    );
    expect(totals.done).toBe(0);
    expect(totals.percent).toBe(0);
  });

  it("moves the percentage as exercises are ticked", () => {
    const d = courseDays[0];
    const progress: CourseProgressMap = {
      [String(d.day)]: day({ exercisesDone: d.exercises.map((e) => e.id) }),
    };
    const totals = exerciseTotals(courseDays, progress);
    expect(totals.done).toBe(d.exercises.length);
    expect(totals.percent).toBeGreaterThan(0);
  });
});

describe("isExerciseDone and exerciseCode", () => {
  it("reports false and empty for an untouched day", () => {
    expect(isExerciseDone({}, 1, "1-1")).toBe(false);
    expect(exerciseCode({}, 1, "1-1")).toBe("");
  });

  it("reads back what was stored", () => {
    const progress: CourseProgressMap = {
      "1": day({ exercisesDone: ["1-1"], exerciseCode: { "1-1": "print(1)" } }),
    };
    expect(isExerciseDone(progress, 1, "1-1")).toBe(true);
    expect(isExerciseDone(progress, 1, "1-2")).toBe(false);
    expect(exerciseCode(progress, 1, "1-1")).toBe("print(1)");
  });
});

describe("prioritySummaries", () => {
  it("has a row per priority that accounts for every day", () => {
    const rows = prioritySummaries(courseDays, {});
    expect(rows.map((r) => r.priority)).toEqual(PRIORITY_ORDER);
    expect(rows.reduce((n, r) => n + r.total, 0)).toBe(courseDays.length);
  });

  it("reports hours remaining, which fall as days are watched", () => {
    const before = prioritySummaries(courseDays, {});
    const core = courseDays.find((d) => d.priority === "core");
    expect(core).toBeDefined();
    const after = prioritySummaries(courseDays, {
      [String(core?.day)]: day({ watched: true }),
    });
    const row = (rows: typeof before): number =>
      rows.find((r) => r.priority === "core")?.hoursRemaining ?? 0;
    expect(row(after)).toBeLessThan(row(before));
  });
});

describe("nextCoreDay", () => {
  it("skips past the days that can be skimmed", () => {
    const next = nextCoreDay(courseDays, {});
    expect(next?.priority).toBe("core");
    // Nothing core may be left behind it.
    const earlierCore = courseDays.filter(
      (d) => d.day < (next?.day ?? 0) && d.priority === "core",
    );
    expect(earlierCore).toEqual([]);
  });

  it("moves on once that day is watched", () => {
    const first = nextCoreDay(courseDays, {});
    const second = nextCoreDay(courseDays, {
      [String(first?.day)]: day({ watched: true }),
    });
    expect(second?.day).toBeGreaterThan(first?.day ?? 0);
  });

  it("returns null when every core day is done", () => {
    const progress: CourseProgressMap = {};
    courseDays
      .filter((d) => d.priority === "core")
      .forEach((d) => {
        progress[String(d.day)] = day({ watched: true });
      });
    expect(nextCoreDay(courseDays, progress)).toBeNull();
  });
});
