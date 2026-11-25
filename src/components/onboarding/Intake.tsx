"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Compass, RotateCcw, Sparkles } from "lucide-react";
import {
  QUESTIONS,
  experienceLevel,
  isComplete,
  recommendPaths,
  startingSkills,
  type Answers,
} from "@/lib/onboarding";
import { useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";

const ADVICE: Record<ReturnType<typeof experienceLevel>, string> = {
  new: "Start with the course. Day 1 is ninety minutes and assumes nothing — do that before you touch the skill map.",
  some: "Do the course alongside the first skills below. The pattern practice can wait until you are comfortable writing loops without looking things up.",
  building: "Skip ahead where you already know something — mark it done and move on. The review queue will tell you if you were wrong.",
};

export function Intake() {
  const ready = useHydrateProgress();
  const setSelectedPath = useProgress((s) => s.setSelectedPath);
  const markOnboarded = useProgress((s) => s.markOnboarded);
  const selectedPathId = useProgress((s) => s.settings.selectedPathId);

  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);

  const done = isComplete(answers);
  const results = useMemo(
    () => (done ? recommendPaths(answers) : []),
    [done, answers],
  );
  const top = results[0];
  const starting = useMemo(
    () => (top ? startingSkills(top.path) : []),
    [top],
  );

  const choose = (questionId: string, answerId: string): void => {
    setAnswers((current) => ({ ...current, [questionId]: answerId }));
    setStep((n) => Math.min(n + 1, QUESTIONS.length));
  };

  const restart = (): void => {
    setAnswers({});
    setStep(0);
  };

  const commit = (pathId: string): void => {
    setSelectedPath(pathId);
    markOnboarded();
  };

  const question = QUESTIONS[step];

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-5 py-6">
      <header>
        <p className="font-mono text-[11px] tracking-widest text-[var(--muted)] uppercase">
          Start here
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Not sure which direction yet?
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Six questions, about a minute. It suggests one path to start on and
          five things to do this week. It is a starting point, not a verdict —
          you can change it whenever you like, and nothing is locked by it.
        </p>
      </header>

      {!done && question && (
        <>
          <div className="flex items-center gap-2">
            {QUESTIONS.map((q, index) => (
              <span
                key={q.id}
                className="h-1 flex-1 rounded-full"
                style={{
                  background:
                    index <= step ? "var(--accent)" : "var(--chart-grid)",
                }}
                aria-hidden
              />
            ))}
          </div>
          <p className="font-mono text-[11px] text-[var(--muted)]">
            {step + 1} of {QUESTIONS.length}
          </p>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold">{question.prompt}</h2>
            {question.help && (
              <p className="mt-1 text-xs text-[var(--muted)]">{question.help}</p>
            )}
            <div className="mt-4 space-y-2">
              {question.answers.map((answer) => (
                <button
                  key={answer.id}
                  type="button"
                  onClick={() => choose(question.id, answer.id)}
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-left text-sm hover:border-[var(--accent)]"
                >
                  {answer.label}
                </button>
              ))}
            </div>
          </section>

          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((n) => Math.max(0, n - 1))}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              Back
            </button>
          )}
        </>
      )}

      {done && top && (
        <>
          <section className="rounded-xl border border-[var(--accent)] bg-[var(--surface)] p-5">
            <p className="flex items-center gap-2 font-mono text-[11px] tracking-wider text-[var(--muted)] uppercase">
              <Compass className="size-3.5 text-[var(--accent)]" aria-hidden />
              Suggested start
            </p>
            <h2 className="mt-1.5 text-lg font-semibold">{top.path.name}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {top.path.tagline}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => commit(top.path.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[#0a0d12]"
              >
                {ready && selectedPathId === top.path.id ? (
                  <>
                    <Check className="size-3.5" aria-hidden />
                    This is your path
                  </>
                ) : (
                  "Start on this path"
                )}
              </button>
              <Link
                href="/"
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                See it on the map
              </Link>
              <button
                type="button"
                onClick={restart}
                className="ml-auto inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <RotateCcw className="size-3" aria-hidden />
                Start over
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold">Close behind</h2>
            <p className="mt-0.5 mb-3 text-xs text-[var(--muted)]">
              These were nearly as good a fit. Most of the early skills overlap,
              so starting on one does not shut the others out.
            </p>
            <ul className="space-y-2">
              {results.slice(1, 4).map((result) => (
                <li key={result.path.id} className="flex items-center gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {result.path.name}
                  </span>
                  <span className="font-mono text-[10px] text-[var(--muted)]">
                    {result.share}%
                  </span>
                  <button
                    type="button"
                    onClick={() => commit(result.path.id)}
                    className="shrink-0 rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    Pick this
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-4 text-[var(--accent)]" aria-hidden />
              What to do this week
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
              {ADVICE[experienceLevel(answers)]}
            </p>
            <ol className="mt-3 space-y-1.5">
              {starting.map((skill, index) => (
                <li key={skill.id} className="flex gap-2.5 text-sm">
                  <span className="shrink-0 font-mono text-xs text-[var(--muted)]">
                    {index + 1}.
                  </span>
                  <span className="min-w-0">
                    <span className="font-medium">{skill.name}</span>
                    <span className="block text-xs text-[var(--muted)]">
                      {skill.summary}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/course"
                className="rounded-lg bg-[var(--surface-raised)] px-3 py-1.5 text-xs hover:bg-[var(--border)]"
              >
                Open Day 1 of the course
              </Link>
              <Link
                href="/"
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Browse the whole map
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
