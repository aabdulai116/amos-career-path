"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ExternalLink,
  Hammer,
  Link2,
  Play,
} from "lucide-react";
import { ExerciseCard } from "@/components/course/ExerciseCard";
import { Markdown } from "@/components/Markdown";
import { COURSE_URL } from "@/data/course";
import {
  PRIORITY_BLURB,
  PRIORITY_COLOR,
  PRIORITY_LABEL,
  TRACK_COLOR,
  formatRuntime,
} from "@/lib/course";
import type { CourseDay, DayProgress } from "@/lib/types";

interface DayRowProps {
  day: CourseDay;
  progress: DayProgress | undefined;
  isNext: boolean;
  onWatched: (watched: boolean) => void;
  onProjectDone: (done: boolean) => void;
  onNotes: (notes: string) => void;
  onRepoUrl: (url: string) => void;
  onLectureUrl: (url: string) => void;
  onToggleExercise: (exerciseId: string, done: boolean) => void;
  onExerciseCode: (exerciseId: string, code: string) => void;
}

export function DayRow({
  day,
  progress,
  isNext,
  onWatched,
  onProjectDone,
  onNotes,
  onRepoUrl,
  onLectureUrl,
  onToggleExercise,
  onExerciseCode,
}: DayRowProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const colour = TRACK_COLOR[day.track];
  const watched = progress?.watched ?? false;
  const projectDone = progress?.projectDone ?? false;
  const panelId = `day-${day.day}-detail`;
  const exercisesDone = day.exercises.filter((e) =>
    progress?.exercisesDone.includes(e.id),
  ).length;

  return (
    <li
      className="rounded-xl border bg-[var(--surface)]"
      style={{ borderColor: isNext ? colour : "var(--border)" }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <input
          type="checkbox"
          checked={watched}
          onChange={(event) => onWatched(event.target.checked)}
          aria-label={`Mark day ${day.day} lectures watched`}
          className="size-4 shrink-0 accent-[var(--accent)]"
        />
        <span
          className="w-10 shrink-0 text-right font-mono text-xs tabular-nums"
          style={{ color: colour }}
        >
          {day.day <= 100 ? day.day : "—"}
        </span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span
            className={`min-w-0 flex-1 truncate text-sm ${
              watched ? "text-[var(--muted)] line-through decoration-1" : ""
            }`}
          >
            {day.title}
          </span>
          {/* Only "core" is highlighted: the question is where to slow down,
              and one marked class answers it faster than three would. */}
          <span
            className="hidden w-12 shrink-0 text-right font-mono text-[10px] sm:inline"
            style={{
              color: PRIORITY_COLOR[day.priority],
              opacity: day.priority === "skim" ? 0.6 : 1,
            }}
          >
            {PRIORITY_LABEL[day.priority]}
          </span>
          {day.exercises.length > 0 && (
            <span className="hidden shrink-0 font-mono text-[10px] text-[var(--muted)] md:inline">
              {exercisesDone}/{day.exercises.length}
            </span>
          )}
          {projectDone && (
            <Hammer className="size-3.5 shrink-0 text-[var(--chart-series)]" aria-label="Practice project built" />
          )}
          <span className="shrink-0 font-mono text-[10px] text-[var(--muted)]">
            {day.lectures} · {formatRuntime(day.minutes)}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div
          id={panelId}
          className="space-y-4 border-t border-[var(--border)] px-3 py-4"
        >
          <p
            className="rounded-lg border-l-2 py-1 pl-3 text-xs leading-relaxed"
            style={{
              borderColor: PRIORITY_COLOR[day.priority],
              color: "var(--muted)",
            }}
          >
            <span
              className="font-medium"
              style={{ color: PRIORITY_COLOR[day.priority] }}
            >
              {PRIORITY_LABEL[day.priority]} — {PRIORITY_BLURB[day.priority]}
            </span>{" "}
            {day.priorityNote}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={progress?.lectureUrl?.trim() || COURSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[#0a0d12]"
            >
              <Play className="size-3" aria-hidden />
              Watch on Udemy
              <ExternalLink className="size-3" aria-hidden />
            </a>
            <input
              type="url"
              value={progress?.lectureUrl ?? ""}
              onChange={(event) => onLectureUrl(event.target.value)}
              placeholder="Paste this day's lecture link once…"
              aria-label={`Lecture link for day ${day.day}`}
              className="min-w-48 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
            />
          </div>

          {day.project && (
            <section className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="flex items-start gap-2.5">
                <input
                  id={`project-${day.day}`}
                  type="checkbox"
                  checked={projectDone}
                  onChange={(event) => onProjectDone(event.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[var(--chart-series)]"
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`project-${day.day}`}
                    className="cursor-pointer text-sm font-medium"
                  >
                    Practice: {day.project.title}
                  </label>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                    {day.project.brief}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Link2 className="size-3 shrink-0 text-[var(--muted)]" aria-hidden />
                    <input
                      type="url"
                      value={progress?.repoUrl ?? ""}
                      onChange={(event) => onRepoUrl(event.target.value)}
                      placeholder="Repo or gist for your build…"
                      aria-label={`Repo link for day ${day.day} project`}
                      className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs outline-none focus:border-[var(--accent)]"
                    />
                    {projectDone && progress?.repoUrl?.trim() && (
                      <Check className="size-3.5 shrink-0 text-[var(--chart-series)]" aria-label="Linked" />
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {day.exercises.length > 0 && (
            <section>
              <h3 className="text-[11px] tracking-wider text-[var(--muted)] uppercase">
                Practice — {exercisesDone}/{day.exercises.length} done
              </h3>
              <p className="mt-0.5 mb-2 text-xs text-[var(--muted)]">
                Short drills for straight after the lectures. The project above
                takes an evening; these take ten minutes and tell you whether it
                landed.
              </p>
              <ul className="space-y-2">
                {day.exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    day={day.day}
                    done={progress?.exercisesDone.includes(exercise.id) ?? false}
                    code={progress?.exerciseCode[exercise.id] ?? ""}
                    onToggle={(value) => onToggleExercise(exercise.id, value)}
                    onCode={(code) => onExerciseCode(exercise.id, code)}
                  />
                ))}
              </ul>
            </section>
          )}

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor={`notes-${day.day}`}
                className="text-[11px] tracking-wider text-[var(--muted)] uppercase"
              >
                Notes
              </label>
              <button
                type="button"
                onClick={() => setPreview((v) => !v)}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {preview ? "Write" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div className="mt-1.5 min-h-20 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                <Markdown source={progress?.notes ?? ""} />
              </div>
            ) : (
              <textarea
                id={`notes-${day.day}`}
                rows={4}
                value={progress?.notes ?? ""}
                onChange={(event) => onNotes(event.target.value)}
                placeholder="What tripped you up, what to come back to…"
                className="mt-1.5 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-[13px] leading-relaxed outline-none focus:border-[var(--accent)]"
              />
            )}
          </div>
        </div>
      )}
    </li>
  );
}
