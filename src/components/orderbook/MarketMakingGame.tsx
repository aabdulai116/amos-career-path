"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Flag, Play, RotateCcw, Target } from "lucide-react";
import { BUY, MatchingEngine, SELL, formatTicks } from "@/lib/engine";
import {
  createGame,
  defaultConfig,
  generateFlow,
  isValidQuote,
  markToMarket,
  settleRound,
  summarise,
  type Fill,
  type GameState,
  type Quote,
} from "@/lib/market-making";

const BID = "#0ca30c";
const ASK = "#e66767";

const pnlColour = (value: number): string =>
  value > 0 ? BID : value < 0 ? ASK : "var(--foreground)";

const signed = (value: number): string =>
  `${value > 0 ? "+" : ""}${value.toFixed(0)}`;

export function MarketMakingGame() {
  const engineRef = useRef<MatchingEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [game, setGame] = useState<GameState>(() => createGame());
  const [bid, setBid] = useState("99.95");
  const [ask, setAsk] = useState("100.05");
  const [size, setSize] = useState("5");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    MatchingEngine.create()
      .then((engine) => {
        if (cancelled) {
          engine.dispose();
          return;
        }
        engineRef.current = engine;
        setReady(true);
      })
      .catch(() => setReady(false));
    return () => {
      cancelled = true;
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  /**
   * One round. The player's quote is placed as two resting limit orders in the
   * C++ book, then each counterparty sends a market order against it. The fills
   * come back from the engine, not from this file - the game never decides who
   * traded, only what it cost.
   */
  const playRound = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || game.finished) return;

    const quote: Quote = {
      bid: Math.round(Number(bid) * 100),
      ask: Math.round(Number(ask) * 100),
      size: Math.round(Number(size)),
    };

    if (!isValidQuote(quote)) {
      setError("Bid must be below ask, both whole cents, size at least 1.");
      return;
    }
    setError("");

    engine.clear();
    engine.limit(BUY, quote.bid, quote.size);
    engine.limit(SELL, quote.ask, quote.size);

    const flow = generateFlow(game.value, quote, game.rngState, game.config);
    const fills: Fill[] = [];
    for (const order of flow.orders) {
      const trades = engine.market(
        order.side === "buy" ? BUY : SELL,
        order.quantity,
      );
      for (const trade of trades) {
        // The counterparty bought, so the market maker sold, and vice versa.
        fills.push({
          side: order.side === "buy" ? "sell" : "buy",
          price: trade.price,
          quantity: trade.quantity,
        });
      }
    }

    setGame((current) => settleRound(current, quote, fills, flow.state));
  }, [bid, ask, size, game]);

  const restart = (): void => {
    setGame(createGame({ ...defaultConfig, seed: Math.floor(Math.random() * 1e9) }));
    setError("");
  };

  // The most recent fill anywhere in the game, not just in the last round -
  // a quiet round should not blank out the last price you saw.
  const lastFill = [...game.history]
    .reverse()
    .flatMap((record) => [...record.fills].reverse())
    .at(0);
  const live = markToMarket(game.cash, game.inventory, game.value);
  const summary = summarise(game);
  const spreadTicks = Math.round(Number(ask) * 100) - Math.round(Number(bid) * 100);

  if (!ready) {
    return (
      <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
        Loading the engine…
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest text-[var(--muted)] uppercase">
          <Target className="size-3.5" aria-hidden />
          Trader practice
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Make a market
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
          Quote a two-sided market each round. Some counterparties are noise —
          they trade because they feel like it, and they are where your profit
          comes from. Others can see the true value and will only deal when your
          price is wrong. Quote tight and you trade a lot, mostly with the people
          you least want to trade with.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-[11px] tracking-wider text-[var(--muted)] uppercase">Round</p>
          <p className="mt-1.5 font-mono text-2xl">
            {Math.min(game.round, game.config.rounds)}/{game.config.rounds}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-[11px] tracking-wider text-[var(--muted)] uppercase">P&L</p>
          <p className="mt-1.5 font-mono text-2xl" style={{ color: pnlColour(live) }}>
            {signed(live)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-[11px] tracking-wider text-[var(--muted)] uppercase">Inventory</p>
          <p className="mt-1.5 font-mono text-2xl">
            {game.inventory > 0 ? `+${game.inventory}` : game.inventory}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {game.inventory === 0 ? "flat" : game.inventory > 0 ? "long" : "short"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-[11px] tracking-wider text-[var(--muted)] uppercase">
            {game.finished ? "True value" : "Last trade"}
          </p>
          <p className="mt-1.5 font-mono text-2xl">
            {game.finished
              ? formatTicks(game.value)
              : lastFill
                ? formatTicks(lastFill.price)
                : "—"}
          </p>
          {!game.finished && (
            <p className="mt-1 text-xs text-[var(--muted)]">value is hidden</p>
          )}
        </div>
      </div>

      {!game.finished ? (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Your quote</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <label className="text-[11px] text-[var(--muted)]">
              Bid
              <input type="number" step="0.01" value={bid}
                onChange={(e) => setBid(e.target.value)}
                className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-mono text-sm outline-none focus:border-[var(--accent)]"
                style={{ color: BID }} />
            </label>
            <label className="text-[11px] text-[var(--muted)]">
              Ask
              <input type="number" step="0.01" value={ask}
                onChange={(e) => setAsk(e.target.value)}
                className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-mono text-sm outline-none focus:border-[var(--accent)]"
                style={{ color: ASK }} />
            </label>
            <label className="text-[11px] text-[var(--muted)]">
              Size each side
              <input type="number" min="1" step="1" value={size}
                onChange={(e) => setSize(e.target.value)}
                className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-mono text-sm outline-none focus:border-[var(--accent)]" />
            </label>
            <div className="text-[11px] text-[var(--muted)]">
              Spread
              <p className="mt-1 py-1.5 font-mono text-sm text-[var(--foreground)]">
                {Number.isFinite(spreadTicks) ? `${spreadTicks} ticks` : "—"}
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-3 flex items-center gap-2 text-xs text-[#e66767]">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <button type="button" onClick={playRound}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#0a0d12]">
            <Play className="size-4" aria-hidden />
            Show the market
          </button>
        </section>
      ) : (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Flag className="size-4" aria-hidden /> Final score
          </h2>
          <p className="mt-2 font-mono text-4xl" style={{ color: pnlColour(summary.finalScore) }}>
            {signed(summary.finalScore)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Inventory was closed out at the true value of {formatTicks(game.value)}.
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Lots traded", String(summary.filled)],
              ["Spread captured", signed(summary.spreadCaptured)],
              ["Picked off", String(summary.pickedOff)],
              ["Worst position", String(summary.worstInventory)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] text-[var(--muted)]">{label}</dt>
                <dd className="mt-0.5 font-mono text-lg">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">
            Spread captured is what you earned for quoting. Picked off is how
            many of those trades the value immediately moved against. A good
            round is a large first number and a small second one — and if your
            worst position was large, you were taking directional risk rather
            than making a market.
          </p>
          <button type="button" onClick={restart}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--accent)]">
            <RotateCcw className="size-4" aria-hidden /> Play again
          </button>
        </section>
      )}

      {game.history.length > 0 && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Round history</h2>
          <table className="mt-3 w-full text-left font-mono text-[11px] tabular-nums">
            <thead className="text-[var(--muted)]">
              <tr>
                <th scope="col" className="py-1 font-medium">#</th>
                <th scope="col" className="py-1 font-medium">Quote</th>
                <th scope="col" className="py-1 text-right font-medium">Filled</th>
                <th scope="col" className="py-1 text-right font-medium">Position</th>
                <th scope="col" className="py-1 text-right font-medium">P&L</th>
              </tr>
            </thead>
            <tbody>
              {[...game.history].reverse().map((record) => {
                const filled = record.fills.reduce((n, f) => n + f.quantity, 0);
                return (
                  <tr key={record.round} className="border-t border-[var(--border)]">
                    <td className="py-1">{record.round}</td>
                    <td className="py-1">
                      <span style={{ color: BID }}>{formatTicks(record.quote.bid)}</span>
                      {" / "}
                      <span style={{ color: ASK }}>{formatTicks(record.quote.ask)}</span>
                    </td>
                    <td className="py-1 text-right">{filled === 0 ? "—" : filled}</td>
                    <td className="py-1 text-right">{record.inventory}</td>
                    <td className="py-1 text-right" style={{ color: pnlColour(record.markToMarket) }}>
                      {signed(record.markToMarket)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
