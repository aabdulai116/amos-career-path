import { describe, expect, it } from "vitest";
import { domains } from "@/data/domains";
import { paths } from "@/data/paths";
import { resourceId, resources } from "@/data/resources";
import { skills } from "@/data/skills";
import { isGraphValid, pathSkillIds, validateGraph } from "@/lib/graph";

const skillIds = new Set(skills.map((s) => s.id));
const domainIds = new Set(domains.map((d) => d.id));

describe("the real skill graph", () => {
  const problems = validateGraph(skills);

  it("has no prerequisite cycles", () => {
    expect(problems.cycles).toEqual([]);
  });

  it("has no duplicate skill ids", () => {
    expect(problems.duplicateIds).toEqual([]);
  });

  it("has no prerequisite pointing at a skill that does not exist", () => {
    expect(problems.missingPrerequisites).toEqual([]);
  });

  it("is valid overall", () => {
    expect(isGraphValid(problems)).toBe(true);
  });
});

describe("skill content", () => {
  it("puts every skill in a declared domain", () => {
    const strays = skills.filter((s) => !domainIds.has(s.domain));
    expect(strays.map((s) => s.id)).toEqual([]);
  });

  it("gives every skill a one-sentence summary", () => {
    const bad = skills.filter(
      (s) => s.summary.trim().length < 20 || !s.summary.trim().endsWith("."),
    );
    expect(bad.map((s) => s.id)).toEqual([]);
  });

  it("gives every skill a positive hours estimate and a level of 1 to 3", () => {
    const bad = skills.filter(
      (s) => s.estHours <= 0 || ![1, 2, 3].includes(s.level),
    );
    expect(bad.map((s) => s.id)).toEqual([]);
  });

  it("uses kebab-case ids", () => {
    const bad = skills.filter((s) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id));
    expect(bad.map((s) => s.id)).toEqual([]);
  });

  it("leaves at least one skill with no prerequisites to start from", () => {
    expect(skills.some((s) => s.prerequisites.length === 0)).toBe(true);
  });

  it("covers every domain with at least one skill", () => {
    const covered = new Set(skills.map((s) => s.domain));
    expect([...domainIds].filter((d) => !covered.has(d))).toEqual([]);
  });

  it("has no skill listing the same prerequisite twice", () => {
    const bad = skills.filter(
      (s) => new Set(s.prerequisites).size !== s.prerequisites.length,
    );
    expect(bad.map((s) => s.id)).toEqual([]);
  });
});

describe("career paths", () => {
  it("only lists skills that exist", () => {
    const bad = paths.flatMap((p) =>
      p.skillIds.filter((id) => !skillIds.has(id)).map((id) => `${p.id}:${id}`),
    );
    expect(bad).toEqual([]);
  });

  it("has unique path ids", () => {
    expect(new Set(paths.map((p) => p.id)).size).toBe(paths.length);
  });

  it("expands each path to a closure that is a superset of its core skills", () => {
    for (const path of paths) {
      const closure = new Set(pathSkillIds(path, skills));
      for (const id of path.skillIds) expect(closure.has(id)).toBe(true);
      expect(closure.size).toBeGreaterThanOrEqual(path.skillIds.length);
    }
  });

  it("includes the three quant tracks", () => {
    const ids = paths.map((p) => p.id);
    expect(ids).toContain("quant-trader");
    expect(ids).toContain("quant-researcher");
    expect(ids).toContain("quant-developer");
  });
});

describe("resources", () => {
  it("only attaches to skills that exist", () => {
    const bad = resources.filter((r) => !skillIds.has(r.skillId));
    expect(bad.map((r) => `${r.skillId}:${r.title}`)).toEqual([]);
  });

  it("uses absolute https URLs", () => {
    const bad = resources.filter((r) => !r.url.startsWith("https://"));
    expect(bad.map((r) => r.url)).toEqual([]);
  });

  it("gives every resource a stable, unique id within its skill", () => {
    const ids = resources.map(resourceId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no blank titles or creators", () => {
    const bad = resources.filter(
      (r) => r.title.trim() === "" || r.creator.trim() === "",
    );
    expect(bad).toEqual([]);
  });
});

describe("domains", () => {
  it("has unique ids and hex colours", () => {
    expect(new Set(domains.map((d) => d.id)).size).toBe(domains.length);
    const bad = domains.filter((d) => !/^#[0-9a-f]{6}$/i.test(d.color));
    expect(bad.map((d) => d.id)).toEqual([]);
  });

  it("includes the new Math and Quant domains", () => {
    const ids = domains.map((d) => d.id);
    expect(ids).toContain("math");
    expect(ids).toContain("quant");
  });
});
