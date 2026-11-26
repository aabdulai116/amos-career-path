/**
 * Checks that DATABASE_URL points at a database with the schema this app
 * expects. Run it after `npm run db:migrate`, or any time sync misbehaves and
 * you want to know whether the database or the app is at fault.
 *
 *   npm run db:verify
 */
import { config } from "dotenv";
import { Pool } from "pg";

config({ path: ".env.local", quiet: true });

const EXPECTED = [
  "account",
  "application",
  "company_verdict",
  "course_progress",
  "custom_resource",
  "day_log",
  "opportunity_progress",
  "problem_progress",
  "session",
  "skill_progress",
  "user",
  "user_settings",
  "verificationToken",
];

const main = async (): Promise<void> => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. See docs/SETUP.md.");
    process.exitCode = 1;
    return;
  }

  // Never print the password, even in an error.
  const host = new URL(url).host;
  console.log(`Connecting to ${host}\n`);

  const pool = new Pool({ connectionString: url });
  try {
    const { rows } = await pool.query<{ tablename: string }>(
      "select tablename from pg_tables where schemaname = 'public' order by 1",
    );
    const found = new Set(rows.map((r) => r.tablename));

    EXPECTED.forEach((table) => {
      console.log(`  ${found.has(table) ? "ok  " : "MISS"} ${table}`);
    });

    const missing = EXPECTED.filter((t) => !found.has(t));
    const extra = [...found].filter((t) => !EXPECTED.includes(t));

    if (extra.length > 0) console.log(`\n  also present: ${extra.join(", ")}`);

    const counts = await Promise.all(
      ["user", "skill_progress", "problem_progress"].map(async (table) => {
        const result = await pool.query<{ n: string }>(
          `select count(*)::text as n from "${table}"`,
        );
        return `${table}=${result.rows[0].n}`;
      }),
    );
    console.log(`\n  rows: ${counts.join("  ")}`);

    if (missing.length > 0) {
      console.error(`\n${missing.length} table(s) missing. Run: npm run db:migrate`);
      process.exitCode = 1;
      return;
    }
    console.log("\nSchema is complete. The database is ready.");
  } finally {
    await pool.end();
  }
};

void main();
