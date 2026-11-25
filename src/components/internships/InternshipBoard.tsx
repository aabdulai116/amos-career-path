"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { ListingRow } from "@/components/internships/ListingRow";
import { StatTile } from "@/components/dashboard/StatTile";
import {
  FEED_PATH,
  STAGE_LABEL,
  STAGE_ORDER,
  allCategories,
  companyVerdict,
  emptyFilters,
  filterInternships,
  internshipStats,
  isNew,
  parseFeed,
  type InternshipFilters,
} from "@/lib/internships";
import type { ApplicationStage, InternshipFeed } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";

const PAGE_SIZE = 50;

const WINDOWS: { days: number; label: string }[] = [
  { days: 0, label: "Any time" },
  { days: 7, label: "Past week" },
  { days: 30, label: "Past month" },
  { days: 90, label: "Past 3 months" },
];

export function InternshipBoard() {
  const ready = useHydrateProgress();
  const verdicts = useProgress((s) => s.companies);
  const applications = useProgress((s) => s.applications);
  const seenAt = useProgress((s) => s.settings.internshipsSeenAt);
  const setCompanyVerdict = useProgress((s) => s.setCompanyVerdict);
  const clearCompanyVerdict = useProgress((s) => s.clearCompanyVerdict);
  const setApplicationStage = useProgress((s) => s.setApplicationStage);
  const setApplicationNotes = useProgress((s) => s.setApplicationNotes);
  const markInternshipsSeen = useProgress((s) => s.markInternshipsSeen);

  const [feed, setFeed] = useState<InternshipFeed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InternshipFilters>(emptyFilters);
  const [limit, setLimit] = useState(PAGE_SIZE);

  // The "new since" count has to be read against the previous visit, so the
  // timestamp is captured on mount and only written back when leaving.
  const [visitStartedAt] = useState(() => seenAt);

  useEffect(() => {
    let cancelled = false;
    fetch(FEED_PATH)
      .then((response) => {
        if (!response.ok) throw new Error(`the feed returned ${response.status}`);
        return response.json();
      })
      .then((raw: unknown) => {
        if (cancelled) return;
        const parsed = parseFeed(raw);
        if (parsed.ok) setFeed(parsed.feed);
        else setError(parsed.error);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(String(cause));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Stamp the visit on the way out, so this session still sees its own "new".
  useEffect(() => {
    if (!ready) return;
    return () => markInternshipsSeen();
  }, [ready, markInternshipsSeen]);

  const listings = useMemo(() => feed?.listings ?? [], [feed]);

  const shown = useMemo(
    () => filterInternships(listings, filters, verdicts, applications),
    [listings, filters, verdicts, applications],
  );

  const stats = useMemo(
    () =>
      internshipStats(listings, shown, verdicts, applications, visitStartedAt),
    [listings, shown, verdicts, applications, visitStartedAt],
  );

  const categories = useMemo(() => allCategories(listings), [listings]);

  const set = <K extends keyof InternshipFilters>(
    key: K,
    value: InternshipFilters[K],
  ): void => {
    setFilters((current) => ({ ...current, [key]: value }));
    setLimit(PAGE_SIZE);
  };

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-5 py-6">
      <header>
        <p className="font-mono text-[11px] tracking-widest text-[var(--muted)] uppercase">
          {feed?.season ?? "Internships"} · via SimplifyJobs
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">Internships</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Software, quant and AI roles, filtered for someone who will be working
          on CPT. A Python worker pulls the feed, drops the employers where
          citizenship is non-negotiable, and is honest that for almost everything
          else nobody has said — so those stay in the list rather than being
          quietly hidden.
        </p>
      </header>

      {error !== null && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-[#dd4f7d] bg-[var(--surface)] p-4 text-sm text-[#dd4f7d]"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          Could not load the listings: {error}. Run{" "}
          <code className="font-mono">python3 worker/ingest.py</code> to
          regenerate the file.
        </p>
      )}

      {feed === null && error === null && (
        <p className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading the listings…
        </p>
      )}

      {feed !== null && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              label="Worth your time"
              value={String(stats.total - stats.blocked)}
              sub={`of ${stats.total} in the feed`}
              accent="var(--chart-series)"
              icon={<Briefcase className="size-3.5" aria-hidden />}
            />
            <StatTile
              label="New since last visit"
              value={ready ? String(stats.newSinceLastVisit) : "—"}
              sub={
                visitStartedAt === null
                  ? "first visit — everything is new"
                  : "posted since you last looked"
              }
              icon={<Sparkles className="size-3.5" aria-hidden />}
            />
            <StatTile
              label="Ruled out"
              value={String(stats.blocked)}
              sub="citizenship or a clearance"
            />
            <StatTile
              label="Applied"
              value={ready ? String(stats.applied) : "—"}
              sub={`${stats.byStage.find((s) => s.stage === "saved")?.total ?? 0} saved`}
              icon={<Send className="size-3.5" aria-hidden />}
            />
          </div>

          <section className="rounded-xl border border-[#ad7510] bg-[var(--surface)] p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle className="size-4 text-[#ad7510]" aria-hidden />
              What the data can and cannot tell you
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
              The feed carries a sponsorship field, and it is filled in for{" "}
              <span className="text-[var(--foreground)]">
                fourteen of its five thousand active listings
              </span>
              . Not one title mentions a clearance. So the worker rules out the
              employers where citizenship is effectively a precondition —
              defence primes, national labs, ITAR hardware — and marks{" "}
              <span className="text-[var(--foreground)]">
                {stats.unverified.toLocaleString()}
              </span>{" "}
              roles unverified rather than guessing. Unverified is not a no. When
              you find out, record it on the company and every future posting
              from them inherits it.
            </p>
          </section>

          <section className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={filters.hideBlocked}
                  onChange={(event) => set("hideBlocked", event.target.checked)}
                  className="size-3.5 accent-[var(--accent)]"
                />
                Hide roles needing citizenship
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <input
                  type="checkbox"
                  checked={filters.bachelorsOnly}
                  onChange={(event) =>
                    set("bachelorsOnly", event.target.checked)
                  }
                  className="size-3.5 accent-[var(--accent)]"
                />
                Open to a bachelor&rsquo;s
              </label>

              <label className="sr-only" htmlFor="listing-search">
                Search listings
              </label>
              <input
                id="listing-search"
                type="search"
                value={filters.query}
                onChange={(event) => set("query", event.target.value)}
                placeholder="Company, title or city"
                className="ml-auto w-52 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] tracking-wider text-[var(--muted)] uppercase">
                Posted
              </span>
              {WINDOWS.map((window) => (
                <button
                  key={window.days}
                  type="button"
                  aria-pressed={filters.postedWithin === window.days}
                  onClick={() => set("postedWithin", window.days)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    filters.postedWithin === window.days
                      ? "border-transparent bg-[var(--accent)] text-[#0a0d12]"
                      : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {window.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] tracking-wider text-[var(--muted)] uppercase">
                Field
              </span>
              {categories.map((category) => {
                const active = filters.categories.includes(category);
                const count =
                  stats.byCategory.find((c) => c.category === category)?.total ??
                  0;
                return (
                  <button
                    key={category}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      set("categories", toggle(filters.categories, category))
                    }
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      active
                        ? "border-transparent bg-[var(--accent)] text-[#0a0d12]"
                        : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {category}
                    <span className="ml-1.5 font-mono text-[10px] opacity-70">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-[11px] tracking-wider text-[var(--muted)] uppercase">
                Mine
              </span>
              {STAGE_ORDER.map((stage: ApplicationStage) => {
                const active = filters.stages.includes(stage);
                const count =
                  stats.byStage.find((s) => s.stage === stage)?.total ?? 0;
                return (
                  <button
                    key={stage}
                    type="button"
                    aria-pressed={active}
                    onClick={() => set("stages", toggle(filters.stages, stage))}
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      active
                        ? "border-transparent bg-[var(--accent)] text-[#0a0d12]"
                        : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {STAGE_LABEL[stage]}
                    <span className="ml-1.5 font-mono text-[10px] opacity-70">
                      {ready ? count : 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <p className="font-mono text-[11px] text-[var(--muted)]">
            {stats.shown.toLocaleString()} shown
            {feed.generatedAt > 0 && (
              <span className="ml-2 inline-flex items-center gap-1">
                <RefreshCw className="size-3" aria-hidden />
                feed built{" "}
                {new Date(feed.generatedAt * 1000).toLocaleDateString()}
              </span>
            )}
          </p>

          {shown.length === 0 ? (
            <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
              Nothing matches those filters.
            </p>
          ) : (
            <>
              <ul className="space-y-1.5">
                {shown.slice(0, limit).map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    verdicts={verdicts}
                    application={applications[listing.id]}
                    reasons={feed.reasons}
                    isNew={ready && isNew(listing, visitStartedAt)}
                    onStage={(stage) => setApplicationStage(listing.id, stage)}
                    onNotes={(notes) => setApplicationNotes(listing.id, notes)}
                    onVerdict={(cpt) => setCompanyVerdict(listing.company, cpt)}
                    onClearVerdict={() => clearCompanyVerdict(listing.company)}
                    onVerdictNote={(note) =>
                      // Keyed by the normalised name, so the lookup has to go
                      // through the same helper the writer uses.
                      setCompanyVerdict(
                        listing.company,
                        companyVerdict(listing, verdicts)?.cpt ?? "unsure",
                        note,
                      )
                    }
                  />
                ))}
              </ul>
              {shown.length > limit && (
                <button
                  type="button"
                  onClick={() => setLimit((n) => n + PAGE_SIZE)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Show {Math.min(PAGE_SIZE, shown.length - limit)} more ·{" "}
                  {(shown.length - limit).toLocaleString()} left
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
