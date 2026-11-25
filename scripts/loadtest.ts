/**
 * A measurement, not a benchmark: how long one sync takes for a heavy user,
 * and what happens when many of them arrive at once.
 *
 * Run against a throwaway database:
 *   DATABASE_URL=postgresql://... npx tsx scripts/loadtest.ts
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import { loadProgress, saveProgress, emptyProgress } from "../src/server/progress";
import type { AnyPgDatabase } from "../src/server/progress";
import type { ProgressState } from "../src/lib/types";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: url, max: 20 });
const db = drizzle(pool, { schema }) as unknown as AnyPgDatabase;

/** A user who has really used the app: most of the course, all 150 problems. */
const heavyUser = (): ProgressState => {
  const state = emptyProgress();
  for (let i = 0; i < 97; i++) {
    state.skills[`skill-${i}`] = {
      status: "done", notes: "x".repeat(120), proofUrl: "https://github.com/a/b",
      hoursLogged: 4, completedAt: new Date().toISOString(),
      resourcesWatched: ["a", "b", "c"], updatedAt: new Date().toISOString(),
    };
  }
  for (let d = 1; d <= 100; d++) {
    state.course[String(d)] = {
      watched: true, projectDone: true, exercisesDone: [`${d}-1`, `${d}-2`],
      exerciseCode: { [`${d}-1`]: "print('x')\n".repeat(20) },
      notes: "y".repeat(200), repoUrl: "https://github.com/a/b", lectureUrl: "",
      completedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
  }
  for (let i = 0; i < 150; i++) {
    state.problems[`problem-${i}`] = {
      status: "solved", attempts: 2, minutes: 35, notes: "z".repeat(150),
      timeComplexity: "O(n)", spaceComplexity: "O(1)",
      solution: "def solve():\n    pass\n".repeat(15), usedHint: false,
      solvedAt: new Date().toISOString(), lastAttemptAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  for (let i = 0; i < 60; i++) {
    state.applications[`job-${i}`] = {
      stage: "applied", notes: "referred", updatedAt: new Date().toISOString(),
    };
  }
  for (let i = 0; i < 40; i++) {
    state.companies[`company-${i}`] = {
      cpt: "ok", note: "asked", updatedAt: new Date().toISOString(),
    };
  }
  for (let i = 0; i < 365; i++) {
    const date = `2027-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`;
    state.dayLogs[date] = { date, hours: 2, resources: 3 };
  }
  return state;
};

const rows = (s: ProgressState): number =>
  Object.keys(s.skills).length + Object.keys(s.course).length +
  Object.keys(s.problems).length + Object.keys(s.applications).length +
  Object.keys(s.companies).length + Object.keys(s.dayLogs).length;

const ms = async (fn: () => Promise<unknown>): Promise<number> => {
  const t = performance.now();
  await fn();
  return Math.round(performance.now() - t);
};

const main = async (): Promise<void> => {
  const state = heavyUser();
  console.log(`heavy user = ${rows(state)} rows, ${Math.round(JSON.stringify(state).length / 1024)} KB of JSON\n`);

  const users = 50;
  for (let i = 0; i < users; i++) {
    await pool.query(
      `INSERT INTO "user" (id, name, email) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING`,
      [`load-${i}`, `User ${i}`, `load-${i}@example.com`],
    );
  }

  console.log(`one sync, cold:   ${await ms(() => saveProgress(db, "load-0", state))} ms`);
  console.log(`one sync, repeat: ${await ms(() => saveProgress(db, "load-0", state))} ms`);
  console.log(`one load:         ${await ms(() => loadProgress(db, "load-0"))} ms\n`);

  for (const concurrency of [1, 5, 10, 25]) {
    const t = await ms(() =>
      Promise.all(
        Array.from({ length: concurrency }, (_, i) =>
          saveProgress(db, `load-${i}`, state),
        ),
      ),
    );
    console.log(
      `${String(concurrency).padStart(2)} users syncing at once: ${String(t).padStart(5)} ms total, ` +
        `${String(Math.round(t / concurrency)).padStart(4)} ms each`,
    );
  }

  const { rows: counts } = await pool.query<{ n: string }>(
    `SELECT count(*)::text AS n FROM problem_progress`,
  );
  console.log(`\nproblem_progress rows now: ${counts[0].n}`);
  await pool.end();
};

void main();
