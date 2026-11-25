import type {
  ApplicationProgress,
  ApplicationStage,
  AuthStatus,
  CompanyVerdict,
  CptVerdict,
  Internship,
  InternshipFeed,
} from "@/lib/types";

export const FEED_PATH = "/data/internships.json";

export type CompanyVerdictMap = Record<string, CompanyVerdict | undefined>;
export type ApplicationMap = Record<string, ApplicationProgress | undefined>;

/**
 * The same normalisation as worker/companies.py, so a verdict I record here
 * matches the employer the worker decided about. A test pins the two together
 * on the cases that actually differ.
 */
const SUFFIXES = new Set([
  "corporation", "corp", "incorporated", "inc", "llc", "ltd", "limited",
  "plc", "company", "co", "group", "holdings", "technologies", "technology",
  "labs", "laboratories", "laboratory", "systems", "industries", "solutions",
  "international", "usa", "us", "na",
]);

export const normaliseCompany = (name: string): string => {
  const words = name
    .toLowerCase()
    .replace(/[^a-z0-9& ]+/g, " ")
    .split(" ")
    .filter((w) => w !== "");
  while (words.length > 1 && SUFFIXES.has(words[words.length - 1])) {
    words.pop();
  }
  return words.join(" ");
};

/* ------------------------------------------------------------- the feed */

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

const STATUSES: AuthStatus[] = [
  "blocked",
  "no_sponsorship",
  "sponsors",
  "unknown",
];

/**
 * Validate the generated file on arrival rather than trusting it. It is
 * written by a separate program in a different language, from a feed a few
 * hundred strangers can edit; a bad record should be dropped, not rendered.
 */
