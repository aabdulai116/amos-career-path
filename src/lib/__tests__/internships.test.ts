import { describe, expect, it } from "vitest";
import {
  STAGE_ORDER,
  STATUS_COLOR,
  STATUS_LABEL,
  allCategories,
  companyVerdict,
  daysSince,
  effectiveStatus,
  emptyFilters,
  filterInternships,
  formatPosted,
  internshipStats,
  isNew,
  normaliseCompany,
  parseFeed,
  verdictFor,
  worthApplying,
  type ApplicationMap,
  type CompanyVerdictMap,
} from "@/lib/internships";
import type { AuthStatus, CompanyVerdict, Internship } from "@/lib/types";

const NOW = Date.UTC(2026, 10, 25); // 2026-11-25
const sec = (iso: string): number => Math.floor(Date.parse(iso) / 1000);

const listing = (over: Partial<Internship> = {}): Internship => ({
  id: "1",
  company: "Stripe",
  title: "Software Engineer Intern",
  url: "https://example.com/job",
  category: "Software",
  locations: ["NYC"],
  degrees: ["Bachelor's"],
  terms: ["Summer 2027"],
  posted: sec("2026-11-20T00:00:00Z"),
  status: "unknown",
  evidence: "none",
  reason: "none",
  openings: 1,
  more: [],
  ...over,
});

const verdict = (over: Partial<CompanyVerdict> = {}): CompanyVerdict => ({
  cpt: "ok",
  note: "",
  updatedAt: "2026-11-01T00:00:00.000Z",
  ...over,
});

/* ------------------------------------------------- the shared normaliser */

describe("normaliseCompany", () => {
  // These exact answers were produced by worker/companies.py. The two
  // implementations have to agree or a verdict recorded in the app would not
  // match the employer the worker decided about.
  const fromPython: Record<string, string> = {
    "L3Harris Technologies": "l3harris",
    "RTX Corporation": "rtx",
    "Anduril Industries": "anduril",
    "Rocket Lab USA": "rocket lab",
    "Booz Allen Hamilton": "booz allen hamilton",
    "General  Dynamics": "general dynamics",
    Mosaic: "mosaic",
    RosaicLabs: "rosaiclabs",
    "Jane Street": "jane street",
    "Systems Inc": "systems",
    SAIC: "saic",
    "The MITRE Corporation": "the mitre",
    "AT&T": "at&t",
    "Two Six Technologies": "two six",
    "Johns Hopkins APL": "johns hopkins apl",
    "  Stripe  ": "stripe",
    "Pay-Pal Holdings, Inc.": "pay pal",
  };

  it("agrees with the Python worker on every case", () => {
    Object.entries(fromPython).forEach(([input, expected]) => {
      expect(normaliseCompany(input), input).toBe(expected);
    });
  });

  it("never strips a name to nothing", () => {
    expect(normaliseCompany("Systems Inc")).not.toBe("");
    expect(normaliseCompany("Inc")).toBe("inc");
  });
});

/* --------------------------------------------------------------- parsing */

