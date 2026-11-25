import type { ProgressState } from "@/lib/types";

/**
 * Merging one person's progress across devices.
 *
 * The rule is last-write-wins per record, not per document. Whole-document
 * wins would mean opening the app on a phone and losing an evening's work from
 * a laptop, which is the kind of data loss that makes people stop trusting a
 * tool. Records are small and independent - one skill, one day, one problem -
 * so resolving them separately almost always keeps both sides' work.
 *
 * Timestamps come from the store's stamping middleware. A record with no
 * timestamp predates it, and loses to one that has a timestamp, because the
 * side that has been written to recently is the side that has been used.
 *
 * Known limitation, stated rather than hidden: there are no tombstones. Clear
 * a problem on a laptop and a phone that has not synced since will put it
 * back. Fixing that properly means recording deletions and keeping them long
 * enough for every device to see - worth doing if this ever has to be exact,
 * and not worth the complexity while it does not.
 */

type Stamped = { updatedAt?: string };

/** Later timestamp wins; a stamped record beats an unstamped one. */
export const newer = <T extends Stamped>(local: T, remote: T): T => {
  const a = local.updatedAt ?? "";
  const b = remote.updatedAt ?? "";
  // Ties go to the server, so a device that merely re-reads cannot overwrite.
  return a > b ? local : remote;
};

export const mergeRecords = <T extends Stamped>(
  local: Record<string, T>,
  remote: Record<string, T>,
): Record<string, T> => {
  const merged: Record<string, T> = { ...remote };
  Object.entries(local).forEach(([key, value]) => {
    const other = remote[key];
    merged[key] = other === undefined ? value : newer(value, other);
  });
  return merged;
};

/**
 * Day logs are counters, not documents, and carry no timestamp. Taking the
 * larger of each side keeps the fuller record of a day that was worked on from
 * two places, and can never erase activity that happened.
 */
export const mergeDayLogs = (
  local: ProgressState["dayLogs"],
  remote: ProgressState["dayLogs"],
): ProgressState["dayLogs"] => {
  const merged: ProgressState["dayLogs"] = { ...remote };
  Object.entries(local).forEach(([date, entry]) => {
    const other = remote[date];
    merged[date] =
      other === undefined
        ? entry
        : {
            date,
            hours: Math.max(entry.hours, other.hours),
            resources: Math.max(entry.resources, other.resources),
          };
  });
  return merged;
};

/** Custom resources are an append-only list; union them by id. */
export const mergeCustomResources = (
  local: ProgressState["customResources"],
  remote: ProgressState["customResources"],
): ProgressState["customResources"] => {
  const byId = new Map(remote.map((entry) => [entry.id, entry]));
  local.forEach((entry) => {
    if (!byId.has(entry.id)) byId.set(entry.id, entry);
  });
  return [...byId.values()].sort((a, b) => a.addedAt.localeCompare(b.addedAt));
};

export const mergeProgress = (
  local: ProgressState,
  remote: ProgressState,
): ProgressState => ({
  version: 1,
  skills: mergeRecords(local.skills, remote.skills),
  course: mergeRecords(local.course, remote.course),
  problems: mergeRecords(local.problems, remote.problems),
  companies: mergeRecords(local.companies, remote.companies),
  applications: mergeRecords(local.applications, remote.applications),
  opportunities: mergeRecords(local.opportunities, remote.opportunities),
  customResources: mergeCustomResources(
    local.customResources,
    remote.customResources,
  ),
  dayLogs: mergeDayLogs(local.dayLogs, remote.dayLogs),
  settings: newer(
    local.settings as ProgressState["settings"] & Stamped,
    remote.settings as ProgressState["settings"] & Stamped,
  ),
});

/** True when a state holds nothing worth sending. */
export const isEmptyProgress = (state: ProgressState): boolean =>
  Object.keys(state.skills).length === 0 &&
  Object.keys(state.course).length === 0 &&
  Object.keys(state.problems).length === 0 &&
  Object.keys(state.companies).length === 0 &&
  Object.keys(state.applications).length === 0 &&
  Object.keys(state.opportunities).length === 0 &&
  state.customResources.length === 0 &&
  Object.keys(state.dayLogs).length === 0;

/** How much is in a state, for the "you are about to upload this" prompt. */
export interface ProgressSize {
  skills: number;
  days: number;
  problems: number;
  companies: number;
  applications: number;
  total: number;
}

export const progressSize = (state: ProgressState): ProgressSize => {
  const skills = Object.keys(state.skills).length;
  const days = Object.keys(state.course).length;
  const problems = Object.keys(state.problems).length;
  const companies = Object.keys(state.companies).length;
  const applications = Object.keys(state.applications).length;
  return {
    skills,
    days,
    problems,
    companies,
    applications,
    total: skills + days + problems + companies + applications,
  };
};
