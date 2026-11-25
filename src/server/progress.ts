import { and, eq, inArray } from "drizzle-orm";
import type {
  PgColumn,
  PgDatabase,
  PgQueryResultHKT,
  PgTable,
} from "drizzle-orm/pg-core";
import { schema } from "@/db";
import { DEFAULT_RECRUITING_DATE, initialState } from "@/lib/progress-state";
import type { ProgressState } from "@/lib/types";

/**
 * Reading and writing one user's progress.
 *
 * Every query here filters by userId, and every write sets it from the
 * session rather than from anything the client sent. That is the whole of the
 * authorization model and it is deliberately boring: there is no code path
 * that takes a user id from a request body.
 */

/**
 * Any Postgres Drizzle instance. Typed this way rather than against the Neon
 * driver so the tests can run these exact functions against an in-process
 * Postgres - the code under test is the code that ships.
 */
export type AnyPgDatabase = PgDatabase<PgQueryResultHKT, typeof schema>;

const iso = (value: Date | string | null | undefined): string | undefined =>
  value === null || value === undefined
    ? undefined
    : value instanceof Date
      ? value.toISOString()
      : value;

export const loadProgress = async (
  db: AnyPgDatabase,
  userId: string,
): Promise<ProgressState> => {
  const [
    skills,
    course,
    problems,
    companies,
    applications,
    opportunities,
    resources,
    logs,
    settings,
  ] = await Promise.all([
      db.select().from(schema.skillProgress).where(eq(schema.skillProgress.userId, userId)),
      db.select().from(schema.courseProgress).where(eq(schema.courseProgress.userId, userId)),
      db.select().from(schema.problemProgress).where(eq(schema.problemProgress.userId, userId)),
      db.select().from(schema.companyVerdicts).where(eq(schema.companyVerdicts.userId, userId)),
      db.select().from(schema.applications).where(eq(schema.applications.userId, userId)),
      db.select().from(schema.opportunityProgress).where(eq(schema.opportunityProgress.userId, userId)),
      db.select().from(schema.customResources).where(eq(schema.customResources.userId, userId)),
      db.select().from(schema.dayLogs).where(eq(schema.dayLogs.userId, userId)),
      db.select().from(schema.userSettings).where(eq(schema.userSettings.userId, userId)),
    ]);

  const state: ProgressState = {
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
      recruitingDate: settings[0]?.recruitingDate ?? DEFAULT_RECRUITING_DATE,
      selectedPathId: settings[0]?.selectedPathId ?? null,
      internshipsSeenAt: settings[0]?.internshipsSeenAt ?? null,
      onboardedAt: settings[0]?.onboardedAt ?? null,
      updatedAt: iso(settings[0]?.updatedAt),
    },
  };

  skills.forEach((row) => {
    state.skills[row.skillId] = {
      status:
        row.status === "in_progress" || row.status === "done"
          ? row.status
          : undefined,
      notes: row.notes,
      proofUrl: row.proofUrl,
      hoursLogged: row.hoursLogged,
      completedAt: row.completedAt,
      resourcesWatched: row.resourcesWatched,
      updatedAt: iso(row.updatedAt),
    };
  });

  course.forEach((row) => {
    state.course[String(row.day)] = {
      watched: row.watched,
      projectDone: row.projectDone,
      exercisesDone: row.exercisesDone,
      exerciseCode: row.exerciseCode,
      notes: row.notes,
      repoUrl: row.repoUrl,
      lectureUrl: row.lectureUrl,
      completedAt: row.completedAt,
      updatedAt: iso(row.updatedAt),
    };
  });

  problems.forEach((row) => {
    state.problems[row.slug] = {
      status: row.status === "solved" ? "solved" : "attempted",
      attempts: row.attempts,
      minutes: row.minutes,
      notes: row.notes,
      timeComplexity: row.timeComplexity,
      spaceComplexity: row.spaceComplexity,
      solution: row.solution,
      usedHint: row.usedHint,
      solvedAt: row.solvedAt,
      lastAttemptAt: row.lastAttemptAt,
      updatedAt: iso(row.updatedAt),
    };
  });

  companies.forEach((row) => {
    state.companies[row.companyKey] = {
      cpt: row.cpt === "ok" || row.cpt === "no" ? row.cpt : "unsure",
      note: row.note,
      updatedAt: iso(row.updatedAt) ?? "",
    };
  });

  applications.forEach((row) => {
    state.applications[row.listingId] = {
      stage: row.stage as ProgressState["applications"][string]["stage"],
      notes: row.notes,
      updatedAt: iso(row.updatedAt) ?? "",
    };
  });

  opportunities.forEach((row) => {
    state.opportunities[row.opportunityId] = {
      deadline: row.deadline,
      interested: row.interested,
      applied: row.applied,
      notes: row.notes,
      updatedAt: iso(row.updatedAt) ?? "",
    };
  });

  state.customResources = resources.map((row) => ({
    id: row.id,
    skillId: row.skillId,
    title: row.title,
    url: row.url,
    addedAt: row.addedAt,
  }));

  logs.forEach((row) => {
    state.dayLogs[row.date] = {
      date: row.date,
      hours: row.hours,
      resources: row.resources,
    };
  });

  return state;
};

