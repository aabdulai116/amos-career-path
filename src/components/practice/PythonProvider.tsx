"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PythonRunner, type RunOutcome } from "@/lib/python";

type Phase = "idle" | "loading" | "ready" | "failed";

interface PythonContextValue {
  phase: Phase;
  /** What the loader is doing, while phase is "loading". */
  stage: string;
  version: string | null;
  error: string | null;
  run: (code: string, onStdout?: (text: string) => void) => Promise<RunOutcome>;
}

const PythonContext = createContext<PythonContextValue | null>(null);

/**
 * One interpreter for the whole page. The worker is spawned on the first run
 * rather than on mount, so opening the page costs nothing; after that every
 * problem's editor shares the same Python process.
 */
export function PythonProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [stage, setStage] = useState("");
  const [version, setVersion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runnerRef = useRef<PythonRunner | null>(null);

  if (runnerRef.current === null) {
    runnerRef.current = new PythonRunner({
      onStatus: (next) => setStage(next),
      onReady: (v) => {
        setVersion(v);
        setPhase("ready");
      },
      onFatal: (message) => {
        setError(message);
        setPhase("failed");
      },
    });
  }

  // The worker holds a 12 MB interpreter; let it go when the page does.
  useEffect(() => {
    const runner = runnerRef.current;
    return () => runner?.terminate();
  }, []);

  const run = useCallback(
    (code: string, onStdout?: (text: string) => void) => {
      const runner = runnerRef.current;
      if (runner === null) {
        throw new Error("The Python runner is unavailable.");
      }
      if (!runner.started) {
        setPhase("loading");
        setStage("Starting up");
      }
      return runner.run(code, onStdout);
    },
    [],
  );

  const value = useMemo<PythonContextValue>(
    () => ({ phase, stage, version, error, run }),
    [phase, stage, version, error, run],
  );

  return (
    <PythonContext.Provider value={value}>{children}</PythonContext.Provider>
  );
}

export const usePython = (): PythonContextValue => {
  const value = useContext(PythonContext);
  if (value === null) {
    throw new Error("usePython must be used inside a PythonProvider.");
  }
  return value;
};
