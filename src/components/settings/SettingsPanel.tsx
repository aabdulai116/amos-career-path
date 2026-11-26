"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  Download,
  Trash2,
  Upload,
} from "lucide-react";
import { skills } from "@/data/skills";
import { DEFAULT_RECRUITING_DATE, useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";
import { countdownTo } from "@/lib/dashboard";
import { isValidDayKey } from "@/lib/dates";

type Notice = { tone: "ok" | "error"; message: string } | null;

export function SettingsPanel() {
  const ready = useHydrateProgress();
  const recruitingDate = useProgress((s) => s.settings.recruitingDate);
  const setRecruitingDate = useProgress((s) => s.setRecruitingDate);
  const exportState = useProgress((s) => s.exportState);
  const importState = useProgress((s) => s.importState);
  const resetAll = useProgress((s) => s.resetAll);
  const skillProgress = useProgress((s) => s.skills);
  const dayLogs = useProgress((s) => s.dayLogs);
  const customResources = useProgress((s) => s.customResources);

  const fileInput = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const tracked = Object.keys(skillProgress).length;
  const done = Object.values(skillProgress).filter(
    (p) => p.status === "done",
  ).length;
  const countdown = ready ? countdownTo(recruitingDate) : null;

  const handleExport = (): void => {
    const payload = JSON.stringify(exportState(), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `career-compass-progress-${stamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice({ tone: "ok", message: `Exported ${tracked} tracked skills.` });
  };

  const handleImport = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const result = importState(parsed);
      setNotice(
        result.ok
          ? { tone: "ok", message: `Imported ${file.name}.` }
          : { tone: "error", message: result.error },
      );
    } catch {
      setNotice({ tone: "error", message: "That file is not valid JSON." });
    }
  };

  const handleReset = (): void => {
    resetAll();
    setConfirmingReset(false);
    setNotice({ tone: "ok", message: "Progress cleared." });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-5 py-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Progress lives in this browser only. Export it before you clear site
          data or move machines.
        </p>
      </div>

      {notice && (
        <p
          role="status"
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
            notice.tone === "ok"
              ? "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
              : "border-[#e66767]/40 bg-[#e66767]/10 text-[#e66767]"
          }`}
        >
          {notice.tone === "ok" ? (
            <Check className="size-4 shrink-0" aria-hidden />
          ) : (
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
          )}
          {notice.message}
        </p>
      )}

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarClock className="size-4" aria-hidden />
          Recruiting target date
        </h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          The date the dashboard counts down to and paces against. Summer 2028
          internship applications open around {DEFAULT_RECRUITING_DATE}.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="date"
            aria-label="Recruiting target date"
            value={recruitingDate}
            onChange={(event) => {
              if (isValidDayKey(event.target.value)) {
                setRecruitingDate(event.target.value);
              }
            }}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <span className="font-mono text-xs text-[var(--muted)]">
            {countdown === null
              ? "—"
              : countdown.overdue
                ? `${Math.abs(countdown.days)} days ago`
                : `${countdown.days} days away`}
          </span>
          {recruitingDate !== DEFAULT_RECRUITING_DATE && (
            <button
              type="button"
              onClick={() => setRecruitingDate(DEFAULT_RECRUITING_DATE)}
              className="text-xs text-[var(--muted)] underline underline-offset-2 hover:text-[var(--foreground)]"
            >
              reset to {DEFAULT_RECRUITING_DATE}
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-semibold">Your data</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Skills touched", ready ? `${tracked}/${skills.length}` : "—"],
            ["Done", ready ? String(done) : "—"],
            ["Days logged", ready ? String(Object.keys(dayLogs).length) : "—"],
            ["Own links", ready ? String(customResources.length) : "—"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] text-[var(--muted)]">{label}</dt>
              <dd className="mt-0.5 font-mono text-lg">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]"
          >
            <Download className="size-4" aria-hidden />
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]"
          >
            <Upload className="size-4" aria-hidden />
            Import JSON
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            onChange={(event) => void handleImport(event)}
            className="hidden"
          />
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Importing replaces everything currently saved. Export first if you are
          not sure.
        </p>
      </section>

      <section className="rounded-xl border border-[#e66767]/30 bg-[var(--surface)] p-5">
        <h2 className="text-sm font-semibold">Reset progress</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Clears every status, note, proof link, logged hour and saved link.
          Content — the skills, paths and curated resources — is untouched.
        </p>
        {confirmingReset ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-[#e66767]">
              Delete {tracked} skills and {Object.keys(dayLogs).length} logged
              days? This cannot be undone.
            </span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-[#e66767] px-3 py-2 text-sm font-semibold text-[#0a0d12]"
            >
              <Trash2 className="size-4" aria-hidden />
              Yes, delete it all
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#e66767]/40 px-3 py-2 text-sm text-[#e66767] hover:bg-[#e66767]/10"
          >
            <Trash2 className="size-4" aria-hidden />
            Reset progress
          </button>
        )}
      </section>
    </div>
  );
}
