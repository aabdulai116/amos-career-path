import { describe, expect, it } from "vitest";
import {
  isEmptyProgress,
  mergeCustomResources,
  mergeDayLogs,
  mergeProgress,
  mergeRecords,
  newer,
  progressSize,
} from "@/lib/sync";
import type { ProgressState } from "@/lib/types";

const base = (): ProgressState => ({
  version: 1,
  skills: {},
  course: {},
  problems: {},
  companies: {},
  applications: {},
  opportunities: {},
  customResources: [],
  dayLogs: {},
  settings: {
    recruitingDate: "2027-08-01",
    selectedPathId: null,
    internshipsSeenAt: null,
    onboardedAt: null,
  },
});

/** A tiny stamped record, so the generic infers something with a field. */
type Rec = { v: number; updatedAt?: string };
const rec = (v: number, updatedAt?: string): Rec => ({ v, updatedAt });

describe("newer", () => {
  it("takes the later timestamp", () => {
    expect(newer(rec(1, "2026-01-02"), rec(2, "2026-01-01")).v).toBe(1);
    expect(newer(rec(1, "2026-01-01"), rec(2, "2026-01-02")).v).toBe(2);
  });

  it("prefers a stamped record over an unstamped one", () => {
    expect(newer(rec(1, "2026-01-01"), rec(2)).v).toBe(1);
    expect(newer(rec(1), rec(2, "2026-01-01")).v).toBe(2);
  });

  it("gives ties to the server, so a plain read cannot overwrite", () => {
    expect(newer(rec(1, "2026-01-01"), rec(2, "2026-01-01")).v).toBe(2);
    expect(newer(rec(1), rec(2)).v).toBe(2);
  });
});

describe("mergeRecords", () => {
  it("keeps records only one side has", () => {
    const merged = mergeRecords(
      { a: rec(1, "2026-01-01") },
      { b: rec(2, "2026-01-01") },
    );
    expect(Object.keys(merged).sort()).toEqual(["a", "b"]);
  });

  it("resolves a record both sides have by timestamp", () => {
    const merged = mergeRecords(
      { a: rec(1, "2026-02-01") },
      { a: rec(2, "2026-01-01") },
    );
    expect(merged.a.v).toBe(1);
  });

  it("never drops a record", () => {
    const local = { a: rec(1, "2026-01-01"), b: rec(1, "2026-01-01") };
    const remote = { b: rec(2, "2026-02-01"), c: rec(2, "2026-01-01") };
    expect(Object.keys(mergeRecords(local, remote)).sort()).toEqual(["a", "b", "c"]);
  });

  it("handles either side being empty", () => {
    expect(mergeRecords({}, { a: rec(1, "x") })).toHaveProperty("a");
    expect(mergeRecords({ a: rec(1, "x") }, {})).toHaveProperty("a");
    expect(mergeRecords<Rec>({}, {})).toEqual({});
  });
});

describe("mergeDayLogs", () => {
  it("takes the larger count, because activity cannot un-happen", () => {
    const merged = mergeDayLogs(
      { "2026-11-01": { date: "2026-11-01", hours: 3, resources: 1 } },
      { "2026-11-01": { date: "2026-11-01", hours: 1, resources: 5 } },
    );
    expect(merged["2026-11-01"]).toEqual({
      date: "2026-11-01",
      hours: 3,
      resources: 5,
    });
  });

  it("keeps days only one side knows about", () => {
    const merged = mergeDayLogs(
      { a: { date: "a", hours: 1, resources: 0 } },
      { b: { date: "b", hours: 2, resources: 0 } },
    );
    expect(Object.keys(merged).sort()).toEqual(["a", "b"]);
  });
});

describe("mergeCustomResources", () => {
  it("unions by id and keeps them in the order they were added", () => {
    const merged = mergeCustomResources(
      [{ id: "a", skillId: "s", title: "A", url: "u", addedAt: "2026-02-01" }],
      [{ id: "b", skillId: "s", title: "B", url: "u", addedAt: "2026-01-01" }],
    );
    expect(merged.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("does not duplicate a resource both sides have", () => {
    const entry = { id: "a", skillId: "s", title: "A", url: "u", addedAt: "2026-01-01" };
    expect(mergeCustomResources([entry], [entry])).toHaveLength(1);
  });
});

describe("mergeProgress", () => {
  it("combines work done on two devices without losing either", () => {
    const laptop = base();
    laptop.problems["two-sum"] = {
      status: "solved", attempts: 1, minutes: 20, notes: "", timeComplexity: "O(n)",
      spaceComplexity: "O(n)", solution: "", usedHint: false,
      solvedAt: "2026-11-01T00:00:00.000Z", lastAttemptAt: null,
      updatedAt: "2026-11-01T00:00:00.000Z",
    };
    const phone = base();
    phone.course["9"] = {
      watched: true, projectDone: false, exercisesDone: [], exerciseCode: {},
      notes: "", repoUrl: "", lectureUrl: "", completedAt: null,
      updatedAt: "2026-11-02T00:00:00.000Z",
    };

    const merged = mergeProgress(phone, laptop);
    expect(merged.problems["two-sum"]).toBeDefined();
    expect(merged.course["9"]).toBeDefined();
  });

  it("takes the newer settings", () => {
    const local = base();
    local.settings = { ...local.settings, recruitingDate: "2028-01-01", updatedAt: "2026-12-01" };
    const remote = base();
    remote.settings = { ...remote.settings, recruitingDate: "2027-08-01", updatedAt: "2026-01-01" };
    expect(mergeProgress(local, remote).settings.recruitingDate).toBe("2028-01-01");
  });

  it("is idempotent", () => {
    const state = base();
    state.companies.stripe = { cpt: "ok", note: "", updatedAt: "2026-11-01" };
    const once = mergeProgress(state, state);
    expect(mergeProgress(once, once)).toEqual(once);
  });

  it("is order-independent for records only one side has", () => {
    const a = base();
    a.companies.stripe = { cpt: "ok", note: "", updatedAt: "2026-11-01" };
    const b = base();
    b.companies.anduril = { cpt: "no", note: "", updatedAt: "2026-11-01" };
    expect(Object.keys(mergeProgress(a, b).companies).sort()).toEqual(
      Object.keys(mergeProgress(b, a).companies).sort(),
    );
  });

  it("always reports version 1", () => {
    expect(mergeProgress(base(), base()).version).toBe(1);
  });
});

describe("isEmptyProgress and progressSize", () => {
  it("recognises a state with nothing in it", () => {
    expect(isEmptyProgress(base())).toBe(true);
  });

  it("recognises a state with anything in it", () => {
    const state = base();
    state.companies.stripe = { cpt: "ok", note: "", updatedAt: "x" };
    expect(isEmptyProgress(state)).toBe(false);
  });

  it("counts what would be uploaded", () => {
    const state = base();
    state.companies.stripe = { cpt: "ok", note: "", updatedAt: "x" };
    state.applications.j1 = { stage: "applied", notes: "", updatedAt: "x" };
    const size = progressSize(state);
    expect(size.companies).toBe(1);
    expect(size.applications).toBe(1);
    expect(size.total).toBe(2);
  });
});
