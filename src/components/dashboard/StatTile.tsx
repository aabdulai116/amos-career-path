import type { ReactNode } from "react";

/**
 * One headline number. A row of these replaces what would otherwise be a
 * grouped bar chart of four unrelated measures.
 */
export function StatTile({
  label,
  value,
  sub,
  accent,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-2 text-[11px] tracking-wider text-[var(--muted)] uppercase">
        {icon}
        {label}
      </div>
      <p
        className="mt-2 font-mono text-3xl leading-none"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-[var(--muted)]">{sub}</p>}
    </div>
  );
}
