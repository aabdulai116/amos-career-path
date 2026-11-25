import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { schema } from "@/db";
import { mergeProgress } from "@/lib/sync";
import {
  emptyProgress,
  loadProgress,
  saveProgress,
  type AnyPgDatabase,
} from "@/server/progress";
import type { ProgressState } from "@/lib/types";

/**
 * The real schema, the real migration and the real mapping code, against a
 * real Postgres running in this process.
 *
 * PGlite is Postgres compiled to WebAssembly, so these are not mocks: the
 * migration that will run on Neon runs here, foreign keys and cascades
 * behave, and transactions are transactions. It needs no service, which means
 * it runs in CI as cheaply as a unit test.
 */

let db: AnyPgDatabase;
let client: PGlite;

const USER = "user-1";
const OTHER = "user-2";

beforeAll(async () => {
  client = new PGlite();
  db = drizzle(client, { schema }) as unknown as AnyPgDatabase;

  const sql = readFileSync(
    resolve(process.cwd(), "drizzle/0000_initial_schema.sql"),
    "utf8",
  );
  // The generated file separates statements with drizzle's marker.
  for (const statement of sql.split("--> statement-breakpoint")) {
    const trimmed = statement.trim();
    if (trimmed !== "") await client.exec(trimmed);
  }

  await client.exec(
    `INSERT INTO "user" (id, name, email) VALUES
       ('${USER}', 'Amos', 'amos@example.com'),
       ('${OTHER}', 'Someone Else', 'other@example.com')`,
  );
});

beforeEach(async () => {
  for (const table of [
    "skill_progress",
    "course_progress",
    "problem_progress",
    "company_verdict",
    "application",
    "custom_resource",
    "day_log",
    "user_settings",
  ]) {
    await client.exec(`DELETE FROM "${table}"`);
  }
});

const sample = (): ProgressState => ({
  ...emptyProgress(),
  skills: {
    probability: {
      status: "done",
      notes: "Bayes finally clicked",
      proofUrl: "https://github.com/x/y",
      hoursLogged: 12.5,
      completedAt: "2026-11-01T00:00:00.000Z",
      resourcesWatched: ["a", "b"],
      updatedAt: "2026-11-02T00:00:00.000Z",
    },
  },
  course: {
    "9": {
      watched: true,
      projectDone: true,
      exercisesDone: ["9-1", "9-2"],
      exerciseCode: { "9-1": "print(1)" },
      notes: "hash maps",
      repoUrl: "https://github.com/x/day9",
      lectureUrl: "",
      completedAt: "2026-11-03T00:00:00.000Z",
      updatedAt: "2026-11-03T00:00:00.000Z",
    },
  },
  problems: {
    "two-sum": {
      status: "solved",
      attempts: 2,
      minutes: 35,
      notes: "complement map",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      solution: "def two_sum(): pass",
      usedHint: false,
      solvedAt: "2026-11-04T00:00:00.000Z",
      lastAttemptAt: "2026-11-04T00:00:00.000Z",
      updatedAt: "2026-11-04T00:00:00.000Z",
    },
  },
  companies: {
    stripe: { cpt: "ok", note: "asked a recruiter", updatedAt: "2026-11-05T00:00:00.000Z" },
  },
  applications: {
    "job-1": { stage: "applied", notes: "referred", updatedAt: "2026-11-06T00:00:00.000Z" },
  },
  customResources: [
    {
      id: "custom::probability::https://x",
      skillId: "probability",
      title: "A talk",
      url: "https://x",
      addedAt: "2026-10-01T00:00:00.000Z",
    },
  ],
  dayLogs: { "2026-11-04": { date: "2026-11-04", hours: 2.5, resources: 3 } },
  settings: {
    recruitingDate: "2027-08-01",
    selectedPathId: "quant-trader",
    internshipsSeenAt: "2026-11-20T00:00:00.000Z",
    updatedAt: "2026-11-20T00:00:00.000Z",
  },
});

