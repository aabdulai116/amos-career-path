/**
 * A market-making game played against the C++ engine.
 *
 * You quote a two-sided market. Simulated counterparties trade against your
 * quotes through the real matching engine, and you are scored on profit and
 * loss. Everything here is pure: the randomness comes from a seeded generator,
 * so a game can be replayed exactly and the maths can be tested.
 *
 * The lesson the game is built to teach is adverse selection. A wide quote
 * trades rarely and safely. A tight quote trades often — and the trades you get
 * are disproportionately the ones you did not want, because the counterparty
 * who knows the value only deals when your price is wrong.
 */

export interface GameConfig {
  rounds: number;
  /** Starting fair value, in ticks. */
  startValue: number;
  /** Standard deviation of the per-round value move, in ticks. */
  volatility: number;
  /** Largest size a counterparty will trade in one go. */
  maxFlowSize: number;
  /** Share of counterparties who can see the true value. 0 to 1. */
  informedShare: number;
  seed: number;
}

export const defaultConfig: GameConfig = {
  rounds: 20,
  startValue: 10000,
  volatility: 8,
  maxFlowSize: 10,
  informedShare: 0.45,
  seed: 1,
};

export interface Quote {
  bid: number;
  ask: number;
  size: number;
}

export interface FlowOrder {
  side: "buy" | "sell";
  quantity: number;
  informed: boolean;
}

export interface Fill {
  side: "buy" | "sell"; // from the market maker's point of view
  price: number;
  quantity: number;
}

export interface RoundRecord {
  round: number;
  quote: Quote;
  valueBefore: number;
  valueAfter: number;
  fills: Fill[];
  inventory: number;
  cash: number;
  markToMarket: number;
}

export interface GameState {
  config: GameConfig;
  round: number;
  /** The true value. Hidden from the player while the game is running. */
  value: number;
  cash: number;
  inventory: number;
  history: RoundRecord[];
  finished: boolean;
  /** Set once the game ends and inventory is flattened at the true value. */
  finalScore: number | null;
  rngState: number;
}

/* ------------------------------------------------------------------ random */

/**
 * mulberry32: small, fast, and good enough for a game. Seeded on purpose so a
 * round can be replayed and the tests are not flaky.
 */
export const nextRandom = (state: number): { value: number; state: number } => {
  const a = (state + 0x6d2b79f5) | 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, state: a };
};

/** Box-Muller, so the value walk is normal rather than uniform. */
export const nextNormal = (
  state: number,
): { value: number; state: number } => {
  const first = nextRandom(state);
  const second = nextRandom(first.state);
  const u = Math.max(first.value, 1e-9);
  const magnitude = Math.sqrt(-2 * Math.log(u));
  return {
    value: magnitude * Math.cos(2 * Math.PI * second.value),
    state: second.state,
  };
};

/* -------------------------------------------------------------------- game */

export const createGame = (config: GameConfig = defaultConfig): GameState => ({
  config,
  round: 1,
  value: config.startValue,
  cash: 0,
  inventory: 0,
  history: [],
  finished: false,
  finalScore: null,
  rngState: config.seed,
});

/**
 * Who turns up this round.
 *
 * An informed counterparty sees the true value and only trades when your quote
 * is on the wrong side of it: they lift an ask that is too cheap, or hit a bid
 * that is too expensive. That is adverse selection, and it is the entire
 * difficulty of the job.
 *
 * Everyone else is noise: they trade because they want to, not because they
 * know something, and they are where a market maker's profit comes from.
 */
export const generateFlow = (
  value: number,
  quote: Quote,
  state: number,
  config: GameConfig,
): { orders: FlowOrder[]; state: number } => {
  const orders: FlowOrder[] = [];
  let rng = state;

  const draws = 2;
  for (let i = 0; i < draws; i += 1) {
    const kind = nextRandom(rng);
    rng = kind.state;
    const sizeDraw = nextRandom(rng);
    rng = sizeDraw.state;
    const quantity = 1 + Math.floor(sizeDraw.value * config.maxFlowSize);

    if (kind.value < config.informedShare) {
      // Informed: only trades when the quote is mispriced against the maker.
      if (value > quote.ask) {
        orders.push({ side: "buy", quantity, informed: true });
      } else if (value < quote.bid) {
        orders.push({ side: "sell", quantity, informed: true });
      }
      continue;
    }

    const direction = nextRandom(rng);
    rng = direction.state;
    orders.push({
      side: direction.value < 0.5 ? "buy" : "sell",
      quantity,
      informed: false,
    });
  }

  return { orders, state: rng };
};

