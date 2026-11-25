import type {
  CourseDay,
  CourseTrack,
  DayPriority,
  DayProgress,
} from "@/lib/types";

export type CourseProgressMap = Record<string, DayProgress | undefined>;

export const TRACK_ORDER: CourseTrack[] = [
  "Beginner",
  "Intermediate",
  "Intermediate+",
  "Web Foundation",
  "Advanced",
  "Portfolio",
  "Wrap-up",
];

/** Each track gets a hue of its own, reused by the chips and the meter rows. */
export const TRACK_COLOR: Record<CourseTrack, string> = {
  Beginner: "#4ade80",
  Intermediate: "#38bdf8",
  "Intermediate+": "#a78bfa",
  "Web Foundation": "#facc15",
  Advanced: "#fb923c",
  Portfolio: "#f472b6",
  "Wrap-up": "#8d9bb0",
};

export const dayProgress = (
  progress: CourseProgressMap,
  day: number,
): DayProgress | undefined => progress[String(day)];

export interface CourseStats {
  totalDays: number;
  watched: number;
  projectsDone: number;
  projectsAvailable: number;
  /** Run time of the days marked watched, in minutes. */
  minutesWatched: number;
  totalMinutes: number;
  percent: number;
  /** The lowest numbered day not yet watched, or null when the course is done. */
  nextDay: number | null;
}

export const courseStats = (
  days: CourseDay[],
  progress: CourseProgressMap,
): CourseStats => {
  const numbered = days.filter((d) => d.day <= 100);
  const watched = numbered.filter((d) => dayProgress(progress, d.day)?.watched);
  const withProject = numbered.filter((d) => d.project !== null);
  const next = numbered.find((d) => !dayProgress(progress, d.day)?.watched);

  return {
    totalDays: numbered.length,
    watched: watched.length,
    projectsDone: withProject.filter(
      (d) => dayProgress(progress, d.day)?.projectDone,
    ).length,
    projectsAvailable: withProject.length,
    minutesWatched: watched.reduce((n, d) => n + d.minutes, 0),
    totalMinutes: numbered.reduce((n, d) => n + d.minutes, 0),
    percent:
      numbered.length === 0
        ? 0
        : Math.round((watched.length / numbered.length) * 1000) / 10,
    nextDay: next?.day ?? null,
  };
};

export interface TrackSummary {
  id: CourseTrack;
  name: string;
  color: string;
  total: number;
  done: number;
  percent: number;
  hoursRemaining: number;
}

export const trackSummaries = (
  days: CourseDay[],
  progress: CourseProgressMap,
): TrackSummary[] =>
  TRACK_ORDER.filter((track) => days.some((d) => d.track === track)).map(
    (track) => {
      const members = days.filter((d) => d.track === track);
      const done = members.filter(
        (d) => dayProgress(progress, d.day)?.watched,
      );
      const minutesLeft = members
        .filter((d) => !dayProgress(progress, d.day)?.watched)
        .reduce((n, d) => n + d.minutes, 0);
      return {
        id: track,
        name: track,
        color: TRACK_COLOR[track],
        total: members.length,
        done: done.length,
        percent:
          members.length === 0
            ? 0
            : Math.round((done.length / members.length) * 1000) / 10,
        hoursRemaining: Math.round((minutesLeft / 60) * 10) / 10,
      };
    },
  );

export const formatRuntime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}hr` : `${hours}hr ${rest}min`;
};

/** Days with a finished practice project and a repo link, newest first. */
export const courseProofs = (
  days: CourseDay[],
  progress: CourseProgressMap,
): { day: CourseDay; repoUrl: string }[] =>
  days
    .filter((d) => {
      const p = dayProgress(progress, d.day);
      return p?.projectDone === true && p.repoUrl.trim() !== "";
    })
    .map((day) => ({
      day,
      repoUrl: dayProgress(progress, day.day)?.repoUrl ?? "",
    }))
    .sort((a, b) => b.day.day - a.day.day);

/* ------------------------------------------------- priority and exercises */

export const PRIORITY_ORDER: DayPriority[] = ["core", "useful", "skim"];

export const PRIORITY_LABEL: Record<DayPriority, string> = {
  core: "Core",
  useful: "Useful",
  skim: "Skim",
};

export const PRIORITY_BLURB: Record<DayPriority, string> = {
  core: "Slow down. You will use this in interviews or in the job.",
  useful: "Worth the time once, not worth polishing.",
  skim: "Watch at speed. Build it if you enjoy it, then move on.",
};

/**
 * Only "core" is coloured. The question this answers is "where do I slow
 * down?", and one highlighted class answers it faster than three competing
 * hues would. The word is always rendered beside it.
 */
export const PRIORITY_COLOR: Record<DayPriority, string> = {
  core: "var(--accent)",
  useful: "var(--muted)",
  skim: "var(--muted)",
};

export const dayExercises = (
  day: CourseDay,
  progress: CourseProgressMap,
): { done: number; total: number } => {
  const entry = dayProgress(progress, day.day);
  return {
    done: day.exercises.filter((e) => entry?.exercisesDone.includes(e.id))
      .length,
    total: day.exercises.length,
  };
};

export const isExerciseDone = (
  progress: CourseProgressMap,
  day: number,
  exerciseId: string,
): boolean =>
  dayProgress(progress, day)?.exercisesDone.includes(exerciseId) ?? false;

export const exerciseCode = (
  progress: CourseProgressMap,
  day: number,
  exerciseId: string,
): string => dayProgress(progress, day)?.exerciseCode[exerciseId] ?? "";

export interface ExerciseTotals {
  done: number;
  total: number;
  percent: number;
}

export const exerciseTotals = (
  days: CourseDay[],
  progress: CourseProgressMap,
): ExerciseTotals => {
  const counts = days.map((day) => dayExercises(day, progress));
  const done = counts.reduce((n, c) => n + c.done, 0);
  const total = counts.reduce((n, c) => n + c.total, 0);
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 1000) / 10,
  };
};

export interface PrioritySummary {
  priority: DayPriority;
  total: number;
  watched: number;
  /** Run time of the unwatched days in this class, in hours. */
  hoursRemaining: number;
}

/**
 * The number that makes the priorities actionable: how much of the course is
 * left in each class. Skimmable hours are hours you can spend somewhere else.
 */
export const prioritySummaries = (
  days: CourseDay[],
  progress: CourseProgressMap,
): PrioritySummary[] =>
  PRIORITY_ORDER.map((priority) => {
    const members = days.filter((d) => d.priority === priority);
    const minutesLeft = members
      .filter((d) => !dayProgress(progress, d.day)?.watched)
      .reduce((n, d) => n + d.minutes, 0);
    return {
      priority,
      total: members.length,
      watched: members.filter((d) => dayProgress(progress, d.day)?.watched)
        .length,
      hoursRemaining: Math.round((minutesLeft / 60) * 10) / 10,
    };
  });

/** The next day that is worth real attention, skipping what you can skim. */
export const nextCoreDay = (
  days: CourseDay[],
  progress: CourseProgressMap,
): CourseDay | null =>
  days.find(
    (d) =>
      d.day <= 100 &&
      d.priority === "core" &&
      !dayProgress(progress, d.day)?.watched,
  ) ?? null;
