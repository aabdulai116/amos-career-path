"use client";

import { Laptop } from "lucide-react";
import { PythonEditor } from "@/components/python/PythonEditor";
import type { CourseExercise } from "@/lib/types";

/**
 * One drill for a day. Runnable ones get a real Python editor; the rest say
 * plainly that they belong on your own machine, because the in-page
 * interpreter has no window, no browser and no network, and pretending a
 * Tkinter exercise could run here would only waste your evening.
 */
export function ExerciseCard({
  exercise,
  day,
  done,
  code,
  onToggle,
  onCode,
}: {
  exercise: CourseExercise;
  day: number;
  done: boolean;
  code: string;
  onToggle: (done: boolean) => void;
  onCode: (code: string) => void;
}) {
  const checkboxId = `exercise-${exercise.id}`;

  return (
    <li className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="flex items-start gap-2.5">
        <input
          id={checkboxId}
          type="checkbox"
          checked={done}
          onChange={(event) => onToggle(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-[var(--chart-series)]"
        />
        <div className="min-w-0 flex-1">
          <label
            htmlFor={checkboxId}
            className={`cursor-pointer text-sm font-medium ${
              done ? "text-[var(--muted)] line-through decoration-1" : ""
            }`}
          >
            {exercise.title}
          </label>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            {exercise.prompt}
          </p>
        </div>
      </div>

      <div className="mt-3">
        {exercise.runnable ? (
          <PythonEditor
            id={exercise.id}
            label="Your answer"
            rows={exercise.starter === null ? 8 : 12}
            starter={
              exercise.starter ??
              `# Day ${day} — ${exercise.title}\n# ${exercise.prompt}\n\n`
            }
            value={code}
            onChange={onCode}
          />
        ) : (
          <p className="flex items-start gap-1.5 text-xs text-[var(--muted)]">
            <Laptop className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Build this one on your own machine — it needs a window, a browser or
            the network, none of which the in-page interpreter has. Tick it off
            when it runs.
          </p>
        )}
      </div>
    </li>
  );
}
