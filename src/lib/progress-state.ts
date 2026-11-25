import type { ProgressState } from "@/lib/types";

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
export const STORAGE_KEY = "amos-career-path:progress:v1";

export const initialState: ProgressState = {
  version: 1,
  skills: {},
  course: {},
  problems: {},
  companies: {},
  applications: {},
  customResources: [],
  dayLogs: {},
  settings: {
    recruitingDate: DEFAULT_RECRUITING_DATE,
    selectedPathId: null,
    internshipsSeenAt: null,
  },
};

/** Shape check for imported JSON; anything unrecognised is rejected, not merged. */
export const parseProgressState = (
  raw: unknown,
): { ok: true; state: ProgressState } | { ok: false; error: string } => {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "File is not a JSON object." };
  }
  const value = raw as Partial<ProgressState>;
  if (value.version !== 1) {
    return { ok: false, error: `Unsupported version: ${String(value.version)}.` };
  }
  if (typeof value.skills !== "object" || value.skills === null) {
    return { ok: false, error: "Missing a skills object." };
  }
  return {
    ok: true,
    state: {
      version: 1,
      skills: value.skills,
      // Exports written before the course tracker existed simply have none.
      course:
        typeof value.course === "object" && value.course !== null
          ? value.course
          : {},
      // Exports written before the practice tracker existed simply have none.
      problems:
        typeof value.problems === "object" && value.problems !== null
          ? value.problems
          : {},
      // Exports written before the internships page existed simply have none.
      companies:
        typeof value.companies === "object" && value.companies !== null
          ? value.companies
          : {},
      applications:
        typeof value.applications === "object" && value.applications !== null
          ? value.applications
          : {},
      customResources: Array.isArray(value.customResources)
        ? value.customResources
        : [],
      dayLogs:
        typeof value.dayLogs === "object" && value.dayLogs !== null
          ? value.dayLogs
          : {},
      settings: {
        recruitingDate:
          typeof value.settings?.recruitingDate === "string"
            ? value.settings.recruitingDate
            : DEFAULT_RECRUITING_DATE,
        selectedPathId:
          typeof value.settings?.selectedPathId === "string"
            ? value.settings.selectedPathId
            : null,
        internshipsSeenAt:
          typeof value.settings?.internshipsSeenAt === "string"
            ? value.settings.internshipsSeenAt
            : null,
      },
    },
  };
};
