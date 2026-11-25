import { describe, expect, it } from "vitest";
import { opportunities, opportunityById } from "@/data/opportunities";
import {
  KIND_BLURB,
  KIND_LABEL,
  KIND_ORDER,
  byKind,
  daysUntil,
  describeDeadline,
  opportunityStats,
  upcoming,
  type OpportunityMap,
} from "@/lib/opportunities";

const NOW = new Date("2026-11-25T12:00:00Z");
const entry = (deadline: string, over = {}) => ({
  deadline,
  interested: false,
  applied: false,
  notes: "",
  updatedAt: "2026-11-01T00:00:00.000Z",
  ...over,
});

describe("the curated list", () => {
  it("has entries with unique ids", () => {
    expect(opportunities.length).toBeGreaterThan(10);
    const ids = opportunities.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(opportunityById.size).toBe(opportunities.length);
  });

  it("gives every entry an https link, an organisation and a real summary", () => {
    opportunities.forEach((o) => {
      expect(o.url, o.id).toMatch(/^https:\/\//);
      expect(o.organisation.trim(), o.id).not.toBe("");
      expect(o.summary.length, o.id).toBeGreaterThan(40);
      expect(o.openTo.trim(), o.id).not.toBe("");
    });
  });

  it("only uses kinds the page can render", () => {
    opportunities.forEach((o) => expect(KIND_ORDER).toContain(o.kind));
  });

  it("covers all three kinds", () => {
    KIND_ORDER.forEach((kind) =>
      expect(opportunities.some((o) => o.kind === kind), kind).toBe(true),
    );
  });

  it("states no dates, because they move every year", () => {
    // A wrong deadline is worse than no deadline. The user records the real
    // one; nothing here may claim to know it.
    opportunities.forEach((o) => {
      const text = `${o.summary} ${o.openTo}`;
      expect(text, o.id).not.toMatch(/\b20\d{2}\b/);
      expect(text, o.id).not.toMatch(
        /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/,
      );
    });
  });

  it("has a label and a blurb for every kind", () => {
    KIND_ORDER.forEach((kind) => {
      expect(KIND_LABEL[kind]).toBeTruthy();
      expect(KIND_BLURB[kind].length).toBeGreaterThan(30);
    });
  });
});

describe("daysUntil", () => {
  it("counts forward to a future date", () => {
    expect(daysUntil("2026-12-05", NOW)).toBe(10);
  });

  it("is zero on the day itself", () => {
    expect(daysUntil("2026-11-25", NOW)).toBe(0);
  });

  it("goes negative once it has passed", () => {
    expect(daysUntil("2026-11-20", NOW)).toBe(-5);
  });

  it("returns null for anything that is not a date", () => {
    expect(daysUntil("", NOW)).toBeNull();
    expect(daysUntil("soon", NOW)).toBeNull();
    expect(daysUntil("25/11/2026", NOW)).toBeNull();
  });
});

describe("describeDeadline", () => {
  it("reads naturally at each distance", () => {
    expect(describeDeadline("2026-11-25", NOW)).toBe("closes today");
    expect(describeDeadline("2026-11-26", NOW)).toBe("1 day left");
    expect(describeDeadline("2026-12-05", NOW)).toBe("10 days left");
    expect(describeDeadline("2026-11-20", NOW)).toBe("closed 5d ago");
  });

  it("says nothing when no date is recorded", () => {
    expect(describeDeadline("", NOW)).toBeNull();
  });
});

describe("upcoming", () => {
  const a = opportunities[0];
  const b = opportunities[1];

  it("is empty when nothing has a date", () => {
    expect(upcoming({}, NOW)).toEqual([]);
  });

  it("sorts soonest first", () => {
    const progress: OpportunityMap = {
      [a.id]: entry("2026-12-20"),
      [b.id]: entry("2026-12-01"),
    };
    expect(upcoming(progress, NOW).map((x) => x.opportunity.id)).toEqual([
      b.id,
      a.id,
    ]);
  });

  it("drops deadlines that have passed", () => {
    const progress: OpportunityMap = { [a.id]: entry("2026-01-01") };
    expect(upcoming(progress, NOW)).toEqual([]);
  });

  it("keeps one closing today", () => {
    const progress: OpportunityMap = { [a.id]: entry("2026-11-25") };
    expect(upcoming(progress, NOW)).toHaveLength(1);
  });
});

describe("opportunityStats", () => {
  const a = opportunities[0];

  it("counts nothing for an untouched user", () => {
    const stats = opportunityStats({}, NOW);
    expect(stats.total).toBe(opportunities.length);
    expect(stats.interested).toBe(0);
    expect(stats.applied).toBe(0);
    expect(stats.nextDays).toBeNull();
  });

  it("counts interest, applications and dates separately", () => {
    const progress: OpportunityMap = {
      [a.id]: entry("2026-12-05", { interested: true, applied: true }),
    };
    const stats = opportunityStats(progress, NOW);
    expect(stats.interested).toBe(1);
    expect(stats.applied).toBe(1);
    expect(stats.withDeadline).toBe(1);
    expect(stats.nextDays).toBe(10);
  });
});

describe("byKind", () => {
  it("groups in the declared order and drops empty groups", () => {
    const groups = byKind();
    expect(groups.map((g) => g.kind)).toEqual(
      KIND_ORDER.filter((k) => opportunities.some((o) => o.kind === k)),
    );
    expect(groups.reduce((n, g) => n + g.items.length, 0)).toBe(
      opportunities.length,
    );
  });
});
