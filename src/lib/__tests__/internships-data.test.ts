import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { normaliseCompany, parseFeed } from "@/lib/internships";

/**
 * The generated file itself, checked the way the app will read it. A worker in
 * another language writes this from a feed strangers can edit, so "it parsed
 * on my machine once" is not evidence.
 */
const raw: unknown = JSON.parse(
  readFileSync(resolve(process.cwd(), "public/data/internships.json"), "utf8"),
);

const parsed = parseFeed(raw);

describe("the generated internships file", () => {
  it("parses", () => {
    expect(parsed.ok).toBe(true);
  });

  it("is not empty and not absurdly large", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    expect(parsed.feed.listings.length).toBeGreaterThan(500);
    expect(parsed.feed.listings.length).toBeLessThan(20_000);
  });

  it("loses nothing to the validator", () => {
    // If the worker writes a record the app then drops, one of them is wrong.
    if (!parsed.ok) throw new Error(parsed.error);
    const written = (raw as { listings: unknown[] }).listings.length;
    expect(parsed.feed.listings).toHaveLength(written);
  });

  it("gives every listing a web link and a non-empty company", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    parsed.feed.listings.forEach((l) => {
      expect(l.url, l.id).toMatch(/^https?:\/\//);
      expect(l.company.trim(), l.id).not.toBe("");
      expect(l.title.trim(), l.id).not.toBe("");
    });
  });

  it("has almost no unencrypted links, and flags the ones it has", () => {
    // A handful of employers still serve their application form over plain
    // http. Those stay in - hiding a real job is worse - but the row warns,
    // because an application form is where personal details get typed.
    if (!parsed.ok) throw new Error(parsed.error);
    const insecure = parsed.feed.listings.filter((l) =>
      l.url.startsWith("http://"),
    );
    expect(insecure.length / parsed.feed.listings.length).toBeLessThan(0.02);
  });

  it("has unique listing ids", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    const ids = parsed.feed.listings.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves every reason code it uses", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    const codes = new Set(parsed.feed.listings.map((l) => l.reason));
    codes.forEach((code) => {
      expect(parsed.feed.reasons[code], code).toBeTruthy();
    });
  });

  it("only blocks on evidence, never on silence", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    parsed.feed.listings
      .filter((l) => l.status === "blocked")
      .forEach((l) => expect(l.evidence, l.company).not.toBe("none"));
  });

  it("leaves most listings unverified, because that is the truth", () => {
    // The feed states a sponsorship position for a handful of listings. A run
    // that suddenly claims to know about most of them has started guessing.
    if (!parsed.ok) throw new Error(parsed.error);
    const unknown = parsed.feed.listings.filter((l) => l.status === "unknown");
    expect(unknown.length / parsed.feed.listings.length).toBeGreaterThan(0.8);
  });

  it("rules out a real, modest number of employers", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    const blocked = parsed.feed.listings.filter((l) => l.status === "blocked");
    expect(blocked.length).toBeGreaterThan(10);
    // A block hides a job, so over-blocking is the costlier error.
    expect(blocked.length / parsed.feed.listings.length).toBeLessThan(0.15);
  });

  it("never blocks a company that is plainly not a defence employer", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    const blockedNames = new Set(
      parsed.feed.listings
        .filter((l) => l.status === "blocked")
        .map((l) => normaliseCompany(l.company)),
    );
    // "Mosaic" and "RosaicLabs" were caught by a substring match on "SAIC"
    // while this was being written. They must never come back.
    ["mosaic", "rosaiclabs", "stripe", "jane street", "google"].forEach(
      (name) => expect(blockedNames.has(name), name).toBe(false),
    );
  });

  it("only carries the categories the app offers", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    const categories = new Set(parsed.feed.listings.map((l) => l.category));
    expect([...categories].sort()).toEqual([
      "AI / ML / Data",
      "Quant",
      "Software",
    ]);
  });

  it("never shows the same role twice in a row", () => {
    // Before grouping, Bandwidth had seven identical rows and TikTok fourteen.
    // The term is part of the identity: the same job advertised for Summer and
    // for Spring is two different things to apply to.
    if (!parsed.ok) throw new Error(parsed.error);
    const seen = new Set(
      parsed.feed.listings.map((l) =>
        [
          l.company,
          l.title,
          [...l.locations].sort().join("|"),
          [...l.terms].sort().join("|"),
        ]
          .join("::")
          .toLowerCase(),
      ),
    );
    expect(seen.size).toBe(parsed.feed.listings.length);
  });

  it("keeps every requisition it folded in", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    const grouped = parsed.feed.listings.filter((l) => l.openings > 1);
    expect(grouped.length).toBeGreaterThan(0);
    grouped.forEach((l) => {
      expect(l.more, l.company).toHaveLength(l.openings - 1);
      l.more.forEach((url) => expect(url).toMatch(/^https?:\/\//));
    });
  });

  it("is sorted newest first", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    const dates = parsed.feed.listings.map((l) => l.posted);
    expect([...dates]).toEqual([...dates].sort((a, b) => b - a));
  });

  it("names the season and the source it came from", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    expect(parsed.feed.season).toMatch(/\d{4}/);
    expect(parsed.feed.source).toMatch(/^https:\/\//);
    expect(parsed.feed.generatedAt).toBeGreaterThan(0);
  });
});
