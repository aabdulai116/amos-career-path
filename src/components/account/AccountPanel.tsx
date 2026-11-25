"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import {
  AlertTriangle,
  Check,
  Cloud,
  CloudOff,
  Loader2,
  LogOut,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { progressSize } from "@/lib/sync";
import { useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";
import { useSync } from "@/store/useSync";

const PROVIDER_LABEL: Record<string, string> = {
  google: "Continue with Google",
  "microsoft-entra-id": "Continue with Microsoft",
};

export function AccountPanel({ providers }: { providers: string[] }) {
  const { data: session, status } = useSession();
  const ready = useHydrateProgress();
  const exportState = useProgress((s) => s.exportState);
  const { phase, lastSyncedAt, error, syncNow } = useSync();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const signedIn = status === "authenticated" && Boolean(session?.user);
  const size = ready ? progressSize(exportState()) : null;

  const onDelete = async (): Promise<void> => {
    setDeleting(true);
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (response.ok) await signOut({ callbackUrl: "/" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-5 py-6">
      <header>
        <p className="font-mono text-[11px] tracking-widest text-[var(--muted)] uppercase">
          Account
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          {signedIn ? "Your account" : "Keep your progress"}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Everything works signed out — your progress lives in this browser.
          Signing in moves it somewhere that survives a cleared cache, a new
          laptop, or your phone.
        </p>
      </header>

      {/* Signed in wins over "no providers". A session is an account, and if a
          provider's credentials are ever rotated or removed, the people
          already signed in must keep their sync controls and their delete
          button rather than being told accounts do not exist. */}
      {signedIn ? (
        <>
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {session?.user?.name ?? "Signed in"}
                </p>
                <p className="truncate text-xs text-[var(--muted)]">
                  {session?.user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <LogOut className="size-3.5" aria-hidden />
                Sign out
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                {phase === "syncing" ? (
                  <Loader2 className="size-4 animate-spin text-[var(--accent)]" aria-hidden />
                ) : phase === "error" ? (
                  <CloudOff className="size-4 text-[#dd4f7d]" aria-hidden />
                ) : (
                  <Cloud className="size-4 text-[#35a56b]" aria-hidden />
                )}
                {phase === "syncing"
                  ? "Syncing…"
                  : phase === "error"
                    ? "Sync failed"
                    : "Synced"}
              </h2>
              <button
                type="button"
                onClick={syncNow}
                disabled={phase === "syncing"}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--surface-raised)] px-3 py-1.5 text-xs hover:bg-[var(--border)] disabled:opacity-50"
              >
                <RefreshCw className="size-3.5" aria-hidden />
                Sync now
              </button>
            </div>

            {error !== null && (
              <p role="alert" className="mt-2 text-xs text-[#dd4f7d]">
                {error}
              </p>
            )}

            <p className="mt-2 text-xs text-[var(--muted)]">
              {lastSyncedAt === null
                ? "Not synced yet in this session."
                : `Last synced ${new Date(lastSyncedAt).toLocaleTimeString()}.`}{" "}
              Changes are pushed a few seconds after you stop typing.
            </p>

            {size !== null && (
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-5">
                {[
                  ["Skills", size.skills],
                  ["Days", size.days],
                  ["Problems", size.problems],
                  ["Companies", size.companies],
                  ["Applications", size.applications],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="text-[var(--muted)]">{label}</dt>
                    <dd className="font-mono tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          <section className="rounded-xl border border-[#dd4f7d] bg-[var(--surface)] p-5">
            <h2 className="text-sm font-semibold">Delete your account</h2>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              Removes the account and every record attached to it — skills,
              course days, problems, verdicts and applications. It cannot be
              undone, and the copy in this browser is not touched.
            </p>
            {confirmDelete ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void onDelete()}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#dd4f7d] px-3 py-1.5 text-xs font-medium text-[#0a0d12] disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Check className="size-3.5" aria-hidden />
                  )}
                  Yes, delete everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#dd4f7d] px-3 py-1.5 text-xs text-[#dd4f7d]"
              >
                <Trash2 className="size-3.5" aria-hidden />
                Delete account
              </button>
            )}
          </section>
        </>
      ) : providers.length === 0 ? (
        <section className="rounded-xl border border-[#ad7510] bg-[var(--surface)] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="size-4 text-[#ad7510]" aria-hidden />
            Accounts are not switched on
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
            No sign-in provider is configured, so this deployment is
            browser-only. That is a working mode, not a broken one — nothing
            else on the site needs an account. See{" "}
            <code className="font-mono">docs/SETUP.md</code> for how to turn
            accounts on.
          </p>
        </section>
      ) : (
        <>
          <section className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            {providers.map((provider) => (
              <button
                key={provider}
                type="button"
                onClick={() => void signIn(provider, { callbackUrl: "/account" })}
                className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-[#0a0d12]"
              >
                {PROVIDER_LABEL[provider] ?? `Continue with ${provider}`}
              </button>
            ))}
            <p className="pt-1 text-xs text-[var(--muted)]">
              No passwords. Signing in uses an account you already have, so
              there is nothing here for anyone to steal.
            </p>
          </section>

          {size !== null && size.total > 0 && (
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <h2 className="text-sm font-semibold">
                This browser already has {size.total} records
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                They are not lost when you sign in. The first sync sends what is
                here and merges it with the account, so work done before making
                one is kept.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
