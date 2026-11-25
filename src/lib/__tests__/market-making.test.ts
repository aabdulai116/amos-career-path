import { describe, expect, it } from "vitest";
import {
  applyFills,
  createGame,
  defaultConfig,
  driftValue,
  generateFlow,
  isValidQuote,
  markToMarket,
  nextNormal,
  nextRandom,
  settleRound,
  summarise,
  type Fill,
  type Quote,
} from "@/lib/market-making";

const quote = (bid: number, ask: number, size = 5): Quote => ({ bid, ask, size });

describe("the seeded generator", () => {
  it("returns numbers in [0, 1)", () => {
    let state = 42;
    for (let i = 0; i < 500; i += 1) {
      const draw = nextRandom(state);
      expect(draw.value).toBeGreaterThanOrEqual(0);
      expect(draw.value).toBeLessThan(1);
      state = draw.state;
    }
  });

  it("is deterministic for a seed", () => {
    expect(nextRandom(7).value).toBe(nextRandom(7).value);
  });

  it("gives different streams for different seeds", () => {
    expect(nextRandom(1).value).not.toBe(nextRandom(2).value);
  });

  it("produces a roughly standard normal", () => {
    let state = 99;
    const samples: number[] = [];
    for (let i = 0; i < 4000; i += 1) {
      const draw = nextNormal(state);
      samples.push(draw.value);
      state = draw.state;
    }
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const sd = Math.sqrt(
      samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length,
    );
    expect(Math.abs(mean)).toBeLessThan(0.1);
    expect(sd).toBeGreaterThan(0.85);
    expect(sd).toBeLessThan(1.15);
  });
});

describe("applyFills", () => {
  it("buying costs cash and adds inventory", () => {
    const result = applyFills(0, 0, [{ side: "buy", price: 100, quantity: 5 }]);
    expect(result).toEqual({ cash: -500, inventory: 5 });
  });

  it("selling raises cash and shorts inventory", () => {
    const result = applyFills(0, 0, [{ side: "sell", price: 100, quantity: 5 }]);
    expect(result).toEqual({ cash: 500, inventory: -5 });
  });

  it("a round trip at a spread leaves a profit and no position", () => {
    const fills: Fill[] = [
      { side: "buy", price: 99, quantity: 10 },
      { side: "sell", price: 101, quantity: 10 },
    ];
    const result = applyFills(0, 0, fills);
    expect(result.inventory).toBe(0);
    expect(result.cash).toBe(20); // 2 ticks of spread, 10 lots
  });

  it("does nothing when there are no fills", () => {
    expect(applyFills(123, 4, [])).toEqual({ cash: 123, inventory: 4 });
  });
});

describe("markToMarket", () => {
  it("values a flat book at its cash", () => {
    expect(markToMarket(250, 0, 10000)).toBe(250);
  });

  it("values a long position at the current price", () => {
    expect(markToMarket(-1000, 10, 105)).toBe(50);
  });

  it("punishes a long position when the value falls", () => {
    expect(markToMarket(-1000, 10, 95)).toBe(-50);
  });

  it("rewards a short position when the value falls", () => {
    expect(markToMarket(1000, -10, 95)).toBe(50);
  });
});

describe("isValidQuote", () => {
  it("accepts a real two-sided market", () => {
    expect(isValidQuote(quote(9995, 10005))).toBe(true);
  });

  it("rejects a crossed or locked quote", () => {
    expect(isValidQuote(quote(10005, 9995))).toBe(false);
    expect(isValidQuote(quote(10000, 10000))).toBe(false);
  });

  it("rejects non-integer ticks and bad sizes", () => {
    expect(isValidQuote({ bid: 99.5, ask: 101, size: 5 })).toBe(false);
    expect(isValidQuote(quote(9995, 10005, 0))).toBe(false);
    expect(isValidQuote(quote(0, 10, 1))).toBe(false);
  });
});

