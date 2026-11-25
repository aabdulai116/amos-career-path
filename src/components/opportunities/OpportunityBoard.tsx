"use client";

import { useMemo } from "react";
import { CalendarClock, Check, ExternalLink, Star } from "lucide-react";
import { StatTile } from "@/components/dashboard/StatTile";
import { opportunities } from "@/data/opportunities";
import {
  KIND_BLURB,
  KIND_LABEL,
  byKind,
  describeDeadline,
  daysUntil,
  opportunityStats,
  upcoming,
} from "@/lib/opportunities";
import { useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";

export function OpportunityBoard() {
  const ready = useHydrateProgress();
  const progress = useProgress((s) => s.opportunities);
  const setOpportunity = useProgress((s) => s.setOpportunity);

  const view = useMemo(
    () => ({
      stats: opportunityStats(progress),
      soon: upcoming(progress).slice(0, 5),
      groups: byKind(),
    }),
    [progress],
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-5 py-6">
      <header>
        <p className="font-mono text-[11px] tracking-widest text-[var(--muted)] uppercase">
          Insight days · early programmes · conferences
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Opportunities
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          The things that are easy to miss because nothing lists them. Curated
          by hand — there is no API for this. Every link was checked, but the{" "}
          <span className="text-[var(--foreground)]">dates are not here</span>:
          application windows move every year, and a wrong deadline in a tracker
          is worse than none. Read the page, record the real date, and the
          countdown below becomes something you can trust.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Next deadline"
          value={
            !ready
              ? "—"
              : view.stats.nextDays === null
                ? "—"
                : `${view.stats.nextDays}d`
          }
          sub={
            view.stats.nextDays === null
              ? "none recorded yet"
              : view.soon[0]?.opportunity.name
          }
          accent="var(--chart-series)"
          icon={<CalendarClock className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Tracked"
          value={String(view.stats.total)}
          sub="programmes and conferences"
        />
        <StatTile
          label="Interested"
          value={ready ? String(view.stats.interested) : "—"}
          sub={`${view.stats.withDeadline} with a date recorded`}
          icon={<Star className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Applied"
          value={ready ? String(view.stats.applied) : "—"}
          sub="this cycle"
          icon={<Check className="size-3.5" aria-hidden />}
        />
      </div>

      {ready && view.soon.length > 0 && (
        <section className="rounded-xl border border-[var(--accent)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Closing soonest</h2>
          <ul className="mt-3 space-y-1.5">
            {view.soon.map(({ opportunity, days }) => (
              <li key={opportunity.id} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {opportunity.name}
                  <span className="ml-2 text-xs text-[var(--muted)]">
                    {opportunity.organisation}
                  </span>
                </span>
                <span
                  className="shrink-0 font-mono text-[10px]"
                  style={{ color: days <= 7 ? "#dd4f7d" : "var(--muted)" }}
                >
                  {days === 0 ? "today" : `${days}d`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {view.groups.map((group) => (
        <section key={group.kind} className="space-y-2">
          <div className="pt-2">
            <h2 className="text-sm font-semibold">{KIND_LABEL[group.kind]}</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {KIND_BLURB[group.kind]}
            </p>
          </div>
          <ul className="space-y-1.5">
            {group.items.map((opportunity) => {
              const entry = progress[opportunity.id];
              const countdown = describeDeadline(entry?.deadline ?? "");
              const days = daysUntil(entry?.deadline ?? "");
              return (
                <li
                  key={opportunity.id}
                  className="rounded-xl border bg-[var(--surface)] p-3"
                  style={{
                    borderColor: entry?.interested
                      ? "var(--accent)"
                      : "var(--border)",
                  }}
                >
                  <div className="flex flex-wrap items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {opportunity.name}
                        <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                          {opportunity.organisation}
                        </span>
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                        {opportunity.summary}
                      </p>
                      <p className="mt-1.5 font-mono text-[10px] text-[var(--muted)]">
                        Open to: {opportunity.openTo}
                      </p>
                    </div>
                    <a
                      href={opportunity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--surface-raised)] px-2.5 py-1 text-xs hover:bg-[var(--border)]"
                    >
                      Open
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <input
                        type="checkbox"
                        checked={entry?.interested ?? false}
                        onChange={(event) =>
                          setOpportunity(opportunity.id, {
                            interested: event.target.checked,
                          })
                        }
                        className="size-3.5 accent-[var(--accent)]"
                      />
                      Interested
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                      <input
                        type="checkbox"
                        checked={entry?.applied ?? false}
                        onChange={(event) =>
                          setOpportunity(opportunity.id, {
                            applied: event.target.checked,
                          })
                        }
                        className="size-3.5 accent-[#35a56b]"
                      />
                      Applied
                    </label>

                    <label
                      className="ml-auto inline-flex items-center gap-1.5 text-xs text-[var(--muted)]"
                      htmlFor={`deadline-${opportunity.id}`}
                    >
                      Deadline
                    </label>
                    <input
                      id={`deadline-${opportunity.id}`}
                      type="date"
                      value={entry?.deadline ?? ""}
                      onChange={(event) =>
                        setOpportunity(opportunity.id, {
                          deadline: event.target.value,
                        })
                      }
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-mono text-xs"
                    />
                    {countdown !== null && (
                      <span
                        className="font-mono text-[10px]"
                        style={{
                          color:
                            days !== null && days >= 0 && days <= 7
                              ? "#dd4f7d"
                              : "var(--muted)",
                        }}
                      >
                        {countdown}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <p className="text-xs text-[var(--muted)]">
        Something missing? These live in{" "}
        <code className="font-mono">src/data/opportunities.ts</code> — add it
        there and run <code className="font-mono">npm run check:links</code>.
        {" "}
        {opportunities.length} tracked today.
      </p>
    </div>
  );
}
