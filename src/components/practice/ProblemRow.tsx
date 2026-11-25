"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  CircleDot,
  ExternalLink,
  Lightbulb,
  Lock,
  Youtube,
} from "lucide-react";
import { PythonEditor } from "@/components/python/PythonEditor";
import {
  DIFFICULTY_COLOR,
  formatMinutes,
  problemUrl,
  solutionUrl,
  videoUrl,
} from "@/lib/practice";
import { starterCode } from "@/lib/python";
import type { Problem, ProblemProgress } from "@/lib/types";

interface ProblemRowProps {
  problem: Problem;
  progress: ProblemProgress | undefined;
  /** Highlighted as the one to open next. */
  isNext: boolean;
  onStatus: (status: "attempted" | "solved" | "reset") => void;
  onLogAttempt: (minutes: number) => void;
  onNotes: (notes: string) => void;
  onSolution: (solution: string) => void;
  onHint: (usedHint: boolean) => void;
  onComplexity: (kind: "time" | "space", value: string) => void;
}

export function ProblemRow({
  problem,
  progress,
  isNext,
  onStatus,
  onLogAttempt,
  onNotes,
  onSolution,
  onHint,
  onComplexity,
}: ProblemRowProps) {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState("");
  const colour = DIFFICULTY_COLOR[problem.difficulty];
  const status = progress?.status;
  const solved = status === "solved";
  const panelId = `problem-${problem.slug}-detail`;
  const time = progress?.timeComplexity.trim() ?? "";
  const space = progress?.spaceComplexity.trim() ?? "";
  const complexity =
    time === "" && space === ""
      ? null
      : `${time === "" ? "?" : time} / ${space === "" ? "?" : space}`;

  const logSitting = (): void => {
    const value = Number(minutes);
    if (!Number.isFinite(value) || value <= 0) return;
    onLogAttempt(value);
    setMinutes("");
  };

  return (
    <li
      className="rounded-xl border bg-[var(--surface)]"
      style={{ borderColor: isNext ? colour : "var(--border)" }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <input
          type="checkbox"
          checked={solved}
          onChange={(event) =>
            onStatus(event.target.checked ? "solved" : "attempted")
          }
          aria-label={`Mark ${problem.title} solved`}
          className="size-4 shrink-0 accent-[var(--accent)]"
        />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span
            className={`min-w-0 flex-1 truncate text-sm ${
              solved ? "text-[var(--muted)] line-through decoration-1" : ""
            }`}
          >
            {problem.title}
          </span>

          {problem.blind75 && (
            <span className="hidden shrink-0 rounded-sm border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)] sm:inline">
              Blind 75
            </span>
          )}
          {problem.freeUrl !== null && (
            <Lock
              className="size-3 shrink-0 text-[var(--muted)]"
              aria-label="LeetCode Premium; opens a free mirror"
            />
          )}
          {progress?.usedHint === true && (
            <Lightbulb
              className="size-3.5 shrink-0 text-[#ad7510]"
              aria-label="Needed the walkthrough"
            />
          )}
          {status === "attempted" && (
            <CircleDot
              className="size-3.5 shrink-0 text-[var(--muted)]"
              aria-label="Attempted"
            />
          )}
          {/* The whole point of writing it down is seeing it without opening
              the row - this is what a revision pass reads. */}
          {complexity !== null && (
            <span className="hidden shrink-0 font-mono text-[10px] text-[var(--muted)] md:inline">
              {complexity}
            </span>
          )}

          {/* The word is always present, so difficulty is never colour alone. */}
          <span
            className="w-14 shrink-0 text-right font-mono text-[10px]"
            style={{ color: colour }}
          >
            {problem.difficulty}
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-[var(--muted)] transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div
          id={panelId}
          className="space-y-4 border-t border-[var(--border)] px-3 py-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={problemUrl(problem)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--surface-raised)] px-2.5 py-1 text-xs hover:bg-[var(--border)]"
            >
              {problem.freeUrl === null ? "Open on LeetCode" : "Open free mirror"}
              <ExternalLink className="size-3" aria-hidden />
            </a>
            <a
              href={videoUrl(problem)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <Youtube className="size-3.5" aria-hidden />
              Walkthrough
            </a>
            <a
              href={solutionUrl(problem)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              NeetCode&rsquo;s Python
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </div>

          {problem.freeUrl !== null && (
            <p className="text-xs text-[var(--muted)]">
              LeetCode keeps this one behind Premium. The link above is the free
              mirror NeetCode points at.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onStatus("attempted")}
              aria-pressed={status === "attempted"}
              className={`rounded-md border px-2.5 py-1 text-xs ${
                status === "attempted"
                  ? "border-[var(--accent)] text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              Attempted
            </button>
            <button
              type="button"
              onClick={() => onStatus("solved")}
              aria-pressed={solved}
              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs ${
                solved
                  ? "border-[#35a56b] text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Check className="size-3" aria-hidden />
              Solved
            </button>
            <label className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <input
                type="checkbox"
                checked={progress?.usedHint ?? false}
                onChange={(event) => onHint(event.target.checked)}
                className="size-3.5 accent-[var(--accent)]"
              />
              Needed the walkthrough
            </label>
            {progress !== undefined && (
              <button
                type="button"
                onClick={() => onStatus("reset")}
                className="ml-auto rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label
                htmlFor={`minutes-${problem.slug}`}
                className="block text-xs text-[var(--muted)]"
              >
                Log a sitting
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  id={`minutes-${problem.slug}`}
                  type="number"
                  min={1}
                  max={600}
                  value={minutes}
                  onChange={(event) => setMinutes(event.target.value)}
                  placeholder="25"
                  className="w-20 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-mono text-xs"
                />
                <span className="text-xs text-[var(--muted)]">min</span>
                <button
                  type="button"
                  onClick={logSitting}
                  className="rounded-md bg-[var(--surface-raised)] px-2.5 py-1 text-xs hover:bg-[var(--border)]"
                >
                  Add
                </button>
              </div>
            </div>
            <p className="pb-1 font-mono text-[10px] text-[var(--muted)]">
              {progress?.attempts ?? 0} sitting
              {(progress?.attempts ?? 0) === 1 ? "" : "s"}
              {(progress?.minutes ?? 0) > 0 &&
                ` · ${formatMinutes(progress?.minutes ?? 0)}`}
            </p>
          </div>

          <div>
            <label
              htmlFor={`notes-${problem.slug}`}
              className="block text-xs font-medium text-[var(--muted)]"
            >
              What the trick was
            </label>
            <textarea
              id={`notes-${problem.slug}`}
              value={progress?.notes ?? ""}
              onChange={(event) => onNotes(event.target.value)}
              rows={2}
              placeholder="One line I would want to read again in six months."
              className="mt-1 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor={`time-${problem.slug}`}
                className="block text-xs font-medium text-[var(--muted)]"
              >
                Time complexity
              </label>
              <input
                id={`time-${problem.slug}`}
                type="text"
                value={progress?.timeComplexity ?? ""}
                onChange={(event) => onComplexity("time", event.target.value)}
                placeholder="O(n)"
                className="mt-1 w-28 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-mono text-xs"
              />
            </div>
            <div>
              <label
                htmlFor={`space-${problem.slug}`}
                className="block text-xs font-medium text-[var(--muted)]"
              >
                Space complexity
              </label>
              <input
                id={`space-${problem.slug}`}
                type="text"
                value={progress?.spaceComplexity ?? ""}
                onChange={(event) => onComplexity("space", event.target.value)}
                placeholder="O(1)"
                className="mt-1 w-28 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 font-mono text-xs"
              />
            </div>
            <p className="pb-1.5 text-xs text-[var(--muted)]">
              Write it in your own words — the point is having to decide.
            </p>
          </div>

          <PythonEditor
            id={problem.slug}
            starter={starterCode(problem)}
            value={progress?.solution ?? ""}
            onChange={onSolution}
          />
        </div>
      )}
    </li>
  );
}