export const parseFeed = (
  raw: unknown,
): { ok: true; feed: InternshipFeed } | { ok: false; error: string } => {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "The internships file is not a JSON object." };
  }
  const value = raw as Partial<InternshipFeed>;
  if (value.version !== 1) {
    return {
      ok: false,
      error: `Unsupported internships file version: ${String(value.version)}.`,
    };
  }
  if (!Array.isArray(value.listings)) {
    return { ok: false, error: "The internships file has no listings array." };
  }

  const reasons =
    typeof value.reasons === "object" && value.reasons !== null
      ? (value.reasons as Record<string, string>)
      : {};

  const listings: Internship[] = [];
  value.listings.forEach((entry: unknown) => {
    if (typeof entry !== "object" || entry === null) return;
    const row = entry as Partial<Internship>;
    if (
      typeof row.id !== "string" ||
      typeof row.company !== "string" ||
      typeof row.title !== "string" ||
      typeof row.url !== "string" ||
      typeof row.category !== "string"
    ) {
      return;
    }
    // The url goes straight into an href, so a scheme check belongs here as
    // well as in the worker. Two cheap checks beat one clever one.
    if (!/^https?:\/\//.test(row.url)) return;
    if (!STATUSES.includes(row.status as AuthStatus)) return;

    listings.push({
      id: row.id,
      company: row.company,
      title: row.title,
      url: row.url,
      category: row.category,
      locations: isStringArray(row.locations) ? row.locations : [],
      degrees: isStringArray(row.degrees) ? row.degrees : [],
      terms: isStringArray(row.terms) ? row.terms : [],
      posted: typeof row.posted === "number" ? row.posted : 0,
      status: row.status as AuthStatus,
      evidence:
        row.evidence === "feed" || row.evidence === "company"
          ? row.evidence
          : "none",
      reason: typeof row.reason === "string" ? row.reason : "none",
      openings: typeof row.openings === "number" && row.openings > 1
        ? row.openings
        : 1,
      more: isStringArray(row.more)
        ? row.more.filter((u) => /^https?:\/\//.test(u))
        : [],
    });
  });

  return {
    ok: true,
    feed: {
      version: 1,
      generatedAt:
        typeof value.generatedAt === "number" ? value.generatedAt : 0,
      season: typeof value.season === "string" ? value.season : "Unknown",
      source: typeof value.source === "string" ? value.source : "",
      reasons,
      listings,
    },
  };
};

/* --------------------------------------------------------- my own verdict */

/**
 * What to show for a listing once my own finding about the employer is taken
 * into account. Mine always wins: I will have read the actual posting or asked
 * a recruiter, and the generated rule is a generalisation about the company.
 */
export interface EffectiveStatus {
  status: AuthStatus;
  /** True when this came from a verdict I recorded, not from the data. */
  mine: boolean;
}

export const effectiveStatus = (
  listing: Internship,
  verdicts: CompanyVerdictMap,
): EffectiveStatus => {
  const verdict = verdicts[normaliseCompany(listing.company)];
  if (verdict === undefined || verdict.cpt === "unsure") {
    return { status: listing.status, mine: false };
  }
  return {
    status: verdict.cpt === "ok" ? "sponsors" : "blocked",
    mine: true,
  };
};

export const companyVerdict = (
  listing: Internship,
  verdicts: CompanyVerdictMap,
): CompanyVerdict | undefined => verdicts[normaliseCompany(listing.company)];

/** Everything except a hard block. Unverified listings stay in. */
export const worthApplying = (
  listing: Internship,
  verdicts: CompanyVerdictMap,
): boolean => effectiveStatus(listing, verdicts).status !== "blocked";

/* ------------------------------------------------------------- presenting */

export const STATUS_LABEL: Record<AuthStatus, string> = {
  blocked: "Needs citizenship",
  no_sponsorship: "No sponsorship",
  sponsors: "Sponsors",
  unknown: "Unverified",
};

/**
 * Status is a four-level state, not a ranking, so it gets the status palette:
 * a hard block in red, an amber caveat, a green yes, and grey for silence.
 * Validated against the dark surface; the label is always rendered with it.
 */
export const STATUS_COLOR: Record<AuthStatus, string> = {
  blocked: "#dd4f7d",
  no_sponsorship: "#ad7510",
  sponsors: "#35a56b",
  unknown: "var(--muted)",
};

export const STAGE_ORDER: ApplicationStage[] = [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
];

export const STAGE_LABEL: Record<ApplicationStage, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

export const daysSince = (posted: number, now: number = Date.now()): number => {
  if (posted <= 0) return 0;
  return Math.max(0, Math.floor((now / 1000 - posted) / 86_400));
};

export const formatPosted = (posted: number, now: number = Date.now()): string => {
  if (posted <= 0) return "undated";
  const days = daysSince(posted, now);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1mo ago" : `${months}mo ago`;
};

/** Posted since I last opened the page. No backend, and good enough. */
export const isNew = (listing: Internship, seenAt: string | null): boolean => {
  if (seenAt === null || listing.posted <= 0) return false;
  const seen = new Date(seenAt).getTime();
  if (Number.isNaN(seen)) return false;
  return listing.posted * 1000 > seen;
};

/* --------------------------------------------------------------- filtering */

export interface InternshipFilters {
  categories: string[];
  /** Matched against company, title and location. */
  query: string;
  /** Hide the roles a hard block rules out. */
  hideBlocked: boolean;
  /** Only roles posted within this many days; 0 means no limit. */
  postedWithin: number;
  /** Only roles I have moved into one of these stages. */
  stages: ApplicationStage[];
  /** Only roles that take a bachelor's. */
  bachelorsOnly: boolean;
}

export const emptyFilters: InternshipFilters = {
  categories: [],
  query: "",
  hideBlocked: true,
  postedWithin: 0,
  stages: [],
  bachelorsOnly: false,
};

export const filterInternships = (
  listings: Internship[],
  filters: InternshipFilters,
  verdicts: CompanyVerdictMap,
  applications: ApplicationMap,
  now: number = Date.now(),
): Internship[] => {
  const query = filters.query.trim().toLowerCase();

  return listings.filter((listing) => {
    if (filters.hideBlocked && !worthApplying(listing, verdicts)) return false;
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(listing.category)
    ) {
      return false;
    }
    if (filters.bachelorsOnly && listing.degrees.length > 0) {
      // No degrees listed means unstated, which is not the same as excluded.
      if (!listing.degrees.some((d) => d.toLowerCase().startsWith("bachelor"))) {
        return false;
      }
    }
    if (filters.postedWithin > 0) {
      if (listing.posted <= 0) return false;
      if (daysSince(listing.posted, now) > filters.postedWithin) return false;
    }
    if (filters.stages.length > 0) {
      const stage = applications[listing.id]?.stage;
      if (stage === undefined || !filters.stages.includes(stage)) return false;
    }
    if (query !== "") {
      const haystack = [
        listing.company,
        listing.title,
        ...listing.locations,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
};

/* ------------------------------------------------------------------ stats */

export interface InternshipStats {
  total: number;
  shown: number;
  blocked: number;
  unverified: number;
  newSinceLastVisit: number;
  applied: number;
  byCategory: { category: string; total: number }[];
  byStage: { stage: ApplicationStage; total: number }[];
}

export const internshipStats = (
  listings: Internship[],
  shown: Internship[],
  verdicts: CompanyVerdictMap,
  applications: ApplicationMap,
  seenAt: string | null,
): InternshipStats => {
  const categories = new Map<string, number>();
  listings.forEach((listing) => {
    categories.set(listing.category, (categories.get(listing.category) ?? 0) + 1);
  });

  const stageCount = (stage: ApplicationStage): number =>
    listings.filter((l) => applications[l.id]?.stage === stage).length;

  return {
    total: listings.length,
    shown: shown.length,
    blocked: listings.filter((l) => !worthApplying(l, verdicts)).length,
    unverified: listings.filter(
      (l) => effectiveStatus(l, verdicts).status === "unknown",
    ).length,
    newSinceLastVisit: listings.filter((l) => isNew(l, seenAt)).length,
    applied: listings.filter((l) => {
      const stage = applications[l.id]?.stage;
      return stage !== undefined && stage !== "saved";
    }).length,
    byCategory: [...categories.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total),
    byStage: STAGE_ORDER.map((stage) => ({ stage, total: stageCount(stage) })),
  };
};

export const allCategories = (listings: Internship[]): string[] =>
  [...new Set(listings.map((l) => l.category))].sort();

export const verdictFor = (
  cpt: CptVerdict,
): { label: string; color: string } => {
  if (cpt === "ok") return { label: "Takes CPT", color: "#35a56b" };
  if (cpt === "no") return { label: "No CPT", color: "#dd4f7d" };
  return { label: "Still checking", color: "#ad7510" };
};
