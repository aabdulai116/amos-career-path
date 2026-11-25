"use client";

import { useRef, useState } from "react";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { usePython } from "@/components/python/PythonProvider";
import { PYODIDE_VERSION, describeOutcome } from "@/lib/python";

/**
 * A Python scratchpad, used both by the NeetCode problems and by the course
 * exercises. Deliberately not a judge: there is no hidden test suite, because
 * for the problems the real cases live on LeetCode, and for the exercises the
 * point is that I decide what "right" looks like. You write the code and the
 * asserts, press Run, and real CPython tells you the truth.
 *
 * Whatever is in the box is saved by the caller, so it doubles as the record.
 */
export function PythonEditor({
  id,
  starter,
  value,
  onChange,
  label = "My solution",
  rows = 12,
}: {
  /** Unique on the page; used for the element ids that tie labels together. */
  id: string;
  /** Shown when nothing has been written yet. */
  starter: string;
  value: string;
  onChange: (code: string) => void;
  label?: string;
  rows?: number;
}) {
  const { phase, stage, version, error, run } = usePython();
  const [output, setOutput] = useState<string | null>(null);
  const [ok, setOk] = useState(true);
  const [busy, setBusy] = useState(false);
  const [ms, setMs] = useState<number | null>(null);
  const streamed = useRef<string[]>([]);

  const code = value === "" ? starter : value;
  const loading = busy && phase !== "ready";
  const outputId = `py-${id}-output`;

  const onRun = async (): Promise<void> => {
    setBusy(true);
    setOutput(null);
    setMs(null);
    streamed.current = [];

    const outcome = await run(code, (text) => {
      streamed.current.push(text);
      setOutput(streamed.current.join("").trimEnd());
    });

    setOk(outcome.ok && !outcome.timedOut && !outcome.bootFailed);
    setOutput(describeOutcome(outcome));
    setMs(outcome.timedOut || outcome.bootFailed ? null : outcome.ms);
    setBusy(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor={`py-${id}`}
          className="text-xs font-medium text-[var(--muted)]"
        >
          {label}
        </label>
        <div className="flex items-center gap-2">
          {value !== "" && (
            <button
              type="button"
              onClick={() => onChange(starter)}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <RotateCcw className="size-3" aria-hidden />
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onRun}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--surface-raised)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="size-3 animate-spin" aria-hidden />
            ) : (
              <Play className="size-3" aria-hidden />
            )}
            {busy ? "Running" : "Run"}
          </button>
        </div>
      </div>

      <textarea
        id={`py-${id}`}
        value={code}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        rows={rows}
        // Tab should indent, not leave the box; a code editor that loses focus
        // on Tab is unusable, and Python without indentation is nothing.
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          event.preventDefault();
          const area = event.currentTarget;
          const { selectionStart: start, selectionEnd: end } = area;
          onChange(`${code.slice(0, start)}    ${code.slice(end)}`);
          requestAnimationFrame(() => {
            area.selectionStart = start + 4;
            area.selectionEnd = start + 4;
          });
        }}
        className="w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-relaxed text-[var(--foreground)]"
      />

      {loading && (
        <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
          <Loader2 className="size-3 animate-spin" aria-hidden />
          {stage || "Starting up"} — CPython {PYODIDE_VERSION} is a ~12 MB
          download, once per visit.
        </p>
      )}

      {phase === "failed" && error !== null && (
        <p role="alert" className="text-xs text-[#dd4f7d]">
          Python could not start: {error}
        </p>
      )}

      {output !== null && (
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor={outputId}
              className="text-xs font-medium text-[var(--muted)]"
            >
              Output
            </label>
            {ms !== null && (
              <span className="font-mono text-[10px] text-[var(--muted)]">
                {ms} ms
                {version !== null && ` · Python ${version}`}
              </span>
            )}
          </div>
          <pre
            id={outputId}
            aria-live="polite"
            className="mt-1 max-h-56 overflow-auto rounded-lg border p-3 font-mono text-xs whitespace-pre-wrap"
            style={{
              borderColor: ok ? "var(--border)" : "#dd4f7d",
              background: "var(--background)",
              color: ok ? "var(--foreground)" : "#dd4f7d",
            }}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
