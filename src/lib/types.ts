/**
 * Content types (static, versioned in git) and progress types (per-user, in localStorage).
 * Content and progress are deliberately separate so editing content never wipes progress.
 */

export type DomainId =
  | "programming"
  | "dsa"
  | "cs-core"
  | "frontend"
  | "backend"
  | "cloud"
  | "math"
  | "ai"
  | "quant"
  | "career";

export interface Domain {
  id: DomainId;
  name: string;
  /** Tailwind-independent hex, used for node accents, chips and charts. */
  color: string;
  /** Lucide icon name, resolved at render time. */
  icon: string;
}

/** 1 = foundational, 2 = intermediate, 3 = advanced / specialist. */
export type SkillLevel = 1 | 2 | 3;

export interface Skill {
  id: string;
  name: string;
  domain: DomainId;
  /** One sentence, plain English. */
  summary: string;
  prerequisites: string[];
  estHours: number;
  level: SkillLevel;
}

export interface CareerPath {
  id: string;
  name: string;
  tagline: string;
  /** Core skills of the path; the prerequisite closure is computed, not listed. */
  skillIds: string[];
}

export type ResourceType = "video" | "playlist" | "course page" | "practice";
export type ResourceLevel = "beginner" | "intermediate" | "advanced";

export interface Resource {
  skillId: string;
  title: string;
  creator: string;
  url: string;
  type: ResourceType;
  level: ResourceLevel;
}

/** A resource the user pasted in themselves; lives in progress state, not content. */
export interface CustomResource {
  id: string;
  skillId: string;
  title: string;
  url: string;
  addedAt: string;
}

export type SkillStatus = "locked" | "available" | "in_progress" | "done";

/** Everything the user has typed or checked for one skill. */
export interface SkillProgress {
  status: Exclude<SkillStatus, "locked" | "available">;
  notes: string;
  proofUrl: string;
  hoursLogged: number;
  completedAt: string | null;
  /** Stable resource ids, see resourceId(). */
  resourcesWatched: string[];
}

export interface DayLog {
  /** YYYY-MM-DD, local time. */
  date: string;
  hours: number;
  /** Resource ids checked off that day, for the streak rule. */
  resources: number;
}

export interface ProgressState {
  version: 1;
  skills: Record<string, SkillProgress>;
  customResources: CustomResource[];
  /** Keyed by YYYY-MM-DD. */
  dayLogs: Record<string, DayLog>;
  settings: {
    /** ISO date, default 2027-08-01. */
    recruitingDate: string;
    selectedPathId: string | null;
  };
}
