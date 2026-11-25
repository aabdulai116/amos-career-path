import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@/db/schema";

// The HTTP driver is a round trip per statement and, more importantly, throws
// "No transactions support" the moment you open one. Saving a user's progress
// replaces several tables at once and must not be able to half-succeed, so
// this uses the WebSocket pool, which gives real transactions - and matches
// what the tests run against, so they exercise the production path.
neonConfig.webSocketConstructor = ws;

/**
 * The database connection, and the decision that the database is optional.
 *
 * With no DATABASE_URL the app runs exactly as it always has: everything in
 * localStorage, no account, no network. That is not a fallback bolted on
 * afterwards - it is the mode a first-year opening the link should get, with
 * nothing to sign up for before they can look around. Signing in is an upgrade
 * that moves the same data somewhere it survives a new laptop.
 *
 * Every server path therefore has to cope with getDb() returning null.
 */

export type Database = ReturnType<typeof drizzle<typeof schema>>;

let cached: Database | null = null;

export const databaseUrl = (): string | null => {
  const url = process.env.DATABASE_URL;
  return typeof url === "string" && url.trim() !== "" ? url.trim() : null;
};

export const databaseConfigured = (): boolean => databaseUrl() !== null;

export const getDb = (): Database | null => {
  if (cached !== null) return cached;
  const url = databaseUrl();
  if (url === null) return null;
  cached = drizzle(new Pool({ connectionString: url }), { schema });
  return cached;
};

export { schema };
