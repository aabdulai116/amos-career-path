import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { mergeProgress } from "@/lib/sync";
import { loadProgress, saveProgress } from "@/server/progress";
import { rateLimit } from "@/server/rate-limit";
import { parseProgressState } from "@/lib/progress-state";

/**
 * One endpoint, one round trip: the client posts what it has, the server
 * merges it with what is stored, writes the result and returns it. The client
 * then adopts the response wholesale.
 *
 * Doing the merge server-side means both devices converge on the same answer
 * without a negotiation protocol, and a client that is offline for a week
 * still cannot clobber anything - its stale records simply lose on timestamp.
 */

export const runtime = "nodejs";

/**
 * The database is the one thing here that can fail for reasons none of this
 * code controls: Neon's free tier sleeps, a pool can be exhausted, a network
 * can drop. Letting that propagate turns a transient outage into an unhandled
 * 500 with a stack trace, and the client cannot tell it apart from a bug in
 * the payload it just sent. 503 says "not now, keep your copy, try again",
 * which is exactly what an offline-first client should do with it.
 */
const unavailable = (): NextResponse =>
  NextResponse.json(
    { error: "The database is unavailable. Your work is safe on this device." },
    { status: 503, headers: { "retry-after": "30" } },
  );

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // The client debounces to one push every few seconds; twenty a minute is
  // far above normal use and far below anything that would strain the
  // database. Keyed by user, so one person cannot affect anyone else.
  const limit = rateLimit(`sync:${userId}`, { limit: 20, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Syncing too often. Try again shortly." },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  const db = getDb();
  if (db === null) {
    return NextResponse.json(
      { error: "No database is configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body is not JSON." }, { status: 400 });
  }

  // The client's state goes through the same validator an imported file does.
  // It arrives from a browser, so it is input, not data. The validator coerces
  // every field to the type its column expects, so nothing below can fail on
  // a string where the schema wants an integer.
  const parsed = parseProgressState(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const remote = await loadProgress(db, userId);
    const merged = mergeProgress(parsed.state, remote);
    await saveProgress(db, userId, merged);
    return NextResponse.json({
      state: merged,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("sync: write failed", error);
    return unavailable();
  }
}

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const db = getDb();
  if (db === null) {
    return NextResponse.json(
      { error: "No database is configured." },
      { status: 503 },
    );
  }
  try {
    return NextResponse.json({ state: await loadProgress(db, userId) });
  } catch (error) {
    console.error("sync: read failed", error);
    return unavailable();
  }
}
