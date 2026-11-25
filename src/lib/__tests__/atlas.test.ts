import { describe, expect, it } from "vitest";
import { buildEdges, computeFocus, matchesQuery, searchSkills } from "@/lib/atlas";
import { skills } from "@/data/skills";
import { paths } from "@/data/paths";
import type { CareerPath, Skill } from "@/lib/types";

const skill = (
  id: string,
  domain: Skill["domain"],
  prerequisites: string[] = [],
  name = id,
  summary = `${id} summary.`,
): Skill => ({
  id,
  name,
  domain,
  summary,
  prerequisites,
  estHours: 10,
  level: 1,
});

const sample: Skill[] = [
  skill("probability", "math", [], "Probability", "Distributions and Bayes."),
  skill("market-making", "quant", ["probability"], "Market Making"),
  skill("react", "frontend", [], "React", "Components and hooks."),
];

const noFilters = { domainIds: [], pathId: null, query: "" };

describe("matchesQuery", () => {
  it("matches on name, case-insensitively", () => {
    expect(matchesQuery(sample[1], "MARKET")).toBe(true);
  });

  it("matches on summary", () => {
    expect(matchesQuery(sample[0], "bayes")).toBe(true);
  });

  it("matches on id with spaces typed instead of hyphens", () => {
    expect(matchesQuery(sample[1], "market making")).toBe(true);
  });

  it("does not match an empty or whitespace query", () => {
    expect(matchesQuery(sample[0], "")).toBe(false);
    expect(matchesQuery(sample[0], "   ")).toBe(false);
  });
});

describe("searchSkills", () => {
  it("ranks a name prefix above a summary hit", () => {
    const results = searchSkills(
      [
        skill("a", "math", [], "Alpha", "mentions react in passing"),
        skill("b", "frontend", [], "React"),
      ],
      "react",
    );
    expect(results[0].name).toBe("React");
  });

  it("returns nothing for an empty query", () => {
    expect(searchSkills(sample, "  ")).toEqual([]);
  });

  it("honours the limit", () => {
    expect(searchSkills(skills, "a", 3)).toHaveLength(3);
  });

  it("finds real skills by partial name", () => {
    expect(searchSkills(skills, "stochastic").map((s) => s.id)).toContain(
      "stochastic-processes",
    );
  });
});

describe("computeFocus", () => {
  it("activates everything when nothing is filtered", () => {
    const focus = computeFocus(sample, noFilters, null);
    expect(focus.activeIds.size).toBe(3);
    expect(focus.filtering).toBe(false);
    expect(focus.pathIds).toBeNull();
  });

  it("narrows to the chosen domains", () => {
    const focus = computeFocus(
      sample,
      { ...noFilters, domainIds: ["quant"] },
      null,
    );
    expect([...focus.activeIds]).toEqual(["market-making"]);
    expect(focus.filtering).toBe(true);
  });

  it("narrows to a path and includes its prerequisites", () => {
    const path: CareerPath = {
      id: "p",
      name: "P",
      tagline: "",
      skillIds: ["market-making"],
    };
    const focus = computeFocus(sample, { ...noFilters, pathId: "p" }, path);
    expect([...focus.activeIds].sort()).toEqual([
      "market-making",
      "probability",
    ]);
    expect(focus.pathIds?.has("probability")).toBe(true);
  });

  it("intersects domain and path rather than unioning them", () => {
    const path: CareerPath = {
      id: "p",
      name: "P",
      tagline: "",
      skillIds: ["market-making"],
    };
    const focus = computeFocus(
      sample,
      { ...noFilters, pathId: "p", domainIds: ["math"] },
      path,
    );
    expect([...focus.activeIds]).toEqual(["probability"]);
  });

  it("records search matches separately from active skills", () => {
    const focus = computeFocus(sample, { ...noFilters, query: "react" }, null);
    expect([...focus.matchIds]).toEqual(["react"]);
    expect([...focus.activeIds]).toEqual(["react"]);
  });

  it("can end up with nothing active", () => {
    const focus = computeFocus(sample, { ...noFilters, query: "zzz" }, null);
    expect(focus.activeIds.size).toBe(0);
    expect(focus.filtering).toBe(true);
  });

  it("keeps every real quant-trader skill active for that path", () => {
    const path = paths.find((p) => p.id === "quant-trader");
    expect(path).toBeDefined();
    if (!path) return;
    const focus = computeFocus(skills, { ...noFilters, pathId: path.id }, path);
    for (const id of path.skillIds) expect(focus.activeIds.has(id)).toBe(true);
    expect(focus.activeIds.size).toBeLessThan(skills.length);
  });
});

describe("buildEdges", () => {
  it("creates one edge per prerequisite, pointing prerequisite to skill", () => {
    const edges = buildEdges(sample);
    expect(edges).toEqual([
      {
        id: "probability->market-making",
        source: "probability",
        target: "market-making",
      },
    ]);
  });

  it("drops edges to skills that do not exist", () => {
    expect(buildEdges([skill("a", "math", ["ghost"])])).toEqual([]);
  });

  it("gives every real edge a unique id", () => {
    const edges = buildEdges(skills);
    expect(new Set(edges.map((e) => e.id)).size).toBe(edges.length);
    expect(edges.length).toBeGreaterThan(skills.length);
  });
});
