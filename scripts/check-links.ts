/**
 * Verifies every URL in src/data/resources.ts and src/data/opportunities.ts.
 *
 *   npm run check:links
 *
 * YouTube videos and playlists are checked through the public oEmbed endpoint,
 * because a plain request to youtube.com answers 200 even for a deleted video.
 * oEmbed is not the whole story though: it answers 401 when the owner has merely
 * turned off embedding, and those videos are still perfectly watchable. So a
 * non-200 from oEmbed falls back to fetching the page and reading YouTube's own
 * playabilityStatus, which does distinguish "cannot embed" from "gone".
 * YouTube channel URLs have no oEmbed record at all and go straight to a GET.
 * Everything else gets a HEAD, then a GET if the server dislikes HEAD.
 *
 * Nothing is edited or removed automatically: the script prints a table and exits
 * non-zero so a dead link is a decision I make, not a silent deletion.
 */

import { opportunities } from "../src/data/opportunities";
import { resources, uniqueResourceLinks } from "../src/data/resources";
import { skillById } from "../src/data/skills";

const TIMEOUT_MS = 20_000;
const CONCURRENCY = 6;
/** Generic client name; no personal details go out with these requests. */
const USER_AGENT = "career-compass-link-checker/1.0";

type Verdict = "ok" | "warn" | "dead";

interface Check {
  url: string;
  title: string;
  creator: string;
  verdict: Verdict;
  method: string;
  status: string;
  note: string;
}

const isYouTube = (url: string): boolean => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com";
  } catch {
    return false;
  }
};

/** Channel and user pages have no oEmbed record, only videos and playlists do. */
const isYouTubeChannel = (url: string): boolean => {
  try {
    const { pathname } = new URL(url);
    return (
      pathname.startsWith("/@") ||
      pathname.startsWith("/channel/") ||
      pathname.startsWith("/c/") ||
      pathname.startsWith("/user/")
    );
  } catch {
    return false;
  }
};

const fetchWithTimeout = async (
  url: string,
  init: RequestInit,
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: "follow",
      headers: { "user-agent": USER_AGENT, ...(init.headers ?? {}) },
    });
  } finally {
    clearTimeout(timer);
  }
};

const checkOEmbed = async (url: string): Promise<Omit<Check, "url" | "title" | "creator">> => {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  try {
    const response = await fetchWithTimeout(endpoint, { method: "GET" });
    if (response.ok) {
      const body: unknown = await response.json();
      const actualTitle =
        typeof body === "object" && body !== null && "title" in body
          ? String((body as { title: unknown }).title)
          : "";
      return {
        verdict: "ok",
        method: "oembed",
        status: String(response.status),
        note: actualTitle,
      };
    }
    return youTubePageFallback(url, response.status);
  } catch (error) {
    return {
      verdict: "dead",
      method: "oembed",
      status: "error",
      note: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Second opinion for a YouTube link oEmbed refused. Reads the watch page and
 * trusts YouTube's own playabilityStatus; for a playlist, a missing list is a
 * real 404, so the status code is enough.
 */
const youTubePageFallback = async (
  url: string,
  oembedStatus: number,
): Promise<Omit<Check, "url" | "title" | "creator">> => {
  const method = `oembed+GET`;
  try {
    const response = await fetchWithTimeout(url, { method: "GET" });
    if (!response.ok) {
      return {
        verdict: "dead",
        method,
        status: String(response.status),
        note: `oEmbed ${oembedStatus}, page ${response.status}: gone`,
      };
    }
    const body = await response.text();
    const playability = /"playabilityStatus":\{"status":"([A-Z_]+)"/.exec(body);
    if (playability !== null) {
      if (playability[1] === "OK") {
        return {
          verdict: "ok",
          method,
          status: "200",
          note: `embedding disabled (oEmbed ${oembedStatus}); video plays on YouTube`,
        };
      }
      // LOGIN_REQUIRED and AGE_VERIFICATION_REQUIRED mean "this network is
      // being asked to sign in", not "this video is gone". YouTube serves
      // that wall to datacenter IPs, so every CI run saw it and the job
      // failed on links that are demonstrably fine from a browser. A check
      // that always fails is a check people learn to ignore, so it is
      // reported as needing a human rather than as dead.
      const needsAHuman =
        playability[1] === "LOGIN_REQUIRED" ||
        playability[1] === "AGE_VERIFICATION_REQUIRED";
      return {
        verdict: needsAHuman ? "warn" : "dead",
        method,
        status: "200",
        note: needsAHuman
          ? `${playability[1]} - YouTube is gating this network, not the video; open it yourself`
          : `playabilityStatus ${playability[1]}`,
      };
    }
    if (url.includes("/playlist?") && body.includes('"playlistId"')) {
      return {
        verdict: "ok",
        method,
        status: "200",
        note: `embedding disabled (oEmbed ${oembedStatus}); playlist exists`,
      };
    }
    return {
      verdict: "warn",
      method,
      status: "200",
      note: `oEmbed ${oembedStatus} and the page gave no clear answer; open it yourself`,
    };
  } catch (error) {
    return {
      verdict: "dead",
      method,
      status: "error",
      note: error instanceof Error ? error.message : String(error),
    };
  }
};

const checkPlain = async (url: string): Promise<Omit<Check, "url" | "title" | "creator">> => {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const response = await fetchWithTimeout(url, { method });
      if (response.ok) {
        return { verdict: "ok", method, status: String(response.status), note: "" };
      }
      // Plenty of servers refuse HEAD; retry with GET before calling it dead.
      if (method === "HEAD") continue;
      return {
        verdict: response.status === 403 || response.status === 429 ? "warn" : "dead",
        method,
        status: String(response.status),
        note:
          response.status === 403 || response.status === 429
            ? "blocked automated requests; open it in a browser to confirm"
            : response.statusText,
      };
    } catch (error) {
      if (method === "HEAD") continue;
      return {
        verdict: "dead",
        method,
        status: "error",
        note: error instanceof Error ? error.message : String(error),
      };
    }
  }
  return { verdict: "dead", method: "GET", status: "error", note: "unreachable" };
};

const checkOne = async (link: {
  url: string;
  title: string;
  creator: string;
}): Promise<Check> => {
  const result =
    isYouTube(link.url) && !isYouTubeChannel(link.url)
      ? await checkOEmbed(link.url)
      : await checkPlain(link.url);
  return { ...link, ...result };
};

const inBatches = async <T, R>(
  items: T[],
  size: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> => {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(worker))));
  }
  return out;
};

