"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Cpu, Play, RotateCcw, Trash2 } from "lucide-react";
import {
  BUY,
  MatchingEngine,
  SELL,
  formatTicks,
  imbalance,
  peakLevelQuantity,
  type EngineTrade,
  type Snapshot,
} from "@/lib/engine";

const BID = "#0ca30c";
const ASK = "#e66767";
const DEPTH = 10;

const emptySnapshot: Snapshot = {
  bids: [],
  asks: [],
  bestBid: null,
  bestAsk: null,
  spread: null,
  mid: null,
  bidQuantity: 0,
  askQuantity: 0,
  restingOrders: 0,
};

export function OrderBookLab() {
  const engineRef = useRef<MatchingEngine | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const [tape, setTape] = useState<EngineTrade[]>([]);

  const [side, setSide] = useState<number>(BUY);
  const [price, setPrice] = useState("100.00");
  const [quantity, setQuantity] = useState("10");

  useEffect(() => {
    let cancelled = false;
    MatchingEngine.create()
      .then((engine) => {
        if (cancelled) {
          engine.dispose();
          return;
        }
        engineRef.current = engine;
        setSnapshot(engine.snapshot(DEPTH));
        setStatus("ready");
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : String(cause));
        setStatus("failed");
      });
    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  const refresh = useCallback((trades: EngineTrade[]) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (trades.length > 0) {
      setTape((current) => [...trades.reverse(), ...current].slice(0, 12));
    }
    setSnapshot(engine.snapshot(DEPTH));
  }, []);

  const submit = (event: React.FormEvent): void => {
    event.preventDefault();
    const engine = engineRef.current;
    if (!engine) return;
    const ticks = Math.round(Number(price) * 100);
    const size = Math.round(Number(quantity));
    if (!Number.isFinite(ticks) || !Number.isFinite(size) || size <= 0) return;
    refresh(engine.limit(side, ticks, size));
  };

  const sendMarket = (marketSide: number): void => {
    const engine = engineRef.current;
    if (!engine) return;
    const size = Math.round(Number(quantity));
    if (!Number.isFinite(size) || size <= 0) return;
    refresh(engine.market(marketSide, size));
  };

  /** Drop a plausible book around 100.00 so there is something to trade. */
  const seedFlow = (): void => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.clear();
    setTape([]);
    for (let i = 1; i <= 8; i += 1) {
      const size = Math.floor(Math.random() * 40) + 5;
      engine.limit(BUY, 10000 - i * 5, size);
      engine.limit(SELL, 10000 + i * 5, Math.floor(Math.random() * 40) + 5);
    }
    refresh([]);
  };

  const reset = (): void => {
    engineRef.current?.clear();
    setTape([]);
    refresh([]);
  };

  const peak = peakLevelQuantity(snapshot);
  const bidShare = imbalance(snapshot);

  const ladderRow = (
    level: { price: number; quantity: number; orders: number },
    colour: string,
    label: string,
  ) => (
    <tr key={`${label}-${level.price}`} className="relative">
      <th scope="row" className="sr-only">
        {label}
      </th>
      <td className="py-0.5 pr-2 text-right font-mono text-xs tabular-nums" style={{ color: colour }}>
        {formatTicks(level.price)}
      </td>
      <td className="w-full py-0.5">
        <span className="block h-3 rounded-sm" style={{
          width: `${(level.quantity / peak) * 100}%`,
          background: `${colour}55`,
          borderLeft: `2px solid ${colour}`,
        }} />
      </td>
      <td className="py-0.5 pl-2 text-right font-mono text-xs tabular-nums text-[var(--muted)]">
        {level.quantity}
      </td>
      <td className="py-0.5 pl-2 text-right font-mono text-[10px] tabular-nums text-[var(--muted)]">
        {level.orders}
      </td>
    </tr>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-5 py-6">
      <header>
        <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest text-[var(--muted)] uppercase">
          <Cpu className="size-3.5" aria-hidden />
          C++ · WebAssembly
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Order book lab
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          A price-time priority matching engine written in C++ and compiled to
          WebAssembly. Orders are matched by best price first, then by who
          arrived first at that price — the discipline most equity and futures
          exchanges run on. Everything below executes in your browser.
        </p>
      </header>

      {status === "loading" && (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
          Loading the engine…
        </p>
      )}

      {status === "failed" && (
        <div className="rounded-xl border border-[#e66767]/40 bg-[#e66767]/10 p-5 text-sm">
          <p className="font-medium text-[#e66767]">The engine did not load.</p>
          <p className="mt-1 text-[var(--muted)]">{error}</p>
          <p className="mt-2 text-[var(--muted)]">
            Build it with <code className="font-mono">npm run build:engine</code>{" "}
            — it needs Emscripten on the PATH.
          </p>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Best bid", snapshot.bestBid === null ? "—" : formatTicks(snapshot.bestBid), BID],
              ["Best ask", snapshot.bestAsk === null ? "—" : formatTicks(snapshot.bestAsk), ASK],
              ["Spread", snapshot.spread === null ? "—" : `${snapshot.spread} ticks`, undefined],
              ["Mid", snapshot.mid === null ? "—" : formatTicks(snapshot.mid), undefined],
            ].map(([label, value, colour]) => (
              <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-[11px] tracking-wider text-[var(--muted)] uppercase">{label}</p>
                <p className="mt-1.5 font-mono text-2xl" style={colour ? { color: colour } : undefined}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
            <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">Depth</h2>
                <p className="font-mono text-[11px] text-[var(--muted)]">
                  {snapshot.restingOrders} resting · price / size / orders
                </p>
              </div>

              <table className="mt-3 w-full border-collapse">
                <caption className="sr-only">
                  Order book depth, asks above the spread and bids below
                </caption>
                <tbody>
                  <tr>
                    <td colSpan={4} className="pb-1 text-[10px] tracking-wider uppercase" style={{ color: ASK }}>
                      Ask — sellers
                    </td>
                  </tr>
                  {[...snapshot.asks].reverse().map((level) => ladderRow(level, ASK, "Ask"))}
                  {snapshot.asks.length === 0 && (
                    <tr><td colSpan={4} className="py-1 text-xs text-[var(--muted)]">no sellers</td></tr>
                  )}

                  <tr>
                    <td colSpan={4} className="py-2">
                      <div className="flex items-center gap-2 border-y border-dashed border-[var(--border)] py-1.5">
                        <span className="font-mono text-[11px] text-[var(--muted)]">
                          spread
                        </span>
                        <span className="font-mono text-xs">
                          {snapshot.spread === null ? "—" : `${snapshot.spread} ticks`}
                        </span>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={4} className="pb-1 text-[10px] tracking-wider uppercase" style={{ color: BID }}>
                      Bid — buyers
                    </td>
                  </tr>
                  {snapshot.bids.map((level) => ladderRow(level, BID, "Bid"))}
                  {snapshot.bids.length === 0 && (
                    <tr><td colSpan={4} className="py-1 text-xs text-[var(--muted)]">no buyers</td></tr>
                  )}
                </tbody>
              </table>

              {bidShare !== null && (
                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="tracking-wider text-[var(--muted)] uppercase">
                      Imbalance
                    </span>
                    <span className="font-mono tabular-nums">
                      {Math.round(bidShare * 100)}% bid
                    </span>
                  </div>
                  <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-[var(--chart-grid)]">
                    <span style={{ width: `${bidShare * 100}%`, background: BID }} />
                    <span style={{ width: `${(1 - bidShare) * 100}%`, background: ASK }} />
                  </div>
                </div>
              )}
            </section>

            <div className="space-y-4">
              <form onSubmit={submit} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <h2 className="text-sm font-semibold">Send an order</h2>

                <div className="mt-3 flex rounded-lg border border-[var(--border)] p-0.5">
                  {[[BUY, "Buy", BID], [SELL, "Sell", ASK]].map(([value, label, colour]) => (
                    <button
                      key={String(label)}
                      type="button"
                      onClick={() => setSide(value as number)}
                      aria-pressed={side === value}
                      className="flex-1 rounded-md py-1 text-xs font-medium transition-colors"
                      style={side === value
                        ? { background: colour as string, color: "#0a0d12" }
                        : { color: "var(--muted)" }}
                    >
                      {label as string}
                    </button>
                  ))}
                </div>

                <label className="mt-3 block text-[11px] text-[var(--muted)]">
                  Price
                  <input
                    type="number" step="0.01" value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-mono text-sm outline-none focus:border-[var(--accent)]"
                  />
                </label>
                <label className="mt-2 block text-[11px] text-[var(--muted)]">
                  Quantity
                  <input
                    type="number" min="1" step="1" value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-mono text-sm outline-none focus:border-[var(--accent)]"
                  />
                </label>

                <button type="submit" className="mt-3 w-full rounded-lg bg-[var(--accent)] py-2 text-sm font-semibold text-[#0a0d12]">
                  Send limit
                </button>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => sendMarket(BUY)}
                    className="rounded-lg border border-[var(--border)] py-1.5 text-xs hover:border-[var(--accent)]">
                    Market buy
                  </button>
                  <button type="button" onClick={() => sendMarket(SELL)}
                    className="rounded-lg border border-[var(--border)] py-1.5 text-xs hover:border-[var(--accent)]">
                    Market sell
                  </button>
                </div>
                <div className="mt-3 flex gap-2 border-t border-[var(--border)] pt-3">
                  <button type="button" onClick={seedFlow}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] py-1.5 text-xs hover:border-[var(--accent)]">
                    <Play className="size-3" aria-hidden /> Seed a book
                  </button>
                  <button type="button" onClick={reset} aria-label="Clear the book"
                    className="rounded-lg border border-[var(--border)] px-2.5 text-[var(--muted)] hover:text-[var(--foreground)]">
                    <RotateCcw className="size-3.5" aria-hidden />
                  </button>
                </div>
              </form>

              <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-sm font-semibold">Tape</h2>
                  {tape.length > 0 && (
                    <button type="button" onClick={() => setTape([])}
                      className="text-[var(--muted)] hover:text-[var(--foreground)]" aria-label="Clear the tape">
                      <Trash2 className="size-3" aria-hidden />
                    </button>
                  )}
                </div>
                <ul className="mt-2 min-h-24 space-y-0.5 font-mono text-[11px] tabular-nums">
                  {tape.length === 0 && (
                    <li className="text-[var(--muted)]">No trades yet.</li>
                  )}
                  {tape.map((trade, index) => (
                    <li key={`${trade.taker}-${trade.maker}-${index}`} className="flex justify-between">
                      <span>{formatTicks(trade.price)}</span>
                      <span className="text-[var(--muted)]">× {trade.quantity}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <p className="text-xs text-[var(--muted)]">
            Engine correctness is covered by 72 assertions in C++ —{" "}
            <code className="font-mono">npm run test:engine</code>. Prices are
            integer ticks of one cent, never floats, so two orders at the same
            price always compare equal.
          </p>
        </>
      )}
    </div>
  );
}
