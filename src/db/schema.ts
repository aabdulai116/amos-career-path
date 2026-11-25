import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * The database behind accounts and sync.
 *
 * Two halves. The first four tables are Auth.js's own shape, required by
 * @auth/drizzle-adapter - sign-in writes them and nothing here should.
 *
 * The rest mirror the progress document the app has always kept in
 * localStorage, one table per kind of record rather than a single JSON blob.
 * A blob would have been less code and a worse answer: with real columns a
 * user's work can be queried, a bad write touches one row instead of
 * everything, and two devices editing different skills do not collide.
 *
 * Every row belongs to exactly one user and carries updatedAt, which is what
 * the merge in src/lib/sync.ts resolves conflicts with.
 */

/* ------------------------------------------------------------- Auth.js */

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (token) => [primaryKey({ columns: [token.identifier, token.token] })],
);

/* --------------------------------------------------------- the app's own */

/** Deleting a user deletes their work: every table cascades, deliberately. */
const owner = () =>
  text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });

const touched = () =>
  timestamp("updated_at", { mode: "date" }).notNull().defaultNow();

export const skillProgress = pgTable(
  "skill_progress",
  {
    userId: owner(),
    skillId: text("skill_id").notNull(),
    /** Absent means "derive from prerequisites"; see SkillProgress. */
    status: text("status"),
    notes: text("notes").notNull().default(""),
    proofUrl: text("proof_url").notNull().default(""),
    hoursLogged: real("hours_logged").notNull().default(0),
    completedAt: text("completed_at"),
    resourcesWatched: jsonb("resources_watched")
      .$type<string[]>()
      .notNull()
      .default([]),
    updatedAt: touched(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.skillId] })],
);

export const courseProgress = pgTable(
  "course_progress",
  {
    userId: owner(),
    day: integer("day").notNull(),
    watched: boolean("watched").notNull().default(false),
    projectDone: boolean("project_done").notNull().default(false),
    notes: text("notes").notNull().default(""),
    repoUrl: text("repo_url").notNull().default(""),
    lectureUrl: text("lecture_url").notNull().default(""),
    exercisesDone: jsonb("exercises_done")
      .$type<string[]>()
      .notNull()
      .default([]),
    exerciseCode: jsonb("exercise_code")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    completedAt: text("completed_at"),
    updatedAt: touched(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

export const problemProgress = pgTable(
  "problem_progress",
  {
    userId: owner(),
    slug: text("slug").notNull(),
    status: text("status").notNull(),
    attempts: integer("attempts").notNull().default(0),
    minutes: integer("minutes").notNull().default(0),
    notes: text("notes").notNull().default(""),
    timeComplexity: text("time_complexity").notNull().default(""),
    spaceComplexity: text("space_complexity").notNull().default(""),
    solution: text("solution").notNull().default(""),
    usedHint: boolean("used_hint").notNull().default(false),
    solvedAt: text("solved_at"),
    lastAttemptAt: text("last_attempt_at"),
    updatedAt: touched(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.slug] })],
);

export const companyVerdicts = pgTable(
  "company_verdict",
  {
    userId: owner(),
    /** The normalised company name; see normaliseCompany(). */
    companyKey: text("company_key").notNull(),
    cpt: text("cpt").notNull(),
    note: text("note").notNull().default(""),
    updatedAt: touched(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.companyKey] })],
);

export const applications = pgTable(
  "application",
  {
    userId: owner(),
    listingId: text("listing_id").notNull(),
    stage: text("stage").notNull(),
    notes: text("notes").notNull().default(""),
    updatedAt: touched(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.listingId] })],
);

export const customResources = pgTable(
  "custom_resource",
  {
    userId: owner(),
    id: text("id").notNull(),
    skillId: text("skill_id").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    addedAt: text("added_at").notNull(),
    updatedAt: touched(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.id] })],
);

export const dayLogs = pgTable(
  "day_log",
  {
    userId: owner(),
    /** YYYY-MM-DD, local to whoever recorded it. */
    date: text("date").notNull(),
    hours: real("hours").notNull().default(0),
    resources: integer("resources").notNull().default(0),
    updatedAt: touched(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })],
);

export const userSettings = pgTable("user_settings", {
  userId: owner().primaryKey(),
  recruitingDate: text("recruiting_date").notNull(),
  selectedPathId: text("selected_path_id"),
  internshipsSeenAt: text("internships_seen_at"),
  updatedAt: touched(),
});

export type DbUser = typeof users.$inferSelect;
export type DbSkillProgress = typeof skillProgress.$inferSelect;
export type DbCourseProgress = typeof courseProgress.$inferSelect;
export type DbProblemProgress = typeof problemProgress.$inferSelect;
export type DbCompanyVerdict = typeof companyVerdicts.$inferSelect;
export type DbApplication = typeof applications.$inferSelect;
export type DbCustomResource = typeof customResources.$inferSelect;
export type DbDayLog = typeof dayLogs.$inferSelect;
export type DbUserSettings = typeof userSettings.$inferSelect;
