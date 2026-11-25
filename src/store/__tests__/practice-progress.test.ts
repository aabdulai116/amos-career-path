import { beforeEach, describe, expect, it } from "vitest";

/** Same memory shim the other store tests use; persist needs somewhere to write. */
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
const { dayKey } = await import("@/lib/dates");

const SLUG = "two-sum";

describe("problem progress", () => {
  beforeEach(() => {
    useProgress.getState().resetAll();
  });

  it("starts with no problems recorded", () => {
    expect(useProgress.getState().problems).toEqual({});
  });

  it("stamps a solve date and never counts zero sittings", () => {
    useProgress.getState().setProblemStatus(SLUG, "solved");
    const entry = useProgress.getState().problems[SLUG];
    expect(entry.status).toBe("solved");
    expect(entry.solvedAt).not.toBeNull();
    expect(entry.attempts).toBe(1);
  });

  it("keeps the original solve date when a solve is re-marked", () => {
    const { setProblemStatus } = useProgress.getState();
    setProblemStatus(SLUG, "solved");
    const first = useProgress.getState().problems[SLUG].solvedAt;
    setProblemStatus(SLUG, "solved");
    expect(useProgress.getState().problems[SLUG].solvedAt).toBe(first);
  });

  it("clears the solve date when a problem goes back to attempted", () => {
    const { setProblemStatus } = useProgress.getState();
    setProblemStatus(SLUG, "solved");
    setProblemStatus(SLUG, "attempted");
    const entry = useProgress.getState().problems[SLUG];
    expect(entry.status).toBe("attempted");
    expect(entry.solvedAt).toBeNull();
  });

  it("keeps notes and solution across a status change", () => {
    const store = useProgress.getState();
    store.setProblemNotes(SLUG, "hash map of complements");
    store.setProblemSolution(SLUG, "print(1)");
    store.setProblemStatus(SLUG, "solved");
    const entry = useProgress.getState().problems[SLUG];
    expect(entry.notes).toBe("hash map of complements");
    expect(entry.solution).toBe("print(1)");
  });

  it("removes the entry entirely on reset", () => {
    const { setProblemStatus, setProblemNotes } = useProgress.getState();
    setProblemNotes(SLUG, "something");
    setProblemStatus(SLUG, "reset");
    expect(useProgress.getState().problems[SLUG]).toBeUndefined();
  });

  it("writing a note alone does not claim a solve", () => {
    useProgress.getState().setProblemNotes(SLUG, "half an idea");
    expect(useProgress.getState().problems[SLUG].status).toBe("attempted");
    expect(useProgress.getState().problems[SLUG].solvedAt).toBeNull();
  });

  it("adds up sittings and minutes", () => {
    const { logAttempt } = useProgress.getState();
    logAttempt(SLUG, 25);
    logAttempt(SLUG, 15);
    const entry = useProgress.getState().problems[SLUG];
    expect(entry.attempts).toBe(2);
    expect(entry.minutes).toBe(40);
    expect(entry.lastAttemptAt).not.toBeNull();
  });

  it("ignores a sitting of zero or less", () => {
    const { logAttempt } = useProgress.getState();
    logAttempt(SLUG, 0);
    logAttempt(SLUG, -5);
    logAttempt(SLUG, Number.NaN);
    expect(useProgress.getState().problems[SLUG]).toBeUndefined();
  });

  it("credits a logged sitting to today's hours", () => {
    useProgress.getState().logAttempt(SLUG, 30);
    expect(useProgress.getState().dayLogs[dayKey()].hours).toBeCloseTo(0.5, 5);
  });

  it("credits a solve to the streak without inventing hours", () => {
    useProgress.getState().setProblemStatus(SLUG, "solved");
    const log = useProgress.getState().dayLogs[dayKey()];
    expect(log.resources).toBe(1);
    expect(log.hours).toBe(0);
  });

  it("records the hint flag on its own", () => {
    useProgress.getState().setProblemHint(SLUG, true);
    expect(useProgress.getState().problems[SLUG].usedHint).toBe(true);
    useProgress.getState().setProblemHint(SLUG, false);
    expect(useProgress.getState().problems[SLUG].usedHint).toBe(false);
  });

  it("round-trips problems through export and import", () => {
    const store = useProgress.getState();
    store.setProblemStatus(SLUG, "solved");
    store.setProblemSolution(SLUG, "print('hi')");
    const exported = store.exportState();
    expect(exported.problems[SLUG].solution).toBe("print('hi')");

    useProgress.getState().resetAll();
    expect(useProgress.getState().problems).toEqual({});

    const result = useProgress.getState().importState(exported);
    expect(result.ok).toBe(true);
    expect(useProgress.getState().problems[SLUG].solution).toBe("print('hi')");
  });

  it("accepts an export written before the practice tracker existed", () => {
    const old = {
      version: 1,
      skills: {},
      course: {},
      customResources: [],
      dayLogs: {},
      settings: { recruitingDate: "2027-08-01", selectedPathId: null },
    };
    const result = useProgress.getState().importState(old);
    expect(result.ok).toBe(true);
    expect(useProgress.getState().problems).toEqual({});
  });
});
