"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { stamp } from "@/store/stamp";
import { dayKey } from "@/lib/dates";
import { normaliseCompany } from "@/lib/internships";
import type {
  ApplicationProgress,
  ApplicationStage,
  CompanyVerdict,
  CptVerdict,
  CustomResource,
  DayProgress,
  ProblemProgress,
  ProblemStatus,
  ProgressState,
  SkillProgress,
} from "@/lib/types";

export const DEFAULT_RECRUITING_DATE = "2027-08-01";
export const STORAGE_KEY = "amos-career-path:progress:v1";

const emptySkill = (): SkillProgress => ({
  notes: "",
  proofUrl: "",
  hoursLogged: 0,
  completedAt: null,
  resourcesWatched: [],
});

const emptyProblem = (): ProblemProgress => ({
  status: "attempted",
  attempts: 0,
  minutes: 0,
  notes: "",
  timeComplexity: "",
  spaceComplexity: "",
  solution: "",
  usedHint: false,
  solvedAt: null,
  lastAttemptAt: null,
});

const emptyDay = (): DayProgress => ({
  watched: false,
  projectDone: false,
  exercisesDone: [],
  exerciseCode: {},
  notes: "",
  repoUrl: "",
  lectureUrl: "",
  completedAt: null,
});

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

interface Actions {
  /** False until the persisted state has been read back from localStorage. */
  hasHydrated: boolean;
  setHydrated: () => void;
  /** Mark a skill started, done, or back to untouched. */
  setStatus: (skillId: string, status: "in_progress" | "done" | "reset") => void;
  setNotes: (skillId: string, notes: string) => void;
  setProofUrl: (skillId: string, proofUrl: string) => void;
  toggleResource: (skillId: string, resourceId: string) => void;
  logHours: (skillId: string, hours: number) => void;
  addCustomResource: (skillId: string, title: string, url: string) => void;
  removeCustomResource: (id: string) => void;
  /** 100 Days of Code: mark a day's lectures watched, or its project built. */
  setDayWatched: (day: number, watched: boolean) => void;
  setDayProjectDone: (day: number, done: boolean) => void;
  setDayNotes: (day: number, notes: string) => void;
  setDayRepoUrl: (day: number, url: string) => void;
  setDayLectureUrl: (day: number, url: string) => void;
  /** Tick one of a day's practice exercises off, or back on. */
  toggleExercise: (day: number, exerciseId: string) => void;
  setExerciseCode: (day: number, exerciseId: string, code: string) => void;
  /** NeetCode 150: record a sitting, a solve, or clear the problem. */
  setProblemStatus: (slug: string, status: ProblemStatus | "reset") => void;
  logAttempt: (slug: string, minutes: number) => void;
  setProblemNotes: (slug: string, notes: string) => void;
  setProblemSolution: (slug: string, solution: string) => void;
  /** Big-O, written in my own words; "time" or "space". */
  setProblemComplexity: (
    slug: string,
    kind: "time" | "space",
    value: string,
  ) => void;
  setProblemHint: (slug: string, usedHint: boolean) => void;
  /** My own finding about an employer; inherited by its future postings. */
  setCompanyVerdict: (company: string, cpt: CptVerdict, note?: string) => void;
  clearCompanyVerdict: (company: string) => void;
  setApplicationStage: (
    listingId: string,
    stage: ApplicationStage | "reset",
  ) => void;
  setApplicationNotes: (listingId: string, notes: string) => void;
  /** Stamp the internships page as seen, for the "new since" count. */
  markInternshipsSeen: () => void;
  setRecruitingDate: (iso: string) => void;
  setSelectedPath: (pathId: string | null) => void;
  importState: (raw: unknown) => { ok: true } | { ok: false; error: string };
  exportState: () => ProgressState;
  resetAll: () => void;
}

export type ProgressStore = ProgressState & Actions;

