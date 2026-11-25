import { eq } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
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
  const [skills, course, problems, companies, applications, resources, logs, settings] =
    await Promise.all([
      db.select().from(schema.skillProgress).where(eq(schema.skillProgress.userId, userId)),
      db.select().from(schema.courseProgress).where(eq(schema.courseProgress.userId, userId)),
      db.select().from(schema.problemProgress).where(eq(schema.problemProgress.userId, userId)),
      db.select().from(schema.companyVerdicts).where(eq(schema.companyVerdicts.userId, userId)),
      db.select().from(schema.applications).where(eq(schema.applications.userId, userId)),
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
    customResources: [],
    dayLogs: {},
    settings: {
      recruitingDate: settings[0]?.recruitingDate ?? DEFAULT_RECRUITING_DATE,
      selectedPathId: settings[0]?.selectedPathId ?? null,
      internshipsSeenAt: settings[0]?.internshipsSeenAt ?? null,
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

/**
 * Replace this user's rows with the merged state.
 *
 * Delete-then-insert per table rather than a per-row diff: the whole document
 * is already in hand, the row counts are in the hundreds, and it cannot leave
 * a row behind that the merge decided should be gone. It runs inside one
 * transaction so a failure halfway cannot leave a user with half their work.
 */
export const saveProgress = async (
  db: AnyPgDatabase,
  userId: string,
  state: ProgressState,
): Promise<void> => {
  await db.transaction(async (tx) => {
    await Promise.all([
      tx.delete(schema.skillProgress).where(eq(schema.skillProgress.userId, userId)),
      tx.delete(schema.courseProgress).where(eq(schema.courseProgress.userId, userId)),
      tx.delete(schema.problemProgress).where(eq(schema.problemProgress.userId, userId)),
      tx.delete(schema.companyVerdicts).where(eq(schema.companyVerdicts.userId, userId)),
      tx.delete(schema.applications).where(eq(schema.applications.userId, userId)),
      tx.delete(schema.customResources).where(eq(schema.customResources.userId, userId)),
      tx.delete(schema.dayLogs).where(eq(schema.dayLogs.userId, userId)),
    ]);

    const skillRows = Object.entries(state.skills).map(([skillId, entry]) => ({
      userId,
      skillId,
      status: entry.status ?? null,
      notes: entry.notes,
      proofUrl: entry.proofUrl,
      hoursLogged: entry.hoursLogged,
      completedAt: entry.completedAt,
      resourcesWatched: entry.resourcesWatched,
      updatedAt: stampOf(entry.updatedAt),
    }));
    if (skillRows.length > 0) await tx.insert(schema.skillProgress).values(skillRows);

    const courseRows = Object.entries(state.course).map(([day, entry]) => ({
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
    }));
    if (courseRows.length > 0) await tx.insert(schema.courseProgress).values(courseRows);

    const problemRows = Object.entries(state.problems).map(([slug, entry]) => ({
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
    }));
    if (problemRows.length > 0) await tx.insert(schema.problemProgress).values(problemRows);

    const companyRows = Object.entries(state.companies).map(([companyKey, entry]) => ({
      userId,
      companyKey,
      cpt: entry.cpt,
      note: entry.note,
      updatedAt: stampOf(entry.updatedAt),
    }));
    if (companyRows.length > 0) await tx.insert(schema.companyVerdicts).values(companyRows);

    const applicationRows = Object.entries(state.applications).map(
      ([listingId, entry]) => ({
        userId,
        listingId,
        stage: entry.stage,
        notes: entry.notes,
        updatedAt: stampOf(entry.updatedAt),
      }),
    );
    if (applicationRows.length > 0)
      await tx.insert(schema.applications).values(applicationRows);

    const resourceRows = state.customResources.map((entry) => ({
      userId,
      id: entry.id,
      skillId: entry.skillId,
      title: entry.title,
      url: entry.url,
      addedAt: entry.addedAt,
    }));
    if (resourceRows.length > 0)
      await tx.insert(schema.customResources).values(resourceRows);

    const logRows = Object.values(state.dayLogs).map((entry) => ({
      userId,
      date: entry.date,
      hours: entry.hours,
      resources: entry.resources,
    }));
    if (logRows.length > 0) await tx.insert(schema.dayLogs).values(logRows);

    await tx
      .insert(schema.userSettings)
      .values({
        userId,
        recruitingDate: state.settings.recruitingDate,
        selectedPathId: state.settings.selectedPathId,
        internshipsSeenAt: state.settings.internshipsSeenAt,
        updatedAt: stampOf(state.settings.updatedAt),
      })
      .onConflictDoUpdate({
        target: schema.userSettings.userId,
        set: {
          recruitingDate: state.settings.recruitingDate,
          selectedPathId: state.settings.selectedPathId,
          internshipsSeenAt: state.settings.internshipsSeenAt,
          updatedAt: stampOf(state.settings.updatedAt),
        },
      });
  });
};

export const emptyProgress = (): ProgressState => ({
  ...initialState,
  skills: {},
  course: {},
  problems: {},
  companies: {},
  applications: {},
  customResources: [],
  dayLogs: {},
});
