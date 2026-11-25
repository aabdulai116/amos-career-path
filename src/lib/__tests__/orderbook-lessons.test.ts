import { describe, expect, it } from "vitest";
import { lessons, ticksToPrice } from "@/lib/orderbook-lessons";

describe("the order book lessons", () => {
  it("has unique ids", () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
  });

  it("gives every lesson a title and real prose", () => {
    const thin = lessons.filter(
      (l) => l.title.length < 10 || l.body.length === 0 ||
        l.body.some((p) => p.length < 60),
    );
    expect(thin.map((l) => l.id)).toEqual([]);
  });

  it("quotes every demo price in whole ticks", () => {
    const fractional = lessons.flatMap((lesson) => {
      const demo = lesson.demo;
      if (!demo) return [];
      return [...demo.setup, demo.action]
        .filter((order) => !Number.isInteger(order.price))
        .map((order) => `${lesson.id}:${order.price}`);
    });
    expect(fractional).toEqual([]);
  });

  it("uses positive quantities everywhere", () => {
    const bad = lessons.flatMap((lesson) => {
      const demo = lesson.demo;
      if (!demo) return [];
      return [...demo.setup, demo.action]
        .filter((order) => order.quantity <= 0)
        .map(() => lesson.id);
    });
    expect(bad).toEqual([]);
  });

  it("tells the reader what to look for after every demo", () => {
    const silent = lessons.filter(
      (l) => l.demo !== undefined && l.demo.watchFor.length < 40,
    );
    expect(silent.map((l) => l.id)).toEqual([]);
  });

  it("sets up the sweep demo so it really does cross two levels", () => {
    const sweep = lessons.find((l) => l.id === "matching")?.demo;
    expect(sweep).toBeDefined();
    if (!sweep) return;
    const reachable = sweep.setup
      .filter((o) => o.side === "sell" && o.price <= sweep.action.price)
      .reduce((n, o) => n + o.quantity, 0);
    // The order must be bigger than the cheapest level but not bigger than
    // everything it can reach, or it would not demonstrate a partial sweep.
    expect(sweep.action.quantity).toBeGreaterThan(sweep.setup[0].quantity);
    expect(sweep.action.quantity).toBeLessThan(reachable);
  });

  it("sets up the queue demo with two equal orders at one price", () => {
    const queue = lessons.find((l) => l.id === "priority")?.demo;
    expect(queue).toBeDefined();
    if (!queue) return;
    expect(queue.setup).toHaveLength(2);
    expect(queue.setup[0].price).toBe(queue.setup[1].price);
    // The taker must clear exactly one of them, so the survivor is visible.
    expect(queue.action.quantity).toBe(queue.setup[0].quantity);
  });

  it("formats ticks as a price", () => {
    expect(ticksToPrice(10005)).toBe("100.05");
    expect(ticksToPrice(10000)).toBe("100.00");
    expect(ticksToPrice(9985)).toBe("99.85");
  });
});
