import { describe, expect, it } from "vitest";
import {
  buildDependents,
  computeStatuses,
  directUnlocks,
  domainProgress,
  findCycles,
  findDuplicateIds,
  findMissingPrerequisites,
  isUnlocked,
  overallProgress,
  pathProgress,
  pathSkillIds,
  recommendedNext,
  requiredPace,
  topologicalOrder,
  unlockCount,
  validateGraph,
  type ProgressMap,
} from "@/lib/graph";
import type { CareerPath, Skill, SkillProgress } from "@/lib/types";

const skill = (
  id: string,
  prerequisites: string[] = [],
  extra: Partial<Skill> = {},
): Skill => ({
  id,
  name: id,
  domain: "programming",
  summary: `${id} summary`,
  prerequisites,
  estHours: 10,
  level: 1,
  ...extra,
});

const done = (): SkillProgress => ({
  status: "done",
  notes: "",
  proofUrl: "",
  hoursLogged: 0,
  completedAt: "2026-01-01T00:00:00.000Z",
  resourcesWatched: [],
});

const started = (): SkillProgress => ({ ...done(), status: "in_progress", completedAt: null });

/** a -> b -> c, plus d which needs both b and c. */
const chain: Skill[] = [
  skill("a"),
  skill("b", ["a"]),
  skill("c", ["b"]),
  skill("d", ["b", "c"]),
];

describe("computeStatuses", () => {
  it("unlocks only root skills when nothing is done", () => {
    const statuses = computeStatuses(chain, {});
    expect(statuses).toEqual({
      a: "available",
      b: "locked",
      c: "locked",
      d: "locked",
    });
  });

  it("unlocks a skill once every prerequisite is done", () => {
    const progress: ProgressMap = { a: done(), b: done() };
    const statuses = computeStatuses(chain, progress);
    expect(statuses.c).toBe("available");
    // d still needs c.
    expect(statuses.d).toBe("locked");
  });

  it("requires all prerequisites, not just one", () => {
    const statuses = computeStatuses(chain, { a: done(), b: done(), c: done() });
    expect(statuses.d).toBe("available");
  });

  it("reports stored statuses at face value", () => {
    const statuses = computeStatuses(chain, { d: started(), c: done() });
    expect(statuses.d).toBe("in_progress");
    expect(statuses.c).toBe("done");
  });

  it("ignores an entry that records activity but claims no status", () => {
    // Ticking a resource or typing a note creates an entry with no status.
    const touched: SkillProgress = {
      notes: "started reading",
      proofUrl: "",
      hoursLogged: 2,
      completedAt: null,
      resourcesWatched: ["x"],
    };
    const statuses = computeStatuses(chain, { a: touched, c: touched });
    expect(statuses.a).toBe("available");
    expect(statuses.c).toBe("locked");
  });

  it("isUnlocked agrees with the derived status", () => {
    const progress: ProgressMap = { a: done() };
    expect(isUnlocked(chain[1], progress)).toBe(true);
    expect(isUnlocked(chain[2], progress)).toBe(false);
  });
});

describe("findCycles", () => {
  it("finds nothing in an acyclic graph", () => {
    expect(findCycles(chain)).toEqual([]);
  });

  it("finds a direct two-skill cycle", () => {
    const cycles = findCycles([skill("x", ["y"]), skill("y", ["x"])]);
    expect(cycles).toHaveLength(1);
    expect([...cycles[0]].sort()).toEqual(["x", "y"]);
  });

  it("finds a longer cycle and reports it once", () => {
    const cycles = findCycles([
      skill("p", ["r"]),
      skill("q", ["p"]),
      skill("r", ["q"]),
    ]);
    expect(cycles).toHaveLength(1);
    expect([...cycles[0]].sort()).toEqual(["p", "q", "r"]);
  });

  it("finds a self-reference", () => {
    expect(findCycles([skill("s", ["s"])])).toEqual([["s"]]);
  });

  it("finds two independent cycles", () => {
    expect(
      findCycles([
        skill("a1", ["a2"]),
        skill("a2", ["a1"]),
        skill("b1", ["b2"]),
        skill("b2", ["b1"]),
      ]),
    ).toHaveLength(2);
  });
});

describe("validateGraph", () => {
  it("reports missing prerequisite ids", () => {
    const problems = validateGraph([skill("a", ["ghost"])]);
    expect(problems.missingPrerequisites).toEqual([
      { skillId: "a", missing: "ghost" },
    ]);
  });

  it("reports duplicate ids", () => {
    expect(findDuplicateIds([skill("a"), skill("a")])).toEqual(["a"]);
    expect(findMissingPrerequisites(chain)).toEqual([]);
  });
});

describe("pathSkillIds", () => {
  const path: CareerPath = {
    id: "p",
    name: "P",
    tagline: "",
    skillIds: ["d"],
  };

  it("pulls in the whole prerequisite closure", () => {
    expect([...pathSkillIds(path, chain)].sort()).toEqual(["a", "b", "c", "d"]);
  });

  it("returns prerequisites before the skills that need them", () => {
    const order = pathSkillIds(path, chain);
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("b"));
    expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"));
    expect(order.indexOf("c")).toBeLessThan(order.indexOf("d"));
  });

  it("does not repeat a skill reachable by two routes", () => {
    const ids = pathSkillIds(path, chain);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ignores unknown skill ids", () => {
    expect(
      pathSkillIds({ ...path, skillIds: ["d", "nope"] }, chain).sort(),
    ).toEqual(["a", "b", "c", "d"]);
  });
});

