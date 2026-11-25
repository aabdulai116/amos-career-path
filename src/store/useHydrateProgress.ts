"use client";

import { useEffect } from "react";
import { useProgress } from "@/store/progress";

/**
 * Loads saved progress out of localStorage after mount.
 *
 * The store is created with `skipHydration`, so the first client render matches
 * what the server sent and React hydrates without a mismatch. This hook then
 * pulls the real state in. Returns false until that has happened, for anything
 * that would rather show a placeholder than a zero.
 */
export const useHydrateProgress = (): boolean => {
  useEffect(() => {
    void useProgress.persist.rehydrate();
  }, []);
  return useProgress((state) => state.hasHydrated);
};
