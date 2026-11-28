import type {
  ApplicationProgress,
  ApplicationStage,
  CompanyVerdict,
  CptVerdict,
  CustomResource,
  DayLog,
  DayProgress,
  OpportunityProgress,
  ProblemProgress,
  ProblemStatus,
  ProgressState,
  SkillProgress,
} from "@/lib/types";

/**
 * The parts of the progress document that are not tied to React.
 *
 * These live apart from the Zustand store because the store is a client
 * module, and a "use client" file cannot be called from a route handler - the
 * server simply throws at runtime, which no amount of typechecking catches.
 * The sync endpoint validates what a browser posts with exactly the same
 * parser an imported JSON file goes through, so it has to be importable from
 * both sides.
 */

export const DEFAULT_RECRUITING_DATE = "2027-08-01";
/**
 * Deliberately still the old slug. The app was renamed to CareerCompass, but
 * this key is where every existing user's progress physically lives in their
 * browser. Renaming it would not migrate anything - it would silently hand
 * everyone a blank app and leave their real work orphaned under a key nothing
 * reads. Changing it needs a migration that copies the old key first, and
 * there is no reason to: it is invisible to users.
 */
export const STORAGE_KEY = "amos-career-path:progress:v1";

export const initialState: ProgressState = {
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
    recruitingDate: DEFAULT_RECRUITING_DATE,
    selectedPathId: null,
    internshipsSeenAt: null,
    onboardedAt: null,
  },
};

/* ------------------------------------------------------------- the limits */

/**
 * Caps, not guesses at normal use.
 *
 * Checking the top-level shape was enough while this only read a file the
 * user picked themselves. It is not enough for the sync endpoint, which takes
 * the same document from the network: every one of these values is on its way
 * to a typed Postgres column, and several of those columns are integer, real,
 * boolean or not-null. An attempts of "lots", a day keyed "abc" or a notes of
 * null is not bad data, it is a failed insert and a 500.
 *
 * So each field is coerced to the type its column expects, and each
 * collection is bounded. The caps sit far above any real user - the course is
 * a hundred days, the practice set a hundred and fifty problems - and exist
 * to stop one account turning a free-tier database into a landfill.
 */
const CAPS = {
  skills: 1_000,
  course: 500,
  problems: 1_000,
  companies: 5_000,
  applications: 5_000,
  opportunities: 1_000,
  dayLogs: 5_000,
  customResources: 2_000,
} as const;

/** Notes, pasted solutions and exercise code are genuinely long. */
const LONG_TEXT = 50_000;
/** Urls, ids, dates, complexity jottings. */
const SHORT_TEXT = 2_000;
/** Per-day exercise code is a map; bound its keys too. */
const MAX_EXERCISES_PER_DAY = 100;

/* ------------------------------------------------------------- coercion */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown, max: number = SHORT_TEXT): string =>
  typeof value === "string" ? value.slice(0, max) : "";

const nullableText = (value: unknown, max: number = SHORT_TEXT): string | null =>
  typeof value === "string" ? value.slice(0, max) : null;

/** Only a real boolean is true. "false" and 0 are not. */
const flag = (value: unknown): boolean => value === true;

/** Finite, non-negative, bounded. NaN and Infinity would both fail the insert. */
const decimal = (value: unknown, max: number): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(Math.max(value, 0), max)
    : 0;

const whole = (value: unknown, max: number): number =>
  Math.round(decimal(value, max));

const oneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T => (allowed.includes(value as T) ? (value as T) : fallback);

const optionalOneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined => (allowed.includes(value as T) ? (value as T) : undefined);

const stamp = (value: unknown): string | undefined =>
  typeof value === "string" ? value.slice(0, SHORT_TEXT) : undefined;

const textList = (value: unknown, maxItems: number): string[] =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .slice(0, maxItems)
        .map((item) => item.slice(0, SHORT_TEXT))
    : [];