/** Cash falls when you buy and rises when you sell; inventory does the reverse. */
export const applyFills = (
  cash: number,
  inventory: number,
  fills: Fill[],
): { cash: number; inventory: number } => {
  let nextCash = cash;
  let nextInventory = inventory;
  for (const fill of fills) {
    if (fill.side === "buy") {
      nextCash -= fill.price * fill.quantity;
      nextInventory += fill.quantity;
    } else {
      nextCash += fill.price * fill.quantity;
      nextInventory -= fill.quantity;
    }
  }
  return { cash: nextCash, inventory: nextInventory };
};

/** Cash plus whatever the inventory is worth at the current value. */
export const markToMarket = (
  cash: number,
  inventory: number,
  value: number,
): number => cash + inventory * value;

export const driftValue = (
  value: number,
  state: number,
  config: GameConfig,
): { value: number; state: number } => {
  const draw = nextNormal(state);
  return {
    value: Math.max(1, Math.round(value + draw.value * config.volatility)),
    state: draw.state,
  };
};

/** A quote must be a real two-sided market: bid below ask, both positive. */
export const isValidQuote = (quote: Quote): boolean =>
  Number.isInteger(quote.bid) &&
  Number.isInteger(quote.ask) &&
  Number.isInteger(quote.size) &&
  quote.bid > 0 &&
  quote.ask > quote.bid &&
  quote.size > 0;

/**
 * Fold one round's fills into the game. The fills themselves come from the C++
 * engine, so this function never decides who traded - only what it cost.
 */
export const settleRound = (
  state: GameState,
  quote: Quote,
  fills: Fill[],
  rngAfterFlow: number,
): GameState => {
  const { cash, inventory } = applyFills(state.cash, state.inventory, fills);
  const valueBefore = state.value;
  const drift = driftValue(valueBefore, rngAfterFlow, state.config);
  const finished = state.round >= state.config.rounds;

  const record: RoundRecord = {
    round: state.round,
    quote,
    valueBefore,
    valueAfter: drift.value,
    fills,
    inventory,
    cash,
    markToMarket: markToMarket(cash, inventory, drift.value),
  };

  return {
    ...state,
    round: state.round + 1,
    value: drift.value,
    cash,
    inventory,
    history: [...state.history, record],
    finished,
    // At the bell, inventory is closed out at the true value. Carrying a
    // position to the end is a bet, not market making, and the score says so.
    finalScore: finished ? markToMarket(cash, inventory, drift.value) : null,
    rngState: drift.state,
  };
};

/* ------------------------------------------------------------------ scoring */

export interface GameSummary {
  filled: number;
  /** Fills where the counterparty knew more than you. */
  pickedOff: number;
  spreadCaptured: number;
  worstInventory: number;
  finalScore: number;
}

export const summarise = (state: GameState): GameSummary => {
  const fills = state.history.flatMap((r) => r.fills);
  const spreadCaptured = state.history.reduce((total, record) => {
    const mid = (record.quote.bid + record.quote.ask) / 2;
    return (
      total +
      record.fills.reduce(
        (sum, fill) =>
          sum +
          (fill.side === "sell"
            ? (fill.price - mid) * fill.quantity
            : (mid - fill.price) * fill.quantity),
        0,
      )
    );
  }, 0);

  return {
    filled: fills.reduce((n, f) => n + f.quantity, 0),
    pickedOff: state.history.reduce(
      (n, record) =>
        n +
        record.fills.filter((fill) =>
          fill.side === "buy"
            ? record.valueAfter < fill.price
            : record.valueAfter > fill.price,
        ).length,
      0,
    ),
    spreadCaptured,
    worstInventory: state.history.reduce(
      (worst, r) => Math.max(worst, Math.abs(r.inventory)),
      0,
    ),
    finalScore: state.finalScore ?? markToMarket(state.cash, state.inventory, state.value),
  };
};
