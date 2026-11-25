import { problems } from "@/data/problems";
import type { NamedSummary } from "@/lib/dashboard";
import type {
  Difficulty,
  Problem,
  ProblemPattern,
  ProblemProgress,
} from "@/lib/types";

export type ProblemProgressMap = Record<string, ProblemProgress | undefined>;

/**
 * NeetCode's eighteen patterns in their order, which is a curriculum: Arrays &
 * Hashing before Two Pointers, graphs before advanced graphs. A test asserts
 * this matches the order in the generated data file.
 */
export const PATTERN_ORDER: ProblemPattern[] = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D Dynamic Programming",
  "2-D Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
];

export const DIFFICULTY_ORDER: Difficulty[] = ["Easy", "Medium", "Hard"];

/**
 * Difficulty is the one thing here worth colouring: three ordered values that
 * everyone already reads as green/amber/red. These steps sit inside OKLCH L
 * 0.48-0.67 on --surface and clear the CVD separation floor (validated, worst
 * adjacent pair deutan dE 8.3 / normal 17.3). The badge always carries the word
 * as well, so difficulty is never colour alone.
 */
export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy: "#35a56b",
  Medium: "#ad7510",
  Hard: "#dd4f7d",
};

/**
 * A planning budget per problem, not a promise: the time a first honest attempt
 * plus reading the walkthrough tends to take. Only used to turn "problems left"
 * into "hours left", which is the number that matters against a recruiting date.
 */
export const ESTIMATED_MINUTES: Record<Difficulty, number> = {
  Easy: 20,
  Medium: 35,
  Hard: 55,
};

/* ------------------------------------------------------------------- links */

/** Every URL below is built from NeetCode's published slug or video id. */
export const problemUrl = (problem: Problem): string =>
  problem.freeUrl ?? `https://leetcode.com/problems/${problem.slug}/`;

export const videoUrl = (problem: Problem): string =>
  `https://www.youtube.com/watch?v=${problem.video}`;

export const solutionUrl = (problem: Problem): string =>
  `https://github.com/neetcode-gh/leetcode/blob/main/python/${problem.solutionPath}.py`;

/* ---------------------------------------------------------------- progress */

export const problemProgress = (
  progress: ProblemProgressMap,
  slug: string,
): ProblemProgress | undefined => progress[slug];

export const isSolved = (
  progress: ProblemProgressMap,
  slug: string,
): boolean => progress[slug]?.status === "solved";

/** Both halves written down; one without the other is half an answer. */
export const hasComplexity = (entry: ProblemProgress | undefined): boolean =>
  entry !== undefined &&
  entry.timeComplexity.trim() !== "" &&
  entry.spaceComplexity.trim() !== "";

export interface PracticeStats {
  total: number;
  solved: number;
  attempted: number;
  percent: number;
  blind75Total: number;
  blind75Solved: number;
  /** Hours of practice left at the per-difficulty budget. */
  hoursRemaining: number;
  /** Minutes actually logged across every problem. */
  minutesLogged: number;
  /** Solved without a hint on the first sitting. */
  cleanSolves: number;
  /** Solved but with no complexity written down - the gap before a revision. */
  missingComplexity: number;
  /** The next unsolved problem in curriculum order, or null when done. */
  nextUp: Problem | null;
}

export const practiceStats = (
  list: Problem[],
  progress: ProblemProgressMap,
): PracticeStats => {
  const solved = list.filter((p) => isSolved(progress, p.slug));
  const attempted = list.filter(
    (p) => progress[p.slug]?.status === "attempted",
  );
  const blind = list.filter((p) => p.blind75);
  const minutesLeft = list
    .filter((p) => !isSolved(progress, p.slug))
    .reduce((n, p) => n + ESTIMATED_MINUTES[p.difficulty], 0);

  return {
    total: list.length,
    solved: solved.length,
    attempted: attempted.length,
    percent:
      list.length === 0
        ? 0
        : Math.round((solved.length / list.length) * 1000) / 10,
    blind75Total: blind.length,
    blind75Solved: blind.filter((p) => isSolved(progress, p.slug)).length,
    hoursRemaining: Math.round((minutesLeft / 60) * 10) / 10,
    minutesLogged: list.reduce((n, p) => n + (progress[p.slug]?.minutes ?? 0), 0),
    cleanSolves: solved.filter((p) => {
      const entry = progress[p.slug];
      return entry !== undefined && !entry.usedHint && entry.attempts <= 1;
    }).length,
    missingComplexity: solved.filter((p) => !hasComplexity(progress[p.slug]))
      .length,
    nextUp: list.find((p) => progress[p.slug] === undefined) ?? null,
  };
};

/**
 * One row per pattern. Bars in the meter list are all one hue - the bar encodes
 * a ratio, not an identity - so every row carries the same accent and the list
 * is rendered without identity dots.
 */
