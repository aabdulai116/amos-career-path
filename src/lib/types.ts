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

/**
 * How much of my attention a day deserves, judged against where I am going:
 * software engineering, AI and quant. Not a judgement on the teaching - a day
 * can be delightful and still be a detour.
 *
 * core   - slow down. You will use this in interviews or in the job itself.
 * useful - worth the time once, not worth polishing.
 * skim   - watch at speed. Build it if you enjoy it, then move on.
 */
export type DayPriority = "core" | "useful" | "skim";

/**
 * A short drill for a day, to be done after the lectures. Separate from the
 * day's project: a project takes an evening, an exercise takes ten minutes and
 * answers "did that actually land?".
 */
export interface CourseExercise {
  /** Unique across the course: `${day}-${n}`. */
  id: string;
  title: string;
  prompt: string;
  /**
   * False when it needs a GUI, a browser, a server or the network. Those are
   * built on your own machine; the in-page interpreter has no screen and no
   * socket, and pretending otherwise would waste your time.
   */
  runnable: boolean;
  /** Pre-filled code, for the exercises that hand you something to fix. */
  starter: string | null;
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
  priority: DayPriority;
  /** One line on why this day earns its time, or why it does not. */
  priorityNote: string;
  exercises: CourseExercise[];
}

export interface DayProgress {
  watched: boolean;
  projectDone: boolean;
  /** Ids of the day's exercises I have finished. */
  exercisesDone: string[];
  /** What I wrote for each exercise, keyed by exercise id. */
  exerciseCode: Record<string, string>;
  notes: string;
  /** Where the practice project lives. */
  repoUrl: string;
  /** The Udemy lecture link for this day, pasted once and kept. */
  lectureUrl: string;
  completedAt: string | null;
  /** ISO, stamped by the store's middleware. Drives sync conflict resolution. */
  updatedAt?: string;
}

/* ----------------------------------------------- LeetCode / NeetCode practice */

/**
 * NeetCode's eighteen pattern groups, in the order neetcode.io lists them. The
 * order is the curriculum: each group assumes the ones above it.
 */
export type ProblemPattern =
  | "Arrays & Hashing"
  | "Two Pointers"
  | "Sliding Window"
  | "Stack"
  | "Binary Search"
  | "Linked List"
  | "Trees"
  | "Tries"
  | "Heap / Priority Queue"
  | "Backtracking"
  | "Graphs"
  | "Advanced Graphs"
  | "1-D Dynamic Programming"
  | "2-D Dynamic Programming"
  | "Greedy"
  | "Intervals"
  | "Math & Geometry"
  | "Bit Manipulation";

export type Difficulty = "Easy" | "Medium" | "Hard";

/**
 * One problem in the NeetCode 150. Every field comes from NeetCode's published
 * problem data - see scripts/sync-problems.ts. Nothing here is hand-typed, so
 * no slug, video id or link is guesswork.
 */
export interface Problem {
  /** LeetCode slug, e.g. "two-sum". URLs are built by problemUrl(). */
  slug: string;
  title: string;
  pattern: ProblemPattern;
  difficulty: Difficulty;
  /** Also one of the Blind 75. The other 75 are NeetCode's additions. */
  blind75: boolean;
  /** YouTube id of NeetCode's walkthrough. */
  video: string;
  /** Solution file stem in neetcode-gh/leetcode, e.g. "0217-contains-duplicate". */
  solutionPath: string;
  /** LeetCode gates seven of these; this is the free mirror to solve them on. */
  freeUrl: string | null;
}

/** Explicit, unlike skills: a problem you have not opened simply has no entry. */
export type ProblemStatus = "attempted" | "solved";

export interface ProblemProgress {
  status: ProblemStatus;
  /** Sittings, not submissions. Incremented by hand when I come back to one. */
  attempts: number;
  /** Minutes across every sitting. */
  minutes: number;
  notes: string;
  /**
   * The complexity I settled on, in my own words - "O(n)", "O(n log n)".
   * Free text rather than a picker: half the value is having to write it down,
   * and an amortised or average-case answer does not fit a dropdown.
   */
  timeComplexity: string;
  spaceComplexity: string;
  /** My own solution, kept so I can reread it the week before an interview. */
  solution: string;
  /** True when I needed the walkthrough. Drives the review queue. */
  usedHint: boolean;
  solvedAt: string | null;
  lastAttemptAt: string | null;
  /** ISO, stamped by the store's middleware. Drives sync conflict resolution. */
  updatedAt?: string;
}

/* ------------------------------------------------------------- internships */

/**
 * What is known about whether an F-1 student on CPT can take this role.
 * Produced by worker/authorisation.py; see that file for why the large
 * "unknown" bucket is the honest answer rather than a cop-out.
 */
export type AuthStatus = "blocked" | "no_sponsorship" | "sponsors" | "unknown";

/** Where the verdict came from, which is how much to trust it. */
export type AuthEvidence = "feed" | "company" | "none";

export interface Internship {
  id: string;
  company: string;
  title: string;
  url: string;
  category: string;
  locations: string[];
  degrees: string[];
  terms: string[];
  /** Unix seconds; 0 when the feed gave no date. */
  posted: number;
  status: AuthStatus;
  evidence: AuthEvidence;
  /** Key into the feed's reason table, not the prose itself. */
  reason: string;
  /**
   * How many indistinguishable requisitions this row stands for. Big employers
   * post the same role once per team; none is dropped, they are just folded in.
   */
  openings: number;
  /** The other requisitions' links, when openings > 1. */
  more: string[];
}

export interface InternshipFeed {
  version: 1;
  generatedAt: number;
  season: string;
  source: string;
  reasons: Record<string, string>;
  listings: Internship[];
}

/**
 * My own finding about an employer, which beats anything the generated data
 * says. Checked once, then inherited by every future role from that company -
 * the whole point, since "do they take CPT" is a fact about the employer.
 */
export type CptVerdict = "ok" | "no" | "unsure";

export interface CompanyVerdict {
  cpt: CptVerdict;
  note: string;
  updatedAt: string;
}

export type ApplicationStage =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

export interface ApplicationProgress {
  stage: ApplicationStage;
  notes: string;
  updatedAt: string;
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
  /** ISO, stamped by the store's middleware. Drives sync conflict resolution. */
  updatedAt?: string;
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
  /** Keyed by LeetCode slug. */
  problems: Record<string, ProblemProgress>;
  /** Keyed by normalised company name; see normaliseCompany(). */
  companies: Record<string, CompanyVerdict>;
  /** Keyed by listing id. */
  applications: Record<string, ApplicationProgress>;
  customResources: CustomResource[];
  /** Keyed by YYYY-MM-DD. */
  dayLogs: Record<string, DayLog>;
  settings: {
    /** ISO date, default 2027-08-01. */
    recruitingDate: string;
    selectedPathId: string | null;
    /** When I last opened the internships page, for "new since". */
    internshipsSeenAt: string | null;
    /** ISO, stamped whenever a setting changes. */
    updatedAt?: string;
  };
}
