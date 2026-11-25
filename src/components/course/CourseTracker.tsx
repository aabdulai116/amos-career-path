"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Hammer, PlayCircle, Timer } from "lucide-react";
import { DayRow } from "@/components/course/DayRow";
import { MeterList } from "@/components/dashboard/MeterList";
import { StatTile } from "@/components/dashboard/StatTile";
import { COURSE_URL, courseDays } from "@/data/course";
import {
  TRACK_ORDER,
  courseStats,
  formatRuntime,
  trackSummaries,
} from "@/lib/course";
import type { CourseTrack } from "@/lib/types";
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

  const [tracks, setTracks] = useState<CourseTrack[]>([]);

  const view = useMemo(
    () => ({
      stats: courseStats(courseDays, progress),
      tracks: trackSummaries(courseDays, progress),
    }),
    [progress],
  );

  const visible = courseDays.filter(
    (d) => tracks.length === 0 || tracks.includes(d.track),
  );
  const grouped = TRACK_ORDER.map((track) => ({
    track,
    days: visible.filter((d) => d.track === track),
  })).filter((g) => g.days.length > 0);

  const toggleTrack = (track: CourseTrack): void =>
    setTracks((current) =>
      current.includes(track)
        ? current.filter((t) => t !== track)
        : [...current, track],
    );

  const { stats } = view;

  return (
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
          label="Practice projects"
          value={ready ? `${stats.projectsDone}/${stats.projectsAvailable}` : "—"}
          sub="built and linked"
          icon={<Hammer className="size-3.5" aria-hidden />}
        />
        <StatTile
          label="Run time done"
          value={ready ? formatRuntime(stats.minutesWatched) : "—"}
          sub={`of ${formatRuntime(stats.totalMinutes)}`}
          icon={<Timer className="size-3.5" aria-hidden />}
        />
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-semibold">Progress by track</h2>
        <p className="mt-0.5 mb-4 text-xs text-[var(--muted)]">
          Hours remaining counts the lectures you have not marked watched
        </p>
        <MeterList rows={view.tracks} />
      </section>

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
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
