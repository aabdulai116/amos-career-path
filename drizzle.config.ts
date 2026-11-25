import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Only needed for `drizzle-kit push` and `studio`; generating migrations
    // works offline, which is why they are committed rather than pushed.
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/placeholder",
  },
  strict: true,
  verbose: true,
});
