"use client";

import { useState } from "react";
import { ChevronDown, GraduationCap, Play } from "lucide-react";
import { lessons, ticksToPrice, type LessonDemo } from "@/lib/orderbook-lessons";
import type { EngineTrade } from "@/lib/engine";

export interface DemoOutcome {
  trades: EngineTrade[];
  restingAfter: number;
}

/**
 * The explainer above the book. Each demo drives the real engine below, so the
 * reader watches the thing being described actually happen rather than reading
 * a description of it.
 */
export function LearnPanel({
  onRunDemo,
}: {
  onRunDemo: (demo: LessonDemo) => DemoOutcome;
}) {
  const [open, setOpen] = useState(true);
  const [ran, setRan] = useState<Record<string, DemoOutcome>>({});

  const run = (id: string, demo: LessonDemo): void => {
    // Run the demo first and store the plain result. Calling onRunDemo inside
    // the updater would execute it during render, where it sets state on the
    // parent - React warns, and in strict mode it would run twice.
    const outcome = onRunDemo(demo);
    setRan((current) => ({ ...current, [id]: outcome }));
  };

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="learn-panel-body"
        className="flex w-full items-center gap-2.5 px-5 py-4 text-left"
      >
        <GraduationCap className="size-4 shrink-0 text-[var(--accent)]" aria-hidden />
        <span className="flex-1">
          <span className="block text-sm font-semibold">
            How an order book works
          </span>
          <span className="block text-xs text-[var(--muted)]">
            Four ideas, three of them runnable against the engine below
          </span>
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-[var(--muted)] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id="learn-panel-body"
          className="space-y-5 border-t border-[var(--border)] px-5 py-5"
        >
          {lessons.map((lesson, index) => {
            const outcome = ran[lesson.id];
            return (
              <article key={lesson.id}>
                <h3 className="flex items-baseline gap-2 text-sm font-medium">
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {index + 1}
                  </span>
                  {lesson.title}
                </h3>
                {lesson.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-[var(--muted)]"
                  >
                    {paragraph}
                  </p>
                ))}

                {lesson.demo && (
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => run(lesson.id, lesson.demo as LessonDemo)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs transition-colors hover:border-[var(--accent)]"
                    >
                      <Play className="size-3" aria-hidden />
                      {lesson.demo.label}
                    </button>

                    {outcome && (
                      <div
                        role="status"
                        className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                      >
                        <p className="text-[13px] leading-relaxed">
                          {lesson.demo.watchFor}
                        </p>
                        <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-[var(--muted)] tabular-nums">
                          <div className="flex gap-1.5">
                            <dt>fills</dt>
                            <dd className="text-[var(--foreground)]">
                              {outcome.trades.length}
                            </dd>
                          </div>
                          {outcome.trades.map((trade, i) => (
                            <div key={i} className="flex gap-1.5">
                              <dt>{ticksToPrice(trade.price)}</dt>
                              <dd className="text-[var(--foreground)]">
                                × {trade.quantity}
                              </dd>
                            </div>
                          ))}
                          <div className="flex gap-1.5">
                            <dt>resting after</dt>
                            <dd className="text-[var(--foreground)]">
                              {outcome.restingAfter}
                            </dd>
                          </div>
                        </dl>
                        <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                          The ladder below is showing this book now.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
