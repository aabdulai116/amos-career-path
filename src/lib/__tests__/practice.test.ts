import { describe, expect, it } from "vitest";
import { problemBySlug, problems } from "@/data/problems";
import {
  DIFFICULTY_COLOR,
  DIFFICULTY_ORDER,
  ESTIMATED_MINUTES,
  PATTERN_ORDER,
  REVIEW_DAYS,
  difficultyStats,
  emptyFilters,
  filterProblems,
  formatMinutes,
  groupByPattern,
  patternSummaries,
  practiceStats,
  problemUrl,
  recommendedProblems,
  reviewInterval,
  reviewQueue,
  scopedProblems,
  solutionUrl,
  videoUrl,
  type ProblemProgressMap,
} from "@/lib/practice";
import type { Problem, ProblemProgress } from "@/lib/types";

const solved = (over: Partial<ProblemProgress> = {}): ProblemProgress => ({
  status: "solved",
  attempts: 1,
  minutes: 30,
  notes: "",
  timeComplexity: "",
  spaceComplexity: "",
  solution: "",
  usedHint: false,
  solvedAt: "2026-01-01T00:00:00.000Z",
  lastAttemptAt: "2026-01-01T00:00:00.000Z",
  ...over,
});

const attempted = (over: Partial<ProblemProgress> = {}): ProblemProgress =>
  solved({ status: "attempted", solvedAt: null, ...over });

/* ------------------------------------------------------- the generated data */

