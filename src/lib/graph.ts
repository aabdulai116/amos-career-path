import type {
  CareerPath,
  Skill,
  SkillProgress,
  SkillStatus,
} from "@/lib/types";

export type ProgressMap = Record<string, SkillProgress | undefined>;

/* ------------------------------------------------------------------ indexing */

export const indexById = (skills: Skill[]): Map<string, Skill> =>
  new Map(skills.map((s) => [s.id, s]));

/** skillId -> ids of the skills that list it as a prerequisite. */
export const buildDependents = (skills: Skill[]): Map<string, string[]> => {
  const dependents = new Map<string, string[]>();
  for (const s of skills) dependents.set(s.id, []);
  for (const s of skills) {
    for (const p of s.prerequisites) {
      const list = dependents.get(p);
      if (list) list.push(s.id);
    }
  }
  return dependents;
};

/* ---------------------------------------------------------------- validation */

/** Prerequisite ids that do not match any skill, as "skill -> missing" pairs. */
export const findMissingPrerequisites = (
  skills: Skill[],
): { skillId: string; missing: string }[] => {
  const ids = new Set(skills.map((s) => s.id));
  const out: { skillId: string; missing: string }[] = [];
  for (const s of skills) {
    for (const p of s.prerequisites) {
      if (!ids.has(p)) out.push({ skillId: s.id, missing: p });
    }
  }
  return out;
};

export const findDuplicateIds = (skills: Skill[]): string[] => {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const s of skills) {
    if (seen.has(s.id)) dupes.add(s.id);
    seen.add(s.id);
  }
  return [...dupes];
};

/**
 * Every prerequisite cycle, each as the list of ids on the loop.
 * Depth-first search with an explicit stack colouring: grey = on the current
 * path, black = finished.
 */
export const findCycles = (skills: Skill[]): string[][] => {
  const byId = indexById(skills);
  const state = new Map<string, "grey" | "black">();
  const path: string[] = [];
  const cycles: string[][] = [];
  const seenCycles = new Set<string>();

  const visit = (id: string): void => {
    const colour = state.get(id);
    if (colour === "black") return;
    if (colour === "grey") {
      const start = path.indexOf(id);
      const loop = path.slice(start);
      // Normalise rotation so the same loop is not reported twice.
      const min = loop.reduce((a, b) => (a < b ? a : b));
      const offset = loop.indexOf(min);
      const key = [...loop.slice(offset), ...loop.slice(0, offset)].join(">");
      if (!seenCycles.has(key)) {
        seenCycles.add(key);
        cycles.push(key.split(">"));
      }
      return;
    }
    state.set(id, "grey");
    path.push(id);
    for (const p of byId.get(id)?.prerequisites ?? []) visit(p);
    path.pop();
    state.set(id, "black");
  };

  for (const s of skills) visit(s.id);
  return cycles;
};

export interface GraphProblems {
  duplicateIds: string[];
  missingPrerequisites: { skillId: string; missing: string }[];
  cycles: string[][];
}

export const validateGraph = (skills: Skill[]): GraphProblems => ({
  duplicateIds: findDuplicateIds(skills),
  missingPrerequisites: findMissingPrerequisites(skills),
  cycles: findCycles(skills),
});

export const isGraphValid = (p: GraphProblems): boolean =>
  p.duplicateIds.length === 0 &&
  p.missingPrerequisites.length === 0 &&
  p.cycles.length === 0;

/* -------------------------------------------------------------------- status */

/**
 * Derived status for every skill.
 *
 * - stored "done" and "in_progress" are taken at face value: if I started a skill
 *   early, the app should not call it locked.
 * - otherwise a skill is "available" once every prerequisite is done, else "locked".
 */
export const computeStatuses = (
  skills: Skill[],
  progress: ProgressMap,
): Record<string, SkillStatus> => {
  const out: Record<string, SkillStatus> = {};
  const isDone = (id: string): boolean => progress[id]?.status === "done";
  for (const s of skills) {
    const stored = progress[s.id]?.status;
    if (stored === "done") {
      out[s.id] = "done";
    } else if (stored === "in_progress") {
      out[s.id] = "in_progress";
    } else {
      out[s.id] = s.prerequisites.every(isDone) ? "available" : "locked";
    }
  }
  return out;
};

export const isUnlocked = (
  skill: Skill,
  progress: ProgressMap,
): boolean => skill.prerequisites.every((p) => progress[p]?.status === "done");

/* --------------------------------------------------------------------- paths */

/**
 * A path's core skills plus everything they transitively depend on, in
 * dependency-first order. This is what gets highlighted when a path is selected.
 */
export const pathSkillIds = (path: CareerPath, skills: Skill[]): string[] => {
  const byId = indexById(skills);
  const out: string[] = [];
  const seen = new Set<string>();
  const onStack = new Set<string>();

  const walk = (id: string): void => {
    if (seen.has(id) || onStack.has(id)) return;
    const skill = byId.get(id);
    if (!skill) return;
    onStack.add(id);
    for (const p of skill.prerequisites) walk(p);
    onStack.delete(id);
    seen.add(id);
    out.push(id);
  };

  for (const id of path.skillIds) walk(id);
  return out;
};

export interface ProgressSummary {
  total: number;
  done: number;
  /** 0 to 100, rounded to one decimal. */
  percent: number;
  hoursRemaining: number;
}

