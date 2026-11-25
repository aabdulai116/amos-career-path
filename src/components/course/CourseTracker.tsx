"use client";

import { useMemo, useState } from "react";
import { Dumbbell, ExternalLink, PlayCircle, Target, Timer } from "lucide-react";
import { DayRow } from "@/components/course/DayRow";
import { PythonProvider } from "@/components/python/PythonProvider";
import { MeterList } from "@/components/dashboard/MeterList";
import { StatTile } from "@/components/dashboard/StatTile";
import { COURSE_URL, courseDays } from "@/data/course";
import {
  PRIORITY_BLURB,
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  TRACK_ORDER,
  courseStats,
  exerciseTotals,
  formatRuntime,
  nextCoreDay,
  prioritySummaries,
  trackSummaries,
} from "@/lib/course";
import type { CourseTrack, DayPriority } from "@/lib/types";
import { useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";

export function CourseTracker() {
  const ready = useHydrateProgress();
  const progress = useProgress((s) => s.course);
  const setDayWatched = useProgress((s) => s.setDayWatched);
  const setDayProjectDone = useProgress((s) => s.setDayProjectDone);
  const setDayNotes = useProgress((s) => s.setDayNotes);
  const setDayRepoUrl = useProgress((s) => s.setDayRepoUrl);
  const setDayLectureUrl = useProgress((s) => s.setDayLectureUrl);
  const toggleExercise = useProgress((s) => s.toggleExercise);
  const setExerciseCode = useProgress((s) => s.setExerciseCode);

  const [tracks, setTracks] = useState<CourseTrack[]>([]);
  const [priorities, setPriorities] = useState<DayPriority[]>([]);

  const view = useMemo(
    () => ({
      stats: courseStats(courseDays, progress),
      tracks: trackSummaries(courseDays, progress),
      priorities: prioritySummaries(courseDays, progress),
      exercises: exerciseTotals(courseDays, progress),
      nextCore: nextCoreDay(courseDays, progress),
    }),
    [progress],
  );

  const visible = courseDays.filter(
    (d) =>
      (tracks.length === 0 || tracks.includes(d.track)) &&
      (priorities.length === 0 || priorities.includes(d.priority)),
  );
  const grouped = TRACK_ORDER.map((track) => ({
    track,
    days: visible.filter((d) => d.track === track),
  })).filter((g) => g.days.length > 0);

  const togglePriority = (priority: DayPriority): void =>
    setPriorities((current) =>
      current.includes(priority)
        ? current.filter((p) => p !== priority)
        : [...current, priority],
    );

  const toggleTrack = (track: CourseTrack): void =>
    setTracks((current) =>
      current.includes(track)
        ? current.filter((t) => t !== track)
        : [...current, track],
    );

  const { stats } = view;

  return (
    <PythonProvider>
      <div className="mx-auto max-w-5xl space-y-5 px-5 py-6">
      <header>
        <p className="font-mono text-[11px] tracking-widest text-[var(--muted)] uppercase">
          Dr. Angela Yu · 100 Days of Code
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Python bootcamp tracker
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Watch the lectures on Udemy, then record the day here. Each day also
          carries a practice project of its own — something different from the
          course build, to prove the idea stuck.
        </p>
        <a
          href={COURSE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
        >
          Open the course on Udemy
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Up next"
          value={
            !ready ? "—" : stats.nextDay === null ? "Done" : `Day ${stats.nextDay}`
          }
          sub={
            ready && stats.nextDay !== null
              ? courseDays.find((d) => d.day === stats.nextDay)?.title.slice(0, 40)
              : undefined
          }
          accent="var(--chart-series)"
          icon={<PlayCircle className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Days watched"
          value={ready ? `${stats.watched}/${stats.totalDays}` : "—"}
          sub={ready ? `${stats.percent}% of the course` : undefined}
        />
        <StatTile
          label="Exercises done"
          value={
            ready ? `${view.exercises.done}/${view.exercises.total}` : "—"
          }
          sub={
            ready
              ? `${stats.projectsDone}/${stats.projectsAvailable} projects built`
              : undefined
          }
          icon={<Dumbbell className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Run time done"
          value={ready ? formatRuntime(stats.minutesWatched) : "—"}
          sub={`of ${formatRuntime(stats.totalMinutes)}`}
          icon={<Timer className="size-3.5" aria-hidden />}
        />
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-semibold">Where to spend the time</h2>
        <p className="mt-0.5 mb-4 text-xs text-[var(--muted)]">
          Judged against software engineering, AI and quant — not against the
          teaching. A day can be excellent and still be a detour.
        </p>
        <ul className="space-y-3">
          {view.priorities.map((row) => (
            <li key={row.priority} className="flex flex-wrap items-baseline gap-x-2">
              <span
                className="w-14 shrink-0 font-mono text-xs"
                style={{
                  color: PRIORITY_COLOR[row.priority],
                  opacity: row.priority === "skim" ? 0.6 : 1,
                }}
              >
                {PRIORITY_LABEL[row.priority]}
              </span>
              <span className="font-mono text-xs text-[var(--foreground)] tabular-nums">
                {ready ? `${row.watched}/${row.total}` : `—/${row.total}`}
              </span>
              <span className="text-xs text-[var(--muted)]">days</span>
              <span className="font-mono text-xs text-[var(--muted)] tabular-nums">
                · {row.hoursRemaining}h left
              </span>
              <span className="min-w-0 flex-1 text-xs text-[var(--muted)]">
                {PRIORITY_BLURB[row.priority]}
              </span>
            </li>
          ))}
        </ul>
        {ready && view.nextCore !== null && (
          <p className="mt-4 flex items-center gap-1.5 border-t border-[var(--border)] pt-3 text-xs text-[var(--muted)]">
            <Target className="size-3.5 shrink-0 text-[var(--accent)]" aria-hidden />
            Next core day:{" "}
            <span className="text-[var(--foreground)]">
              Day {view.nextCore.day} — {view.nextCore.title}
            </span>
          </p>
        )}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-semibold">Progress by track</h2>
        <p className="mt-0.5 mb-4 text-xs text-[var(--muted)]">
          Hours remaining counts the lectures you have not marked watched
        </p>
        <MeterList rows={view.tracks} />
      </section>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-x-visible">
        <span className="mr-1 shrink-0 text-[11px] tracking-wider text-[var(--muted)] uppercase">
          Priority
        </span>
        {PRIORITY_ORDER.map((priority) => {
          const active = priorities.includes(priority);
          return (
            <button
              key={priority}
              type="button"
              aria-pressed={active}
              onClick={() => togglePriority(priority)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs whitespace-nowrap transition-colors ${
                active
                  ? "border-transparent bg-[var(--accent)] text-[#0a0d12]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {PRIORITY_LABEL[priority]}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-x-visible">
        <span className="mr-1 shrink-0 text-[11px] tracking-wider text-[var(--muted)] uppercase">
          Track
        </span>
        {TRACK_ORDER.map((track) => {
          const active = tracks.includes(track);
          return (
            <button
              key={track}
              type="button"
              aria-pressed={active}
              onClick={() => toggleTrack(track)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs whitespace-nowrap transition-colors ${
                active
                  ? "border-transparent bg-[var(--accent)] text-[#0a0d12]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {track}
            </button>
          );
        })}
      </div>

        {grouped.map(({ track, days }) => (
        <section key={track}>
          <h2 className="mb-2 text-[11px] tracking-wider text-[var(--muted)] uppercase">
            {track}
          </h2>
          <ul className="space-y-1.5">
            {days.map((day) => (
              <DayRow
                key={day.day}
                day={day}
                progress={progress[String(day.day)]}
                isNext={ready && stats.nextDay === day.day}
                onWatched={(v) => setDayWatched(day.day, v)}
                onProjectDone={(v) => setDayProjectDone(day.day, v)}
                onNotes={(v) => setDayNotes(day.day, v)}
                onRepoUrl={(v) => setDayRepoUrl(day.day, v)}
                onLectureUrl={(v) => setDayLectureUrl(day.day, v)}
                onToggleExercise={(id) => toggleExercise(day.day, id)}
                onExerciseCode={(id, code) =>
                  setExerciseCode(day.day, id, code)
                }
              />
            ))}
          </ul>
        </section>
        ))}
      </div>
    </PythonProvider>
  );
}
