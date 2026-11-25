import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimits } from "@/server/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  const opts = { limit: 3, windowMs: 1000 };

  it("allows requests up to the limit", () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("a", opts, 0).ok, `request ${i}`).toBe(true);
    }
  });

  it("refuses the one after that", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", opts, 0);
    const result = rateLimit("a", opts, 0);
    expect(result.ok).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("lets the window slide", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", opts, 0);
    expect(rateLimit("a", opts, 500).ok).toBe(false);
    expect(rateLimit("a", opts, 1001).ok).toBe(true);
  });

  it("keeps one user's budget away from another's", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", opts, 0);
    expect(rateLimit("a", opts, 0).ok).toBe(false);
    expect(rateLimit("b", opts, 0).ok).toBe(true);
  });

  it("reports a sensible retry-after", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", opts, 0);
    expect(rateLimit("a", opts, 200).retryAfter).toBe(1);
  });
});
