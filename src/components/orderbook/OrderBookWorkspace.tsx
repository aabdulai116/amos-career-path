"use client";

import { useState } from "react";
import { MarketMakingGame } from "@/components/orderbook/MarketMakingGame";
import { OrderBookLab } from "@/components/orderbook/OrderBookLab";

const TABS = [
  { id: "lab", label: "Lab" },
  { id: "game", label: "Make a market" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * Two ways into the same engine: the lab, where you drive the book by hand,
 * and the game, where simulated flow drives it against your quotes.
 */
export function OrderBookWorkspace() {
  const [tab, setTab] = useState<TabId>("lab");

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-5 py-6">
      <div role="tablist" aria-label="Order book views" className="flex gap-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              tab === id
                ? "bg-[var(--surface-raised)] text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "lab" ? <OrderBookLab /> : <MarketMakingGame />}
      </div>
    </div>
  );
}
