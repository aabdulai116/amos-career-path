// Native tests for the matching engine. No framework: a counter, a macro and
// a non-zero exit code is all a test runner needs to be useful in CI.

#include "../src/order_book.hpp"

#include <iostream>
#include <string>

namespace {

int checks = 0;
int failures = 0;
std::string currentCase;

void testCase(const std::string& name) { currentCase = name; }

void check(bool condition, const std::string& what) {
  ++checks;
  if (!condition) {
    ++failures;
    std::cout << "  FAIL  " << currentCase << " :: " << what << "\n";
  }
}

template <typename A, typename B>
void checkEqual(const A& actual, const B& expected, const std::string& what) {
  ++checks;
  if (!(actual == static_cast<A>(expected))) {
    ++failures;
    std::cout << "  FAIL  " << currentCase << " :: " << what << " (got "
              << actual << ", expected " << expected << ")\n";
  }
}

using book::OrderBook;
using book::Side;

}  // namespace

int main() {
  {
    testCase("an empty book has no prices");
    OrderBook b;
    check(!b.bestBid().has_value(), "no bid");
    check(!b.bestAsk().has_value(), "no ask");
    check(!b.spread().has_value(), "no spread");
    check(b.empty(), "empty");
    checkEqual(b.totalQuantity(Side::Buy), 0, "no buy quantity");
  }

  {
    testCase("a limit order with nothing to trade against rests");
    OrderBook b;
    const auto r = b.limit(Side::Buy, 100, 10);
    checkEqual(r.trades.size(), 0u, "no trades");
    checkEqual(r.resting, 10, "all of it rests");
    check(r.restingId.has_value(), "has an id");
    checkEqual(b.bestBid().value(), 100, "best bid");
    checkEqual(b.restingOrderCount(), 1u, "one resting order");
  }

  {
    testCase("best bid is the highest, best ask the lowest");
    OrderBook b;
    b.limit(Side::Buy, 99, 5);
    b.limit(Side::Buy, 101, 5);
    b.limit(Side::Buy, 100, 5);
    b.limit(Side::Sell, 105, 5);
    b.limit(Side::Sell, 103, 5);
    b.limit(Side::Sell, 104, 5);
    checkEqual(b.bestBid().value(), 101, "highest bid");
    checkEqual(b.bestAsk().value(), 103, "lowest ask");
    checkEqual(b.spread().value(), 2, "spread");
    checkEqual(b.midPriceDoubled().value(), 204, "doubled mid");
  }

  {
    testCase("a crossing order trades at the resting price, not its own");
    OrderBook b;
    b.limit(Side::Sell, 100, 10);
    // Willing to pay 105, but the maker is resting at 100, so 100 it is.
    const auto r = b.limit(Side::Buy, 105, 10);
    checkEqual(r.trades.size(), 1u, "one trade");
    checkEqual(r.trades[0].price, 100, "trades at the maker's price");
    checkEqual(r.trades[0].quantity, 10, "full size");
    checkEqual(r.resting, 0, "nothing rests");
    check(b.empty(), "book is now empty");
  }

  {
    testCase("time priority: first in at a price is first filled");
    OrderBook b;
    const auto first = b.limit(Side::Sell, 100, 5).restingId.value();
    const auto second = b.limit(Side::Sell, 100, 5).restingId.value();
    const auto r = b.limit(Side::Buy, 100, 5);
    checkEqual(r.trades.size(), 1u, "one trade");
    checkEqual(r.trades[0].maker, first, "the older order filled");
    check(r.trades[0].maker != second, "not the newer one");
  }

  {
    testCase("price priority beats time priority");
    OrderBook b;
    const auto expensive = b.limit(Side::Sell, 102, 5).restingId.value();
    const auto cheap = b.limit(Side::Sell, 100, 5).restingId.value();
    const auto r = b.limit(Side::Buy, 102, 5);
    checkEqual(r.trades[0].maker, cheap, "the cheaper ask filled first");
    check(r.trades[0].maker != expensive, "despite resting for less time");
  }

  {
    testCase("a large order sweeps several levels in price order");
    OrderBook b;
    b.limit(Side::Sell, 100, 5);
    b.limit(Side::Sell, 101, 5);
    b.limit(Side::Sell, 102, 5);
    const auto r = b.limit(Side::Buy, 102, 12);
    checkEqual(r.trades.size(), 3u, "three fills");
    checkEqual(r.trades[0].price, 100, "cheapest first");
    checkEqual(r.trades[1].price, 101, "then next");
    checkEqual(r.trades[2].price, 102, "then next");
    checkEqual(r.trades[2].quantity, 2, "partial on the last level");
    checkEqual(r.resting, 0, "nothing left over");
    checkEqual(b.bestAsk().value(), 102, "3 left at the top level");
  }

  {
    testCase("a partial fill rests the remainder");
    OrderBook b;
    b.limit(Side::Sell, 100, 4);
    const auto r = b.limit(Side::Buy, 100, 10);
    checkEqual(r.trades.size(), 1u, "one trade");
    checkEqual(r.resting, 6, "six rest");
    checkEqual(b.bestBid().value(), 100, "now the best bid");
    check(!b.bestAsk().has_value(), "asks are exhausted");
  }

  {
    testCase("a limit order does not trade through its price");
    OrderBook b;
    b.limit(Side::Sell, 105, 10);
    const auto r = b.limit(Side::Buy, 100, 10);
    checkEqual(r.trades.size(), 0u, "no trade: 105 is above the 100 limit");
    checkEqual(r.resting, 10, "it rests instead");
    checkEqual(b.spread().value(), 5, "a 5 tick spread");
  }

  {
    testCase("a market order takes any price");
    OrderBook b;
    b.limit(Side::Sell, 100, 5);
    b.limit(Side::Sell, 500, 5);
    const auto r = b.market(Side::Buy, 10);
    checkEqual(r.trades.size(), 2u, "both levels");
    checkEqual(r.trades[1].price, 500, "including the far one");
    checkEqual(r.resting, 0, "markets never rest");
  }

  {
    testCase("a market order against an empty book does nothing");
    OrderBook b;
    const auto r = b.market(Side::Buy, 10);
    checkEqual(r.trades.size(), 0u, "no trades");
    checkEqual(r.resting, 0, "and nothing rests");
    check(b.empty(), "book untouched");
  }

  {
    testCase("an unfilled market remainder is cancelled, not rested");
    OrderBook b;
    b.limit(Side::Sell, 100, 3);
    const auto r = b.market(Side::Buy, 10);
    checkEqual(r.trades[0].quantity, 3, "took what was there");
    checkEqual(r.resting, 0, "the other 7 are gone");
    check(b.empty(), "nothing left behind");
  }

  {
    testCase("cancel removes a resting order");
    OrderBook b;
    const auto id = b.limit(Side::Buy, 100, 10).restingId.value();
    check(b.cancel(id), "cancel succeeds");
    check(b.empty(), "book is empty");
    check(!b.cancel(id), "cancelling twice fails");
    check(!b.cancel(9999), "an unknown id fails");
  }

  {
    testCase("cancelling the middle of a queue keeps the rest in order");
    OrderBook b;
    const auto a = b.limit(Side::Sell, 100, 5).restingId.value();
    const auto mid = b.limit(Side::Sell, 100, 5).restingId.value();
    const auto c = b.limit(Side::Sell, 100, 5).restingId.value();
    check(b.cancel(mid), "cancelled the middle");
    const auto r = b.limit(Side::Buy, 100, 10);
    checkEqual(r.trades.size(), 2u, "two fills");
    checkEqual(r.trades[0].maker, a, "first still first");
    checkEqual(r.trades[1].maker, c, "third is now second");
  }

  {
    testCase("a filled order cannot be cancelled afterwards");
    OrderBook b;
    const auto id = b.limit(Side::Sell, 100, 5).restingId.value();
    b.limit(Side::Buy, 100, 5);
    check(!b.cancel(id), "already gone");
  }

  {
    testCase("depth aggregates quantity and order count per level");
    OrderBook b;
    b.limit(Side::Buy, 100, 5);
    b.limit(Side::Buy, 100, 7);
    b.limit(Side::Buy, 99, 3);
    const auto levels = b.bidLevels(10);
    checkEqual(levels.size(), 2u, "two levels");
    checkEqual(levels[0].price, 100, "best first");
    checkEqual(levels[0].quantity, 12, "quantity summed");
    checkEqual(levels[0].orders, 2u, "two orders there");
    checkEqual(levels[1].price, 99, "then the next");
  }

  {
    testCase("depth is capped at the requested number of levels");
    OrderBook b;
    for (int i = 0; i < 20; ++i) b.limit(Side::Buy, 100 - i, 1);
    checkEqual(b.bidLevels(5).size(), 5u, "five levels");
    checkEqual(b.bidLevels(0).size(), 0u, "none");
    checkEqual(b.askLevels(5).size(), 0u, "no asks at all");
  }

  {
    testCase("totals track both sides");
    OrderBook b;
    b.limit(Side::Buy, 100, 5);
    b.limit(Side::Buy, 99, 6);
    b.limit(Side::Sell, 101, 4);
    checkEqual(b.totalQuantity(Side::Buy), 11, "bid quantity");
    checkEqual(b.totalQuantity(Side::Sell), 4, "ask quantity");
  }

  {
    testCase("zero and negative quantities are rejected");
    OrderBook b;
    const auto zero = b.limit(Side::Buy, 100, 0);
    checkEqual(zero.trades.size(), 0u, "no trade");
    check(!zero.restingId.has_value(), "nothing rested");
    b.limit(Side::Buy, 100, -5);
    check(b.empty(), "book untouched");
  }

  {
    testCase("clear empties the book");
    OrderBook b;
    b.limit(Side::Buy, 100, 5);
    b.limit(Side::Sell, 101, 5);
    b.clear();
    check(b.empty(), "empty");
    check(!b.bestBid().has_value(), "no bid");
  }

  {
    testCase("quantity is conserved across a busy session");
    OrderBook b;
    book::Quantity sold = 0;
    for (int i = 0; i < 50; ++i) {
      b.limit(Side::Sell, 100 + (i % 5), 10);
      sold += 10;
    }
    book::Quantity bought = 0;
    for (int i = 0; i < 30; ++i) {
      const auto r = b.limit(Side::Buy, 104, 7);
      for (const auto& t : r.trades) bought += t.quantity;
    }
    // Everything bought came out of the asks; the rest is still resting.
    checkEqual(b.totalQuantity(Side::Sell) + bought, sold,
               "no quantity invented or lost");
  }

  std::cout << (failures == 0 ? "PASS  " : "FAIL  ") << checks - failures << "/"
            << checks << " checks\n";
  return failures == 0 ? 0 : 1;
}