const summarise = (
  ids: string[],
  skills: Skill[],
  progress: ProgressMap,
): ProgressSummary => {
  const byId = indexById(skills);
  const known = ids.filter((id) => byId.has(id));
  const done = known.filter((id) => progress[id]?.status === "done");
  const hoursRemaining = known
    .filter((id) => progress[id]?.status !== "done")
    .reduce((sum, id) => sum + (byId.get(id)?.estHours ?? 0), 0);
  return {
    total: known.length,
    done: done.length,
    percent:
      known.length === 0
        ? 0
        : Math.round((done.length / known.length) * 1000) / 10,
    hoursRemaining,
  };
};

export const pathProgress = (
  path: CareerPath,
  skills: Skill[],
  progress: ProgressMap,
): ProgressSummary => summarise(pathSkillIds(path, skills), skills, progress);

export const domainProgress = (
  domainId: string,
  skills: Skill[],
  progress: ProgressMap,
): ProgressSummary =>
  summarise(
    skills.filter((s) => s.domain === domainId).map((s) => s.id),
    skills,
    progress,
  );

export const overallProgress = (
  skills: Skill[],
  progress: ProgressMap,
): ProgressSummary => summarise(skills.map((s) => s.id), skills, progress);

/* ----------------------------------------------------------- recommendations */

/** How many other skills sit downstream of this one, transitively. */
export const unlockCount = (
  skillId: string,
  skills: Skill[],
  dependents = buildDependents(skills),
): number => {
  const seen = new Set<string>();
  const stack = [...(dependents.get(skillId) ?? [])];
  while (stack.length > 0) {
    const next = stack.pop();
    if (next === undefined || seen.has(next)) continue;
    seen.add(next);
    stack.push(...(dependents.get(next) ?? []));
  }
  seen.delete(skillId);
  return seen.size;
};

export interface Recommendation {
  skill: Skill;
  unlocks: number;
}

/**
 * What to start next: skills that are available (or already started) and, when a
 * path is selected, on that path. Ordered by how much they unlock, then by the
 * smallest time investment, then by name so the order is stable.
 */
export const recommendedNext = (
  skills: Skill[],
  progress: ProgressMap,
  path: CareerPath | null,
  limit = 5,
): Recommendation[] => {
  const statuses = computeStatuses(skills, progress);
  const scope = path ? new Set(pathSkillIds(path, skills)) : null;
  const dependents = buildDependents(skills);

  return skills
    .filter((s) => statuses[s.id] === "available" || statuses[s.id] === "in_progress")
    .filter((s) => (scope ? scope.has(s.id) : true))
    .map((skill) => ({ skill, unlocks: unlockCount(skill.id, skills, dependents) }))
    .sort(
      (a, b) =>
        b.unlocks - a.unlocks ||
        a.skill.estHours - b.skill.estHours ||
        a.skill.name.localeCompare(b.skill.name),
    )
    .slice(0, limit);
};

/* ---------------------------------------------------------------------- pace */

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface Pace {
  daysLeft: number;
  weeksLeft: number;
  skillsRemaining: number;
  /** Skills per week needed to finish in time; 0 when nothing is left. */
  skillsPerWeek: number;
  hoursPerWeek: number;
  /** True when the target date has passed. */
  overdue: boolean;
}

export const requiredPace = (
  targetDateIso: string,
  summary: ProgressSummary,
  now: Date = new Date(),
): Pace => {
  const target = new Date(`${targetDateIso}T00:00:00`);
  const daysLeft = Math.ceil((target.getTime() - now.getTime()) / MS_PER_DAY);
  const weeksLeft = daysLeft / 7;
  const skillsRemaining = summary.total - summary.done;
  const usableWeeks = weeksLeft > 0 ? weeksLeft : 0;
  const round = (n: number): number => Math.round(n * 100) / 100;
  return {
    daysLeft,
    weeksLeft: round(weeksLeft),
    skillsRemaining,
    skillsPerWeek:
      skillsRemaining === 0 || usableWeeks === 0
        ? skillsRemaining === 0
          ? 0
          : Number.POSITIVE_INFINITY
        : round(skillsRemaining / usableWeeks),
    hoursPerWeek:
      summary.hoursRemaining === 0 || usableWeeks === 0
        ? summary.hoursRemaining === 0
          ? 0
          : Number.POSITIVE_INFINITY
        : round(summary.hoursRemaining / usableWeeks),
    overdue: daysLeft <= 0,
  };
};

/* --------------------------------------------------------------------- misc */

/** Prerequisite-first ordering; ids in a cycle are appended at the end. */
export const topologicalOrder = (skills: Skill[]): string[] => {
  const byId = indexById(skills);
  const out: string[] = [];
  const done = new Set<string>();
  const onStack = new Set<string>();

  const walk = (id: string): void => {
    if (done.has(id) || onStack.has(id)) return;
    onStack.add(id);
    for (const p of byId.get(id)?.prerequisites ?? []) walk(p);
    onStack.delete(id);
    done.add(id);
    out.push(id);
  };

  for (const s of skills) walk(s.id);
  return out;
};

export const directUnlocks = (
  skillId: string,
  skills: Skill[],
): Skill[] => skills.filter((s) => s.prerequisites.includes(skillId));
