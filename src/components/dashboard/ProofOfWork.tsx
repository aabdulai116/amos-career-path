import Link from "next/link";
import { ExternalLink, FileWarning } from "lucide-react";
import { domainById } from "@/data/domains";
import type { ProofEntry } from "@/lib/dashboard";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Locale-independent so the server and client render the same string. */
const completedOn = (iso: string | null): string => {
  if (iso === null) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * Everything finished, with the artefact that proves it. This is the list I
 * pull resume bullets from, so a finished skill with no link is shown rather
 * than hidden - the gap is the point.
 */
export function ProofOfWork({
  entries,
  ready,
}: {
  entries: ProofEntry[];
  ready: boolean;
}) {
  const missing = entries.filter((e) => e.proofUrl.trim() === "").length;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">Proof of work</h2>
        {ready && entries.length > 0 && (
          <p className="text-xs text-[var(--muted)]">
            {entries.length} done
            {missing > 0 && ` · ${missing} with no link yet`}
          </p>
        )}
      </div>

      <ul className="mt-4 min-h-24 space-y-1">
        {!ready && (
          <li className="text-sm text-[var(--muted)]">Loading your progress…</li>
        )}
        {ready && entries.length === 0 && (
          <li className="text-sm text-[var(--muted)]">
            Nothing finished yet. Mark a skill done in the Atlas and link the repo,
            notebook or problem list that proves it.
          </li>
        )}
        {ready &&
          entries.map((entry) => {
            const domain = domainById[entry.skill.domain];
            const hasProof = entry.proofUrl.trim() !== "";
            return (
              <li
                key={entry.skill.id}
                className="flex items-center gap-3 border-b border-[var(--border)] py-2 last:border-b-0"
              >
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: domain?.color }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">
                    {entry.skill.name}
                  </span>
                  <span className="block font-mono text-[10px] text-[var(--muted)]">
                    {completedOn(entry.completedAt) || "no date"}
                    {entry.hoursLogged > 0 && ` · ${entry.hoursLogged}h`}
                  </span>
                </span>
                {hasProof ? (
                  <a
                    href={entry.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-xs text-[var(--accent)] hover:underline"
                  >
                    proof
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : (
                  <Link
                    href={`/?skill=${entry.skill.id}`}
                    className="inline-flex shrink-0 items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    <FileWarning className="size-3" aria-hidden />
                    add a link
                  </Link>
                )}
              </li>
            );
          })}
      </ul>
    </section>
  );
}
