import { describe, expect, it } from "vitest";
import { initialState, parseProgressState } from "@/lib/progress-state";

/**
 * These are not shape tests for their own sake. Every case below is a value
 * that used to reach a typed Postgres column unexamined: a day keyed "abc"
 * became NaN in an integer column, a notes of null hit a not-null constraint,
 * an attempts of "lots" failed an integer insert. Each one was a 500 from the
 * sync endpoint, so each one gets a test.
 */

const base = (extra: Record<string, unknown> = {}): unknown => ({
  version: 1,
  skills: {},
  ...extra,
});

const ok = (raw: unknown) => {
  const parsed = parseProgressState(raw);
  if (!parsed.ok) throw new Error(`expected ok, got: ${parsed.error}`);
  return parsed.state;
};

describe("parseProgressState rejects what the schema cannot store", () => {
  it("drops a course day whose key is not a number", () => {
    // Number("abc") is NaN, and course_progress.day is an integer column.
    const state = ok(base({ course: { abc: { watched: true }, "7": { watched: true } } }));
    expect(Object.keys(state.course)).toEqual(["7"]);
  });

  it("drops a course day keyed with a decimal", () => {
    const state = ok(base({ course: { "7.5": { watched: true } } }));
    expect(state.course).toEqual({});
  });

  it("coerces a non-numeric attempts to zero", () => {
    const state = ok(base({ problems: { "two-sum": { status: "solved", attempts: "lots" } } }));
    expect(state.problems["two-sum"].attempts).toBe(0);
  });

  it("coerces NaN and Infinity hours to zero", () => {
    const state = ok(
      base({
        skills: { a: { hoursLogged: Number.NaN }, b: { hoursLogged: Number.POSITIVE_INFINITY } },
      }),
    );
    expect(state.skills.a.hoursLogged).toBe(0);
    expect(state.skills.b.hoursLogged).toBe(0);
  });

  it("turns a null notes into an empty string, never null", () => {
    // notes is NOT NULL in every table that has it.
    const state = ok(base({ skills: { a: { notes: null } } }));
    expect(state.skills.a.notes).toBe("");
  });

  it("treats only a real boolean as true", () => {
    const state = ok(base({ course: { "1": { watched: "true", projectDone: 1 } } }));
    expect(state.course["1"].watched).toBe(false);
    expect(state.course["1"].projectDone).toBe(false);
  });

  it("falls back when a status is outside the allowed set", () => {
    const state = ok(
      base({
        skills: { a: { status: "nearly" } },
        problems: { p: { status: "pondered" } },
        companies: { c: { cpt: "maybe" } },
        applications: { l: { stage: "ghosted" } },
      }),
    );
    expect(state.skills.a.status).toBeUndefined();
    expect(state.problems.p.status).toBe("attempted");
    expect(state.companies.c.cpt).toBe("unsure");
    expect(state.applications.l.stage).toBe("saved");
  });

  it("drops a custom resource with no id, since every column is not-null", () => {
    const state = ok(
      base({ customResources: [{ skillId: "s", title: "t" }, { id: "keep", title: "t" }] }),
    );
    expect(state.customResources.map((r) => r.id)).toEqual(["keep"]);
  });

  it("ignores entries that are not objects", () => {
    const state = ok(base({ skills: { a: "not an object", b: { notes: "real" } } }));
    expect(Object.keys(state.skills)).toEqual(["b"]);
  });
});

describe("parseProgressState bounds the payload", () => {
  it("refuses a collection far beyond any real use", () => {
    const skills: Record<string, unknown> = {};
    for (let i = 0; i < 1_001; i++) skills[`s${i}`] = { notes: "" };
    const parsed = parseProgressState(base({ skills }));
    expect(parsed.ok).toBe(false);
    if (!parsed.ok) expect(parsed.error).toContain("Too many skills");
  });

  it("refuses rather than silently truncating, so no work vanishes unannounced", () => {
    const parsed = parseProgressState(
      base({ customResources: Array.from({ length: 2_001 }, (_, i) => ({ id: `r${i}` })) }),
    );
    expect(parsed.ok).toBe(false);
  });

  it("truncates an overlong string instead of rejecting the document", () => {
    const state = ok(base({ skills: { a: { notes: "x".repeat(60_000) } } }));
    expect(state.skills.a.notes).toHaveLength(50_000);
  });

  it("accepts a full-sized real user", () => {
    const course: Record<string, unknown> = {};
    for (let d = 1; d <= 100; d++) course[String(d)] = { watched: true, notes: "y" };
    const state = ok(base({ course }));
    expect(Object.keys(state.course)).toHaveLength(100);
  });
});

describe("parseProgressState still does what it always did", () => {
  it("rejects a non-object and the wrong version", () => {
    expect(parseProgressState(null).ok).toBe(false);
    expect(parseProgressState([]).ok).toBe(false);
    expect(parseProgressState({ version: 2, skills: {} }).ok).toBe(false);
  });

  it("rejects a document with no skills object", () => {
    expect(parseProgressState({ version: 1 }).ok).toBe(false);
  });

  it("defaults the collections an older export predates", () => {
    const state = ok({ version: 1, skills: {} });
    expect(state.course).toEqual({});
    expect(state.problems).toEqual({});
    expect(state.customResources).toEqual([]);
    expect(state.settings.recruitingDate).toBe(initialState.settings.recruitingDate);
  });

  it("carries the settings stamp through, so settings can win a merge", () => {
    const state = ok(base({ settings: { updatedAt: "2026-01-01T00:00:00.000Z" } }));
    expect(state.settings.updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("round-trips a realistic record without altering it", () => {
    const skill = {
      status: "done",
      notes: "finished",
      proofUrl: "https://github.com/a/b",
      hoursLogged: 4.5,
      completedAt: "2026-01-01T00:00:00.000Z",
      resourcesWatched: ["r1", "r2"],
      updatedAt: "2026-01-02T00:00:00.000Z",
    };
    expect(ok(base({ skills: { a: skill } })).skills.a).toEqual(skill);
  });
});