/** Credit today in the activity log; a day counts if hours or a resource landed. */
const touchDay = (
  dayLogs: ProgressState["dayLogs"],
  hours: number,
  resources: number,
): ProgressState["dayLogs"] => {
  const key = dayKey();
  const existing = dayLogs[key] ?? { date: key, hours: 0, resources: 0 };
  return {
    ...dayLogs,
    [key]: {
      date: key,
      hours: Math.round((existing.hours + hours) * 100) / 100,
      resources: existing.resources + resources,
    },
  };
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

export const useProgress = create<ProgressStore>()(
  persist(
    stamp((set, get) => ({
      ...initialState,
      hasHydrated: false,
      setHydrated: () => set({ hasHydrated: true }),

      setStatus: (skillId, status) =>
        set((state) => {
          if (status === "reset") {
            const next = { ...state.skills };
            delete next[skillId];
            return { skills: next };
          }
          const existing = state.skills[skillId] ?? emptySkill();
          return {
            skills: {
              ...state.skills,
              [skillId]: {
                ...existing,
                status,
                completedAt:
                  status === "done"
                    ? (existing.completedAt ?? new Date().toISOString())
                    : null,
              },
            },
          };
        }),

      setNotes: (skillId, notes) =>
        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: { ...(state.skills[skillId] ?? emptySkill()), notes },
          },
        })),

      setProofUrl: (skillId, proofUrl) =>
        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: { ...(state.skills[skillId] ?? emptySkill()), proofUrl },
          },
        })),

      toggleResource: (skillId, resourceId) =>
        set((state) => {
          const existing = state.skills[skillId] ?? emptySkill();
          const watched = existing.resourcesWatched.includes(resourceId);
          const resourcesWatched = watched
            ? existing.resourcesWatched.filter((id) => id !== resourceId)
            : [...existing.resourcesWatched, resourceId];
          return {
            skills: {
              ...state.skills,
              [skillId]: { ...existing, resourcesWatched },
            },
            dayLogs: watched
              ? state.dayLogs
              : touchDay(state.dayLogs, 0, 1),
          };
        }),

      logHours: (skillId, hours) =>
        set((state) => {
          if (!Number.isFinite(hours) || hours === 0) return state;
          const existing = state.skills[skillId] ?? emptySkill();
          const total = Math.max(
            0,
            Math.round((existing.hoursLogged + hours) * 100) / 100,
          );
          return {
            skills: {
              ...state.skills,
              [skillId]: { ...existing, hoursLogged: total },
            },
            dayLogs:
              hours > 0 ? touchDay(state.dayLogs, hours, 0) : state.dayLogs,
          };
        }),

      addCustomResource: (skillId, title, url) =>
        set((state) => {
          const entry: CustomResource = {
            id: `custom::${skillId}::${url}`,
            skillId,
            title: title.trim() || url,
            url: url.trim(),
            addedAt: new Date().toISOString(),
          };
          if (state.customResources.some((r) => r.id === entry.id)) return state;
          return { customResources: [...state.customResources, entry] };
        }),

      removeCustomResource: (id) =>
        set((state) => ({
          customResources: state.customResources.filter((r) => r.id !== id),
        })),

      setDayWatched: (day, watched) =>
        set((state) => {
          const existing = state.course[day] ?? emptyDay();
          return {
            course: {
              ...state.course,
              [day]: {
                ...existing,
                watched,
                completedAt: watched ? new Date().toISOString() : null,
              },
            },
            // Finishing a day counts as activity for the streak. Time is not
            // logged automatically - watch speed is nobody's guess but mine.
            dayLogs: watched ? touchDay(state.dayLogs, 0, 1) : state.dayLogs,
          };
        }),

      setDayProjectDone: (day, done) =>
        set((state) => ({
          course: {
            ...state.course,
            [day]: { ...(state.course[day] ?? emptyDay()), projectDone: done },
          },
          dayLogs: done ? touchDay(state.dayLogs, 0, 1) : state.dayLogs,
        })),

      setDayNotes: (day, notes) =>
        set((state) => ({
          course: {
            ...state.course,
            [day]: { ...(state.course[day] ?? emptyDay()), notes },
          },
        })),

      setDayRepoUrl: (day, repoUrl) =>
        set((state) => ({
          course: {
            ...state.course,
            [day]: { ...(state.course[day] ?? emptyDay()), repoUrl },
          },
        })),

      setDayLectureUrl: (day, lectureUrl) =>
        set((state) => ({
          course: {
            ...state.course,
            [day]: { ...(state.course[day] ?? emptyDay()), lectureUrl },
          },
        })),

      setProblemStatus: (slug, status) =>
        set((state) => {
          if (status === "reset") {
            const next = { ...state.problems };
            delete next[slug];
            return { problems: next };
          }
          const existing = state.problems[slug] ?? emptyProblem();
          const now = new Date().toISOString();
          const solving = status === "solved";
          return {
            problems: {
              ...state.problems,
              [slug]: {
                ...existing,
                status,
                // Opening a problem for the first time counts as one sitting,
                // so a solve never lands on zero attempts.
                attempts: Math.max(existing.attempts, 1),
                solvedAt: solving ? (existing.solvedAt ?? now) : null,
                lastAttemptAt: now,
              },
            },
            // A solve is activity for the streak; time is logged separately,
            // because only I know how long I actually sat with it.
            dayLogs: solving ? touchDay(state.dayLogs, 0, 1) : state.dayLogs,
          };
        }),

      logAttempt: (slug, minutes) =>
        set((state) => {
          if (!Number.isFinite(minutes) || minutes <= 0) return state;
          const existing = state.problems[slug] ?? emptyProblem();
          return {
            problems: {
              ...state.problems,
              [slug]: {
                ...existing,
                attempts: existing.attempts + 1,
                minutes: existing.minutes + Math.round(minutes),
                lastAttemptAt: new Date().toISOString(),
              },
            },
            dayLogs: touchDay(state.dayLogs, minutes / 60, 0),
          };
        }),

      setProblemNotes: (slug, notes) =>
        set((state) => ({
          problems: {
            ...state.problems,
            [slug]: { ...(state.problems[slug] ?? emptyProblem()), notes },
          },
        })),

      setProblemSolution: (slug, solution) =>
        set((state) => ({
          problems: {
            ...state.problems,
            [slug]: { ...(state.problems[slug] ?? emptyProblem()), solution },
          },
        })),

      setProblemComplexity: (slug, kind, value) =>
        set((state) => {
          const existing = state.problems[slug] ?? emptyProblem();
          return {
            problems: {
              ...state.problems,
              [slug]: {
                ...existing,
                ...(kind === "time"
                  ? { timeComplexity: value }
                  : { spaceComplexity: value }),
              },
            },
          };
        }),

      setProblemHint: (slug, usedHint) =>
        set((state) => ({
          problems: {
            ...state.problems,
            [slug]: { ...(state.problems[slug] ?? emptyProblem()), usedHint },
          },
        })),

      toggleExercise: (day, exerciseId) =>
        set((state) => {
          const existing = state.course[day] ?? emptyDay();
          const done = existing.exercisesDone.includes(exerciseId);
          return {
            course: {
              ...state.course,
              [day]: {
                ...existing,
                exercisesDone: done
                  ? existing.exercisesDone.filter((id) => id !== exerciseId)
                  : [...existing.exercisesDone, exerciseId],
              },
            },
            dayLogs: done ? state.dayLogs : touchDay(state.dayLogs, 0, 1),
          };
        }),

      setExerciseCode: (day, exerciseId, code) =>
        set((state) => {
          const existing = state.course[day] ?? emptyDay();
          return {
            course: {
              ...state.course,
              [day]: {
                ...existing,
                exerciseCode: { ...existing.exerciseCode, [exerciseId]: code },
              },
            },
          };
        }),

      setCompanyVerdict: (company, cpt, note) =>
        set((state) => {
          const key = normaliseCompany(company);
          if (key === "") return state;
          const existing = state.companies[key];
          const entry: CompanyVerdict = {
            cpt,
            note: note ?? existing?.note ?? "",
            updatedAt: new Date().toISOString(),
          };
          return { companies: { ...state.companies, [key]: entry } };
        }),

      clearCompanyVerdict: (company) =>
        set((state) => {
          const next = { ...state.companies };
          delete next[normaliseCompany(company)];
          return { companies: next };
        }),

      setApplicationStage: (listingId, stage) =>
        set((state) => {
          if (stage === "reset") {
            const next = { ...state.applications };
            delete next[listingId];
            return { applications: next };
          }
          const existing = state.applications[listingId];
          const entry: ApplicationProgress = {
            stage,
            notes: existing?.notes ?? "",
            updatedAt: new Date().toISOString(),
          };
          return {
            applications: { ...state.applications, [listingId]: entry },
            // Sending an application is the activity that matters most here.
            dayLogs:
              stage === "applied"
                ? touchDay(state.dayLogs, 0, 1)
                : state.dayLogs,
          };
        }),

      setApplicationNotes: (listingId, notes) =>
        set((state) => {
          const existing = state.applications[listingId];
          return {
            applications: {
              ...state.applications,
              [listingId]: {
                stage: existing?.stage ?? "saved",
                notes,
                updatedAt: new Date().toISOString(),
              },
            },
          };
        }),

      markInternshipsSeen: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            internshipsSeenAt: new Date().toISOString(),
          },
        })),

      setRecruitingDate: (iso) =>
        set((state) => ({
          settings: { ...state.settings, recruitingDate: iso },
        })),

      setSelectedPath: (pathId) =>
        set((state) => ({
          settings: { ...state.settings, selectedPathId: pathId },
        })),

      importState: (raw) => {
        const parsed = parseProgressState(raw);
        if (!parsed.ok) return { ok: false, error: parsed.error };
        set(parsed.state);
        return { ok: true };
      },

      exportState: () => {
        const {
          version,
          skills,
          course,
          problems,
          companies,
          applications,
          customResources,
          dayLogs,
          settings,
        } = get();
        return {
          version,
          skills,
          course,
          problems,
          companies,
          applications,
          customResources,
          dayLogs,
          settings,
        };
      },

      resetAll: () => set({ ...initialState }),

    })),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Read storage from an effect instead of at import time, so the server
      // markup and the first client render agree. useHydrateProgress() does it.
      skipHydration: true,
      partialize: ({
        version,
        skills,
        course,
        problems,
        companies,
        applications,
        customResources,
        dayLogs,
        settings,
      }) => ({
        version,
        skills,
        course,
        problems,
        companies,
        applications,
        customResources,
        dayLogs,
        settings,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