const truncate = (value: string, width: number): string =>
  value.length <= width ? value : `${value.slice(0, width - 1)}…`;

const printTable = (rows: Check[]): void => {
  const columns: [string, number, (c: Check) => string][] = [
    ["", 2, (c) => (c.verdict === "ok" ? "ok" : c.verdict === "warn" ? "!!" : "XX")],
    ["STATUS", 6, (c) => c.status],
    ["VIA", 6, (c) => c.method],
    ["TITLE", 46, (c) => c.title],
    ["URL", 62, (c) => c.url],
    ["NOTE", 40, (c) => c.note],
  ];
  const line = (cells: string[]): string =>
    cells.map((cell, i) => truncate(cell, columns[i][1]).padEnd(columns[i][1])).join("  ");
  console.log(line(columns.map((c) => c[0])));
  console.log(line(columns.map((c) => "-".repeat(Math.min(c[1], 8)))));
  for (const row of rows) console.log(line(columns.map(([, , get]) => get(row))));
};

const main = async (): Promise<void> => {
  // Opportunities are checked alongside resources: they are hand-curated
  // links to other people's pages, which is exactly the thing that rots.
  const links = [
    ...uniqueResourceLinks.map((r) => ({
      url: r.url,
      title: r.title,
      creator: r.creator,
    })),
    ...opportunities.map((o) => ({
      url: o.url,
      title: o.name,
      creator: o.organisation,
    })),
  ];

  console.log(
    `Checking ${links.length} links: ${uniqueResourceLinks.length} resources, ` +
      `${opportunities.length} opportunities…\n`,
  );

  const results = await inBatches(links, CONCURRENCY, checkOne);
  const order: Record<Verdict, number> = { dead: 0, warn: 1, ok: 2 };
  results.sort((a, b) => order[a.verdict] - order[b.verdict] || a.title.localeCompare(b.title));

  printTable(results);

  const dead = results.filter((r) => r.verdict === "dead");
  const warn = results.filter((r) => r.verdict === "warn");

  console.log(
    `\n${results.length - dead.length - warn.length} ok, ${warn.length} needs a human, ${dead.length} dead`,
  );

  if (warn.length > 0) {
    console.log("\nNeeds a human (the site blocks automated requests):");
    for (const r of warn) console.log(`  ${r.url}`);
  }

  if (dead.length > 0) {
    console.log("\nDead links, and the skills that reference them:");
    for (const r of dead) {
      const owners = resources
        .filter((entry) => entry.url === r.url)
        .map((entry) => skillById[entry.skillId]?.name ?? entry.skillId);
      console.log(`  ${r.url}`);
      console.log(`      ${r.title} - ${r.creator}`);
      console.log(`      status ${r.status} via ${r.method}: ${r.note}`);
      console.log(`      referenced by: ${[...new Set(owners)].join(", ")}`);
    }
    process.exitCode = 1;
  }
};

void main();
