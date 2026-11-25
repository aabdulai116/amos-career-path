import type { Problem } from "@/lib/types";

/**
 * The page's side of the Python runner. The interpreter itself lives in
 * public/python/worker.js; everything here is either a pure helper (and tested)
 * or the thin client that talks to the worker.
 */

export const PYODIDE_VERSION = "314.0.8";
const WORKER_URL = "/python/worker.js";

/**
 * A run is killed after this long. Enough for a brute-force sanity check.
 * This clock starts when the interpreter picks the code up, not when the page
 * posts it - the first run of a visit waits on a 12 MB download first.
 */
export const RUN_TIMEOUT_MS = 15_000;

/** How long the interpreter itself gets to download and boot. */
export const BOOT_TIMEOUT_MS = 180_000;

export interface RunOutcome {
  ok: boolean;
  /** Everything printed, in order, plus any Python traceback. */
  output: string;
  /** The repr of the final expression, when there was one. */
  value: string | null;
  error: string | null;
  ms: number;
  timedOut: boolean;
  /** True when it was the interpreter that never arrived, not the code. */
  bootFailed: boolean;
}

/* ------------------------------------------------------------ pure helpers */

/**
 * A starting point for a problem: the facts about it and a link, then an empty
 * space. Deliberately not a function signature - LeetCode's signatures are not
 * in NeetCode's data, and a guessed `def twoSum(self, nums, target)` that is
 * subtly wrong is worse than no stub at all. Paste the real one from LeetCode.
 */
export const starterCode = (problem: Problem): string =>
  [
    `# ${problem.title}  -  ${problem.difficulty}  -  ${problem.pattern}`,
    `# ${problem.freeUrl ?? `https://leetcode.com/problems/${problem.slug}/`}`,
    "#",
    "# Paste the signature from LeetCode, write the solution, then assert your",
    "# way through the examples. Anything you print shows up below.",
    "",
    "",
  ].join("\n");

/**
 * Pyodide hands back the whole traceback, including the frames inside its own
 * loader. Those frames are noise - the only line numbers that mean anything are
 * the ones in the code I wrote, which Python labels `<exec>`.
 */
