"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * What a crash looks like to someone who is not me.
 *
 * Without this, a thrown error in production renders a blank white page: no
 * explanation, no way back, and no clue whether their work survived. The
 * first thing anyone wants to know is whether they have lost anything, so
 * that is the first thing this says.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Shows up in the Vercel logs with the digest, which is the only way to
    // tie a report of "it broke" to the actual stack trace.
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-full items-center justify-center px-5 py-16">
      <div className="max-w-md space-y-4">
        <p className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#dd4f7d] uppercase">
          <AlertTriangle className="size-3.5" aria-hidden />
          Something broke
        </p>
        <h1 className="text-xl font-semibold tracking-tight">
          This page hit an error
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Your progress is safe — it is stored in this browser, and on your
          account if you are signed in. Nothing you have done has been lost.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[#0a0d12]"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Back to the map
          </Link>
        </div>
        {error.digest && (
          <p className="pt-2 font-mono text-[10px] text-[var(--muted)]">
            Error ref: {error.digest} — quote this if you report it.
          </p>
        )}
      </div>
    </div>
  );
}
