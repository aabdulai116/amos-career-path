"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dayKey } from "@/lib/dates";
import type {
  CustomResource,
  DayProgress,
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

const emptyDay = (): DayProgress => ({
  watched: false,
  projectDone: false,
  notes: "",
  repoUrl: "",
  lectureUrl: "",
  completedAt: null,
});

export const initialState: ProgressState = {
  version: 1,
  skills: {},
  course: {},
  customResources: [],
  dayLogs: {},
  settings: {
    recruitingDate: DEFAULT_RECRUITING_DATE,
    selectedPathId: null,
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
      },
    },
  };
};

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
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
        const { version, skills, course, customResources, dayLogs, settings } =
          get();
        return { version, skills, course, customResources, dayLogs, settings };
      },

      resetAll: () => set({ ...initialState }),

    }),
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
        customResources,
        dayLogs,
        settings,
      }) => ({ version, skills, course, customResources, dayLogs, settings }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