export const patternSummaries = (
  list: Problem[],
  progress: ProblemProgressMap,
  accent = "var(--chart-series)",
): NamedSummary[] =>
  PATTERN_ORDER.filter((pattern) => list.some((p) => p.pattern === pattern)).map(
    (pattern) => {
      const members = list.filter((p) => p.pattern === pattern);
      const done = members.filter((p) => isSolved(progress, p.slug));
      const minutesLeft = members
        .filter((p) => !isSolved(progress, p.slug))
        .reduce((n, p) => n + ESTIMATED_MINUTES[p.difficulty], 0);
      return {
        id: pattern,
        name: pattern,
        color: accent,
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

export const difficultyStats = (
  list: Problem[],
  progress: ProblemProgressMap,
): { difficulty: Difficulty; total: number; solved: number }[] =>
  DIFFICULTY_ORDER.map((difficulty) => {
    const members = list.filter((p) => p.difficulty === difficulty);
    return {
      difficulty,
      total: members.length,
      solved: members.filter((p) => isSolved(progress, p.slug)).length,
    };
  });

/* ------------------------------------------------------------ spaced review */

/**
 * How long a solved problem stays solved before it is worth redoing. A problem
 * you needed the walkthrough for comes back in a week; one you got first try is
 * parked for six. This is the whole point of tracking attempts and hints: the
 * list of what to redo should fall out of the record, not out of memory.
 */
export const REVIEW_DAYS = { shaky: 7, ok: 21, clean: 45 };

export const reviewInterval = (entry: ProblemProgress): number => {
  if (entry.usedHint || entry.attempts > 2) return REVIEW_DAYS.shaky;
  if (entry.attempts === 2) return REVIEW_DAYS.ok;
  return REVIEW_DAYS.clean;
};

const MS_PER_DAY = 86_400_000;

export interface ReviewItem {
  problem: Problem;
  /** Days past due; 0 means due today. */
  overdueDays: number;
  interval: number;
  usedHint: boolean;
}

/**
 * Solved problems that are due to be redone, most overdue first. Ties break on
 * curriculum order so the earlier pattern comes back first.
 */
export const reviewQueue = (
  list: Problem[],
  progress: ProblemProgressMap,
  now: Date = new Date(),
): ReviewItem[] => {
  const items: ReviewItem[] = [];

  list.forEach((problem) => {
    const entry = progress[problem.slug];
    if (entry === undefined || entry.status !== "solved") return;
    if (entry.solvedAt === null) return;
    const solvedAt = new Date(entry.solvedAt);
    if (Number.isNaN(solvedAt.getTime())) return;

    const interval = reviewInterval(entry);
    const elapsed = Math.floor((now.getTime() - solvedAt.getTime()) / MS_PER_DAY);
    if (elapsed < interval) return;

    items.push({
      problem,
      overdueDays: elapsed - interval,
      interval,
      usedHint: entry.usedHint,
    });
  });

  const order = new Map(list.map((p, index) => [p.slug, index]));
  return items.sort(
    (a, b) =>
      b.overdueDays - a.overdueDays ||
      (order.get(a.problem.slug) ?? 0) - (order.get(b.problem.slug) ?? 0),
  );
};

/**
 * What to open now: unfinished attempts first, because a half-solved problem is
 * the cheapest win, then the next untouched problems in curriculum order.
 */
export const recommendedProblems = (
  list: Problem[],
  progress: ProblemProgressMap,
  limit = 5,
): Problem[] => {
  const unfinished = list.filter(
    (p) => progress[p.slug]?.status === "attempted",
  );
  const fresh = list.filter((p) => progress[p.slug] === undefined);
  return [...unfinished, ...fresh].slice(0, limit);
};

/* ----------------------------------------------------------------- filters */

export type ListScope = "neetcode150" | "blind75";
export type StatusFilter = "all" | "todo" | "attempted" | "solved";

export interface ProblemFilters {
  scope: ListScope;
  patterns: ProblemPattern[];
  difficulties: Difficulty[];
  status: StatusFilter;
  /** Matched against the title, case-insensitively. */
  query: string;
}

export const emptyFilters: ProblemFilters = {
  scope: "neetcode150",
  patterns: [],
  difficulties: [],
  status: "all",
  query: "",
};

export const filterProblems = (
  list: Problem[],
  progress: ProblemProgressMap,
  filters: ProblemFilters,
): Problem[] => {
  const query = filters.query.trim().toLowerCase();

  return list.filter((problem) => {
    if (filters.scope === "blind75" && !problem.blind75) return false;
    if (
      filters.patterns.length > 0 &&
      !filters.patterns.includes(problem.pattern)
    ) {
      return false;
    }
    if (
      filters.difficulties.length > 0 &&
      !filters.difficulties.includes(problem.difficulty)
    ) {
      return false;
    }
    if (filters.status !== "all") {
      const status = progress[problem.slug]?.status;
      if (filters.status === "todo" && status !== undefined) return false;
      if (filters.status === "attempted" && status !== "attempted") return false;
      if (filters.status === "solved" && status !== "solved") return false;
    }
    if (query !== "" && !problem.title.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });
};

/** The list the filters start from, in curriculum order. */
export const scopedProblems = (scope: ListScope): Problem[] =>
  scope === "blind75" ? problems.filter((p) => p.blind75) : problems;

export const groupByPattern = (
  list: Problem[],
): { pattern: ProblemPattern; items: Problem[] }[] =>
  PATTERN_ORDER.map((pattern) => ({
    pattern,
    items: list.filter((p) => p.pattern === pattern),
  })).filter((group) => group.items.length > 0);

export const formatMinutes = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
};
