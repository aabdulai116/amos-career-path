import { beforeEach, describe, expect, it } from "vitest";

/**
 * Minimal localStorage so the persist middleware has somewhere to write.
 * The store skips hydration, so nothing is read back unless we ask.
 */
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

const { DEFAULT_RECRUITING_DATE, useProgress } = await import(
  "@/store/progress"
);

describe("the progress store", () => {
  beforeEach(() => {
    useProgress.getState().resetAll();
  });

  it("starts empty with the default recruiting date", () => {
    const state = useProgress.getState();
    expect(state.skills).toEqual({});
    expect(state.settings.recruitingDate).toBe(DEFAULT_RECRUITING_DATE);
  });

  it("records a completion date when a skill is marked done", () => {
    useProgress.getState().setStatus("probability", "done");
    const entry = useProgress.getState().skills.probability;
    expect(entry.status).toBe("done");
    expect(entry.completedAt).not.toBeNull();
  });

  it("clears the completion date on reopen and stamps a new one on finishing", () => {
    const { setStatus } = useProgress.getState();
    setStatus("probability", "done");
    setStatus("probability", "in_progress");
    expect(useProgress.getState().skills.probability.completedAt).toBeNull();
    expect(useProgress.getState().skills.probability.notes).toBe("");
    setStatus("probability", "done");
    expect(
      useProgress.getState().skills.probability.completedAt,
    ).not.toBeNull();
  });

  it("removes the entry entirely on reset", () => {
    const { setStatus, setNotes } = useProgress.getState();
    setNotes("probability", "something");
    setStatus("probability", "reset");
    expect(useProgress.getState().skills.probability).toBeUndefined();
  });

  it("records notes and proof without claiming a status", () => {
    const { setNotes, setProofUrl } = useProgress.getState();
    setNotes("probability", "## heading");
    setProofUrl("probability", "https://example.com");
    const entry = useProgress.getState().skills.probability;
    expect(entry.status).toBeUndefined();
    expect(entry.notes).toBe("## heading");
    expect(entry.proofUrl).toBe("https://example.com");
  });

  it("toggles a resource on and off and logs the day only when adding", () => {
    const { toggleResource } = useProgress.getState();
    toggleResource("probability", "r1");
    expect(useProgress.getState().skills.probability.resourcesWatched).toEqual([
      "r1",
    ]);
    const afterAdd = Object.values(useProgress.getState().dayLogs)[0];
    expect(afterAdd.resources).toBe(1);

    toggleResource("probability", "r1");
    expect(useProgress.getState().skills.probability.resourcesWatched).toEqual(
      [],
    );
    expect(Object.values(useProgress.getState().dayLogs)[0].resources).toBe(1);
  });

  it("accumulates hours and credits the day", () => {
    const { logHours } = useProgress.getState();
    logHours("probability", 1.5);
    logHours("probability", 2);
    expect(useProgress.getState().skills.probability.hoursLogged).toBe(3.5);
    expect(Object.values(useProgress.getState().dayLogs)[0].hours).toBe(3.5);
  });

  it("never drops hours below zero and ignores a zero entry", () => {
    const { logHours } = useProgress.getState();
    logHours("probability", 1);
    logHours("probability", -5);
    expect(useProgress.getState().skills.probability.hoursLogged).toBe(0);
    const before = useProgress.getState().skills;
    logHours("new-skill", 0);
    expect(useProgress.getState().skills).toBe(before);
  });

  it("does not add the same custom link twice", () => {
    const { addCustomResource } = useProgress.getState();
    addCustomResource("probability", "Notes", "https://example.com/a");
    addCustomResource("probability", "Notes again", "https://example.com/a");
    expect(useProgress.getState().customResources).toHaveLength(1);
  });

  it("falls back to the URL when a custom link has no title", () => {
    useProgress.getState().addCustomResource("probability", "  ", "https://x.example");
    expect(useProgress.getState().customResources[0].title).toBe(
      "https://x.example",
    );
  });

  it("round-trips a full export through JSON and back", () => {
    const store = useProgress.getState();
    store.setStatus("probability", "done");
    store.setNotes("probability", "Finished **chapter 7**.");
    store.setProofUrl("probability", "https://github.com/example/notes");
    store.logHours("probability", 12.5);
    store.toggleResource("probability", "r1");
    store.addCustomResource("probability", "My notes", "https://example.com");
    store.setRecruitingDate("2027-09-15");
    store.setSelectedPath("quant-trader");

    const exported = useProgress.getState().exportState();
    const wire: unknown = JSON.parse(JSON.stringify(exported));

    useProgress.getState().resetAll();
    expect(useProgress.getState().skills).toEqual({});

    const result = useProgress.getState().importState(wire);
    expect(result.ok).toBe(true);

    const restored = useProgress.getState();
    expect(restored.skills).toEqual(exported.skills);
    expect(restored.dayLogs).toEqual(exported.dayLogs);
    expect(restored.customResources).toEqual(exported.customResources);
    expect(restored.settings.recruitingDate).toBe("2027-09-15");
    expect(restored.settings.selectedPathId).toBe("quant-trader");
  });

  it("leaves current progress alone when an import is rejected", () => {
    useProgress.getState().setStatus("probability", "done");
    const before = useProgress.getState().skills;
    const result = useProgress.getState().importState({ version: 42 });
    expect(result.ok).toBe(false);
    expect(useProgress.getState().skills).toBe(before);
  });
});