describe("progress math", () => {
  const path: CareerPath = { id: "p", name: "P", tagline: "", skillIds: ["c"] };

  it("counts a path as its closure, not just its listed skills", () => {
    const summary = pathProgress(path, chain, { a: done() });
    expect(summary.total).toBe(3); // a, b, c
    expect(summary.done).toBe(1);
    expect(summary.percent).toBe(33.3);
    expect(summary.hoursRemaining).toBe(20);
  });

  it("is 100 percent with every skill done", () => {
    const summary = pathProgress(path, chain, {
      a: done(),
      b: done(),
      c: done(),
    });
    expect(summary.percent).toBe(100);
    expect(summary.hoursRemaining).toBe(0);
  });

  it("is 0 percent for an empty path instead of dividing by zero", () => {
    const summary = pathProgress({ ...path, skillIds: [] }, chain, {});
    expect(summary).toEqual({
      total: 0,
      done: 0,
      percent: 0,
      hoursRemaining: 0,
    });
  });

  it("scopes domain progress to one domain", () => {
    const mixed = [
      skill("x", [], { domain: "quant" }),
      skill("y", [], { domain: "quant" }),
      skill("z", [], { domain: "math" }),
    ];
    expect(domainProgress("quant", mixed, { x: done() })).toMatchObject({
      total: 2,
      done: 1,
      percent: 50,
    });
    expect(domainProgress("math", mixed, { x: done() }).done).toBe(0);
  });

  it("counts every skill for overall progress", () => {
    expect(overallProgress(chain, { a: done(), b: done() })).toMatchObject({
      total: 4,
      done: 2,
      percent: 50,
    });
  });
});

describe("unlockCount", () => {
  it("counts downstream skills transitively", () => {
    expect(unlockCount("a", chain)).toBe(3);
    expect(unlockCount("b", chain)).toBe(2);
    expect(unlockCount("c", chain)).toBe(1);
    expect(unlockCount("d", chain)).toBe(0);
  });

  it("does not double count a skill reachable twice", () => {
    const diamond = [
      skill("top"),
      skill("left", ["top"]),
      skill("right", ["top"]),
      skill("bottom", ["left", "right"]),
    ];
    expect(unlockCount("top", diamond)).toBe(3);
  });

  it("reuses a prebuilt dependents map", () => {
    const dependents = buildDependents(chain);
    expect(unlockCount("a", chain, dependents)).toBe(3);
  });

  it("lists direct unlocks only", () => {
    expect(directUnlocks("b", chain).map((s) => s.id)).toEqual(["c", "d"]);
  });
});

describe("recommendedNext", () => {
  it("orders available skills by how much they unlock", () => {
    const skills = [
      skill("root-wide"),
      skill("dep1", ["root-wide"]),
      skill("dep2", ["dep1"]),
      skill("root-narrow"),
      skill("leaf", ["root-narrow"]),
      skill("root-dead-end"),
    ];
    const ranked = recommendedNext(skills, {}, null);
    expect(ranked.map((r) => r.skill.id)).toEqual([
      "root-wide",
      "root-narrow",
      "root-dead-end",
    ]);
    expect(ranked[0].unlocks).toBe(2);
  });

  it("breaks ties by estimated hours, then name", () => {
    const skills = [
      skill("slow", [], { estHours: 50 }),
      skill("fast", [], { estHours: 5 }),
      skill("also-fast", [], { estHours: 5 }),
    ];
    expect(recommendedNext(skills, {}, null).map((r) => r.skill.id)).toEqual([
      "also-fast",
      "fast",
      "slow",
    ]);
  });

  it("excludes locked and completed skills but keeps started ones", () => {
    // a is done so it drops off; b is started so it stays; c is still locked
    // because an in-progress prerequisite is not a finished one.
    const ranked = recommendedNext(chain, { a: done(), b: started() }, null);
    expect(ranked.map((r) => r.skill.id)).toEqual(["b"]);
  });

  it("restricts to the selected path", () => {
    const skills = [...chain, skill("offpath")];
    const path: CareerPath = {
      id: "p",
      name: "P",
      tagline: "",
      skillIds: ["c"],
    };
    expect(recommendedNext(skills, {}, path).map((r) => r.skill.id)).toEqual([
      "a",
    ]);
  });

  it("honours the limit", () => {
    expect(recommendedNext(chain, {}, null, 0)).toEqual([]);
  });
});

describe("requiredPace", () => {
  const summary = { total: 20, done: 0, percent: 0, hoursRemaining: 200 };

  it("spreads the remaining skills over the weeks left", () => {
    const pace = requiredPace(
      "2027-01-01",
      summary,
      new Date("2026-12-04T12:00:00"),
    );
    expect(pace.daysLeft).toBe(28);
    expect(pace.weeksLeft).toBe(4);
    expect(pace.skillsPerWeek).toBe(5);
    expect(pace.hoursPerWeek).toBe(50);
    expect(pace.overdue).toBe(false);
  });

  it("asks for nothing once the path is finished", () => {
    const pace = requiredPace(
      "2027-01-01",
      { total: 5, done: 5, percent: 100, hoursRemaining: 0 },
      new Date("2026-12-04T12:00:00"),
    );
    expect(pace.skillsPerWeek).toBe(0);
    expect(pace.hoursPerWeek).toBe(0);
  });

  it("flags an overdue target instead of returning a negative pace", () => {
    const pace = requiredPace(
      "2026-01-01",
      summary,
      new Date("2026-12-04T12:00:00"),
    );
    expect(pace.overdue).toBe(true);
    expect(pace.skillsPerWeek).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("topologicalOrder", () => {
  it("lists prerequisites first", () => {
    const order = topologicalOrder(chain);
    expect(order.indexOf("a")).toBeLessThan(order.indexOf("d"));
    expect(order).toHaveLength(4);
  });

  it("terminates on a cyclic graph", () => {
    expect(topologicalOrder([skill("x", ["y"]), skill("y", ["x"])])).toHaveLength(2);
  });
});
