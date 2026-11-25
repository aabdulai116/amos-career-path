import { pathSkillIds } from "@/lib/graph";
import type { CareerPath, Skill } from "@/lib/types";

/**
 * What the Atlas shows at full strength versus dimmed. Nothing is ever removed
 * from the canvas: filtering dims, so the map keeps its shape and the layout
 * never reflows under you.
 */

export interface AtlasFilters {
  /** Empty means every domain. */
  domainIds: string[];
  pathId: string | null;
  query: string;
}

export interface AtlasFocus {
  /** Skills shown at full strength. */
  activeIds: Set<string>;
  /** Skills matching the search box, for the highlight ring. */
  matchIds: Set<string>;
  /** The selected path's closure, or null when no path is selected. */
  pathIds: Set<string> | null;
  /** True when something is narrowing the view, so the rest should dim. */
  filtering: boolean;
}

export const normalise = (value: string): string =>
  value.trim().toLowerCase();

export const matchesQuery = (skill: Skill, query: string): boolean => {
  const q = normalise(query);
  if (q === "") return false;
  return (
    skill.name.toLowerCase().includes(q) ||
    skill.summary.toLowerCase().includes(q) ||
    skill.id.includes(q.replace(/\s+/g, "-"))
  );
};

/** Best-first search results: name prefix, then name, then summary. */
export const searchSkills = (
  skills: Skill[],
  query: string,
  limit = 8,
): Skill[] => {
  const q = normalise(query);
  if (q === "") return [];
  const score = (skill: Skill): number => {
    const name = skill.name.toLowerCase();
    if (name.startsWith(q)) return 0;
    if (name.includes(q)) return 1;
    if (skill.id.includes(q.replace(/\s+/g, "-"))) return 2;
    if (skill.summary.toLowerCase().includes(q)) return 3;
    return Number.POSITIVE_INFINITY;
  };
  return skills
    .map((skill) => ({ skill, rank: score(skill) }))
    .filter((entry) => Number.isFinite(entry.rank))
    .sort(
      (a, b) => a.rank - b.rank || a.skill.name.localeCompare(b.skill.name),
    )
    .slice(0, limit)
    .map((entry) => entry.skill);
};

export const computeFocus = (
  skills: Skill[],
  filters: AtlasFilters,
  path: CareerPath | null,
): AtlasFocus => {
  const pathIds =
    path === null ? null : new Set(pathSkillIds(path, skills));
  const domainIds = new Set(filters.domainIds);
  const hasQuery = normalise(filters.query) !== "";

  const matchIds = new Set<string>();
  const activeIds = new Set<string>();

  for (const skill of skills) {
    const matched = hasQuery && matchesQuery(skill, filters.query);
    if (matched) matchIds.add(skill.id);

    const domainOk = domainIds.size === 0 || domainIds.has(skill.domain);
    const pathOk = pathIds === null || pathIds.has(skill.id);
    const queryOk = !hasQuery || matched;
    if (domainOk && pathOk && queryOk) activeIds.add(skill.id);
  }

  return {
    activeIds,
    matchIds,
    pathIds,
    filtering: domainIds.size > 0 || pathIds !== null || hasQuery,
  };
};

export interface AtlasEdge {
  id: string;
  source: string;
  target: string;
}

export const buildEdges = (skills: Skill[]): AtlasEdge[] => {
  const known = new Set(skills.map((s) => s.id));
  return skills.flatMap((skill) =>
    skill.prerequisites
      .filter((p) => known.has(p))
      .map((p) => ({ id: `${p}->${skill.id}`, source: p, target: skill.id })),
  );
};