export const formatPythonError = (raw: string): string => {
  const lines = raw.split("\n");
  const kept: string[] = [];
  let skipping = false;

  lines.forEach((line) => {
    const isPyodideFrame =
      /File "\/lib\/python\d/.test(line) ||
      /File "\/home\/pyodide/.test(line) ||
      line.includes("_pyodide/_base.py") ||
      line.includes("pyodide/_package_loader");

    if (isPyodideFrame) {
      skipping = true;
      return;
    }
    // The indented source line that follows a frame belongs to that frame.
    if (skipping && /^\s{4,}\S/.test(line) && !line.includes("File \"")) return;
    skipping = false;
    kept.push(line);
  });

  return kept
    .join("\n")
    // `File "<exec>", line 4` is Python naming the buffer it was handed; the
    // only part that means anything to me is the line number.
    .replace(/File "<exec>", line /g, "line ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/** Lines printed by a run, for display. Empty output gets a placeholder. */
export const describeOutcome = (outcome: RunOutcome): string => {
  if (outcome.bootFailed) {
    return outcome.error ?? "Python could not be downloaded. Check the connection and try again.";
  }
  if (outcome.timedOut) {
    return `Stopped after ${Math.round(RUN_TIMEOUT_MS / 1000)}s - probably an infinite loop.`;
  }
  if (!outcome.ok && outcome.error !== null) {
    const traceback = formatPythonError(outcome.error);
    // Whatever printed before the exception is usually the clue to it, so keep
    // it rather than replacing it with the traceback.
    return outcome.output.trim() === ""
      ? traceback
      : `${outcome.output.trimEnd()}\n\n${traceback}`;
  }
  if (outcome.output.trim() === "") {
    return outcome.value === null
      ? "Ran cleanly. Nothing was printed."
      : outcome.value;
  }
  return outcome.output.trimEnd();
};

/* ------------------------------------------------------------------ client */

type WorkerMessage =
  | { type: "status"; stage: string }
  | { type: "ready"; version: string }
  | { type: "started"; id: number }
  | { type: "stdout"; id: number | null; text: string }
  | {
      type: "result";
      id: number;
      ok: boolean;
      value?: string | null;
      error?: string;
      ms: number;
    }
  | { type: "fatal"; error: string };

export interface RunnerHandlers {
  onStatus: (stage: string) => void;
  onReady: (version: string) => void;
  onFatal: (error: string) => void;
}

/**
 * Owns the worker. One instance per page; the worker is only spawned on the
 * first run, so visiting the page does not pull 12 MB down for nothing.
 */
export class PythonRunner {
  private worker: Worker | null = null;
  private nextId = 1;
  private pending: Map<
    number,
    {
      resolve: (outcome: RunOutcome) => void;
      output: string[];
      timer: number;
      /** False until the interpreter has the code; see RUN_TIMEOUT_MS. */
      running: boolean;
      onStdout?: (text: string) => void;
    }
  > = new Map();

  constructor(private readonly handlers: RunnerHandlers) {}

  /** True once the worker exists; it may still be loading. */
  get started(): boolean {
    return this.worker !== null;
  }

  private spawn(): Worker {
    if (this.worker !== null) return this.worker;
    // A module worker, not a classic one: importScripts() is same-origin only
    // in practice, while a module worker can import Pyodide from the CDN.
    const worker = new Worker(WORKER_URL, { type: "module" });
    worker.onmessage = (event: MessageEvent<WorkerMessage>) =>
      this.receive(event.data);
    worker.onerror = () =>
      this.handlers.onFatal("The Python worker failed to start.");
    this.worker = worker;
    return worker;
  }

  private receive(message: WorkerMessage): void {
    switch (message.type) {
      case "status":
        this.handlers.onStatus(message.stage);
        return;
      case "ready":
        this.handlers.onReady(message.version);
        return;
      case "started": {
        const entry = this.pending.get(message.id);
        if (entry === undefined) return;
        // Swap the generous boot budget for the tight execution one.
        clearTimeout(entry.timer);
        entry.running = true;
        entry.timer = this.arm(message.id, RUN_TIMEOUT_MS);
        return;
      }
      case "stdout": {
        if (message.id === null) return;
        const entry = this.pending.get(message.id);
        if (entry === undefined) return;
        entry.output.push(message.text);
        entry.onStdout?.(message.text);
        return;
      }
      case "result": {
        const entry = this.pending.get(message.id);
        if (entry === undefined) return;
        clearTimeout(entry.timer);
        this.pending.delete(message.id);
        entry.resolve({
          ok: message.ok,
          output: entry.output.join(""),
          value: message.value ?? null,
          error: message.error ?? null,
          ms: message.ms,
          timedOut: false,
          bootFailed: false,
        });
        return;
      }
      case "fatal":
        this.handlers.onFatal(message.error);
        this.failAll(message.error);
        return;
    }
  }

  private failAll(error: string): void {
    this.pending.forEach((entry) => {
      clearTimeout(entry.timer);
      entry.resolve({
        ok: false,
        output: entry.output.join(""),
        value: null,
        error,
        ms: 0,
        timedOut: false,
        bootFailed: !entry.running,
      });
    });
    this.pending.clear();
  }

  /** onStdout streams output for this run only, so several rows can print. */
  run(code: string, onStdout?: (text: string) => void): Promise<RunOutcome> {
    const worker = this.spawn();
    const id = this.nextId++;

    return new Promise<RunOutcome>((resolve) => {
      // Starts on the boot budget; "started" swaps it for the run budget.
      this.pending.set(id, {
        resolve,
        output: [],
        timer: this.arm(id, BOOT_TIMEOUT_MS),
        running: false,
        onStdout,
      });
      worker.postMessage({ type: "run", id, code });
    });
  }

  /**
   * A runaway loop cannot be interrupted from inside the interpreter, so the
   * only reliable stop is to destroy the worker; the next run spawns a new one.
   */
  private arm(id: number, ms: number): number {
    return window.setTimeout(() => {
      const entry = this.pending.get(id);
      if (entry === undefined) return;
      this.pending.delete(id);
      this.terminate();
      entry.resolve({
        ok: false,
        output: entry.output.join(""),
        value: null,
        error: null,
        ms,
        timedOut: entry.running,
        bootFailed: !entry.running,
      });
    }, ms);
  }

  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
  }
}