const stampOf = (value: string | undefined): Date =>
  value === undefined ? new Date(0) : new Date(value);

const sameInstant = (a: Date | string, b: Date): boolean =>
  (a instanceof Date ? a.getTime() : new Date(a).getTime()) === b.getTime();

export interface SaveReport {
  written: number;
  removed: number;
  unchanged: number;
}

/**
 * Write only what changed.
 *
 * The first version deleted every row for the user and reinserted the lot.
 * Measured, it was fast - but a heavy user is 531 rows, so a client syncing
 * because one note changed rewrote all 531. At tens of users that is
 * invisible; at hundreds it is the first thing to hurt, and it is pure waste.
 *
 * Each table is now diffed on its timestamp: rows whose stamp already matches
 * are left alone, so an idle sync costs reads and no writes at all. Changed
 * rows are deleted and reinserted by key rather than upserted, which keeps
 * the SQL ordinary and does the same thing inside a transaction.
 *
 * Deletions are computed rather than assumed. The merge never drops a record,
 * so after a sync the state is always a superset of what is stored - but
 * saveProgress is also called directly, and silently keeping a row the caller
 * removed would be a lie.
 */
const syncTable = async <Row extends Record<string, unknown>>(
  tx: AnyPgDatabase,
  options: {
    table: PgTable;
    userColumn: PgColumn;
    keyColumn: PgColumn;
    /**
     * The updated_at column itself, not raw SQL. Selecting it through Drizzle
     * keeps the driver's type mapping, so it comes back as a Date; a raw
     * `table.updated_at` returns a naive string that gets parsed as local
     * time and never matches, which made every row look changed.
     */
    stampColumn: PgColumn;
    /** key -> row to write, with the timestamp the row should carry. */
    wanted: Map<string, { stamp: Date; row: Row }>;
    userId: string;
  },
  report: SaveReport,
): Promise<void> => {
  const { table, userColumn, keyColumn, stampColumn, wanted, userId } = options;

  const existing = await tx
    .select({ key: keyColumn, at: stampColumn })
    .from(table)
    .where(eq(userColumn, userId));

  const current = new Map<string, Date>(
    existing.map((row) => [String(row.key), row.at as Date]),
  );

  const changed: Row[] = [];
  const changedKeys: string[] = [];
  wanted.forEach(({ stamp, row }, key) => {
    const at = current.get(key);
    if (at === undefined || !sameInstant(at, stamp)) {
      changed.push(row);
      changedKeys.push(key);
    }
  });

  const stale: string[] = [];
  current.forEach((_, key) => {
    if (!wanted.has(key)) stale.push(key);
  });

  // Rows being rewritten are cleared first; rows the caller dropped go too.
  const removing = [...changedKeys, ...stale];
  if (removing.length > 0) {
    await tx
      .delete(table)
      .where(and(eq(userColumn, userId), inArray(keyColumn, removing)));
  }
  if (changed.length > 0) {
    await tx.insert(table).values(changed);
  }

  report.written += changed.length;
  report.removed += stale.length;
  report.unchanged += wanted.size - changed.length;
};

