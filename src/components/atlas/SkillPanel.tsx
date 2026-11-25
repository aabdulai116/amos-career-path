"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ExternalLink,
  Link2,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { DomainIcon } from "@/components/DomainIcon";
import { Markdown } from "@/components/Markdown";
import { domainById } from "@/data/domains";
import { resourceId, resourcesBySkill } from "@/data/resources";
import { skillById } from "@/data/skills";
import { directUnlocks } from "@/lib/graph";
import type {
  CustomResource,
  Resource,
  ResourceLevel,
  Skill,
  SkillProgress,
  SkillStatus,
} from "@/lib/types";

const LEVEL_ORDER: ResourceLevel[] = ["beginner", "intermediate", "advanced"];

const STATUS_COPY: Record<SkillStatus, string> = {
  locked: "Locked",
  available: "Available",
  in_progress: "In progress",
  done: "Done",
};

const HOUR_STEPS = [0.5, 1, 2];

interface SkillPanelProps {
  skill: Skill;
  status: SkillStatus;
  progress: SkillProgress | undefined;
  statuses: Record<string, SkillStatus>;
  allSkills: Skill[];
  customResources: CustomResource[];
  onClose: () => void;
  onSelectSkill: (id: string) => void;
  onToggleResource: (resourceId: string) => void;
  onSetNotes: (value: string) => void;
  onSetProofUrl: (value: string) => void;
  onLogHours: (hours: number) => void;
  onSetStatus: (status: "in_progress" | "done" | "reset") => void;
  onAddResource: (title: string, url: string) => void;
  onRemoveResource: (id: string) => void;
}

