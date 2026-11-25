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

/* ------------------------------------------------------- 100 Days of Code */

export type CourseTrack =
  | "Beginner"
  | "Intermediate"
  | "Intermediate+"
  | "Web Foundation"
  | "Advanced"
  | "Portfolio"
  | "Wrap-up";

/** A practice build of my own for a day, separate from the course's project. */
export interface CourseProject {
  title: string;
  brief: string;
}

export interface CourseDay {
  day: number;
  /** Udemy section number, which matches the day for this course. */
  section: number;
  title: string;
  track: CourseTrack;
  lectures: number;
  minutes: number;
  project: CourseProject | null;
}

export interface DayProgress {
  watched: boolean;
  projectDone: boolean;
  notes: string;
  /** Where the practice project lives. */
  repoUrl: string;
  /** The Udemy lecture link for this day, pasted once and kept. */
  lectureUrl: string;
  completedAt: string | null;
}

export type SkillStatus = "locked" | "available" | "in_progress" | "done";

/** Everything the user has typed or checked for one skill. */
export interface SkillProgress {
  /**
   * Absent until the skill is explicitly started or finished. Jotting a note or
   * ticking a resource records the activity without claiming a status, so a
   * skill never silently reports progress I did not declare.
   */
  status?: "in_progress" | "done";
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
  /** Keyed by day number as a string. */
  course: Record<string, DayProgress>;
  customResources: CustomResource[];
  /** Keyed by YYYY-MM-DD. */
  dayLogs: Record<string, DayLog>;
  settings: {
    /** ISO date, default 2027-08-01. */
    recruitingDate: string;
    selectedPathId: string | null;
  };
}