export const saveProgress = async (
  db: AnyPgDatabase,
  userId: string,
  state: ProgressState,
): Promise<SaveReport> => {
  const report: SaveReport = { written: 0, removed: 0, unchanged: 0 };

  await db.transaction(async (tx) => {
    const t = tx as unknown as AnyPgDatabase;

    await syncTable(
      t,
      {
        table: schema.skillProgress,
        userColumn: schema.skillProgress.userId,
        keyColumn: schema.skillProgress.skillId,
        stampColumn: schema.skillProgress.updatedAt,
        userId,
        wanted: new Map(
          Object.entries(state.skills).map(([skillId, entry]) => [
            skillId,
            {
              stamp: stampOf(entry.updatedAt),
              row: {
                userId,
                skillId,
                status: entry.status ?? null,
                notes: entry.notes,
                proofUrl: entry.proofUrl,
                hoursLogged: entry.hoursLogged,
                completedAt: entry.completedAt,
                resourcesWatched: entry.resourcesWatched,
                updatedAt: stampOf(entry.updatedAt),
              },
            },
          ]),
        ),
      },
      report,
    );

    await syncTable(
      t,
      {
        table: schema.courseProgress,
        userColumn: schema.courseProgress.userId,
        keyColumn: schema.courseProgress.day,
        stampColumn: schema.courseProgress.updatedAt,
        userId,
        wanted: new Map(
          Object.entries(state.course).map(([day, entry]) => [
            String(Number(day)),
            {
              stamp: stampOf(entry.updatedAt),
              row: {
                userId,
                day: Number(day),
                watched: entry.watched,
                projectDone: entry.projectDone,
                notes: entry.notes,
                repoUrl: entry.repoUrl,
                lectureUrl: entry.lectureUrl,
                exercisesDone: entry.exercisesDone,
                exerciseCode: entry.exerciseCode,
                completedAt: entry.completedAt,
                updatedAt: stampOf(entry.updatedAt),
              },
            },
          ]),
        ),
      },
      report,
    );

    await syncTable(
      t,
      {
        table: schema.problemProgress,
        userColumn: schema.problemProgress.userId,
        keyColumn: schema.problemProgress.slug,
        stampColumn: schema.problemProgress.updatedAt,
        userId,
        wanted: new Map(
          Object.entries(state.problems).map(([slug, entry]) => [
            slug,
            {
              stamp: stampOf(entry.updatedAt),
              row: {
                userId,
                slug,
                status: entry.status,
                attempts: entry.attempts,
                minutes: entry.minutes,
                notes: entry.notes,
                timeComplexity: entry.timeComplexity,
                spaceComplexity: entry.spaceComplexity,
                solution: entry.solution,
                usedHint: entry.usedHint,
                solvedAt: entry.solvedAt,
                lastAttemptAt: entry.lastAttemptAt,
                updatedAt: stampOf(entry.updatedAt),
              },
            },
          ]),
        ),
      },
      report,
    );

    await syncTable(
      t,
      {
        table: schema.companyVerdicts,
        userColumn: schema.companyVerdicts.userId,
        keyColumn: schema.companyVerdicts.companyKey,
        stampColumn: schema.companyVerdicts.updatedAt,
        userId,
        wanted: new Map(
          Object.entries(state.companies).map(([companyKey, entry]) => [
            companyKey,
            {
              stamp: stampOf(entry.updatedAt),
              row: {
                userId,
                companyKey,
                cpt: entry.cpt,
                note: entry.note,
                updatedAt: stampOf(entry.updatedAt),
              },
            },
          ]),
        ),
      },
      report,
    );

    await syncTable(
      t,
      {
        table: schema.applications,
        userColumn: schema.applications.userId,
        keyColumn: schema.applications.listingId,
        stampColumn: schema.applications.updatedAt,
        userId,
        wanted: new Map(
          Object.entries(state.applications).map(([listingId, entry]) => [
            listingId,
            {
              stamp: stampOf(entry.updatedAt),
              row: {
                userId,
                listingId,
                stage: entry.stage,
                notes: entry.notes,
                updatedAt: stampOf(entry.updatedAt),
              },
            },
          ]),
        ),
      },
      report,
    );

    await syncTable(
      t,
      {
        table: schema.opportunityProgress,
        userColumn: schema.opportunityProgress.userId,
        keyColumn: schema.opportunityProgress.opportunityId,
        stampColumn: schema.opportunityProgress.updatedAt,
        userId,
        wanted: new Map(
          Object.entries(state.opportunities).map(([opportunityId, entry]) => [
            opportunityId,
            {
              stamp: stampOf(entry.updatedAt),
              row: {
                userId,
                opportunityId,
                deadline: entry.deadline,
                interested: entry.interested,
                applied: entry.applied,
                notes: entry.notes,
                updatedAt: stampOf(entry.updatedAt),
              },
            },
          ]),
        ),
      },
      report,
    );

    // Custom resources and day logs carry no edit timestamp - one is
    // append-only and the other is a counter - so they are keyed on content
    // and rewritten only when that content differs.
    await syncTable(
      t,
      {
        table: schema.customResources,
        userColumn: schema.customResources.userId,
        keyColumn: schema.customResources.id,
        stampColumn: schema.customResources.updatedAt,
        userId,
        wanted: new Map(
          state.customResources.map((entry) => [
            entry.id,
            {
              stamp: stampOf(entry.addedAt),
              row: {
                userId,
                id: entry.id,
                skillId: entry.skillId,
                title: entry.title,
                url: entry.url,
                addedAt: entry.addedAt,
                updatedAt: stampOf(entry.addedAt),
              },
            },
          ]),
        ),
      },
      report,
    );

    await syncTable(
      t,
      {
        table: schema.dayLogs,
        userColumn: schema.dayLogs.userId,
        keyColumn: schema.dayLogs.date,
        stampColumn: schema.dayLogs.updatedAt,
        userId,
        wanted: new Map(
          Object.values(state.dayLogs).map((entry) => [
            entry.date,
            {
              // A day log has no edit time, so its contents stand in for one:
              // a changed count produces a different stamp and gets written.
              stamp: new Date(
                Date.UTC(2000, 0, 1) +
                  Math.round(entry.hours * 100) * 1000 +
                  entry.resources,
              ),
              row: {
                userId,
                date: entry.date,
                hours: entry.hours,
                resources: entry.resources,
                updatedAt: new Date(
                  Date.UTC(2000, 0, 1) +
                    Math.round(entry.hours * 100) * 1000 +
                    entry.resources,
                ),
              },
            },
          ]),
        ),
      },
      report,
    );

    await tx
      .insert(schema.userSettings)
      .values({
        userId,
        recruitingDate: state.settings.recruitingDate,
        selectedPathId: state.settings.selectedPathId,
        internshipsSeenAt: state.settings.internshipsSeenAt,
        onboardedAt: state.settings.onboardedAt,
        updatedAt: stampOf(state.settings.updatedAt),
      })
      .onConflictDoUpdate({
        target: schema.userSettings.userId,
        set: {
          recruitingDate: state.settings.recruitingDate,
          selectedPathId: state.settings.selectedPathId,
          internshipsSeenAt: state.settings.internshipsSeenAt,
          onboardedAt: state.settings.onboardedAt,
          updatedAt: stampOf(state.settings.updatedAt),
        },
      });
  });

  return report;
};

export const emptyProgress = (): ProgressState => ({
  ...initialState,
  skills: {},
  course: {},
  problems: {},
  companies: {},
  applications: {},
  opportunities: {},
  customResources: [],
  dayLogs: {},
});
