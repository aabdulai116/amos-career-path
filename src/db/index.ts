import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { Pool as NodePool } from "pg";
import ws from "ws";
import * as schema from "@/db/schema";

// Neon's HTTP driver is a round trip per statement and, more importantly,
// throws "No transactions support" the moment you open one. Saving a user's
// progress replaces several tables at once and must not half-succeed, so the
// Neon path uses the WebSocket pool, which gives real transactions.
neonConfig.webSocketConstructor = ws;

/**
 * Neon's driver speaks WebSocket to Neon's endpoint and cannot talk to an
 * ordinary Postgres, so pointing DATABASE_URL at localhost silently fails.
 * The driver is therefore chosen from the host: Neon in production, plain
 * node-postgres for a local database or any other provider. Both give real
 * transactions, so the behaviour is the same either way.
 */
export const isNeonUrl = (url: string): boolean =>
  /[.@]neon\.tech[:/]?|\.neon\.build/.test(url) ||
  url.includes("neon.tech");

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

export type Database = ReturnType<typeof drizzleNeon<typeof schema>>;

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
  cached = isNeonUrl(url)
    ? drizzleNeon(new NeonPool({ connectionString: url }), { schema })
    : (drizzleNode(new NodePool({ connectionString: url }), {
        schema,
      }) as unknown as Database);
  return cached;
};

export { schema };
