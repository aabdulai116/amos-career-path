"use client";

import { useMemo } from "react";
import { CalendarClock, CircleDot, Gauge, KeyRound, Target } from "lucide-react";
import { MeterList } from "@/components/dashboard/MeterList";
import { ProofOfWork } from "@/components/dashboard/ProofOfWork";
import { RecommendedNext } from "@/components/dashboard/RecommendedNext";
import { WeeklyHours } from "@/components/dashboard/WeeklyHours";
import { StatTile } from "@/components/dashboard/StatTile";
import { pathById, paths } from "@/data/paths";
import { skills } from "@/data/skills";
import {
  countdownTo,
  dashboardTotals,
  domainSummaries,
  formatHours,
  formatPace,
  pathSummaries,
  proofOfWork,
} from "@/lib/dashboard";
import { currentStreak, hoursByWeek, longestStreak } from "@/lib/dates";
import { pathSkillIds, recommendedNext, requiredPace } from "@/lib/graph";
import { useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";

/** Twelve empty buckets so the chart keeps its height before progress loads. */
const PLACEHOLDER_WEEKS = Array.from({ length: 12 }, (_, i) => ({
  week: `placeholder-${i}`,
  hours: 0,
}));

export function Dashboard() {
  const ready = useHydrateProgress();
  const progress = useProgress((s) => s.skills);
  const dayLogs = useProgress((s) => s.dayLogs);
  const recruitingDate = useProgress((s) => s.settings.recruitingDate);
  const selectedPathId = useProgress((s) => s.settings.selectedPathId);
  const setSelectedPath = useProgress((s) => s.setSelectedPath);

  const path = selectedPathId ? (pathById[selectedPathId] ?? null) : null;

  const view = useMemo(() => {
    const scope = path ? new Set(pathSkillIds(path, skills)) : null;
    const totals = dashboardTotals(skills, progress, scope);
    return {
      totals,
      pace: requiredPace(recruitingDate, totals.overall),
      recommendations: recommendedNext(skills, progress, path, 6),
      domains: domainSummaries(skills, progress),
      paths: pathSummaries(skills, progress),
      proof: proofOfWork(skills, progress),
    };
  }, [progress, path, recruitingDate]);

  // Anything that depends on "now" or on saved progress waits for hydration,
  // so the server and the first client render cannot disagree.
  const countdown = ready ? countdownTo(recruitingDate) : null;
  const weeks = ready ? hoursByWeek(dayLogs, 12) : PLACEHOLDER_WEEKS;
  const streak = ready ? currentStreak(dayLogs) : 0;
  const best = ready ? longestStreak(dayLogs) : 0;

  const { totals, pace } = view;
  const scopeLabel = path ? path.name : "the whole map";

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-5 py-6">
      {/* Every page needs a top-level heading: it is what a screen reader
          announces on arrival and what "jump to main content" lands on. This
          page was the only one without one. Visually hidden because the page
          is a wall of figures that already explain themselves. */}
      <h1 className="sr-only">Dashboard</h1>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[11px] tracking-wider text-[var(--muted)] uppercase">
          Tracking
        </span>
        <button
          type="button"
          onClick={() => setSelectedPath(null)}
          aria-pressed={selectedPathId === null}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            selectedPathId === null
              ? "border-transparent bg-[var(--accent)] text-[#0a0d12]"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          Everything
        </button>
        {paths.map((p) => {
          const active = selectedPathId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedPath(active ? null : p.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                active
                  ? "border-transparent bg-[var(--accent)] text-[#0a0d12]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Hero: the one number this page leads with. */}
      <section className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] tracking-wider text-[var(--muted)] uppercase">
            <CalendarClock className="size-3.5" aria-hidden />
            Recruiting opens
          </p>
          <p className="mt-1 font-mono text-5xl leading-none">
            {countdown === null ? "—" : Math.abs(countdown.days)}
          </p>
          <p className="mt-1.5 text-sm text-[var(--muted)]">
            {countdown === null
              ? "days"
              : countdown.overdue
                ? `days since ${recruitingDate}`
                : `days · ${countdown.weeks} weeks · ${recruitingDate}`}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:border-l sm:border-[var(--border)] sm:pl-5">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] tracking-wider text-[var(--muted)] uppercase">
              <Gauge className="size-3.5" aria-hidden />
              Required pace
            </p>
            <p className="mt-1 font-mono text-2xl text-balance">
              {ready ? formatPace(pace.skillsPerWeek) : "—"}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              to finish {scopeLabel} in time
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[11px] tracking-wider text-[var(--muted)] uppercase">
              Study load
            </p>
            <p className="mt-1 font-mono text-2xl">
              {ready ? `${formatHours(pace.hoursPerWeek)}/wk` : "—"}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {ready
                ? `${totals.overall.hoursRemaining}h of estimated work left`
                : "—"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Overall"
          value={ready ? `${totals.overall.percent}%` : "—"}
          sub={`${scopeLabel}`}
          accent="var(--chart-series)"
          icon={<Target className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Skills done"
          value={ready ? `${totals.done}/${totals.overall.total}` : "—"}
        />
        <StatTile
          label="Unlocked now"
          value={ready ? String(totals.unlockedNow) : "—"}
          sub="ready to start"
          icon={<KeyRound className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="In progress"
          value={ready ? String(totals.inProgress) : "—"}
          sub="started, not finished"
          icon={<CircleDot className="size-3.5" aria-hidden />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecommendedNext
          recommendations={view.recommendations}
          pathName={path?.name ?? null}
          ready={ready}
        />
        <WeeklyHours weeks={weeks} streak={streak} longest={best} ready={ready} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Progress by domain</h2>
          <p className="mt-0.5 mb-4 text-xs text-[var(--muted)]">
            Across the whole map, not just the selected path
          </p>
          <MeterList rows={view.domains} />
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Progress by career path</h2>
          <p className="mt-0.5 mb-4 text-xs text-[var(--muted)]">
            Each path counts its core skills plus everything they depend on
          </p>
          <MeterList rows={view.paths} showDots={false} />
        </section>
      </div>

      <ProofOfWork entries={view.proof} ready={ready} />
    </div>
  );
}
