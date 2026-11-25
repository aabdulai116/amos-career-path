/**
 * Bridge to the C++ matching engine compiled to WebAssembly.
 *
 * The engine lives in /engine and is built with `npm run build:engine`. Its
 * output sits in public/, so it is fetched at runtime rather than bundled:
 * Emscripten's loader resolves the .wasm next to its own .js, which only works
 * if the bundler leaves both alone. The indirect import below is what keeps
 * webpack and Turbopack from trying to follow it at build time.
 */

export interface EngineTrade {
  taker: number;
  maker: number;
  price: number;
  quantity: number;
}

export interface EngineLevel {
  price: number;
  quantity: number;
  orders: number;
}

/** Emscripten returns vectors as objects with size()/get(); this unwraps them. */
interface WasmVector<T> {
  size: () => number;
  get: (index: number) => T;
  delete: () => void;
}

export interface EngineResult {
  trades: WasmVector<EngineTrade>;
  resting: number;
  restingId: number;
}

export interface EngineSnapshot {
  bids: WasmVector<EngineLevel>;
  asks: WasmVector<EngineLevel>;
  bestBid: number;
  bestAsk: number;
  hasBid: boolean;
  hasAsk: boolean;
  spread: number;
  midDoubled: number;
  bidQuantity: number;
  askQuantity: number;
  restingOrders: number;
}

interface WasmEngine {
  limit: (side: number, price: number, quantity: number) => EngineResult;
  market: (side: number, quantity: number) => EngineResult;
  cancel: (id: number) => boolean;
  clear: () => void;
  snapshot: (depth: number) => EngineSnapshot;
  delete: () => void;
}

interface WasmModule {
  Engine: new () => WasmEngine;
}

export const BUY = 0;
export const SELL = 1;

/** Plain JS copies, so nothing holds a reference into wasm memory. */
export interface Snapshot {
  bids: EngineLevel[];
  asks: EngineLevel[];
  bestBid: number | null;
  bestAsk: number | null;
  spread: number | null;
  mid: number | null;
  bidQuantity: number;
  askQuantity: number;
  restingOrders: number;
}

const drain = <T>(vector: WasmVector<T>): T[] => {
  const out: T[] = [];
  for (let i = 0; i < vector.size(); i += 1) out.push(vector.get(i));
  vector.delete();
  return out;
};

let modulePromise: Promise<WasmModule> | null = null;

const loadModule = async (): Promise<WasmModule> => {
  // Hidden from the bundler on purpose - see the note at the top of the file.
  const dynamicImport = new Function(
    "url",
    "return import(/* webpackIgnore: true */ url)",
  ) as (url: string) => Promise<{ default: () => Promise<WasmModule> }>;
  const loaded = await dynamicImport("/engine/order_book.js");
  return loaded.default();
};

/** The order book, with the wasm details kept on this side of the wall. */
export class MatchingEngine {
  private constructor(private readonly engine: WasmEngine) {}

  static async create(): Promise<MatchingEngine> {
    modulePromise ??= loadModule();
    const wasm = await modulePromise;
    return new MatchingEngine(new wasm.Engine());
  }

  limit(side: number, price: number, quantity: number): EngineTrade[] {
    const result = this.engine.limit(side, price, quantity);
    return drain(result.trades);
  }

  market(side: number, quantity: number): EngineTrade[] {
    const result = this.engine.market(side, quantity);
    return drain(result.trades);
  }

  cancel(id: number): boolean {
    return this.engine.cancel(id);
  }

  clear(): void {
    this.engine.clear();
  }

  snapshot(depth = 10): Snapshot {
    const raw = this.engine.snapshot(depth);
    return {
      bids: drain(raw.bids),
      asks: drain(raw.asks),
      bestBid: raw.hasBid ? raw.bestBid : null,
      bestAsk: raw.hasAsk ? raw.bestAsk : null,
      spread: raw.hasBid && raw.hasAsk ? raw.spread : null,
      mid: raw.hasBid && raw.hasAsk ? raw.midDoubled / 2 : null,
      bidQuantity: raw.bidQuantity,
      askQuantity: raw.askQuantity,
      restingOrders: raw.restingOrders,
    };
  }

  dispose(): void {
    this.engine.delete();
  }
}

/* ------------------------------------------------------- display helpers */

/**
 * Order-book imbalance: bid share of total resting size, 0 to 1.
 * Above 0.5 means more buyers than sellers are showing. It is one of the
 * oldest short-horizon signals in microstructure, and one of the weakest.
 */
export const imbalance = (snapshot: {
  bidQuantity: number;
  askQuantity: number;
}): number | null => {
  const total = snapshot.bidQuantity + snapshot.askQuantity;
  if (total === 0) return null;
  return snapshot.bidQuantity / total;
};

/** Widest level on either side, for scaling the depth bars. */
export const peakLevelQuantity = (snapshot: {
  bids: EngineLevel[];
  asks: EngineLevel[];
}): number =>
  Math.max(
    1,
    ...snapshot.bids.map((l) => l.quantity),
    ...snapshot.asks.map((l) => l.quantity),
  );

/** Ticks to a display price. The book works in integer ticks of 1 cent. */
export const formatTicks = (ticks: number): string =>
  (ticks / 100).toFixed(2);
