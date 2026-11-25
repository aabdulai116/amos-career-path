"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { DomainIcon } from "@/components/DomainIcon";
import { searchSkills } from "@/lib/atlas";
import type { CareerPath, Domain, Skill } from "@/lib/types";

interface FilterBarProps {
  skills: Skill[];
  domains: Domain[];
  paths: CareerPath[];
  query: string;
  onQueryChange: (value: string) => void;
  selectedDomainIds: string[];
  onToggleDomain: (id: string) => void;
  selectedPathId: string | null;
  onSelectPath: (id: string | null) => void;
  onJumpToSkill: (id: string) => void;
  activeCount: number;
  totalCount: number;
}

export function FilterBar({
  skills,
  domains,
  paths,
  query,
  onQueryChange,
  selectedDomainIds,
  onToggleDomain,
  selectedPathId,
  onSelectPath,
  onJumpToSkill,
  activeCount,
  totalCount,
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const listId = useId();

  const results = searchSkills(skills, query);
  const selectedPath = paths.find((p) => p.id === selectedPathId) ?? null;

  // "/" focuses the search box, the way a code host does it.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target?.isContentEditable === true
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const choose = useCallback(
    (skill: Skill | undefined) => {
      if (!skill) return;
      onJumpToSkill(skill.id);
      setOpen(false);
    },
    [onJumpToSkill],
  );

  const onSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "Escape") {
      if (query !== "") onQueryChange("");
      else inputRef.current?.blur();
      setOpen(false);
      return;
    }
    if (results.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[Math.min(highlight, results.length - 1)]);
    }
  };

  const chip = (active: boolean): string =>
    [
      "shrink-0 rounded-full border px-3 py-1 text-xs whitespace-nowrap transition-colors",
      active
        ? "border-transparent text-[#0a0d12]"
        : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]",
    ].join(" ");

  return (
    <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--muted)]"
            aria-hidden
          />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={open && results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label="Search skills"
            placeholder="Search skills…  (press / )"
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
              setOpen(true);
              setHighlight(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={onSearchKeyDown}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pr-3 pl-9 text-sm outline-none focus:border-[var(--accent)]"
          />
          {open && results.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              className="absolute top-full right-0 left-0 z-30 mt-1 max-h-72 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] py-1 shadow-xl"
            >
              {results.map((skill, index) => (
                <li key={skill.id} role="option" aria-selected={index === highlight}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(skill)}
                    onMouseEnter={() => setHighlight(index)}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm ${
                      index === highlight ? "bg-[var(--border)]" : ""
                    }`}
                  >
                    <span className="truncate">{skill.name}</span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] text-[var(--muted)]">
                      {skill.domain}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <span className="font-mono text-xs text-[var(--muted)]">
          {activeCount}/{totalCount} shown
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
        <span className="mr-1 shrink-0 text-[11px] tracking-wider text-[var(--muted)] uppercase">
          Path
        </span>
        <button
          type="button"
          onClick={() => onSelectPath(null)}
          aria-pressed={selectedPathId === null}
          className={chip(selectedPathId === null)}
          style={
            selectedPathId === null ? { background: "var(--accent)" } : undefined
          }
        >
          All
        </button>
        {paths.map((path) => {
          const active = selectedPathId === path.id;
          return (
            <button
              key={path.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectPath(active ? null : path.id)}
              className={chip(active)}
              style={active ? { background: "var(--accent)" } : undefined}
            >
              {path.name}
            </button>
          );
        })}
        {selectedPath && (
          <span className="hidden w-full text-[11px] text-[var(--muted)] italic sm:block">
            {selectedPath.tagline}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-x-visible sm:pb-0">
        <span className="mr-1 shrink-0 text-[11px] tracking-wider text-[var(--muted)] uppercase">
          Domain
        </span>
        {domains.map((domain) => {
          const active = selectedDomainIds.includes(domain.id);
          return (
            <button
              key={domain.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleDomain(domain.id)}
              className={`${chip(active)} inline-flex items-center gap-1.5`}
              style={active ? { background: domain.color } : undefined}
            >
              <DomainIcon name={domain.icon} className="size-3" />
              {domain.name}
            </button>
          );
        })}
        {selectedDomainIds.length > 0 && (
          <button
            type="button"
            onClick={() => selectedDomainIds.forEach(onToggleDomain)}
            className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="size-3" aria-hidden />
            clear
          </button>
        )}
      </div>
    </div>
  );
}
