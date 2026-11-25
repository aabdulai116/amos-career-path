import { describe, expect, it } from "vitest";
import { skills } from "@/data/skills";
import {
  countStatus,
  countdownTo,
  dashboardTotals,
  domainSummaries,
  formatHours,
  formatPace,
  pathSummaries,
  proofOfWork,
} from "@/lib/dashboard";
import { computeStatuses, type ProgressMap } from "@/lib/graph";
import type { CareerPath, Domain, Skill, SkillProgress } from "@/lib/types";

const skill = (
  id: string,
  domain: Skill["domain"] = "programming",
  prerequisites: string[] = [],
  estHours = 10,
): Skill => ({
  id,
  name: id,
  domain,
  summary: `${id}.`,
  prerequisites,
  estHours,
  level: 1,
});

const done = (completedAt: string | null, extra: Partial<SkillProgress> = {}): SkillProgress => ({
  status: "done",
  notes: "",
  proofUrl: "",
  hoursLogged: 0,
  completedAt,
  resourcesWatched: [],
  ...extra,
});

const chain = [
  skill("a"),
  skill("b", "programming", ["a"]),
  skill("c", "programming", ["b"]),
];

describe("countdownTo", () => {
  const now = new Date("2026-11-24T18:30:00");

  it("counts whole days to the target, ignoring the time of day", () => {
    expect(countdownTo("2026-12-01", now).days).toBe(7);
  });

  it("derives whole weeks and months", () => {
    const c = countdownTo("2027-08-01", now);
    expect(c.days).toBe(250);
    expect(c.weeks).toBe(35);
    expect(c.months).toBe(8);
    expect(c.overdue).toBe(false);
  });

  it("treats today as overdue", () => {
    const c = countdownTo("2026-11-24", now);
    expect(c.days).toBe(0);
    expect(c.overdue).toBe(true);
  });

  it("goes negative once the date has passed", () => {
    const c = countdownTo("2026-11-10", now);
    expect(c.days).toBe(-14);
    expect(c.weeks).toBe(-2);
    expect(c.overdue).toBe(true);
  });
});

describe("countStatus", () => {
  const statuses = computeStatuses(chain, { a: done(null) });

  it("counts a status across the whole map", () => {
    expect(countStatus(statuses, "done")).toBe(1);
    expect(countStatus(statuses, "available")).toBe(1);
    expect(countStatus(statuses, "locked")).toBe(1);
  });

  it("can be scoped to a subset", () => {
    expect(countStatus(statuses, "available", new Set(["c"]))).toBe(0);
    expect(countStatus(statuses, "available", new Set(["b"]))).toBe(1);
  });
});

describe("dashboardTotals", () => {
  it("summarises the whole map by default", () => {
    const totals = dashboardTotals(chain, { a: done(null) });
    expect(totals.overall).toEqual({
      total: 3,
      done: 1,
      percent: 33.3,
      hoursRemaining: 20,
    });
    expect(totals.unlockedNow).toBe(1);
    expect(totals.locked).toBe(1);
    expect(totals.inProgress).toBe(0);
  });

  it("restricts the totals to a scope", () => {
    const totals = dashboardTotals(chain, { a: done(null) }, new Set(["a", "b"]));
    expect(totals.overall.total).toBe(2);
    expect(totals.overall.percent).toBe(50);
  });

  it("reports zero rather than NaN for an empty scope", () => {
    const totals = dashboardTotals(chain, {}, new Set());
    expect(totals.overall.percent).toBe(0);
    expect(totals.overall.total).toBe(0);
  });

  it("counts an in-progress skill separately from an available one", () => {
    const progress: ProgressMap = {
      a: { ...done(null), status: "in_progress" },
    };
    const totals = dashboardTotals(chain, progress);
    expect(totals.inProgress).toBe(1);
    expect(totals.unlockedNow).toBe(0);
  });
});

describe("proofOfWork", () => {
  it("lists only finished skills, newest first", () => {
    const entries = proofOfWork(chain, {
      a: done("2026-01-02T00:00:00.000Z"),
      b: done("2026-03-04T00:00:00.000Z"),
    });
    expect(entries.map((e) => e.skill.id)).toEqual(["b", "a"]);
  });

  it("keeps a finished skill that has no proof link", () => {
    const entries = proofOfWork(chain, { a: done("2026-01-02T00:00:00.000Z") });
    expect(entries).toHaveLength(1);
    expect(entries[0].proofUrl).toBe("");
  });

  it("carries the proof link and hours through", () => {
    const entries = proofOfWork(chain, {
      a: done("2026-01-02T00:00:00.000Z", {
        proofUrl: "https://github.com/example/repo",
        hoursLogged: 9.5,
      }),
    });
    expect(entries[0].proofUrl).toBe("https://github.com/example/repo");
    expect(entries[0].hoursLogged).toBe(9.5);
  });

  it("sorts undated completions last, by name", () => {
    const entries = proofOfWork(chain, {
      c: done(null),
      a: done(null),
      b: done("2026-05-05T00:00:00.000Z"),
    });
    expect(entries.map((e) => e.skill.id)).toEqual(["b", "a", "c"]);
  });

  it("is empty when nothing is finished", () => {
    expect(proofOfWork(chain, {})).toEqual([]);
  });
});

describe("summaries", () => {
  const testDomains: Domain[] = [
    { id: "programming", name: "Programming", color: "#111111", icon: "Code2" },
    { id: "quant", name: "Quant", color: "#222222", icon: "TrendingUp" },
  ];

  it("gives one row per domain, carrying its colour", () => {
    const rows = domainSummaries(chain, { a: done(null) }, testDomains);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ id: "programming", percent: 33.3, color: "#111111" });
    expect(rows[1]).toMatchObject({ id: "quant", total: 0, percent: 0 });
  });

  it("ranks paths by completion, then by name", () => {
    const testPaths: CareerPath[] = [
      { id: "behind", name: "Behind", tagline: "", skillIds: ["c"] },
      { id: "ahead", name: "Ahead", tagline: "", skillIds: ["a"] },
    ];
    const rows = pathSummaries(chain, { a: done(null) }, testPaths);
    expect(rows.map((r) => r.id)).toEqual(["ahead", "behind"]);
    expect(rows[0].percent).toBe(100);
  });

  it("covers every real domain", () => {
    expect(domainSummaries(skills, {})).toHaveLength(10);
  });

  it("covers every real path and starts everyone at zero", () => {
    const rows = pathSummaries(skills, {});
    expect(rows).toHaveLength(9);
    expect(rows.every((r) => r.percent === 0)).toBe(true);
    expect(rows.every((r) => r.total > 0)).toBe(true);
  });
});

describe("formatting", () => {
  it("writes a pace in skills per week", () => {
    expect(formatPace(3)).toBe("3 skills/week");
    expect(formatPace(0.64)).toBe("0.6 skills/week");
  });

  it("says so plainly when there is nothing left", () => {
    expect(formatPace(0)).toBe("nothing left to schedule");
  });

  it("does not print Infinity when the date has passed", () => {
    expect(formatPace(Number.POSITIVE_INFINITY)).toBe("past the target date");
    expect(formatHours(Number.POSITIVE_INFINITY)).toBe("—");
  });

  it("rounds hours to one decimal", () => {
    expect(formatHours(12.34)).toBe("12.3h");
  });
});
