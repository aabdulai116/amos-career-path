import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { mergeProgress } from "@/lib/sync";
import { loadProgress, saveProgress } from "@/server/progress";
import { parseProgressState } from "@/store/progress";

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

export async function POST(request: Request): Promise<NextResponse> {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body is not JSON." }, { status: 400 });
  }

  // The client's state goes through the same validator an imported file does.
  // It arrives from a browser, so it is input, not data.
  const parsed = parseProgressState(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const remote = await loadProgress(db, userId);
  const merged = mergeProgress(parsed.state, remote);
  await saveProgress(db, userId, merged);

  return NextResponse.json({ state: merged, syncedAt: new Date().toISOString() });
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
  return NextResponse.json({ state: await loadProgress(db, userId) });
}
