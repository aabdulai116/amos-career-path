import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Server code must not import a "use client" module.
 *
 * This exists because it happened. The sync route imported its validator from
 * the Zustand store, which is a client module, and every POST returned 500.
 * Typecheck, lint, the production build and 463 tests all passed - the failure
 * only appears when the route actually runs, because it is a Next.js runtime
 * boundary rather than a type error.
 *
 * So the boundary gets a test of its own.
 */

const root = process.cwd();

const walk = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
};

/** Files that run on the server only. */
const serverFiles = (): string[] => [
  ...walk(resolve(root, "src/server")),
  ...walk(resolve(root, "src/app/api")),
  resolve(root, "src/auth.ts"),
  resolve(root, "src/db/index.ts"),
];

const isClientModule = (file: string): boolean => {
  try {
    return /^\s*["']use client["']/.test(readFileSync(file, "utf8"));
  } catch {
    return false;
  }
};

/** Resolve an @/ import to a file on disk, trying the usual extensions. */
const resolveImport = (spec: string): string | null => {
  if (!spec.startsWith("@/")) return null;
  const base = resolve(root, "src", spec.slice(2));
  for (const candidate of [
    `${base}.ts`,
    `${base}.tsx`,
    resolve(base, "index.ts"),
    resolve(base, "index.tsx"),
  ]) {
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      // keep trying
    }
  }
  return null;
};

describe("the server/client boundary", () => {
  const files = serverFiles().filter((f) => !f.includes("__tests__"));

  it("finds the server files to check", () => {
    expect(files.length).toBeGreaterThan(3);
  });

  it("never imports a client module from server code", () => {
    const offences: string[] = [];

    files.forEach((file) => {
      const source = readFileSync(file, "utf8");
      // Server files are themselves not client modules.
      expect(isClientModule(file), file).toBe(false);

      const imports = [...source.matchAll(/from\s+["'](@\/[^"']+)["']/g)].map(
        (m) => m[1],
      );
      imports.forEach((spec) => {
        const target = resolveImport(spec);
        if (target !== null && isClientModule(target)) {
          offences.push(`${file.replace(root, "")} imports ${spec}`);
        }
      });
    });

    expect(offences).toEqual([]);
  });

  it("keeps the shared progress helpers out of the client module", () => {
    // The specific regression: these three have to be importable from a route
    // handler, so they cannot live in the store.
    const shared = readFileSync(
      resolve(root, "src/lib/progress-state.ts"),
      "utf8",
    );
    expect(isClientModule(resolve(root, "src/lib/progress-state.ts"))).toBe(false);
    expect(shared).toContain("export const parseProgressState");
    expect(shared).toContain("export const initialState");
    expect(shared).toContain("export const DEFAULT_RECRUITING_DATE");
  });
});
