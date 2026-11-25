/**
 * The explainer that sits above the order book.
 *
 * Content lives here as data rather than inside the component for the same
 * reason the skills do: it can be tested, and the prices in a demo can be
 * checked for being whole ticks instead of silently rounding at runtime.
 *
 * Every demo runs against the real C++ engine. Nothing here is a mock-up —
 * if the explanation and the engine ever disagreed, the demo would show it.
 */

export interface DemoOrder {
  side: "buy" | "sell";
  /** Ticks of one cent, so 10005 is $100.05. Must be a whole number. */
  price: number;
  quantity: number;
}

export interface LessonDemo {
  label: string;
  /** Resting orders placed first, to build a book worth trading against. */
  setup: DemoOrder[];
  /** The order that makes the point. */
  action: DemoOrder;
  /** What to look for once it has run. */
  watchFor: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** Paragraphs. Kept short on purpose — this sits above a working tool. */
  body: string[];
  demo?: LessonDemo;
}

export const lessons: Lesson[] = [
  {
    id: "two-prices",
    title: "A stock does not have one price",
    body: [
      "It has two. There is a list of people willing to buy and a list of people willing to sell, each at a price of their own. That list is the order book, and it is what an exchange really is.",
      "Buyers want cheap and sellers want expensive, so the highest bid always sits below the lowest ask. The gap between them is the spread. Buy right now and you pay the best ask; sell right now and you get the best bid. Market makers earn their living inside that gap.",
    ],
    demo: {
      label: "Build a book",
      setup: [
        { side: "sell", price: 10020, quantity: 50 },
        { side: "sell", price: 10010, quantity: 30 },
        { side: "sell", price: 10005, quantity: 20 },
        { side: "buy", price: 9995, quantity: 25 },
        { side: "buy", price: 9990, quantity: 40 },
        { side: "buy", price: 9985, quantity: 15 },
      ],
      action: { side: "buy", price: 9980, quantity: 1 },
      watchFor:
        "Best ask $100.05, best bid $99.95, a 10 tick spread. The last order bid $99.80 — too low to trade — so it just joined the queue at the bottom.",
    },
  },
  {
    id: "matching",
    title: "One order can pay several prices",
    body: [
      "Send a buy for more than the cheapest seller is offering and the engine works upwards: it takes the cheapest first, then the next, until your order is filled or you run out of willingness to pay.",
      "That is why a large order costs more per share than a small one. It is called slippage, and it is the single biggest reason big trades are broken into small ones.",
    ],
    demo: {
      label: "Sweep two levels",
      setup: [
        { side: "sell", price: 10005, quantity: 20 },
        { side: "sell", price: 10010, quantity: 30 },
        { side: "sell", price: 10020, quantity: 50 },
      ],
      action: { side: "buy", price: 10010, quantity: 35 },
      watchFor:
        "Two fills on the tape: 20 at $100.05, then 15 at $100.10. One order, two prices. The $100.20 sellers were never touched — the order was not willing to pay that much.",
    },
  },
  {
    id: "priority",
    title: "At the same price, you are in a queue",
    body: [
      "Price comes first: the cheapest seller always trades first. But when two sellers are at the same price, the one who arrived earlier is filled first. That pair of rules is what price-time priority means.",
      "It is a literal queue, and it is the reason trading firms care about microseconds. Being a few millionths of a second earlier moves you up the line, and the front of the line is where the trade happens.",
    ],
    demo: {
      label: "Watch the queue",
      setup: [
        { side: "sell", price: 10000, quantity: 5 },
        { side: "sell", price: 10000, quantity: 5 },
      ],
      action: { side: "buy", price: 10000, quantity: 5 },
      watchFor:
        "Two sellers were at $100.00 for the same size. Only the first one traded. The second is still resting — same price, later arrival, so it waits.",
    },
  },
  {
    id: "why-cpp",
    title: "Why this is written in C++",
    body: [
      "A real exchange matches millions of orders a second and answers in microseconds. That is one of the few places left where the choice of language decides whether a strategy makes money, which is why trading systems are written in C++ and why quant developer interviews are full of it.",
      "Browsers only run JavaScript, so the engine is compiled to WebAssembly — a format C++ can target that runs in a browser at close to native speed. The 300 lines of C++ in /engine become a 39KB .wasm file this page downloads. Everything above executed in your browser, not on a server.",
    ],
  },
];

/** $100.05 from 10005. The book works in whole ticks of one cent. */
export const ticksToPrice = (ticks: number): string => (ticks / 100).toFixed(2);
