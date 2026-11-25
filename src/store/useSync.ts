"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";
import type { ProgressState } from "@/lib/types";

export type SyncPhase = "local" | "idle" | "syncing" | "synced" | "error";

export interface SyncStatus {
  phase: SyncPhase;
  lastSyncedAt: string | null;
  error: string | null;
  /** Push now, regardless of the debounce. */
  syncNow: () => void;
}

/** How long after the last edit to push. Long enough to batch a burst. */
const DEBOUNCE_MS = 4000;

const snapshot = (state: ProgressState): string =>
  JSON.stringify([
    state.skills,
    state.course,
    state.problems,
    state.companies,
    state.applications,
    state.customResources,
    state.dayLogs,
    state.settings,
  ]);

/**
 * Keeps this browser and the account in step.
 *
 * Local storage stays the source of truth while you work, so the app never
 * waits on the network to record a solved problem. Sync is a background push
 * of the whole document; the server merges and returns the result, which this
 * adopts. One endpoint, one round trip, and no negotiation.
 *
 * Signed out, it does nothing at all - the app works exactly as it did before
 * accounts existed, which is what a first-year clicking a shared link gets.
 */
export const useSync = (): SyncStatus => {
  const { data: session, status } = useSession();
  const hydrated = useHydrateProgress();
  const exportState = useProgress((s) => s.exportState);
  const importState = useProgress((s) => s.importState);

  const [syncPhase, setPhase] = useState<SyncPhase>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // What was last agreed with the server. Adopting a response sets this, so
  // adopting it does not itself look like a change worth pushing back.
  const agreed = useRef<string | null>(null);
  const inFlight = useRef(false);
  const timer = useRef<number | null>(null);

  const signedIn = status === "authenticated" && Boolean(session?.user);

  const push = useCallback(async (): Promise<void> => {
    if (!signedIn || inFlight.current) return;
    inFlight.current = true;
    setPhase("syncing");
    setError(null);

    try {
      const state = exportState();
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(state),
      });
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          body !== null && typeof body === "object" && "error" in body
            ? String((body as { error: unknown }).error)
            : `Sync failed (${response.status})`;
        throw new Error(message);
      }

      const payload = (await response.json()) as {
        state: ProgressState;
        syncedAt: string;
      };
      const result = importState(payload.state);
      if (!result.ok) throw new Error(result.error);

      agreed.current = snapshot(payload.state);
      setLastSyncedAt(payload.syncedAt);
      setPhase("synced");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setPhase("error");
    } finally {
      inFlight.current = false;
    }
  }, [signedIn, exportState, importState]);

  // First sync after signing in: sends whatever this browser already has, so
  // work done before making an account is adopted rather than lost.
  useEffect(() => {
    if (!signedIn || !hydrated || agreed.current !== null) return;
    void push();
  }, [signedIn, hydrated, push]);

  // Afterwards, push a while after the last edit.
  useEffect(() => {
    if (!signedIn || !hydrated) return;

    return useProgress.subscribe((state) => {
      const current = snapshot(state);
      if (agreed.current === null || current === agreed.current) return;
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void push(), DEBOUNCE_MS);
    });
  }, [signedIn, hydrated, push]);

  // Signing out forgets what was agreed, so signing back in - possibly as
  // someone else - starts from a clean first sync. A ref, not state: the
  // phase is derived below rather than stored, so there is nothing to reset.
  useEffect(() => {
    if (!signedIn) agreed.current = null;
  }, [signedIn]);

  const syncNow = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    void push();
  }, [push]);

  return {
    // Signed out there is nothing to sync, so that is the whole answer and
    // it does not need to be kept in state.
    phase: signedIn ? syncPhase : "local",
    lastSyncedAt,
    error,
    syncNow,
  };
};