describe("the NeetCode 150 data", () => {
  it("is exactly 150 problems, 75 of them Blind 75", () => {
    expect(problems).toHaveLength(150);
    expect(problems.filter((p) => p.blind75)).toHaveLength(75);
  });

  it("has no duplicate slugs", () => {
    expect(new Set(problems.map((p) => p.slug)).size).toBe(problems.length);
    expect(problemBySlug.size).toBe(problems.length);
  });

  it("only carries slugs and video ids in the shapes the links are built from", () => {
    problems.forEach((problem) => {
      expect(problem.slug, problem.title).toMatch(/^[a-z0-9-]+$/);
      expect(problem.video, problem.title).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(problem.solutionPath, problem.title).toMatch(/^\d{4}-[a-z0-9-]+$/);
      expect(problem.title.trim(), problem.slug).not.toBe("");
    });
  });

  it("covers every declared pattern and difficulty, and nothing else", () => {
    const patterns = new Set(problems.map((p) => p.pattern));
    expect([...patterns].sort()).toEqual([...PATTERN_ORDER].sort());
    const difficulties = new Set(problems.map((p) => p.difficulty));
    expect([...difficulties].sort()).toEqual([...DIFFICULTY_ORDER].sort());
  });

  it("is stored in the declared pattern order, which is the curriculum", () => {
    // The generator groups by PATTERN_ORDER; if either side drifts, the page
    // would silently teach the patterns in the wrong sequence.
    const seen: string[] = [];
    problems.forEach((p) => {
      if (seen[seen.length - 1] !== p.pattern) seen.push(p.pattern);
    });
    expect(seen).toEqual(PATTERN_ORDER);
  });

  it("gives every premium problem a free mirror, and no others", () => {
    const gated = problems.filter((p) => p.freeUrl !== null);
    expect(gated.length).toBeGreaterThan(0);
    gated.forEach((p) => {
      expect(p.freeUrl, p.title).toMatch(/^https:\/\//);
    });
  });
});

/* ----------------------------------------------------------------- the links */

describe("link building", () => {
  it("builds a LeetCode URL from the slug", () => {
    const problem = problemBySlug.get("two-sum");
    expect(problem).toBeDefined();
    expect(problemUrl(problem as Problem)).toBe(
      "https://leetcode.com/problems/two-sum/",
    );
  });

  it("prefers the free mirror when LeetCode gates the problem", () => {
    const gated = problems.find((p) => p.freeUrl !== null) as Problem;
    expect(problemUrl(gated)).toBe(gated.freeUrl);
    expect(problemUrl(gated)).not.toContain("leetcode.com/problems");
  });

  it("builds the walkthrough and solution URLs from NeetCode's own ids", () => {
    const problem = problems[0];
    expect(videoUrl(problem)).toBe(
      `https://www.youtube.com/watch?v=${problem.video}`,
    );
    expect(solutionUrl(problem)).toBe(
      `https://github.com/neetcode-gh/leetcode/blob/main/python/${problem.solutionPath}.py`,
    );
  });
});

/* ----------------------------------------------------------------- the stats */

describe("practiceStats", () => {
  it("counts an empty record as nothing done", () => {
    const stats = practiceStats(problems, {});
    expect(stats.solved).toBe(0);
    expect(stats.percent).toBe(0);
    expect(stats.blind75Total).toBe(75);
    expect(stats.nextUp?.slug).toBe(problems[0].slug);
  });

  it("separates solved from attempted", () => {
    const progress: ProblemProgressMap = {
      [problems[0].slug]: solved(),
      [problems[1].slug]: attempted(),
    };
    const stats = practiceStats(problems, progress);
    expect(stats.solved).toBe(1);
    expect(stats.attempted).toBe(1);
    // An attempted problem is still work in hand, so it stays in the budget.
    expect(stats.nextUp?.slug).toBe(problems[2].slug);
  });

  it("only counts a clean solve when there was no hint and one sitting", () => {
    const progress: ProblemProgressMap = {
      [problems[0].slug]: solved(),
      [problems[1].slug]: solved({ usedHint: true }),
      [problems[2].slug]: solved({ attempts: 3 }),
    };
    expect(practiceStats(problems, progress).cleanSolves).toBe(1);
  });

  it("drains the hours budget as problems are solved", () => {
    const full = practiceStats(problems, {}).hoursRemaining;
    const one = practiceStats(problems, {
      [problems[0].slug]: solved(),
    }).hoursRemaining;
    expect(full).toBeGreaterThan(one);
    const expected =
      (problems.reduce((n, p) => n + ESTIMATED_MINUTES[p.difficulty], 0) -
        ESTIMATED_MINUTES[problems[0].difficulty]) /
      60;
    expect(one).toBeCloseTo(Math.round(expected * 10) / 10, 5);
  });

  it("reports the Blind 75 subset separately", () => {
    const blind = problems.find((p) => p.blind75) as Problem;
    const stats = practiceStats(problems, { [blind.slug]: solved() });
    expect(stats.blind75Solved).toBe(1);
  });

  it("reaches 100 percent and no next problem when everything is solved", () => {
    const all: ProblemProgressMap = {};
    problems.forEach((p) => {
      all[p.slug] = solved();
    });
    const stats = practiceStats(problems, all);
    expect(stats.percent).toBe(100);
    expect(stats.nextUp).toBeNull();
    expect(stats.hoursRemaining).toBe(0);
  });
});

describe("patternSummaries", () => {
  it("has one row per pattern, summing to the whole list", () => {
    const rows = patternSummaries(problems, {});
    expect(rows).toHaveLength(PATTERN_ORDER.length);
    expect(rows.reduce((n, r) => n + r.total, 0)).toBe(problems.length);
    expect(rows.map((r) => r.id)).toEqual(PATTERN_ORDER);
  });

  it("gives every row the same accent, since the bar encodes a ratio", () => {
    const rows = patternSummaries(problems, {}, "#abcdef");
    expect(new Set(rows.map((r) => r.color))).toEqual(new Set(["#abcdef"]));
  });

  it("moves one pattern without touching the others", () => {
    const first = problems[0];
    const rows = patternSummaries(problems, { [first.slug]: solved() });
    const row = rows.find((r) => r.id === first.pattern);
    expect(row?.done).toBe(1);
    rows
      .filter((r) => r.id !== first.pattern)
      .forEach((r) => expect(r.done).toBe(0));
  });

  it("skips patterns with nothing in the list", () => {
    const rows = patternSummaries(
      problems.filter((p) => p.pattern === "Two Pointers"),
      {},
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("Two Pointers");
  });
});

describe("difficultyStats", () => {
  it("splits the list three ways and accounts for every problem", () => {
    const rows = difficultyStats(problems, {});
    expect(rows.map((r) => r.difficulty)).toEqual(DIFFICULTY_ORDER);
    expect(rows.reduce((n, r) => n + r.total, 0)).toBe(problems.length);
  });
});

/* ---------------------------------------------------------- the review queue */

describe("reviewInterval", () => {
  it("brings a hinted solve back soonest", () => {
    expect(reviewInterval(solved({ usedHint: true }))).toBe(REVIEW_DAYS.shaky);
  });

  it("brings a many-sitting solve back soon too", () => {
    expect(reviewInterval(solved({ attempts: 3 }))).toBe(REVIEW_DAYS.shaky);
  });

  it("parks a second-sitting solve in the middle", () => {
    expect(reviewInterval(solved({ attempts: 2 }))).toBe(REVIEW_DAYS.ok);
  });

  it("parks a clean first solve longest", () => {
    expect(reviewInterval(solved())).toBe(REVIEW_DAYS.clean);
  });
});

describe("reviewQueue", () => {
  const at = (iso: string): Date => new Date(iso);

  it("leaves a fresh solve alone", () => {
    const progress: ProblemProgressMap = {
      [problems[0].slug]: solved({ solvedAt: "2026-01-01T00:00:00.000Z" }),
    };
    expect(reviewQueue(problems, progress, at("2026-01-10T00:00:00.000Z"))).toEqual(
      [],
    );
  });

  it("surfaces a hinted solve after a week", () => {
    const progress: ProblemProgressMap = {
      [problems[0].slug]: solved({
        usedHint: true,
        solvedAt: "2026-01-01T00:00:00.000Z",
      }),
    };
    const queue = reviewQueue(problems, progress, at("2026-01-08T00:00:00.000Z"));
    expect(queue).toHaveLength(1);
    expect(queue[0].overdueDays).toBe(0);
    expect(queue[0].interval).toBe(REVIEW_DAYS.shaky);
  });

  it("never surfaces something that is only attempted", () => {
    const progress: ProblemProgressMap = {
      [problems[0].slug]: attempted(),
    };
    expect(reviewQueue(problems, progress, at("2027-01-01T00:00:00.000Z"))).toEqual(
      [],
    );
  });

  it("puts the most overdue first", () => {
    const progress: ProblemProgressMap = {
      [problems[0].slug]: solved({
        usedHint: true,
        solvedAt: "2026-01-01T00:00:00.000Z",
      }),
      [problems[1].slug]: solved({
        usedHint: true,
        solvedAt: "2026-02-01T00:00:00.000Z",
      }),
    };
    const queue = reviewQueue(problems, progress, at("2026-03-01T00:00:00.000Z"));
    expect(queue.map((i) => i.problem.slug)).toEqual([
      problems[0].slug,
      problems[1].slug,
    ]);
    expect(queue[0].overdueDays).toBeGreaterThan(queue[1].overdueDays);
  });

  it("breaks a tie on curriculum order", () => {
    const sameDay = "2026-01-01T00:00:00.000Z";
    const progress: ProblemProgressMap = {
      [problems[3].slug]: solved({ usedHint: true, solvedAt: sameDay }),
      [problems[1].slug]: solved({ usedHint: true, solvedAt: sameDay }),
    };
    const queue = reviewQueue(problems, progress, at("2026-03-01T00:00:00.000Z"));
    expect(queue.map((i) => i.problem.slug)).toEqual([
      problems[1].slug,
      problems[3].slug,
    ]);
  });

  it("ignores a solve with a missing or unparseable date", () => {
    const progress: ProblemProgressMap = {
      [problems[0].slug]: solved({ solvedAt: null }),
      [problems[1].slug]: solved({ solvedAt: "not a date" }),
    };
    expect(reviewQueue(problems, progress, at("2030-01-01T00:00:00.000Z"))).toEqual(
      [],
    );
  });
});

describe("recommendedProblems", () => {
  it("offers the first untouched problems when nothing is started", () => {
    expect(recommendedProblems(problems, {}, 3).map((p) => p.slug)).toEqual(
      problems.slice(0, 3).map((p) => p.slug),
    );
  });

  it("puts a half-finished problem ahead of a fresh one", () => {
    const progress: ProblemProgressMap = { [problems[9].slug]: attempted() };
    const picks = recommendedProblems(problems, progress, 3);
    expect(picks[0].slug).toBe(problems[9].slug);
  });

  it("never offers something already solved", () => {
    const progress: ProblemProgressMap = { [problems[0].slug]: solved() };
    const picks = recommendedProblems(problems, progress, 150);
    expect(picks.map((p) => p.slug)).not.toContain(problems[0].slug);
  });
});

/* --------------------------------------------------------------- the filters */

describe("filterProblems", () => {
  it("returns everything by default", () => {
    expect(filterProblems(problems, {}, emptyFilters)).toHaveLength(150);
  });

  it("narrows to the Blind 75 by scope", () => {
    const blind = scopedProblems("blind75");
    expect(blind).toHaveLength(75);
    expect(blind.every((p) => p.blind75)).toBe(true);
  });

  it("filters by pattern and by difficulty together", () => {
    const result = filterProblems(problems, {}, {
      ...emptyFilters,
      patterns: ["Trees"],
      difficulties: ["Easy"],
    });
    expect(result.length).toBeGreaterThan(0);
    result.forEach((p) => {
      expect(p.pattern).toBe("Trees");
      expect(p.difficulty).toBe("Easy");
    });
  });

  it("treats an empty pattern list as no pattern filter", () => {
    expect(
      filterProblems(problems, {}, { ...emptyFilters, patterns: [] }),
    ).toHaveLength(150);
  });

  it("splits the list cleanly by status", () => {
    const progress: ProblemProgressMap = {
      [problems[0].slug]: solved(),
      [problems[1].slug]: attempted(),
    };
    const todo = filterProblems(problems, progress, {
      ...emptyFilters,
      status: "todo",
    });
    expect(todo).toHaveLength(148);
    expect(
      filterProblems(problems, progress, { ...emptyFilters, status: "solved" }),
    ).toHaveLength(1);
    expect(
      filterProblems(problems, progress, {
        ...emptyFilters,
        status: "attempted",
      }),
    ).toHaveLength(1);
  });

  it("matches titles case-insensitively, ignoring surrounding space", () => {
    const result = filterProblems(problems, {}, {
      ...emptyFilters,
      query: "  TWO sum ",
    });
    expect(result.map((p) => p.slug)).toContain("two-sum");
  });

  it("returns nothing for a query that matches no title", () => {
    expect(
      filterProblems(problems, {}, { ...emptyFilters, query: "zzzzz" }),
    ).toHaveLength(0);
  });
});

describe("groupByPattern", () => {
  it("keeps the curriculum order and drops empty groups", () => {
    const groups = groupByPattern(problems.filter((p) => p.difficulty === "Hard"));
    expect(groups.length).toBeGreaterThan(0);
    groups.forEach((g) => expect(g.items.length).toBeGreaterThan(0));
    const order = groups.map((g) => PATTERN_ORDER.indexOf(g.pattern));
    expect([...order]).toEqual([...order].sort((a, b) => a - b));
  });
});

describe("presentation helpers", () => {
  it("has a validated colour for every difficulty", () => {
    DIFFICULTY_ORDER.forEach((d) => {
      expect(DIFFICULTY_COLOR[d]).toMatch(/^#[0-9a-f]{6}$/);
    });
    expect(new Set(Object.values(DIFFICULTY_COLOR)).size).toBe(3);
  });

  it("formats minutes as hours once they pass an hour", () => {
    expect(formatMinutes(0)).toBe("0m");
    expect(formatMinutes(45)).toBe("45m");
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(95)).toBe("1h 35m");
  });
});
