"use client";

import { useState } from "react";
import { Flame, Table2 } from "lucide-react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Deterministic, locale-independent, so the server and client agree. */
const shortDate = (dayKey: string): string => {
  const [, month, day] = dayKey.split("-");
  if (month === undefined || day === undefined) return "";
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
};

export interface WeekBucket {
  week: string;
  hours: number;
}

/**
 * Hours logged per week. One series, so no legend: the heading says what is
 * plotted. Only the best week is labelled directly; the rest is in the tooltip
 * and the table view.
 */
export function WeeklyHours({
  weeks,
  streak,
  longest,
  ready,
}: {
  weeks: WeekBucket[];
  streak: number;
  longest: number;
  ready: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const peak = Math.max(...weeks.map((w) => w.hours), 0);
  const scaleMax = peak === 0 ? 1 : Math.ceil(peak);
  const total = Math.round(weeks.reduce((sum, w) => sum + w.hours, 0) * 10) / 10;
  const peakIndex = weeks.findIndex((w) => w.hours === peak && peak > 0);

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Hours per week</h2>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            Last 12 weeks · {ready ? `${total}h logged` : "—"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm">
            <Flame className="size-4 text-[var(--chart-series)]" aria-hidden />
            <span className="font-mono tabular-nums">{ready ? streak : "—"}</span>
            <span className="text-xs text-[var(--muted)]">
              day streak{ready && longest > streak ? ` · best ${longest}` : ""}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            aria-expanded={showTable}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <Table2 className="size-3" aria-hidden />
            {showTable ? "Hide table" : "Table"}
          </button>
        </div>
      </div>

      <div className="relative mt-5 h-40">
        {/* Recessive hairline grid; the axis carries the values not labelled. */}
        {[0, 0.5, 1].map((fraction) => (
          <div
            key={fraction}
            aria-hidden
            className="absolute inset-x-0 flex items-center"
            style={{ bottom: `${fraction * 100}%` }}
          >
            <span className="w-9 shrink-0 pr-2 text-right font-mono text-[10px] text-[var(--muted)] tabular-nums">
              {Math.round(scaleMax * fraction * 10) / 10}
            </span>
            <span className="h-px flex-1 bg-[var(--chart-grid)]" />
          </div>
        ))}

        <div className="absolute inset-y-0 right-0 left-9 flex items-end gap-[2px]">
          {weeks.map((bucket, index) => {
            const height = ready ? (bucket.hours / scaleMax) * 100 : 0;
            return (
              <div
                key={bucket.week}
                className="group relative flex h-full flex-1 cursor-default flex-col justify-end"
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                aria-label={`Week of ${shortDate(bucket.week)}: ${bucket.hours} hours`}
              >
                {index === peakIndex && ready && (
                  <span className="mb-1 text-center font-mono text-[10px] text-[var(--foreground)] tabular-nums">
                    {bucket.hours}
                  </span>
                )}
                <span
                  className="mx-auto w-full max-w-6 rounded-t-[4px] transition-[height] duration-500"
                  style={{
                    height: `${Math.max(height, bucket.hours > 0 ? 2 : 0)}%`,
                    background: "var(--chart-series)",
                    opacity: hovered === null || hovered === index ? 1 : 0.55,
                  }}
                />
                {hovered === index && (
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-2 py-1 text-[11px] whitespace-nowrap">
                    <span className="text-[var(--muted)]">
                      week of {shortDate(bucket.week)}
                    </span>
                    <span className="ml-1.5 font-mono tabular-nums">
                      {bucket.hours}h
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-1.5 flex gap-[2px] pl-9">
        {weeks.map((bucket, index) => (
          <span
            key={bucket.week}
            className="flex-1 text-center font-mono text-[10px] text-[var(--muted)]"
          >
            {index === 0 || index === weeks.length - 1 || index === 6
              ? shortDate(bucket.week)
              : ""}
          </span>
        ))}
      </div>

      {peak === 0 && ready && (
        <p className="mt-3 text-xs text-[var(--muted)]">
          No hours logged yet. Open a skill in the Atlas and use the +0.5 / +1 / +2
          buttons as you work.
        </p>
      )}

      {showTable && (
        <table className="mt-4 w-full text-left text-xs">
          <caption className="sr-only">Hours logged per week</caption>
          <thead className="text-[var(--muted)]">
            <tr>
              <th scope="col" className="py-1 font-medium">Week of</th>
              <th scope="col" className="py-1 text-right font-medium">Hours</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {weeks.map((bucket) => (
              <tr key={bucket.week} className="border-t border-[var(--border)]">
                <td className="py-1">{shortDate(bucket.week)}</td>
                <td className="py-1 text-right">{bucket.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