describe("parseFeed", () => {
  const good = {
    version: 1,
    generatedAt: 123,
    season: "Summer 2027",
    source: "https://example.com",
    reasons: { none: "Nobody said." },
    listings: [listing()],
  };

  it("accepts a well-formed feed", () => {
    const result = parseFeed(good);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.feed.listings).toHaveLength(1);
  });

  it("rejects a file that is not an object", () => {
    expect(parseFeed("nope").ok).toBe(false);
    expect(parseFeed(null).ok).toBe(false);
  });

  it("rejects an unknown version rather than guessing", () => {
    const result = parseFeed({ ...good, version: 2 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("version");
  });

  it("rejects a feed with no listings array", () => {
    expect(parseFeed({ ...good, listings: "x" }).ok).toBe(false);
  });

  it("drops a record missing what a link needs, keeping the rest", () => {
    const result = parseFeed({
      ...good,
      listings: [listing(), { id: "2" }, listing({ id: "3", url: "" })],
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.feed.listings.map((l) => l.id)).toEqual(["1"]);
  });

  it("drops a url that is not http, because it becomes an href", () => {
    const result = parseFeed({
      ...good,
      listings: [listing({ url: "javascript:alert(1)" })],
    });
    if (result.ok) expect(result.feed.listings).toEqual([]);
  });

  it("drops a record with an unrecognised status", () => {
    const result = parseFeed({
      ...good,
      listings: [listing({ status: "maybe" as AuthStatus })],
    });
    if (result.ok) expect(result.feed.listings).toEqual([]);
  });

  it("folds grouped requisitions in, dropping any unsafe extra link", () => {
    const result = parseFeed({
      ...good,
      listings: [
        {
          ...listing(),
          openings: 3,
          more: ["https://a.example", "javascript:alert(1)"],
        },
      ],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.feed.listings[0].openings).toBe(3);
      expect(result.feed.listings[0].more).toEqual(["https://a.example"]);
    }
  });

  it("defaults a lone listing to one opening", () => {
    const result = parseFeed({
      ...good,
      listings: [{ ...listing(), openings: undefined, more: undefined }],
    });
    if (result.ok) {
      expect(result.feed.listings[0].openings).toBe(1);
      expect(result.feed.listings[0].more).toEqual([]);
    }
  });

  it("repairs soft fields rather than dropping the record", () => {
    const result = parseFeed({
      ...good,
      listings: [
        { ...listing(), locations: "NYC", degrees: null, posted: "soon" },
      ],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const [row] = result.feed.listings;
      expect(row.locations).toEqual([]);
      expect(row.degrees).toEqual([]);
      expect(row.posted).toBe(0);
    }
  });
});

/* ------------------------------------------------------- my own verdicts */

describe("effectiveStatus", () => {
  it("uses the generated status when I have said nothing", () => {
    const result = effectiveStatus(listing({ status: "blocked" }), {});
    expect(result).toEqual({ status: "blocked", mine: false });
  });

  it("lets my yes override a generated block", () => {
    const verdicts: CompanyVerdictMap = { stripe: verdict({ cpt: "ok" }) };
    const result = effectiveStatus(
      listing({ company: "Stripe", status: "blocked" }),
      verdicts,
    );
    expect(result).toEqual({ status: "sponsors", mine: true });
  });

  it("lets my no override a generated unknown", () => {
    const verdicts: CompanyVerdictMap = { stripe: verdict({ cpt: "no" }) };
    expect(effectiveStatus(listing(), verdicts).status).toBe("blocked");
  });

  it("treats 'still checking' as no answer at all", () => {
    const verdicts: CompanyVerdictMap = { stripe: verdict({ cpt: "unsure" }) };
    const result = effectiveStatus(listing({ status: "sponsors" }), verdicts);
    expect(result).toEqual({ status: "sponsors", mine: false });
  });

  it("inherits a verdict across every spelling of the company", () => {
    // The point of the whole feature: decide once, applies to future roles.
    const verdicts: CompanyVerdictMap = { "rocket lab": verdict({ cpt: "no" }) };
    ["Rocket Lab", "Rocket Lab USA", "ROCKET LAB, Inc."].forEach((company) => {
      expect(
        effectiveStatus(listing({ company }), verdicts).status,
        company,
      ).toBe("blocked");
    });
  });

  it("finds the stored verdict through the same normalisation", () => {
    const verdicts: CompanyVerdictMap = { "booz allen hamilton": verdict() };
    expect(
      companyVerdict(listing({ company: "Booz Allen Hamilton" }), verdicts),
    ).toBeDefined();
  });
});

describe("worthApplying", () => {
  it("keeps everything except a hard block", () => {
    expect(worthApplying(listing({ status: "unknown" }), {})).toBe(true);
    expect(worthApplying(listing({ status: "no_sponsorship" }), {})).toBe(true);
    expect(worthApplying(listing({ status: "sponsors" }), {})).toBe(true);
    expect(worthApplying(listing({ status: "blocked" }), {})).toBe(false);
  });

  it("respects a verdict of mine over the data", () => {
    const verdicts: CompanyVerdictMap = { stripe: verdict({ cpt: "ok" }) };
    expect(worthApplying(listing({ status: "blocked" }), verdicts)).toBe(true);
  });
});

/* ------------------------------------------------------------------ time */

describe("daysSince and formatPosted", () => {
  it("counts whole days", () => {
    expect(daysSince(sec("2026-11-20T00:00:00Z"), NOW)).toBe(5);
  });

  it("treats an undated listing as zero, not negative", () => {
    expect(daysSince(0, NOW)).toBe(0);
    expect(formatPosted(0, NOW)).toBe("undated");
  });

  it("never goes negative on a future date", () => {
    expect(daysSince(sec("2027-01-01T00:00:00Z"), NOW)).toBe(0);
  });

  it("reads naturally at each scale", () => {
    expect(formatPosted(sec("2026-11-25T01:00:00Z"), NOW)).toBe("today");
    expect(formatPosted(sec("2026-11-24T00:00:00Z"), NOW)).toBe("yesterday");
    expect(formatPosted(sec("2026-11-15T00:00:00Z"), NOW)).toBe("10d ago");
    expect(formatPosted(sec("2026-09-20T00:00:00Z"), NOW)).toBe("2mo ago");
  });
});

describe("isNew", () => {
  it("is false on a first visit, when nothing has been seen yet", () => {
    expect(isNew(listing(), null)).toBe(false);
  });

  it("is true for something posted after the last visit", () => {
    expect(isNew(listing(), "2026-11-01T00:00:00.000Z")).toBe(true);
  });

  it("is false for something posted before it", () => {
    expect(isNew(listing(), "2026-11-24T00:00:00.000Z")).toBe(false);
  });

  it("is false for an undated listing or an unreadable timestamp", () => {
    expect(isNew(listing({ posted: 0 }), "2026-11-01T00:00:00.000Z")).toBe(false);
    expect(isNew(listing(), "not a date")).toBe(false);
  });
});

/* -------------------------------------------------------------- filtering */

describe("filterInternships", () => {
  const rows = [
    listing({ id: "a", company: "Stripe", category: "Software" }),
    listing({ id: "b", company: "Jane Street", category: "Quant" }),
    listing({
      id: "c",
      company: "Lockheed Martin",
      category: "Software",
      status: "blocked",
    }),
    listing({
      id: "d",
      company: "OpenAI",
      category: "AI / ML / Data",
      degrees: ["PhD"],
      posted: sec("2026-05-01T00:00:00Z"),
    }),
  ];
  const ids = (list: Internship[]): string[] => list.map((l) => l.id);

  it("hides blocked roles by default", () => {
    expect(ids(filterInternships(rows, emptyFilters, {}, {}, NOW))).toEqual([
      "a",
      "b",
      "d",
    ]);
  });

  it("can show the blocked ones when asked", () => {
    const result = filterInternships(
      rows,
      { ...emptyFilters, hideBlocked: false },
      {},
      {},
      NOW,
    );
    expect(ids(result)).toContain("c");
  });

  it("hides a role once I rule the company out myself", () => {
    const verdicts: CompanyVerdictMap = { stripe: verdict({ cpt: "no" }) };
    expect(
      ids(filterInternships(rows, emptyFilters, verdicts, {}, NOW)),
    ).not.toContain("a");
  });

  it("filters by category", () => {
    const result = filterInternships(
      rows,
      { ...emptyFilters, categories: ["Quant"] },
      {},
      {},
      NOW,
    );
    expect(ids(result)).toEqual(["b"]);
  });

  it("filters by how recently it was posted", () => {
    const result = filterInternships(
      rows,
      { ...emptyFilters, postedWithin: 30 },
      {},
      {},
      NOW,
    );
    expect(ids(result)).toEqual(["a", "b"]);
  });

  it("drops undated listings from a recency window", () => {
    const result = filterInternships(
      [listing({ id: "x", posted: 0 })],
      { ...emptyFilters, postedWithin: 30 },
      {},
      {},
      NOW,
    );
    expect(result).toEqual([]);
  });

  it("keeps a listing with no stated degree when filtering for a bachelor's", () => {
    // Unstated is not the same as excluded; dropping these loses real jobs.
    const rowsWithBlank = [
      listing({ id: "x", degrees: [] }),
      listing({ id: "y", degrees: ["PhD"] }),
      listing({ id: "z", degrees: ["Bachelor's", "Master's"] }),
    ];
    const result = filterInternships(
      rowsWithBlank,
      { ...emptyFilters, bachelorsOnly: true },
      {},
      {},
      NOW,
    );
    expect(ids(result)).toEqual(["x", "z"]);
  });

  it("searches company, title and location together", () => {
    const byCity = filterInternships(
      rows,
      { ...emptyFilters, query: "nyc" },
      {},
      {},
      NOW,
    );
    expect(byCity.length).toBeGreaterThan(0);
    const byCompany = filterInternships(
      rows,
      { ...emptyFilters, query: "  JANE street " },
      {},
      {},
      NOW,
    );
    expect(ids(byCompany)).toEqual(["b"]);
  });

  it("filters by the stage I have put it in", () => {
    const applications: ApplicationMap = {
      a: { stage: "applied", notes: "", updatedAt: "" },
    };
    const result = filterInternships(
      rows,
      { ...emptyFilters, stages: ["applied"] },
      {},
      applications,
      NOW,
    );
    expect(ids(result)).toEqual(["a"]);
  });
});

/* ----------------------------------------------------------------- stats */

describe("internshipStats", () => {
  const rows = [
    listing({ id: "a" }),
    listing({ id: "b", company: "Lockheed Martin", status: "blocked" }),
    listing({ id: "c", company: "Jane Street", category: "Quant" }),
  ];

  it("counts blocked and unverified separately", () => {
    const stats = internshipStats(rows, rows, {}, {}, null);
    expect(stats.total).toBe(3);
    expect(stats.blocked).toBe(1);
    expect(stats.unverified).toBe(2);
  });

  it("counts a role I ruled out myself as blocked", () => {
    const verdicts: CompanyVerdictMap = { stripe: verdict({ cpt: "no" }) };
    expect(internshipStats(rows, rows, verdicts, {}, null).blocked).toBe(2);
  });

  it("counts applications but not merely saved ones", () => {
    const applications: ApplicationMap = {
      a: { stage: "applied", notes: "", updatedAt: "" },
      c: { stage: "saved", notes: "", updatedAt: "" },
    };
    const stats = internshipStats(rows, rows, {}, applications, null);
    expect(stats.applied).toBe(1);
    expect(stats.byStage.find((s) => s.stage === "saved")?.total).toBe(1);
  });

  it("groups by category, biggest first", () => {
    const stats = internshipStats(rows, rows, {}, {}, null);
    expect(stats.byCategory[0].total).toBeGreaterThanOrEqual(
      stats.byCategory[stats.byCategory.length - 1].total,
    );
  });

  it("counts what is new since the last visit", () => {
    expect(
      internshipStats(rows, rows, {}, {}, "2026-11-01T00:00:00.000Z")
        .newSinceLastVisit,
    ).toBe(3);
    expect(internshipStats(rows, rows, {}, {}, null).newSinceLastVisit).toBe(0);
  });
});

describe("presentation", () => {
  it("has a label and a colour for every status", () => {
    (["blocked", "no_sponsorship", "sponsors", "unknown"] as AuthStatus[]).forEach(
      (status) => {
        expect(STATUS_LABEL[status]).toBeTruthy();
        expect(STATUS_COLOR[status]).toBeTruthy();
      },
    );
  });

  it("describes every verdict I can record", () => {
    (["ok", "no", "unsure"] as const).forEach((cpt) => {
      expect(verdictFor(cpt).label).toBeTruthy();
      expect(verdictFor(cpt).color).toMatch(/^#/);
    });
  });

  it("orders the stages as an application actually progresses", () => {
    expect(STAGE_ORDER.indexOf("saved")).toBeLessThan(
      STAGE_ORDER.indexOf("applied"),
    );
    expect(STAGE_ORDER.indexOf("applied")).toBeLessThan(
      STAGE_ORDER.indexOf("offer"),
    );
  });

  it("lists the categories present, sorted", () => {
    const cats = allCategories([
      listing({ category: "Software" }),
      listing({ category: "Quant" }),
      listing({ category: "Software" }),
    ]);
    expect(cats).toEqual(["Quant", "Software"]);
  });
});
