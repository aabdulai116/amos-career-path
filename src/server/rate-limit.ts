/**
 * A cheap guard against one client hammering an endpoint.
 *
 * Deliberately in memory. On serverless this means the limit is per instance
 * rather than global, so it is a guard against a runaway or buggy client -
 * the realistic failure here - and not a defence against a determined
 * attacker spreading requests across instances. Doing that properly needs
 * shared state (Upstash or Postgres), which is worth adding the day this is
 * public enough to be worth attacking, and is noise before then.
 *
 * Stating which of those it is seemed better than implying the stronger one.
 */

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the next request would be allowed. */
  retryAfter: number;
}

interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

/** Keeps the map from growing without bound on a long-lived instance. */
const sweep = (now: number, windowMs: number): void => {
  if (buckets.size < 5000) return;
  buckets.forEach((bucket, key) => {
    if (bucket.hits.every((at) => now - at > windowMs)) buckets.delete(key);
  });
};

export const rateLimit = (
  key: string,
  options: { limit: number; windowMs: number },
  now: number = Date.now(),
): RateLimitResult => {
  const { limit, windowMs } = options;
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((at) => now - at < windowMs);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  sweep(now, windowMs);
  return { ok: true, retryAfter: 0 };
};

/** Test seam; nothing in the app calls this. */
export const resetRateLimits = (): void => buckets.clear();
