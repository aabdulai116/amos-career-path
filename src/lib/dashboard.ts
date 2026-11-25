import { domains } from "@/data/domains";
import { paths } from "@/data/paths";
import {
  computeStatuses,
  domainProgress,
  pathProgress,
  type ProgressMap,
  type ProgressSummary,
} from "@/lib/graph";
import type { CareerPath, Domain, Skill, SkillStatus } from "@/lib/types";

/** Derived numbers for the dashboard. Pure, so every line of it is testable. */

export interface Countdown {
  days: number;
  weeks: number;
  months: number;
  /** True once the target date is today or in the past. */
  overdue: boolean;
}

export const countdownTo = (
  targetDateIso: string,
  now: Date = new Date(),
): Countdown => {
  const target = new Date(`${targetDateIso}T00:00:00`);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const days = Math.round(
    (target.getTime() - startOfToday.getTime()) / 86_400_000,
  );
  const toward = (perUnit: number): number =>
    Math.sign(days) * Math.floor(Math.abs(days) / perUnit);
  return {
    days,
    weeks: toward(7),
    months: toward(30.44),
    overdue: days <= 0,
  };
};

export const countStatus = (
  statuses: Record<string, SkillStatus>,
  status: SkillStatus,
  scope?: Set<string>,
): number =>
  Object.entries(statuses).filter(
    ([id, value]) => value === status && (scope ? scope.has(id) : true),
  ).length;

export interface ProofEntry {
  skill: Skill;
  proofUrl: string;
  completedAt: string | null;
  hoursLogged: number;
}

/**
 * Everything finished, newest first. Skills with no proof link are kept, not
 * hidden: an empty row is the reminder to go and link something.
 */
export const proofOfWork = (
  skills: Skill[],
  progress: ProgressMap,
): ProofEntry[] =>
  skills
    .filter((skill) => progress[skill.id]?.status === "done")
    .map((skill) => ({
      skill,
      proofUrl: progress[skill.id]?.proofUrl ?? "",
      completedAt: progress[skill.id]?.completedAt ?? null,
      hoursLogged: progress[skill.id]?.hoursLogged ?? 0,
    }))
    .sort((a, b) => {
      if (a.completedAt === null && b.completedAt === null) {
        return a.skill.name.localeCompare(b.skill.name);
      }
      if (a.completedAt === null) return 1;
      if (b.completedAt === null) return -1;
      return b.completedAt.localeCompare(a.completedAt);
    });

export interface NamedSummary extends ProgressSummary {
  id: string;
  name: string;
  color: string;
}

export const domainSummaries = (
  skills: Skill[],
  progress: ProgressMap,
  list: Domain[] = domains,
): NamedSummary[] =>
  list.map((domain) => ({
    id: domain.id,
    name: domain.name,
    color: domain.color,
    ...domainProgress(domain.id, skills, progress),
  }));

export const pathSummaries = (
  skills: Skill[],
  progress: ProgressMap,
  list: CareerPath[] = paths,
  accent = "#2d9fd4",
): NamedSummary[] =>
  list
    .map((path) => ({
      id: path.id,
      name: path.name,
      color: accent,
      ...pathProgress(path, skills, progress),
    }))
    .sort((a, b) => b.percent - a.percent || a.name.localeCompare(b.name));

export interface DashboardTotals {
  overall: ProgressSummary;
  done: number;
  inProgress: number;
  unlockedNow: number;
  locked: number;
}

export const dashboardTotals = (
  skills: Skill[],
  progress: ProgressMap,
  scope: Set<string> | null = null,
): DashboardTotals => {
  const statuses = computeStatuses(skills, progress);
  const inScope = scope ?? undefined;
  const members = skills.filter((s) => (scope ? scope.has(s.id) : true));
  const doneCount = members.filter((s) => progress[s.id]?.status === "done");
  const hoursRemaining = members
    .filter((s) => progress[s.id]?.status !== "done")
    .reduce((sum, s) => sum + s.estHours, 0);

  return {
    overall: {
      total: members.length,
      done: doneCount.length,
      percent:
        members.length === 0
          ? 0
          : Math.round((doneCount.length / members.length) * 1000) / 10,
      hoursRemaining,
    },
    done: doneCount.length,
    inProgress: countStatus(statuses, "in_progress", inScope),
    unlockedNow: countStatus(statuses, "available", inScope),
    locked: countStatus(statuses, "locked", inScope),
  };
};

/** "3 skills/week" style copy, or a plain phrase when there is nothing to do. */
export const formatPace = (skillsPerWeek: number): string => {
  if (skillsPerWeek === 0) return "nothing left to schedule";
  if (!Number.isFinite(skillsPerWeek)) return "past the target date";
  return `${Math.round(skillsPerWeek * 10) / 10} skills/week`;
};

export const formatHours = (hours: number): string => {
  if (!Number.isFinite(hours)) return "—";
  return `${Math.round(hours * 10) / 10}h`;
};
