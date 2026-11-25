import type { NamedSummary } from "@/lib/dashboard";

/**
 * A name, a bar and a figure per row, bars aligned on one baseline. The bar
 * encodes a ratio, so every bar is the same hue; the dot beside the name
 * carries identity and matches the Atlas.
 */
export function MeterList({
  rows,
  showDots = true,
  emptyLabel = "Nothing here yet.",
}: {
  rows: NamedSummary[];
  showDots?: boolean;
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-[var(--muted)]">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.id} className="grid grid-cols-[9rem_1fr_5.5rem] items-center gap-3">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            {showDots && (
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{ background: row.color }}
              />
            )}
            <span className="truncate">{row.name}</span>
          </span>
          <span
            className="h-2 overflow-hidden rounded-full bg-[var(--chart-grid)]"
            role="img"
            aria-label={`${row.name}: ${row.done} of ${row.total} done, ${row.percent} percent`}
          >
            <span
              className="block h-full rounded-r-[4px] transition-[width] duration-500"
              style={{
                width: `${row.percent}%`,
                background: "var(--chart-series)",
              }}
            />
          </span>
          <span className="text-right font-mono text-xs text-[var(--muted)] tabular-nums">
            {row.done}/{row.total}
            <span className="ml-1.5 text-[var(--foreground)]">
              {Math.round(row.percent)}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
