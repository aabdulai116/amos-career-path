import type { StateCreator, StoreMutatorIdentifier } from "zustand";

/**
 * Zustand middleware that timestamps the records a change actually touched.
 *
 * Sync resolves conflicts per record with last-write-wins, which needs an
 * updatedAt on every record. Writing that into all eighteen mutations would
 * mean eighteen chances to forget one, and a record that silently never
 * updates its timestamp is a record that silently loses to a stale device.
 *
 * So it happens in one place. Every reducer builds a fresh object for the
 * entry it changes and leaves the others by reference, so reference inequality
 * is exactly "this record was touched" - no deep comparison required, and
 * nothing to keep in step as mutations are added.
 */

type Stamped = { updatedAt?: string };
type RecordMap = Record<string, Stamped | undefined>;

/** The maps whose entries carry a timestamp. */
const TRACKED = [
  "skills",
  "course",
  "problems",
  "companies",
  "applications",
] as const;

export const stampChanged = <T extends object>(
  previous: T,
  next: T,
  now: string,
): T => {
  let result = next;

  const prev = previous as Record<string, unknown>;
  const now_ = next as Record<string, unknown>;

  TRACKED.forEach((key) => {
    const before = prev[key] as RecordMap | undefined;
    const after = now_[key] as RecordMap | undefined;
    if (after === undefined || before === after) return;

    let changed: RecordMap | null = null;
    Object.keys(after).forEach((id) => {
      const entry = after[id];
      if (entry === undefined) return;
      // Same object reference means this reducer did not touch it.
      if (before?.[id] === entry) return;
      changed ??= { ...after };
      changed[id] = { ...entry, updatedAt: now };
    });

    if (changed !== null) {
      result = result === next ? { ...next } : result;
      (result as Record<string, unknown>)[key] = changed;
    }
  });

  // Settings is one object rather than a map of records.
  const beforeSettings = prev.settings;
  const afterSettings = now_.settings;
  if (
    afterSettings !== undefined &&
    beforeSettings !== afterSettings &&
    typeof afterSettings === "object" &&
    afterSettings !== null
  ) {
    result = result === next ? { ...next } : result;
    (result as Record<string, unknown>).settings = {
      ...(afterSettings as object),
      updatedAt: now,
    };
  }

  return result;
};

type Stamp = <
  T extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  initializer: StateCreator<T, Mps, Mcs>,
) => StateCreator<T, Mps, Mcs>;

type StampImpl = <T extends object>(
  initializer: StateCreator<T, [], []>,
) => StateCreator<T, [], []>;

const impl: StampImpl = (initializer) => (set, get, store) => {
  const stampedSet: typeof set = (partial, replace) => {
    const previous = get();
    const update =
      typeof partial === "function"
        ? (partial as (state: ReturnType<typeof get>) => object)(previous)
        : partial;

    // A replace wipes the state rather than editing records; nothing to stamp.
    if (replace === true || update === null || update === undefined) {
      (set as (p: unknown, r?: boolean) => void)(update, replace);
      return;
    }

    const merged = { ...previous, ...(update as object) };
    const stamped = stampChanged(previous, merged, new Date().toISOString());
    (set as (p: unknown, r?: boolean) => void)(stamped, replace);
  };

  return initializer(stampedSet, get, store);
};

export const stamp = impl as unknown as Stamp;
