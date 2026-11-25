import { beforeEach, describe, expect, it } from "vitest";
import { stampChanged } from "@/store/stamp";

class MemoryStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
  removeItem(key: string): void {
    this.data.delete(key);
  }
  clear(): void {
    this.data.clear();
  }
  key(index: number): string | null {
    return [...this.data.keys()][index] ?? null;
  }
  get length(): number {
    return this.data.size;
  }
}
globalThis.localStorage = new MemoryStorage() as unknown as Storage;

const { useProgress } = await import("@/store/progress");

const NOW = "2026-11-25T12:00:00.000Z";

/** The shape the middleware stamps: anything with an optional updatedAt. */
type Rec = { updatedAt?: string } & Record<string, unknown>;
const rec = (fields: Record<string, unknown>): Rec => fields as Rec;

describe("stampChanged", () => {
  it("stamps only the record that changed", () => {
    const a = rec({ notes: "a" });
    const b = rec({ notes: "b" });
    const previous = { skills: { one: a, two: b } };
    const next = { skills: { one: rec({ notes: "edited" }), two: b } };

    const result = stampChanged(previous, next, NOW);
    expect(result.skills.one.updatedAt).toBe(NOW);
    // Untouched records keep their identity, so sync does not resend them.
    expect(result.skills.two).toBe(b);
  });

  it("stamps a newly added record", () => {
    const result = stampChanged(
      { problems: {} as Record<string, Rec> },
      { problems: { "two-sum": rec({ attempts: 1 }) } },
      NOW,
    );
    expect(result.problems["two-sum"]?.updatedAt).toBe(NOW);
  });

  it("leaves a map alone when its reference did not change", () => {
    const skills = { one: rec({ notes: "a" }) };
    const result = stampChanged({ skills }, { skills }, NOW);
    expect(result.skills).toBe(skills);
  });

  it("stamps settings, which is one object rather than a map", () => {
    const result = stampChanged(
      { settings: rec({ recruitingDate: "2027-08-01" }) },
      { settings: rec({ recruitingDate: "2028-01-01" }) },
      NOW,
    );
    expect(result.settings.updatedAt).toBe(NOW);
  });

  it("ignores maps it does not track", () => {
    const result = stampChanged(
      { dayLogs: { a: rec({ hours: 1 }) } },
      { dayLogs: { a: rec({ hours: 2 }) } },
      NOW,
    );
    expect(result.dayLogs.a.updatedAt).toBeUndefined();
  });

  it("does not mutate the state it was given", () => {
    const next = { skills: { one: rec({ notes: "x" }) } };
    stampChanged({ skills: {} as Record<string, Rec> }, next, NOW);
    expect(next.skills.one.updatedAt).toBeUndefined();
  });
});

describe("the store, stamped end to end", () => {
  beforeEach(() => {
    useProgress.getState().resetAll();
  });

  it("stamps a skill without the reducer knowing about it", () => {
    useProgress.getState().setNotes("probability", "hello");
    expect(useProgress.getState().skills.probability.updatedAt).toBeTruthy();
  });

  it("stamps a course day", () => {
    useProgress.getState().setDayWatched(9, true);
    expect(useProgress.getState().course[9].updatedAt).toBeTruthy();
  });

  it("stamps a problem", () => {
    useProgress.getState().setProblemStatus("two-sum", "solved");
    expect(useProgress.getState().problems["two-sum"].updatedAt).toBeTruthy();
  });

  it("stamps a company verdict and an application", () => {
    useProgress.getState().setCompanyVerdict("Stripe", "ok");
    useProgress.getState().setApplicationStage("job-1", "applied");
    expect(useProgress.getState().companies["stripe"].updatedAt).toBeTruthy();
    expect(useProgress.getState().applications["job-1"].updatedAt).toBeTruthy();
  });

  it("moves the stamp forward on a later edit", async () => {
    useProgress.getState().setNotes("probability", "first");
    const first = useProgress.getState().skills.probability.updatedAt;
    await new Promise((resolve) => setTimeout(resolve, 5));
    useProgress.getState().setNotes("probability", "second");
    const second = useProgress.getState().skills.probability.updatedAt;
    expect(second).not.toBe(first);
    expect(String(second) > String(first)).toBe(true);
  });

  it("does not disturb a record an unrelated edit left alone", () => {
    const store = useProgress.getState();
    store.setNotes("probability", "a");
    const before = useProgress.getState().skills.probability;
    store.setNotes("statistics", "b");
    expect(useProgress.getState().skills.probability).toBe(before);
  });
});

describe("adopting a document does not restamp it", () => {
  beforeEach(() => {
    useProgress.getState().resetAll();
  });

  it("keeps the timestamps an imported state arrived with", () => {
    // If importing restamped, the device that just synced would win every
    // later merge and the next sync would rewrite every row.
    const imported = {
      version: 1 as const,
      skills: {
        probability: {
          status: "done" as const,
          notes: "from the server",
          proofUrl: "",
          hoursLogged: 1,
          completedAt: null,
          resourcesWatched: [],
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
      course: {},
      problems: {},
      companies: {},
      applications: {},
      customResources: [],
      dayLogs: {},
      settings: {
        recruitingDate: "2027-08-01",
        selectedPathId: null,
        internshipsSeenAt: null,
        onboardedAt: null,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    };

    expect(useProgress.getState().importState(imported).ok).toBe(true);
    expect(useProgress.getState().skills.probability.updatedAt).toBe(
      "2026-01-01T00:00:00.000Z",
    );
    expect(useProgress.getState().settings.updatedAt).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });

  it("still stamps an edit made after adopting one", () => {
    useProgress.getState().setNotes("probability", "mine now");
    const stamp = useProgress.getState().skills.probability.updatedAt;
    expect(stamp).toBeTruthy();
    expect(stamp).not.toBe("2026-01-01T00:00:00.000Z");
  });

  it("leaves no marker field behind in the state", () => {
    const state = useProgress.getState() as unknown as Record<string, unknown>;
    expect(state.__skipStamp).toBeUndefined();
    expect(useProgress.getState().exportState()).not.toHaveProperty("__skipStamp");
  });
});
