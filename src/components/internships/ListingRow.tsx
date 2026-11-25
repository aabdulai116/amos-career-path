"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ExternalLink,
  MapPin,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  STAGE_LABEL,
  STAGE_ORDER,
  STATUS_COLOR,
  STATUS_LABEL,
  companyVerdict,
  effectiveStatus,
  formatPosted,
  verdictFor,
  type CompanyVerdictMap,
} from "@/lib/internships";
import type {
  ApplicationProgress,
  ApplicationStage,
  CptVerdict,
  Internship,
} from "@/lib/types";

interface ListingRowProps {
  listing: Internship;
  verdicts: CompanyVerdictMap;
  application: ApplicationProgress | undefined;
  reasons: Record<string, string>;
  isNew: boolean;
  onStage: (stage: ApplicationStage | "reset") => void;
  onNotes: (notes: string) => void;
  onVerdict: (cpt: CptVerdict) => void;
  onClearVerdict: () => void;
  onVerdictNote: (note: string) => void;
}

export function ListingRow({
  listing,
  verdicts,
  application,
  reasons,
  isNew,
  onStage,
  onNotes,
  onVerdict,
  onClearVerdict,
  onVerdictNote,
}: ListingRowProps) {
  const [open, setOpen] = useState(false);
  const effective = effectiveStatus(listing, verdicts);
  const verdict = companyVerdict(listing, verdicts);
  const colour = STATUS_COLOR[effective.status];
  const panelId = `listing-${listing.id}-detail`;

  return (
    <li
      className="rounded-xl border bg-[var(--surface)]"
      style={{ borderColor: application ? colour : "var(--border)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{listing.company}</span>
            {listing.openings > 1 && (
              <span className="shrink-0 rounded-sm border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)]">
                {listing.openings} openings
              </span>
            )}
            {isNew && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-[var(--surface-raised)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--accent)]">
                <Sparkles className="size-2.5" aria-hidden />
                new
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">
            {listing.title}
          </span>
        </span>

        {listing.locations.length > 0 && (
          <span className="hidden min-w-0 shrink-0 items-center gap-1 text-xs text-[var(--muted)] lg:flex">
            <MapPin className="size-3 shrink-0" aria-hidden />
            <span className="max-w-32 truncate">
              {listing.locations[0]}
              {listing.locations.length > 1 && ` +${listing.locations.length - 1}`}
            </span>
          </span>
        )}

        <span className="hidden w-24 shrink-0 text-right font-mono text-[10px] text-[var(--muted)] sm:inline">
          {formatPosted(listing.posted)}
        </span>

        {/* The label is always present, so status is never colour alone. */}
        <span
          className="w-28 shrink-0 text-right font-mono text-[10px]"
          style={{ color: colour }}
        >
          {STATUS_LABEL[effective.status]}
          {effective.mine && " ·"}
        </span>

        {application && (
          <span className="hidden shrink-0 rounded-sm border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted)] md:inline">
            {STAGE_LABEL[application.stage]}
          </span>
        )}

        <ChevronDown
          className={`size-4 shrink-0 text-[var(--muted)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="space-y-4 border-t border-[var(--border)] px-3 py-4"
        >
          <p className="text-xs leading-relaxed" style={{ color: colour }}>
            {effective.mine
              ? `Your call: ${verdictFor(verdict?.cpt ?? "unsure").label}.${
                  verdict?.note ? ` ${verdict.note}` : ""
                }`
              : (reasons[listing.reason] ?? STATUS_LABEL[effective.status])}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--surface-raised)] px-2.5 py-1 text-[var(--foreground)] hover:bg-[var(--border)]"
            >
              Open the posting
              <ExternalLink className="size-3" aria-hidden />
            </a>
            <span className="font-mono text-[10px]">{listing.category}</span>
            {listing.terms.length > 0 && (
              <span className="font-mono text-[10px]">
                {listing.terms.join(" · ")}
              </span>
            )}
            {listing.degrees.length > 0 && (
              <span className="font-mono text-[10px]">
                {listing.degrees.join(", ")}
              </span>
            )}
          </div>

          {listing.more.length > 0 && (
            <p className="text-xs text-[var(--muted)]">
              {listing.openings} identical requisitions. The link above is the
              newest;{" "}
              {listing.more.map((url, index) => (
                <span key={url}>
                  {index > 0 && ", "}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--accent)] hover:underline"
                  >
                    #{index + 2}
                  </a>
                </span>
              ))}
              .
            </p>
          )}

          {listing.url.startsWith("http://") && (
            <p className="flex items-start gap-1.5 text-xs text-[#ad7510]">
              <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              This employer serves its application form over plain http, so
              anything you type into it travels unencrypted.
            </p>
          )}

          {listing.locations.length > 1 && (
            <p className="text-xs text-[var(--muted)]">
              {listing.locations.join(" · ")}
            </p>
          )}

          <section className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
            <h3 className="text-xs font-medium">
              Does {listing.company} take CPT?
            </h3>
            <p className="mt-0.5 mb-2 text-xs text-[var(--muted)]">
              Check once, and every future role from this employer inherits the
              answer. Your call beats whatever the data says.
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {(["ok", "unsure", "no"] as CptVerdict[]).map((cpt) => {
                const meta = verdictFor(cpt);
                const active = verdict?.cpt === cpt;
                return (
                  <button
                    key={cpt}
                    type="button"
                    onClick={() => onVerdict(cpt)}
                    aria-pressed={active}
                    className="rounded-md border px-2.5 py-1 text-xs"
                    style={{
                      borderColor: active ? meta.color : "var(--border)",
                      color: active ? "var(--foreground)" : "var(--muted)",
                    }}
                  >
                    {meta.label}
                  </button>
                );
              })}
              {verdict && (
                <button
                  type="button"
                  onClick={onClearVerdict}
                  className="ml-auto rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Clear
                </button>
              )}
            </div>
            {verdict && (
              <input
                type="text"
                value={verdict.note}
                onChange={(event) => onVerdictNote(event.target.value)}
                placeholder="How you found out — a recruiter reply, the FAQ…"
                aria-label={`How you learned ${listing.company}'s CPT policy`}
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs"
              />
            )}
          </section>

          <div>
            <p className="mb-1.5 text-xs font-medium text-[var(--muted)]">
              Where this one stands
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {STAGE_ORDER.map((stage) => {
                const active = application?.stage === stage;
                return (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => onStage(stage)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs ${
                      active
                        ? "border-[var(--accent)] text-[var(--foreground)]"
                        : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {active && <Check className="size-3" aria-hidden />}
                    {STAGE_LABEL[stage]}
                  </button>
                );
              })}
              {application && (
                <button
                  type="button"
                  onClick={() => onStage("reset")}
                  className="ml-auto rounded-md px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={application?.notes ?? ""}
              onChange={(event) => onNotes(event.target.value)}
              rows={2}
              placeholder="Referral, recruiter name, what you sent…"
              aria-label={`Notes for ${listing.company}`}
              className="mt-2 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-2 text-xs"
            />
          </div>
        </div>
      )}
    </li>
  );
}
