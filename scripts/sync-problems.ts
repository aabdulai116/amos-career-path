/**
 * Regenerates src/data/problems.ts from NeetCode's published problem data.
 *
 * Why a generator rather than a hand-written data file: the NeetCode 150 is 150
 * LeetCode slugs and 150 YouTube ids. Typing those by hand would mean inventing
 * URLs, and a slug that is one character out is a dead link that looks alive.
 * NeetCode publishes the exact data that drives neetcode.io in their own repo,
 * so every slug, pattern, difficulty and video id here is theirs, not mine.
 *
 * Source: https://github.com/neetcode-gh/leetcode  (.problemSiteData.json)
 *
 * Run with: npm run sync:problems
 *
 * The script validates before it writes and exits non-zero on any surprise, so
 * a change upstream fails loudly instead of quietly rewriting the curriculum.
 * It never writes a partial file.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE =
  "https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json";

/** Run from the package root, the way npm scripts do. */
const OUT = resolve(process.cwd(), "src/data/problems.ts");

/**
 * NeetCode's pattern order. Declared here rather than taken from the feed so a
 * reordering upstream is caught instead of silently reshuffling the curriculum.
 */
const PATTERNS = [
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
] as const;

const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

/** What the list should contain, asserted rather than assumed. */
const EXPECTED = { neetcode150: 150, blind75: 75 };

interface Upstream {
  neetcode150?: boolean;
  blind75?: boolean;
  problem?: string;
  pattern?: string;
  link?: string;
  video?: string;
  difficulty?: string;
  code?: string;
  premium?: boolean;
  freeLink?: string;
}

const fail = (message: string): never => {
  console.error(`sync-problems: ${message}`);
  process.exit(1);
};

const asString = (value: unknown, field: string, title: string): string => {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${title}: ${field} is missing`);
  }
  return value as string;
};

const quote = (value: string): string => JSON.stringify(value);

const main = async (): Promise<void> => {
  const response = await fetch(SOURCE, {
    headers: { "user-agent": "career-compass-problem-sync/1.0" },
  });
  if (!response.ok) {
    fail(`${SOURCE} returned ${response.status}`);
  }

  const raw: unknown = await response.json();
  if (!Array.isArray(raw)) fail("source is not a JSON array");

  const all = raw as Upstream[];
  const selected = all.filter((entry) => entry.neetcode150 === true);

  // Widening to NeetCode's full practice list is this one filter: drop the
  // predicate above and every pattern section grows. The 150 is the list the
  // badges are about, so that is what ships.
  if (selected.length !== EXPECTED.neetcode150) {
    fail(
      `expected ${EXPECTED.neetcode150} problems in the NeetCode 150, found ${selected.length}`,
    );
  }

  const blind = selected.filter((entry) => entry.blind75 === true);
  if (blind.length !== EXPECTED.blind75) {
    fail(`expected ${EXPECTED.blind75} Blind 75 problems, found ${blind.length}`);
  }
  const strays = all.filter(
    (entry) => entry.blind75 === true && entry.neetcode150 !== true,
  );
  if (strays.length > 0) {
    fail(
      `the Blind 75 should be a subset of the NeetCode 150; outside it: ${strays
        .map((entry) => entry.problem)
        .join(", ")}`,
    );
  }

  const seen = new Set<string>();
  const rows = selected.map((entry) => {
    const title = asString(entry.problem, "problem", "<untitled>");
    const link = asString(entry.link, "link", title);
    const video = asString(entry.video, "video", title);
    const pattern = asString(entry.pattern, "pattern", title);
    const difficulty = asString(entry.difficulty, "difficulty", title);
    const code = asString(entry.code, "code", title);

    // "two-sum/" is the shape NeetCode stores; the trailing slash is theirs.
    if (!/^[a-z0-9-]+\/$/.test(link)) {
      fail(`${title}: link ${quote(link)} is not a bare LeetCode slug`);
    }
    const slug = link.slice(0, -1);
    if (seen.has(slug)) fail(`${title}: duplicate slug ${slug}`);
    seen.add(slug);

    if (!/^[A-Za-z0-9_-]{11}$/.test(video)) {
      fail(`${title}: ${quote(video)} is not a YouTube video id`);
    }
    if (!PATTERNS.includes(pattern as (typeof PATTERNS)[number])) {
      fail(`${title}: unknown pattern ${quote(pattern)}`);
    }
    if (!DIFFICULTIES.includes(difficulty as (typeof DIFFICULTIES)[number])) {
      fail(`${title}: unknown difficulty ${quote(difficulty)}`);
    }
    if (!/^\d{4}-[a-z0-9-]+$/.test(code)) {
      fail(`${title}: ${quote(code)} is not a solution file stem`);
    }

    // Seven of the 150 are LeetCode Premium. NeetCode publishes a free mirror
    // for each, which is the only link I can actually open.
    const freeUrl =
      entry.premium === true ? asString(entry.freeLink, "freeLink", title) : null;
    if (freeUrl !== null && !freeUrl.startsWith("https://")) {
      fail(`${title}: free mirror ${quote(freeUrl)} is not https`);
    }

    return { slug, title, pattern, difficulty, blind75: entry.blind75 === true, video, code, freeUrl };
  });

  // Group into NeetCode's pattern order, keeping their order within each group.
  const ordered = PATTERNS.flatMap((pattern) =>
    rows.filter((row) => row.pattern === pattern),
  );
  if (ordered.length !== rows.length) {
    fail("a problem fell outside the declared pattern order");
  }

  const body = ordered
    .map((row) =>
      [
        "  {",
        `    slug: ${quote(row.slug)},`,
        `    title: ${quote(row.title)},`,
        `    pattern: ${quote(row.pattern)},`,
        `    difficulty: ${quote(row.difficulty)},`,
        `    blind75: ${row.blind75},`,
        `    video: ${quote(row.video)},`,
        `    solutionPath: ${quote(row.code)},`,
        `    freeUrl: ${row.freeUrl === null ? "null" : quote(row.freeUrl)},`,
        "  },",
      ].join("\n"),
    )
    .join("\n");

  const file = `import type { Problem } from "@/lib/types";

/**
 * The NeetCode 150, grouped into NeetCode's eighteen patterns and kept in their
 * order within each group.
 *
 * GENERATED by scripts/sync-problems.ts - do not edit by hand.
 * Source: ${SOURCE}
 * Regenerate with: npm run sync:problems
 *
 * Slugs, video ids and difficulties are NeetCode's published data, so the links
 * this app builds are theirs rather than mine.
 */
export const problems: Problem[] = [
${body}
];

export const problemBySlug = new Map(problems.map((p) => [p.slug, p]));
`;

  writeFileSync(OUT, file, "utf8");
  console.log(
    `sync-problems: wrote ${ordered.length} problems (${blind.length} Blind 75, ` +
      `${ordered.filter((r) => r.freeUrl !== null).length} premium) to src/data/problems.ts`,
  );
};

void main();
