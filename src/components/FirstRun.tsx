"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, X } from "lucide-react";
import { useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";

/**
 * A pointer to the intake for someone who has just arrived.
 *
 * A first visit currently lands on the Atlas: ninety-seven skills and nine
 * paths at once, which is the exact wall the intake exists to avoid. A hard
 * redirect would be worse - it would hijack a link someone deliberately sent
 * to a specific page - so this is a bar that can be dismissed and never
 * comes back.
 */
export function FirstRun() {
  const ready = useHydrateProgress();
  const onboardedAt = useProgress((s) => s.settings.onboardedAt);
  const markOnboarded = useProgress((s) => s.markOnboarded);
  const pathname = usePathname();

  // Nothing until storage has been read, or the bar would flash for people
  // who settled this months ago.
  if (!ready || onboardedAt !== null || pathname === "/start") return null;

  return (
    <div className="flex items-center gap-3 border-b border-[var(--accent)] bg-[var(--surface)] px-4 py-2">
      <Compass className="size-4 shrink-0 text-[var(--accent)]" aria-hidden />
      <p className="min-w-0 flex-1 text-xs text-[var(--muted)]">
        <span className="text-[var(--foreground)]">New here?</span> Six
        questions to work out where to start — it suggests a path and five
        things to do this week.
      </p>
      <Link
        href="/start"
        className="shrink-0 rounded-md bg-[var(--accent)] px-2.5 py-1 text-xs font-medium whitespace-nowrap text-[#0a0d12]"
      >
        Start here
      </Link>
      <button
        type="button"
        onClick={markOnboarded}
        aria-label="Dismiss, I know where I am going"
        className="shrink-0 rounded-md p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
