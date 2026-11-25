import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { domainById } from "@/data/domains";
import type { Recommendation } from "@/lib/graph";

/**
 * What to start now: available skills, highest leverage first. "Unlocks" is the
 * number of other skills that sit downstream, so the top of this list is the
 * work that opens the most of the map.
 */
export function RecommendedNext({
  recommendations,
  pathName,
  ready,
}: {
  recommendations: Recommendation[];
  pathName: string | null;
  ready: boolean;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <h2 className="text-sm font-semibold">Start next</h2>
      <p className="mt-0.5 text-xs text-[var(--muted)]">
        {pathName
          ? `Unlocked on the ${pathName} path, most unlocked first`
          : "Unlocked now, ordered by how much each one opens up"}
      </p>

      <ol className="mt-4 min-h-40 space-y-1.5">
        {!ready && (
          <li className="text-sm text-[var(--muted)]">Loading your progress…</li>
        )}
        {ready && recommendations.length === 0 && (
          <li className="text-sm text-[var(--muted)]">
            Nothing is unlocked on this path. Finish something in progress, or
            switch paths above.
          </li>
        )}
        {ready &&
          recommendations.map(({ skill, unlocks }) => {
            const domain = domainById[skill.domain];
            return (
              <li key={skill.id}>
                <Link
                  href={`/?skill=${skill.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-[var(--border)] hover:bg-[var(--surface-raised)]"
                >
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: domain?.color }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{skill.name}</span>
                    <span className="block font-mono text-[10px] text-[var(--muted)]">
                      {domain?.name} · {skill.estHours}h
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-xs tabular-nums">
                      {unlocks}
                    </span>
                    <span className="block text-[10px] text-[var(--muted)]">
                      unlocks
                    </span>
                  </span>
                  <ArrowRight
                    className="size-3.5 shrink-0 text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
      </ol>
    </section>
  );
}
