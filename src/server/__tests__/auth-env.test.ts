import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * A blank environment variable is not a value.
 *
 * .env.example ships the optional keys empty, and hosting dashboards hand
 * back "" for a variable someone created but left blank. `?? undefined` only
 * catches null and undefined, so "" went straight through as the Microsoft
 * issuer, and Auth.js used it instead of falling back to its /common/
 * default - breaking OpenID discovery with an error that named nothing
 * useful. This pins the shape of the fix.
 */
const source = readFileSync(resolve(process.cwd(), "src/auth.ts"), "utf8");

describe("auth configuration reads environment safely", () => {
  it("has a helper that rejects blank and whitespace-only values", () => {
    expect(source).toContain("const env = (name: string)");
    expect(source).toMatch(/value\.trim\(\) !== ""/);
  });

  it("never reads an auth variable off process.env directly", () => {
    // Every one has to go through the helper, or the blank case comes back.
    const direct = [
      ...source.matchAll(/process\.env\.(AUTH_[A-Z_]+)/g),
    ].map((m) => m[1]);
    expect(direct).toEqual([]);
  });

  it("routes every provider credential through the helper", () => {
    [
      "AUTH_GOOGLE_ID",
      "AUTH_GOOGLE_SECRET",
      "AUTH_MICROSOFT_ENTRA_ID_ID",
      "AUTH_MICROSOFT_ENTRA_ID_SECRET",
      "AUTH_MICROSOFT_ENTRA_ID_ISSUER",
    ].forEach((name) => {
      expect(source, name).toContain(`env("${name}")`);
    });
  });

  it("leaves the Microsoft issuer unset by default, for the common endpoint", () => {
    // Pinning a tenant would lock out personal Outlook accounts and every
    // university but one.
    expect(source).toMatch(/issuer: env\("AUTH_MICROSOFT_ENTRA_ID_ISSUER"\)/);
  });
});

describe("the env template", () => {
  const example = readFileSync(resolve(process.cwd(), ".env.example"), "utf8");

  it("lists every variable the auth config reads", () => {
    [
      "DATABASE_URL",
      "AUTH_SECRET",
      "AUTH_GOOGLE_ID",
      "AUTH_GOOGLE_SECRET",
      "AUTH_MICROSOFT_ENTRA_ID_ID",
      "AUTH_MICROSOFT_ENTRA_ID_SECRET",
    ].forEach((name) => expect(example, name).toContain(`${name}=`));
  });

  it("carries no real values", () => {
    expect(example).not.toMatch(/GOCSPX-\S/);
    expect(example).not.toMatch(/postgresql:\/\/\S+:\S+@/);
  });
});
