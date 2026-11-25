import type { CourseDay, CourseTrack, DayProgress } from "@/lib/types";

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