const textMap = (value: unknown, maxKeys: number): Record<string, string> => {
  if (!isRecord(value)) return {};
  const out: Record<string, string> = {};
  for (const key of Object.keys(value).slice(0, maxKeys)) {
    out[key.slice(0, SHORT_TEXT)] = text(value[key], LONG_TEXT);
  }
  return out;
};

/**
 * Walks one collection, dropping entries that are not objects and refusing
 * the whole document when there are implausibly many. Refusing beats silently
 * truncating: losing the overflow without saying so would look like the app
 * ate someone's work.
 */
const collection = <T>(
  value: unknown,
  cap: number,
  label: string,
  make: (raw: Record<string, unknown>, key: string) => T | null,
): { ok: true; value: Record<string, T> } | { ok: false; error: string } => {
  if (!isRecord(value)) return { ok: true, value: {} };
  const keys = Object.keys(value);
  if (keys.length > cap) {
    return { ok: false, error: `Too many ${label}: ${keys.length} (limit ${cap}).` };
  }
  const out: Record<string, T> = {};
  for (const key of keys) {
    const raw = value[key];
    if (!isRecord(raw)) continue;
    const made = make(raw, key);
    if (made !== null) out[key.slice(0, SHORT_TEXT)] = made;
  }
  return { ok: true, value: out };
};

/* --------------------------------------------------------- the records */

const skill = (raw: Record<string, unknown>): SkillProgress => ({
  status: optionalOneOf(raw.status, ["in_progress", "done"] as const),
  notes: text(raw.notes, LONG_TEXT),
  proofUrl: text(raw.proofUrl),
  hoursLogged: decimal(raw.hoursLogged, 100_000),
  completedAt: nullableText(raw.completedAt),
  resourcesWatched: textList(raw.resourcesWatched, 500),
  updatedAt: stamp(raw.updatedAt),
});

/** The key becomes an integer column, so a key that is not a number is dropped. */
const courseDay = (raw: Record<string, unknown>, key: string): DayProgress | null => {
  const day = Number(key);
  if (!Number.isInteger(day) || day < 0 || day > 100_000) return null;
  return {
    watched: flag(raw.watched),
    projectDone: flag(raw.projectDone),
    exercisesDone: textList(raw.exercisesDone, MAX_EXERCISES_PER_DAY),
    exerciseCode: textMap(raw.exerciseCode, MAX_EXERCISES_PER_DAY),
    notes: text(raw.notes, LONG_TEXT),
    repoUrl: text(raw.repoUrl),
    lectureUrl: text(raw.lectureUrl),
    completedAt: nullableText(raw.completedAt),
    updatedAt: stamp(raw.updatedAt),
  };
};

const problem = (raw: Record<string, unknown>): ProblemProgress => ({
  status: oneOf<ProblemStatus>(raw.status, ["attempted", "solved"], "attempted"),
  attempts: whole(raw.attempts, 100_000),
  minutes: whole(raw.minutes, 1_000_000),
  notes: text(raw.notes, LONG_TEXT),
  timeComplexity: text(raw.timeComplexity),
  spaceComplexity: text(raw.spaceComplexity),
  solution: text(raw.solution, LONG_TEXT),
  usedHint: flag(raw.usedHint),
  solvedAt: nullableText(raw.solvedAt),
  lastAttemptAt: nullableText(raw.lastAttemptAt),
  updatedAt: stamp(raw.updatedAt),
});

const company = (raw: Record<string, unknown>): CompanyVerdict => ({
  cpt: oneOf<CptVerdict>(raw.cpt, ["ok", "no", "unsure"], "unsure"),
  note: text(raw.note, LONG_TEXT),
  updatedAt: text(raw.updatedAt),
});

const application = (raw: Record<string, unknown>): ApplicationProgress => ({
  stage: oneOf<ApplicationStage>(
    raw.stage,
    ["saved", "applied", "interview", "offer", "rejected"],
    "saved",
  ),
  notes: text(raw.notes, LONG_TEXT),
  updatedAt: text(raw.updatedAt),
});

