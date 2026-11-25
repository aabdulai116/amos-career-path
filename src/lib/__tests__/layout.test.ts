import { describe, expect, it } from "vitest";
import { domains } from "@/data/domains";
import { skills } from "@/data/skills";
import {
  LABEL_GUTTER,
  NODE_HEIGHT,
  NODE_WIDTH,
  layoutSkills,
} from "@/lib/layout";
import type { Domain, Skill } from "@/lib/types";

const skill = (
  id: string,
  domain: Skill["domain"],
  prerequisites: string[] = [],
): Skill => ({
  id,
  name: id,
  domain,
  summary: `${id}.`,
  prerequisites,
  estHours: 10,
  level: 1,
});

const twoDomains: Domain[] = [
  { id: "programming", name: "Programming", color: "#111111", icon: "Code2" },
  { id: "quant", name: "Quant", color: "#222222", icon: "TrendingUp" },
];

const overlaps = (
  a: { x: number; y: number },
  b: { x: number; y: number },
): boolean =>
  a.x < b.x + NODE_WIDTH &&
  b.x < a.x + NODE_WIDTH &&
  a.y < b.y + NODE_HEIGHT &&
  b.y < a.y + NODE_HEIGHT;

describe("layoutSkills", () => {
  it("places every skill exactly once", () => {
    const layout = layoutSkills(skills, domains);
    expect(Object.keys(layout.positions)).toHaveLength(skills.length);
  });

  it("puts a skill to the right of its prerequisites", () => {
    const layout = layoutSkills(skills, domains);
    for (const s of skills) {
      for (const p of s.prerequisites) {
        expect(layout.positions[s.id].x).toBeGreaterThan(
          layout.positions[p].x,
        );
      }
    }
  });

  it("never overlaps two nodes", () => {
    const layout = layoutSkills(skills, domains);
    const placed = Object.entries(layout.positions);
    for (let i = 0; i < placed.length; i += 1) {
      for (let j = i + 1; j < placed.length; j += 1) {
        expect(
          overlaps(placed[i][1], placed[j][1]),
          `${placed[i][0]} overlaps ${placed[j][0]}`,
        ).toBe(false);
      }
    }
  });

  it("keeps every skill inside its own domain band", () => {
    const layout = layoutSkills(skills, domains);
    const bandOf = new Map(layout.bands.map((b) => [b.domainId, b]));
    for (const s of skills) {
      const band = bandOf.get(s.domain);
      expect(band).toBeDefined();
      if (!band) continue;
      const { y } = layout.positions[s.id];
      expect(y).toBeGreaterThanOrEqual(band.top);
      expect(y + NODE_HEIGHT).toBeLessThanOrEqual(band.top + band.height);
    }
  });

  it("orders bands the way domains are declared and never overlaps them", () => {
    const layout = layoutSkills(skills, domains);
    expect(layout.bands.map((b) => b.domainId)).toEqual(
      domains.map((d) => d.id),
    );
    for (let i = 1; i < layout.bands.length; i += 1) {
      const previous = layout.bands[i - 1];
      expect(layout.bands[i].top).toBeGreaterThanOrEqual(
        previous.top + previous.height,
      );
    }
  });

  it("leaves a gutter on the left for the domain label", () => {
    const layout = layoutSkills(skills, domains);
    const leftmost = Math.min(
      ...Object.values(layout.positions).map((p) => p.x),
    );
    expect(leftmost).toBe(LABEL_GUTTER);
  });

  it("packs an independent domain onto a single row", () => {
    const layout = layoutSkills(
      [
        skill("a", "programming"),
        skill("b", "programming", ["a"]),
        skill("c", "programming", ["b"]),
      ],
      twoDomains,
    );
    expect(layout.bands).toHaveLength(1);
    expect(layout.bands[0].rows).toBe(1);
  });

  it("uses extra rows when siblings share a column", () => {
    const layout = layoutSkills(
      [
        skill("root", "programming"),
        skill("x", "programming", ["root"]),
        skill("y", "programming", ["root"]),
        skill("z", "programming", ["root"]),
      ],
      twoDomains,
    );
    expect(layout.bands[0].rows).toBe(3);
    expect(layout.positions.x.y).not.toBe(layout.positions.y.y);
  });

  it("skips domains that have no skills", () => {
    const layout = layoutSkills([skill("only", "quant")], twoDomains);
    expect(layout.bands.map((b) => b.domainId)).toEqual(["quant"]);
  });

  it("reports a canvas big enough for every node", () => {
    const layout = layoutSkills(skills, domains);
    for (const position of Object.values(layout.positions)) {
      expect(position.x + NODE_WIDTH).toBeLessThanOrEqual(layout.width);
      expect(position.y + NODE_HEIGHT).toBeLessThanOrEqual(layout.height);
    }
  });

  it("ignores a prerequisite that is not in the given skill list", () => {
    const layout = layoutSkills([skill("a", "quant", ["ghost"])], twoDomains);
    expect(layout.positions.a).toBeDefined();
  });

  it("is deterministic", () => {
    expect(layoutSkills(skills, domains).positions).toEqual(
      layoutSkills(skills, domains).positions,
    );
  });
});
