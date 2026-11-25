import { describe, expect, it } from "vitest";
import { paths } from "@/data/paths";
import {
  QUESTIONS,
  experienceLevel,
  isComplete,
  recommendPaths,
  startingSkills,
  type Answers,
} from "@/lib/onboarding";

const answer = (over: Partial<Answers> = {}): Answers => ({
  pull: "system",
  maths: "fine",
  pressure: "ok",
  output: "service",
  money: "no",
  experience: "some",
  ...over,
});

describe("the questions", () => {
  it("are all answerable and say something", () => {
    expect(QUESTIONS.length).toBeGreaterThanOrEqual(5);
    QUESTIONS.forEach((q) => {
      expect(q.prompt.trim()).not.toBe("");
      expect(q.answers.length).toBeGreaterThanOrEqual(2);
      q.answers.forEach((a) => expect(a.label.trim()).not.toBe(""));
    });
  });

  it("have unique ids throughout", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    QUESTIONS.forEach((q) => {
      const answerIds = q.answers.map((a) => a.id);
      expect(new Set(answerIds).size, q.id).toBe(answerIds.length);
    });
  });

  it("only ever point at paths that exist", () => {
    const known = new Set(paths.map((p) => p.id));
    QUESTIONS.forEach((q) =>
      q.answers.forEach((a) =>
        Object.keys(a.weights).forEach((pathId) =>
          expect(known.has(pathId), `${q.id}/${a.id} -> ${pathId}`).toBe(true),
        ),
      ),
    );
  });

  it("can reach every path from some combination of answers", () => {
    // A path nothing can score is a path the intake can never suggest.
    const reachable = new Set<string>();
    QUESTIONS.forEach((q) =>
      q.answers.forEach((a) =>
        Object.entries(a.weights).forEach(([id, points]) => {
          if ((points ?? 0) > 0) reachable.add(id);
        }),
      ),
    );
    paths.forEach((p) => expect(reachable.has(p.id), p.name).toBe(true));
  });
});

describe("recommendPaths", () => {
  it("returns every path, highest first", () => {
    const results = recommendPaths(answer());
    expect(results).toHaveLength(paths.length);
    const scores = results.map((r) => r.score);
    expect([...scores]).toEqual([...scores].sort((a, b) => b - a));
  });

  it("sends a maths-loving, fast-deciding, finance-curious person to quant", () => {
    const top = recommendPaths(
      answer({ pull: "data", maths: "love", pressure: "thrive", output: "finding", money: "yes" }),
    )[0];
    expect(top.path.id).toMatch(/^quant-/);
  });

  it("sends a build-focused, maths-avoiding person to the front end", () => {
    const top = recommendPaths(
      answer({ pull: "interface", maths: "avoid", pressure: "dislike", output: "product", money: "no" }),
    )[0];
    expect(["frontend", "full-stack"]).toContain(top.path.id);
  });

  it("keeps someone who dislikes finance out of quant", () => {
    const top = recommendPaths(
      answer({ pull: "system", maths: "avoid", pressure: "dislike", output: "service", money: "no" }),
    )[0];
    expect(top.path.id).not.toMatch(/^quant-/);
  });

  it("gives shares that add up to about a hundred", () => {
    const total = recommendPaths(answer()).reduce((n, r) => n + r.share, 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it("handles no answers without blowing up", () => {
    const results = recommendPaths({});
    expect(results).toHaveLength(paths.length);
    expect(results.every((r) => r.score === 0)).toBe(true);
    expect(results.every((r) => r.share === 0)).toBe(true);
  });

  it("ignores an answer id that is not real", () => {
    expect(recommendPaths({ pull: "nonsense" }).every((r) => r.score === 0)).toBe(true);
  });

  it("is deterministic", () => {
    const a = recommendPaths(answer());
    const b = recommendPaths(answer());
    expect(a.map((r) => r.path.id)).toEqual(b.map((r) => r.path.id));
  });
});

describe("isComplete", () => {
  it("needs every question answered", () => {
    expect(isComplete(answer())).toBe(true);
    const partial = answer();
    delete partial.money;
    expect(isComplete(partial)).toBe(false);
    expect(isComplete({})).toBe(false);
  });
});

describe("startingSkills", () => {
  it("offers foundational skills you can actually begin now", () => {
    paths.forEach((path) => {
      const start = startingSkills(path);
      expect(start.length, path.name).toBeGreaterThan(0);
      start.forEach((skill) => expect(skill.level, skill.name).toBe(1));
    });
  });

  it("respects the limit", () => {
    expect(startingSkills(paths[0], 3)).toHaveLength(3);
  });

  it("puts prerequisites before the skills that need them", () => {
    const start = startingSkills(paths[0], 5);
    const seen = new Set<string>();
    start.forEach((skill) => {
      skill.prerequisites.forEach((p) => {
        // Any prerequisite also in this list must have come first.
        const laterIndex = start.findIndex((s) => s.id === p);
        if (laterIndex !== -1) expect(seen.has(p), `${skill.name} needs ${p}`).toBe(true);
      });
      seen.add(skill.id);
    });
  });
});

describe("experienceLevel", () => {
  it("reads the experience answer", () => {
    expect(experienceLevel({ experience: "none" })).toBe("new");
    expect(experienceLevel({ experience: "some" })).toBe("some");
    expect(experienceLevel({ experience: "lots" })).toBe("building");
  });

  it("assumes the gentlest start when unanswered", () => {
    expect(experienceLevel({})).toBe("new");
  });
});