export function SkillPanel({
  skill,
  status,
  progress,
  statuses,
  allSkills,
  customResources,
  onClose,
  onSelectSkill,
  onToggleResource,
  onSetNotes,
  onSetProofUrl,
  onLogHours,
  onSetStatus,
  onAddResource,
  onRemoveResource,
}: SkillPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const [notesMode, setNotesMode] = useState<"write" | "preview">("write");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const domain = domainById[skill.domain];
  const curated: Resource[] = resourcesBySkill[skill.id] ?? [];
  const mine = customResources.filter((r) => r.skillId === skill.id);
  const watched = new Set(progress?.resourcesWatched ?? []);
  const unlocks = directUnlocks(skill.id, allSkills);

  // Move focus into the panel when it opens so keyboard users land here.
  // Atlas keys this component by skill id, so switching skills remounts it and
  // the draft fields reset without an effect.
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const submitResource = (event: React.FormEvent): void => {
    event.preventDefault();
    const url = draftUrl.trim();
    if (url === "") return;
    onAddResource(draftTitle.trim(), url);
    setDraftTitle("");
    setDraftUrl("");
    setShowAdd(false);
  };

  const skillChip = (id: string) => {
    const other = skillById[id];
    if (!other) return null;
    const otherStatus = statuses[id] ?? "locked";
    const otherDomain = domainById[other.domain];
    return (
      <button
        key={id}
        type="button"
        onClick={() => onSelectSkill(id)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs transition-colors hover:border-[var(--accent)]"
      >
        <span
          aria-hidden
          className="size-1.5 rounded-full"
          style={{ background: otherDomain?.color ?? "var(--muted)" }}
        />
        <span>{other.name}</span>
        {otherStatus === "done" ? (
          <Check className="size-3 text-[var(--accent)]" aria-hidden />
        ) : otherStatus === "locked" ? (
          <Lock className="size-3 text-[var(--muted)]" aria-hidden />
        ) : null}
        <span className="sr-only">({STATUS_COPY[otherStatus]})</span>
      </button>
    );
  };

  const resourceRow = (
    key: string,
    title: string,
    creator: string,
    url: string,
    badge: string,
    onRemove?: () => void,
  ) => (
    <li key={key} className="flex items-start gap-2.5 py-1.5">
      <input
        id={`res-${key}`}
        type="checkbox"
        checked={watched.has(key)}
        onChange={() => onToggleResource(key)}
        className="mt-1 size-4 shrink-0 accent-[var(--accent)]"
      />
      <div className="min-w-0 flex-1">
        <label
          htmlFor={`res-${key}`}
          className="cursor-pointer text-sm leading-snug"
        >
          {title}
        </label>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--muted)]">
          <span className="truncate">{creator}</span>
          <span className="rounded border border-[var(--border)] px-1 font-mono">
            {badge}
          </span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[var(--accent)]"
          >
            open <ExternalLink className="size-3" aria-hidden />
          </a>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 hover:text-[var(--foreground)]"
            >
              <Trash2 className="size-3" aria-hidden />
              <span className="sr-only">Remove {title}</span>
            </button>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      role="complementary"
      aria-labelledby="skill-panel-title"
      className="flex h-full w-full flex-col overflow-y-auto border-l border-[var(--border)] bg-[var(--surface)] outline-none"
    >
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: `${domain?.color ?? "#888"}22`,
              color: domain?.color,
            }}
          >
            <DomainIcon name={domain?.icon ?? "Code2"} className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] tracking-wider text-[var(--muted)] uppercase">
              {domain?.name} · Level {skill.level} · {skill.estHours}h
            </p>
            <h2
              id="skill-panel-title"
              className="mt-0.5 text-lg leading-tight font-semibold"
            >
              {skill.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close skill details"
            className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{
              background:
                status === "done"
                  ? "var(--accent)"
                  : status === "locked"
                    ? "transparent"
                    : `${domain?.color ?? "#888"}22`,
              color:
                status === "done"
                  ? "#0a0d12"
                  : status === "locked"
                    ? "var(--muted)"
                    : domain?.color,
              border:
                status === "locked" ? "1px solid var(--border)" : undefined,
            }}
          >
            {STATUS_COPY[status]}
          </span>
          {status === "locked" && (
            <span className="text-[11px] text-[var(--muted)]">
              readable now, unlocks when its prerequisites are done
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-6 px-5 py-5">
        <p className="text-sm leading-relaxed text-[var(--foreground)]/90">
          {skill.summary}
        </p>

        <section>
          <h3 className="text-[11px] tracking-wider text-[var(--muted)] uppercase">
            Prerequisites
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {skill.prerequisites.length === 0 ? (
              <span className="text-sm text-[var(--muted)]">
                None — you can start this today.
              </span>
            ) : (
              skill.prerequisites.map(skillChip)
            )}
          </div>
        </section>

        <section>
          <h3 className="text-[11px] tracking-wider text-[var(--muted)] uppercase">
            Unlocks
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {unlocks.length === 0 ? (
              <span className="text-sm text-[var(--muted)]">
                Nothing yet — this is a leaf of the map.
              </span>
            ) : (
              unlocks.map((s) => skillChip(s.id))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] tracking-wider text-[var(--muted)] uppercase">
              Resources
            </h3>
            <button
              type="button"
              onClick={() => setShowAdd((v) => !v)}
              className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--accent)]"
            >
              <Plus className="size-3" aria-hidden />
              add a resource
            </button>
          </div>

          {curated.length === 0 && mine.length === 0 && (
            <p className="mt-2 text-sm text-[var(--muted)]">
              No curated link for this one yet. Paste your own above and it is
              saved with your progress.
            </p>
          )}

          {LEVEL_ORDER.map((level) => {
            const group = curated.filter((r) => r.level === level);
            if (group.length === 0) return null;
            return (
              <div key={level} className="mt-3">
                <p className="text-[11px] font-medium text-[var(--muted)] capitalize">
                  {level}
                </p>
                <ul className="mt-0.5 divide-y divide-[var(--border)]">
                  {group.map((r) =>
                    resourceRow(
                      resourceId(r),
                      r.title,
                      r.creator,
                      r.url,
                      r.type,
                    ),
                  )}
                </ul>
              </div>
            );
          })}

          {mine.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-medium text-[var(--muted)]">
                Yours
              </p>
              <ul className="mt-0.5 divide-y divide-[var(--border)]">
                {mine.map((r) =>
                  resourceRow(r.id, r.title, "added by you", r.url, "custom", () =>
                    onRemoveResource(r.id),
                  ),
                )}
              </ul>
            </div>
          )}

          {showAdd && (
            <form
              onSubmit={submitResource}
              className="mt-3 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
            >
              <label className="block text-[11px] text-[var(--muted)]">
                Title
                <input
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  placeholder="What is it called?"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="block text-[11px] text-[var(--muted)]">
                URL
                <input
                  value={draftUrl}
                  onChange={(event) => setDraftUrl(event.target.value)}
                  type="url"
                  required
                  placeholder="https://…"
                  className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-[#0a0d12]"
              >
                <Link2 className="size-3" aria-hidden />
                Save link
              </button>
            </form>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <label
              htmlFor="skill-notes"
              className="text-[11px] tracking-wider text-[var(--muted)] uppercase"
            >
              Notes <span className="normal-case">(markdown)</span>
            </label>
            <div
              role="tablist"
              aria-label="Notes view"
              className="flex rounded-md border border-[var(--border)] p-0.5"
            >
              {(["write", "preview"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={notesMode === mode}
                  onClick={() => setNotesMode(mode)}
                  className={`rounded px-2 py-0.5 text-[11px] capitalize transition-colors ${
                    notesMode === mode
                      ? "bg-[var(--border)] text-[var(--foreground)]"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          {notesMode === "write" ? (
            <textarea
              id="skill-notes"
              rows={5}
              value={progress?.notes ?? ""}
              onChange={(event) => onSetNotes(event.target.value)}
              placeholder="What clicked, what did not, what to revisit…"
              className="mt-1.5 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-[13px] leading-relaxed outline-none focus:border-[var(--accent)]"
            />
          ) : (
            <div className="mt-1.5 min-h-[7.5rem] rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
              <Markdown source={progress?.notes ?? ""} />
            </div>
          )}
        </section>

        <section>
          <label
            htmlFor="skill-proof"
            className="text-[11px] tracking-wider text-[var(--muted)] uppercase"
          >
            Proof of work
          </label>
          <input
            id="skill-proof"
            type="url"
            value={progress?.proofUrl ?? ""}
            onChange={(event) => onSetProofUrl(event.target.value)}
            placeholder="Repo, LeetCode list, notebook…"
            className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </section>

        <section>
          <h3 className="text-[11px] tracking-wider text-[var(--muted)] uppercase">
            Hours logged
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-2xl">
              {progress?.hoursLogged ?? 0}
            </span>
            <span className="text-xs text-[var(--muted)]">
              of ~{skill.estHours}h estimated
            </span>
            <span className="flex-1" />
            {HOUR_STEPS.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => onLogHours(step)}
                className="rounded-md border border-[var(--border)] px-2 py-1 font-mono text-xs hover:border-[var(--accent)]"
              >
                +{step}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onLogHours(-(progress?.hoursLogged ?? 0))}
              disabled={(progress?.hoursLogged ?? 0) === 0}
              aria-label="Reset hours logged"
              className="rounded-md border border-[var(--border)] p-1.5 text-[var(--muted)] disabled:opacity-40"
            >
              <RotateCcw className="size-3" aria-hidden />
            </button>
          </div>
        </section>
      </div>

      <footer className="sticky bottom-0 flex gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-5 py-4">
        {status === "done" ? (
          <button
            type="button"
            onClick={() => onSetStatus("in_progress")}
            className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:border-[var(--accent)]"
          >
            Reopen
          </button>
        ) : (
          <>
            {status !== "in_progress" && (
              <button
                type="button"
                onClick={() => onSetStatus("in_progress")}
                className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium hover:border-[var(--accent)]"
              >
                Start
              </button>
            )}
            <button
              type="button"
              onClick={() => onSetStatus("done")}
              className="flex-1 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-[#0a0d12]"
            >
              Mark done
            </button>
          </>
        )}
        {progress && (
          <button
            type="button"
            onClick={() => onSetStatus("reset")}
            aria-label="Clear all progress for this skill"
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Clear
          </button>
        )}
      </footer>
    </aside>
  );
}