describe("generateFlow", () => {
  const allInformed = { ...defaultConfig, informedShare: 1 };
  const noneInformed = { ...defaultConfig, informedShare: 0 };

  it("informed flow lifts an ask that is too cheap", () => {
    const { orders } = generateFlow(10050, quote(9990, 10000), 5, allInformed);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.every((o) => o.side === "buy" && o.informed)).toBe(true);
  });

  it("informed flow hits a bid that is too expensive", () => {
    const { orders } = generateFlow(9900, quote(9990, 10010), 5, allInformed);
    expect(orders.length).toBeGreaterThan(0);
    expect(orders.every((o) => o.side === "sell" && o.informed)).toBe(true);
  });

  it("informed flow stays away from a quote that straddles the value", () => {
    const { orders } = generateFlow(10000, quote(9950, 10050), 5, allInformed);
    expect(orders).toEqual([]);
  });

  it("noise flow trades regardless of where the value is", () => {
    const { orders } = generateFlow(10000, quote(9950, 10050), 5, noneInformed);
    expect(orders.length).toBe(2);
    expect(orders.every((o) => !o.informed)).toBe(true);
  });

  it("never asks for a non-positive size", () => {
    let state = 3;
    for (let i = 0; i < 200; i += 1) {
      const result = generateFlow(10000 + i, quote(9950, 10050), state, noneInformed);
      for (const order of result.orders) {
        expect(order.quantity).toBeGreaterThan(0);
        expect(order.quantity).toBeLessThanOrEqual(defaultConfig.maxFlowSize);
      }
      state = result.state;
    }
  });

  it("is reproducible for a given state", () => {
    const a = generateFlow(10000, quote(9990, 10010), 11, defaultConfig);
    const b = generateFlow(10000, quote(9990, 10010), 11, defaultConfig);
    expect(a.orders).toEqual(b.orders);
  });
});

describe("driftValue", () => {
  it("never lets the value reach zero", () => {
    let state = 1;
    let value = 5;
    const violent = { ...defaultConfig, volatility: 500 };
    for (let i = 0; i < 300; i += 1) {
      const next = driftValue(value, state, violent);
      expect(next.value).toBeGreaterThanOrEqual(1);
      value = next.value;
      state = next.state;
    }
  });

  it("stays on whole ticks", () => {
    const next = driftValue(10000, 5, defaultConfig);
    expect(Number.isInteger(next.value)).toBe(true);
  });
});

describe("settleRound", () => {
  it("records the round and advances the clock", () => {
    const game = createGame({ ...defaultConfig, rounds: 3 });
    const next = settleRound(game, quote(9990, 10010), [], game.rngState);
    expect(next.round).toBe(2);
    expect(next.history).toHaveLength(1);
    expect(next.finished).toBe(false);
    expect(next.finalScore).toBeNull();
  });

  it("finishes on the last round and scores the position out", () => {
    let game = createGame({ ...defaultConfig, rounds: 2 });
    game = settleRound(game, quote(9990, 10010), [], game.rngState);
    game = settleRound(game, quote(9990, 10010), [], game.rngState);
    expect(game.finished).toBe(true);
    expect(game.finalScore).not.toBeNull();
  });

  it("a flat round trip inside one round books the spread", () => {
    const game = createGame();
    const next = settleRound(
      game,
      quote(9990, 10010),
      [
        { side: "buy", price: 9990, quantity: 5 },
        { side: "sell", price: 10010, quantity: 5 },
      ],
      game.rngState,
    );
    expect(next.inventory).toBe(0);
    expect(next.cash).toBe(100); // 20 ticks × 5
  });

  it("carrying inventory exposes you to the next move", () => {
    const game = createGame({ ...defaultConfig, volatility: 0 });
    const next = settleRound(
      game,
      quote(9990, 10010),
      [{ side: "buy", price: 9990, quantity: 10 }],
      game.rngState,
    );
    expect(next.inventory).toBe(10);
    // Bought 10 below the unchanged value, so the position is worth something.
    expect(next.history[0].markToMarket).toBe(100);
  });
});

describe("summarise", () => {
  it("counts volume, spread captured and the worst position held", () => {
    const game = createGame({ ...defaultConfig, rounds: 1, volatility: 0 });
    const done = settleRound(
      game,
      quote(9990, 10010),
      [
        { side: "buy", price: 9990, quantity: 4 },
        { side: "sell", price: 10010, quantity: 2 },
      ],
      game.rngState,
    );
    const summary = summarise(done);
    expect(summary.filled).toBe(6);
    // Both sides are 10 ticks from the mid: 4 × 10 plus 2 × 10.
    expect(summary.spreadCaptured).toBe(60);
    expect(summary.worstInventory).toBe(2);
  });

  it("flags fills that the value immediately moved against", () => {
    const game = createGame({ ...defaultConfig, rounds: 1, volatility: 0 });
    const done = settleRound(
      game,
      quote(9990, 10010),
      [{ side: "buy", price: 10010, quantity: 5 }],
      game.rngState,
    );
    // Bought at 10010 with the value at 10000: picked off.
    expect(summarise(done).pickedOff).toBe(1);
  });

  it("reports a score even mid-game", () => {
    const game = createGame();
    expect(summarise(game).finalScore).toBe(0);
  });
});
