import { opportunities } from "@/data/opportunities";
import type {
  Opportunity,
  OpportunityKind,
  OpportunityProgress,
} from "@/lib/types";

export type OpportunityMap = Record<string, OpportunityProgress | undefined>;

export const KIND_ORDER: OpportunityKind[] = [
  "insight-day",
  "early-programme",
  "conference",
];

export const KIND_LABEL: Record<OpportunityKind, string> = {
  "insight-day": "Insight days",
  "early-programme": "Early programmes",
  conference: "Conferences",
};

export const KIND_BLURB: Record<OpportunityKind, string> = {
  "insight-day":
    "A few days inside a firm, usually with no prior knowledge assumed. Often the easiest route into a later internship.",
  "early-programme":
    "Internships and schemes that take people early in a degree, rather than only in the penultimate year.",
  conference:
    "Career fairs where companies interview on the spot. Most have student grants that cover registration and travel.",
};

/**
 * Whole days until a deadline; negative once it has passed, 0 on the day.
 *
 * Both sides are reduced to a calendar date before subtracting. Mixing an
 * end-of-day deadline with a midnight "today" made everything a day out -
 * a deadline today reported one day left, which is exactly the error that
 * makes someone submit late.
 */
export const daysUntil = (deadline: string, now: Date = new Date()): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deadline);
  if (match === null) return null;
  const [, year, month, day] = match;
  const target = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(target.getTime())) return null;
  // The date typed into the field is a local one, so today is local too.
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
};

export const describeDeadline = (
  deadline: string,
  now: Date = new Date(),
): string | null => {
  const days = daysUntil(deadline, now);
  if (days === null) return null;
  if (days < 0) return `closed ${Math.abs(days)}d ago`;
  if (days === 0) return "closes today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
};

/** Deadlines I have recorded, soonest first, dropping the ones that passed. */
export const upcoming = (
  progress: OpportunityMap,
  now: Date = new Date(),
  list: Opportunity[] = opportunities,
): { opportunity: Opportunity; days: number }[] =>
  list
    .map((opportunity) => {
      const days = daysUntil(progress[opportunity.id]?.deadline ?? "", now);
      return days === null ? null : { opportunity, days };
    })
    .filter(
      (entry): entry is { opportunity: Opportunity; days: number } =>
        entry !== null && entry.days >= 0,
    )
    .sort((a, b) => a.days - b.days);

export const byKind = (
  list: Opportunity[] = opportunities,
): { kind: OpportunityKind; items: Opportunity[] }[] =>
  KIND_ORDER.map((kind) => ({
    kind,
    items: list.filter((o) => o.kind === kind),
  })).filter((group) => group.items.length > 0);

export interface OpportunityStats {
  total: number;
  interested: number;
  applied: number;
  withDeadline: number;
  nextDays: number | null;
}

export const opportunityStats = (
  progress: OpportunityMap,
  now: Date = new Date(),
  list: Opportunity[] = opportunities,
): OpportunityStats => {
  const next = upcoming(progress, now, list)[0];
  return {
    total: list.length,
    interested: list.filter((o) => progress[o.id]?.interested === true).length,
    applied: list.filter((o) => progress[o.id]?.applied === true).length,
    withDeadline: list.filter(
      (o) => daysUntil(progress[o.id]?.deadline ?? "", now) !== null,
    ).length,
    nextDays: next ? next.days : null,
  };
};
