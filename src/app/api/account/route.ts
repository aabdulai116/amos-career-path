import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb, schema } from "@/db";

export const runtime = "nodejs";

/**
 * Delete the account and everything attached to it.
 *
 * Every progress table cascades from the user row, so one delete removes the
 * lot. This exists because the moment other people's data is involved, "let
 * me out" has to be a button rather than an email to me.
 */
export async function DELETE(): Promise<NextResponse> {
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

  await db.delete(schema.users).where(eq(schema.users.id, userId));
  return NextResponse.json({ deleted: true });
}