describe("saving and loading progress", () => {
  it("round-trips every kind of record", async () => {
    const state = sample();
    await saveProgress(db, USER, state);
    const loaded = await loadProgress(db, USER);

    expect(loaded.skills.probability).toEqual(state.skills.probability);
    expect(loaded.course["9"]).toEqual(state.course["9"]);
    expect(loaded.problems["two-sum"]).toEqual(state.problems["two-sum"]);
    expect(loaded.companies.stripe).toEqual(state.companies.stripe);
    expect(loaded.applications["job-1"]).toEqual(state.applications["job-1"]);
    expect(loaded.customResources).toEqual(state.customResources);
    expect(loaded.dayLogs["2026-11-04"]).toEqual(state.dayLogs["2026-11-04"]);
    expect(loaded.settings).toEqual(state.settings);
  });

  it("returns an empty state for a user with no rows", async () => {
    const loaded = await loadProgress(db, USER);
    expect(loaded.skills).toEqual({});
    expect(loaded.problems).toEqual({});
    expect(loaded.settings.recruitingDate).toBe("2027-08-01");
  });

  it("keeps one user's work entirely out of another's", async () => {
    await saveProgress(db, USER, sample());
    const other = await loadProgress(db, OTHER);
    expect(other.skills).toEqual({});
    expect(other.problems).toEqual({});
    expect(other.applications).toEqual({});
    expect(other.customResources).toEqual([]);
  });

  it("does not touch another user's rows when saving", async () => {
    await saveProgress(db, OTHER, sample());
    await saveProgress(db, USER, emptyProgress());
    const other = await loadProgress(db, OTHER);
    expect(Object.keys(other.problems)).toEqual(["two-sum"]);
  });

  it("replaces rather than accumulating on a second save", async () => {
    await saveProgress(db, USER, sample());
    const fewer: ProgressState = { ...sample(), problems: {} };
    await saveProgress(db, USER, fewer);
    const loaded = await loadProgress(db, USER);
    expect(loaded.problems).toEqual({});
    expect(loaded.skills.probability).toBeDefined();
  });

  it("saves an entirely empty state without failing", async () => {
    await saveProgress(db, USER, emptyProgress());
    const loaded = await loadProgress(db, USER);
    expect(loaded.skills).toEqual({});
  });

  it("preserves a skill with no explicit status", async () => {
    const state = emptyProgress();
    state.skills.algebra = {
      notes: "just a note",
      proofUrl: "",
      hoursLogged: 0,
      completedAt: null,
      resourcesWatched: [],
      updatedAt: "2026-11-01T00:00:00.000Z",
    };
    await saveProgress(db, USER, state);
    const loaded = await loadProgress(db, USER);
    expect(loaded.skills.algebra.status).toBeUndefined();
    expect(loaded.skills.algebra.notes).toBe("just a note");
  });

  it("deletes everything when the user is deleted, by cascade", async () => {
    await saveProgress(db, USER, sample());
    await client.exec(`DELETE FROM "user" WHERE id = '${USER}'`);
    const rows = await client.query(
      `SELECT count(*)::int AS n FROM problem_progress WHERE user_id = '${USER}'`,
    );
    expect((rows.rows[0] as { n: number }).n).toBe(0);
    await client.exec(
      `INSERT INTO "user" (id, name, email) VALUES ('${USER}', 'Amos', 'amos@example.com')`,
    );
  });
});

describe("a full sync, the way the endpoint does it", () => {
  it("merges a device's work with what is stored and converges", async () => {
    // Laptop solved two-sum; phone has never seen it but did day 9.
    const laptop = sample();
    await saveProgress(db, USER, laptop);

    const phone: ProgressState = {
      ...emptyProgress(),
      course: {
        "10": {
          watched: true,
          projectDone: false,
          exercisesDone: [],
          exerciseCode: {},
          notes: "",
          repoUrl: "",
          lectureUrl: "",
          completedAt: null,
          updatedAt: "2026-11-07T00:00:00.000Z",
        },
      },
    };

    const stored = await loadProgress(db, USER);
    const merged = mergeProgress(phone, stored);
    await saveProgress(db, USER, merged);

    const final = await loadProgress(db, USER);
    expect(Object.keys(final.course).sort()).toEqual(["10", "9"]);
    expect(final.problems["two-sum"]).toBeDefined();
  });

  it("lets a newer edit win and leaves an older one alone", async () => {
    await saveProgress(db, USER, sample());

    const edited = sample();
    edited.skills.probability = {
      ...edited.skills.probability,
      notes: "newer note",
      updatedAt: "2026-12-01T00:00:00.000Z",
    };
    edited.problems["two-sum"] = {
      ...edited.problems["two-sum"],
      notes: "stale note",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const stored = await loadProgress(db, USER);
    await saveProgress(db, USER, mergeProgress(edited, stored));

    const final = await loadProgress(db, USER);
    expect(final.skills.probability.notes).toBe("newer note");
    expect(final.problems["two-sum"].notes).toBe("complement map");
  });

  it("is idempotent: syncing twice changes nothing", async () => {
    await saveProgress(db, USER, sample());
    const once = await loadProgress(db, USER);
    await saveProgress(db, USER, mergeProgress(once, once));
    const twice = await loadProgress(db, USER);
    expect(twice).toEqual(once);
  });
});