const opportunity = (raw: Record<string, unknown>): OpportunityProgress => ({
  deadline: text(raw.deadline),
  interested: flag(raw.interested),
  applied: flag(raw.applied),
  notes: text(raw.notes, LONG_TEXT),
  updatedAt: text(raw.updatedAt),
});

const dayLog = (raw: Record<string, unknown>, key: string): DayLog => ({
  date: text(raw.date) || key.slice(0, SHORT_TEXT),
  hours: decimal(raw.hours, 24 * 366),
  resources: whole(raw.resources, 100_000),
});

/** An array, not a map, and every column is not-null, so partial rows go. */
const customResource = (raw: unknown): CustomResource | null => {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" || raw.id === "") return null;
  return {
    id: raw.id.slice(0, SHORT_TEXT),
    skillId: text(raw.skillId),
    title: text(raw.title),
    url: text(raw.url),
    addedAt: text(raw.addedAt),
  };
};

/* ------------------------------------------------------------ the parser */

/** Shape check for imported JSON; anything unrecognised is rejected, not merged. */
export const parseProgressState = (
  raw: unknown,
): { ok: true; state: ProgressState } | { ok: false; error: string } => {
  if (!isRecord(raw)) {
    return { ok: false, error: "File is not a JSON object." };
  }
  if (raw.version !== 1) {
    return { ok: false, error: `Unsupported version: ${String(raw.version)}.` };
  }
  if (!isRecord(raw.skills)) {
    return { ok: false, error: "Missing a skills object." };
  }

  const skills = collection(raw.skills, CAPS.skills, "skills", skill);
  if (!skills.ok) return skills;
  // Exports written before the course tracker existed simply have none.
  const course = collection(raw.course, CAPS.course, "course days", courseDay);
  if (!course.ok) return course;
  // Exports written before the practice tracker existed simply have none.
  const problems = collection(raw.problems, CAPS.problems, "problems", problem);
  if (!problems.ok) return problems;
  // Exports written before the internships page existed simply have none.
  const companies = collection(raw.companies, CAPS.companies, "companies", company);
  if (!companies.ok) return companies;
  const applications = collection(
    raw.applications,
    CAPS.applications,
    "applications",
    application,
  );
  if (!applications.ok) return applications;
  const opportunities = collection(
    raw.opportunities,
    CAPS.opportunities,
    "opportunities",
    opportunity,
  );
  if (!opportunities.ok) return opportunities;
  const dayLogs = collection(raw.dayLogs, CAPS.dayLogs, "day logs", dayLog);
  if (!dayLogs.ok) return dayLogs;

  const rawResources = Array.isArray(raw.customResources) ? raw.customResources : [];
  if (rawResources.length > CAPS.customResources) {
    return {
      ok: false,
      error: `Too many custom resources: ${rawResources.length} (limit ${CAPS.customResources}).`,
    };
  }
  const customResources = rawResources
    .map(customResource)
    .filter((item): item is CustomResource => item !== null);

  const settings = isRecord(raw.settings) ? raw.settings : {};

  return {
    ok: true,
    state: {
      version: 1,
      skills: skills.value,
      course: course.value,
      problems: problems.value,
      companies: companies.value,
      applications: applications.value,
      opportunities: opportunities.value,
      customResources,
      dayLogs: dayLogs.value,
      settings: {
        recruitingDate:
          typeof settings.recruitingDate === "string"
            ? settings.recruitingDate.slice(0, SHORT_TEXT)
            : DEFAULT_RECRUITING_DATE,
        selectedPathId: nullableText(settings.selectedPathId),
        internshipsSeenAt: nullableText(settings.internshipsSeenAt),
        onboardedAt: nullableText(settings.onboardedAt),
        // Carried through, not rebuilt: dropping it would make settings lose
        // every merge, because an undefined stamp always loses to a real one.
        updatedAt: stamp(settings.updatedAt),
      },
    },
  };
};
