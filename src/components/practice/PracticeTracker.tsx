"use client";

import { useMemo, useState } from "react";
import { CircleCheck, Flame, History, Target, Timer } from "lucide-react";
import { MeterList } from "@/components/dashboard/MeterList";
import { StatTile } from "@/components/dashboard/StatTile";
import { ProblemRow } from "@/components/practice/ProblemRow";
import { PythonProvider } from "@/components/practice/PythonProvider";
import {
  DIFFICULTY_COLOR,
  DIFFICULTY_ORDER,
  PATTERN_ORDER,
  difficultyStats,
  emptyFilters,
  filterProblems,
  formatMinutes,
  groupByPattern,
  patternSummaries,
  practiceStats,
  reviewQueue,
  scopedProblems,
  type ListScope,
  type ProblemFilters,
  type StatusFilter,
} from "@/lib/practice";
import type { Difficulty, ProblemPattern } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: "All",
  todo: "Not started",
  attempted: "Attempted",
  solved: "Solved",
};

export function PracticeTracker() {
  const ready = useHydrateProgress();
  const progress = useProgress((s) => s.problems);
  const setProblemStatus = useProgress((s) => s.setProblemStatus);
  const logAttempt = useProgress((s) => s.logAttempt);
  const setProblemNotes = useProgress((s) => s.setProblemNotes);
  const setProblemSolution = useProgress((s) => s.setProblemSolution);
  const setProblemHint = useProgress((s) => s.setProblemHint);

  const [filters, setFilters] = useState<ProblemFilters>(emptyFilters);

  const scoped = useMemo(() => scopedProblems(filters.scope), [filters.scope]);

  const view = useMemo(
    () => ({
      stats: practiceStats(scoped, progress),
      patterns: patternSummaries(scoped, progress),
      difficulties: difficultyStats(scoped, progress),
      review: reviewQueue(scoped, progress).slice(0, 6),
      visible: filterProblems(scoped, progress, filters),
    }),
    [scoped, progress, filters],
  );

  const { stats } = view;
  const groups = groupByPattern(view.visible);

  const set = <K extends keyof ProblemFilters>(
    key: K,
    value: ProblemFilters[K],
  ): void => setFilters((current) => ({ ...current, [key]: value }));

  const toggle = <T,>(list: T[], item: T): T[] =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  return (
    <PythonProvider>
      <div className="mx-auto max-w-5xl space-y-5 px-5 py-6">
        <header>
          <p className="font-mono text-[11px] tracking-widest text-[var(--muted)] uppercase">
            NeetCode 150 · Blind 75
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            Pattern practice
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
            Eighteen patterns in NeetCode&rsquo;s order, because the order is the
            curriculum. Solve on LeetCode, then record it here with the line you
            would want to read again — and the review queue decides what comes
            back. Python runs in the browser, so the solution you keep is one you
            have actually executed.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Up next"
            value={
              !ready
                ? "—"
                : stats.nextUp === null
                  ? "Done"
                  : `#${scoped.indexOf(stats.nextUp) + 1}`
            }
            sub={
              ready
                ? stats.nextUp === null
                  ? "Every problem solved"
                  : `${stats.nextUp.title} · ${stats.nextUp.difficulty}`
                : undefined
            }
            accent="var(--chart-series)"
            icon={<Target className="size-3.5" aria-hidden />}
          />
          <StatTile
            label="Solved"
            value={ready ? `${stats.solved}/${stats.total}` : "—"}
            sub={ready ? `${stats.percent}% · ${stats.attempted} in progress` : undefined}
            icon={<CircleCheck className="size-3.5" aria-hidden />}
          />
          <StatTile
            label="Clean first solves"
            value={ready ? String(stats.cleanSolves) : "—"}
            sub="no walkthrough, one sitting"
            icon={<Flame className="size-3.5" aria-hidden />}
          />
          <StatTile
            label="Practice left"
            value={ready ? `${stats.hoursRemaining}h` : "—"}
            sub={
              ready && stats.minutesLogged > 0
                ? `${formatMinutes(stats.minutesLogged)} logged so far`
                : "at 20/35/55 min a problem"
            }
            icon={<Timer className="size-3.5" aria-hidden />}
          />
        </div>

        {ready && view.review.length > 0 && (
          <section className="rounded-xl border border-[#ad7510] bg-[var(--surface)] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <History className="size-4 text-[#ad7510]" aria-hidden />
              Due for a second pass
            </h2>
            <p className="mt-0.5 mb-3 text-xs text-[var(--muted)]">
              A problem you needed the walkthrough for comes back in a week; one
              you got first try waits six. Most overdue first.
            </p>
            <ul className="space-y-1.5">
              {view.review.map((item) => (
                <li
                  key={item.problem.slug}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className="w-14 shrink-0 font-mono text-[10px]"
                    style={{ color: DIFFICULTY_COLOR[item.problem.difficulty] }}
                  >
                    {item.problem.difficulty}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {item.problem.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
                    {item.overdueDays === 0
                      ? "due today"
                      : `${item.overdueDays}d overdue`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Progress by pattern</h2>
          <p className="mt-0.5 mb-4 text-xs text-[var(--muted)]">
            Hours left is the unsolved problems at the per-difficulty budget
          </p>
          {/* Eighteen patterns is far past the point where a hue per row means
              anything, so the bars share one and the name carries identity. */}
          <MeterList rows={view.patterns} showDots={false} />
        </section>

        <section className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="List"
              className="flex overflow-hidden rounded-lg border border-[var(--border)]"
            >
              {(["neetcode150", "blind75"] as ListScope[]).map((scope) => (
                <button
                  key={scope}
                  type="button"
                  onClick={() => set("scope", scope)}
                  aria-pressed={filters.scope === scope}
                  className={`px-3 py-1.5 text-xs ${
                    filters.scope === scope
                      ? "bg-[var(--surface-raised)] text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {scope === "blind75" ? "Blind 75" : "NeetCode 150"}
                </button>
              ))}
            </div>

            <div
              role="group"
              aria-label="Status"
              className="flex overflow-hidden rounded-lg border border-[var(--border)]"
            >
              {(Object.keys(STATUS_LABEL) as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => set("status", status)}
                  aria-pressed={filters.status === status}
                  className={`px-2.5 py-1.5 text-xs ${
                    filters.status === status
                      ? "bg-[var(--surface-raised)] text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {STATUS_LABEL[status]}
                </button>
              ))}
            </div>

            <label className="sr-only" htmlFor="problem-search">
              Search problems
            </label>
            <input
              id="problem-search"
              type="search"
              value={filters.query}
              onChange={(event) => set("query", event.target.value)}
              placeholder="Search titles"
              className="ml-auto w-40 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DIFFICULTY_ORDER.map((difficulty) => {
              const on = filters.difficulties.includes(difficulty);
              const row = view.difficulties.find(
                (d) => d.difficulty === difficulty,
              );
              return (
                <button
                  key={difficulty}
                  type="button"
                  onClick={() =>
                    set(
                      "difficulties",
                      toggle<Difficulty>(filters.difficulties, difficulty),
                    )
                  }
                  aria-pressed={on}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                  style={{
                    borderColor: on
                      ? DIFFICULTY_COLOR[difficulty]
                      : "var(--border)",
                    color: on ? "var(--foreground)" : "var(--muted)",
                  }}
                >
                  <span
                    aria-hidden
                    className="size-2 rounded-full"
                    style={{ background: DIFFICULTY_COLOR[difficulty] }}
                  />
                  {difficulty}
                  <span className="font-mono text-[10px] text-[var(--muted)]">
                    {ready && row ? `${row.solved}/${row.total}` : row?.total}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PATTERN_ORDER.map((pattern) => {
              const on = filters.patterns.includes(pattern);
              return (
                <button
                  key={pattern}
                  type="button"
                  onClick={() =>
                    set(
                      "patterns",
                      toggle<ProblemPattern>(filters.patterns, pattern),
                    )
                  }
                  aria-pressed={on}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    on
                      ? "border-[var(--accent)] text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {pattern}
                </button>
              );
            })}
          </div>
        </section>

        <p className="font-mono text-[11px] text-[var(--muted)]">
          {view.visible.length} of {scoped.length} shown
        </p>

        {groups.length === 0 ? (
          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            Nothing matches those filters.
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.pattern} className="space-y-2">
              <h2 className="flex items-baseline gap-2 pt-2 text-sm font-semibold">
                {group.pattern}
                <span className="font-mono text-[10px] font-normal text-[var(--muted)]">
                  {
                    group.items.filter(
                      (p) => progress[p.slug]?.status === "solved",
                    ).length
                  }
                  /{group.items.length}
                </span>
              </h2>
              <ul className="space-y-1.5">
                {group.items.map((problem) => (
                  <ProblemRow
                    key={problem.slug}
                    problem={problem}
                    progress={progress[problem.slug]}
                    isNext={ready && stats.nextUp?.slug === problem.slug}
                    onStatus={(status) =>
                      setProblemStatus(problem.slug, status)
                    }
                    onLogAttempt={(minutes) => logAttempt(problem.slug, minutes)}
                    onNotes={(notes) => setProblemNotes(problem.slug, notes)}
                    onSolution={(solution) =>
                      setProblemSolution(problem.slug, solution)
                    }
                    onHint={(usedHint) => setProblemHint(problem.slug, usedHint)}
                  />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </PythonProvider>
  );
}
