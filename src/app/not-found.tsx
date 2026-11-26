import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center px-5 py-16">
      <div className="max-w-md space-y-4">
        <p className="font-mono text-[11px] tracking-widest text-[var(--muted)] uppercase">
          404
        </p>
        <h1 className="text-xl font-semibold tracking-tight">
          There is nothing at this address
        </h1>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          The link may be out of date, or mistyped. Everything in the app is
          reachable from the navigation at the top.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/start"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[#0a0d12]"
          >
            <Compass className="size-3.5" aria-hidden />
            Start here
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            The skill map
          </Link>
        </div>
      </div>
    </div>
  );
}
