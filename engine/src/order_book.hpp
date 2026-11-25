// A price-time priority limit order book.
//
// Prices are integer ticks, never floating point: two orders at "the same
// price" must compare equal, and 0.1 + 0.2 does not. Quantities are integers
// for the same reason.
//
// Price priority comes from the ordered maps (best bid = highest, best ask =
// lowest). Time priority comes from the FIFO deque at each price level: an
// order resting longer at a given price fills first. That pair of rules is what
// "price-time priority" means, and it is the matching discipline most equity
// and futures exchanges run.

#pragma once

#include <algorithm>
#include <cstdint>
#include <deque>
#include <map>
#include <optional>
#include <unordered_map>
#include <vector>

namespace book {

using Price = std::int64_t;    // in ticks
using Quantity = std::int64_t;
using OrderId = std::uint64_t;
using Sequence = std::uint64_t;

enum class Side { Buy, Sell };

constexpr Side opposite(Side side) {
  return side == Side::Buy ? Side::Sell : Side::Buy;
}

struct Order {
  OrderId id{};
  Side side{};
  Price price{};
  Quantity quantity{};   // remaining, not original
  Sequence sequence{};   // arrival order, for time priority
};

struct Trade {
  OrderId taker{};
  OrderId maker{};
  Price price{};         // the resting order's price: the maker sets the terms
  Quantity quantity{};
};

struct Level {
  Price price{};
  Quantity quantity{};   // total resting at this price
  std::size_t orders{};
};

/** What came back from submitting an order. */
struct Result {
  std::vector<Trade> trades;
  /** Quantity that did not trade and is now resting. 0 if fully filled. */
  Quantity resting{};
  /** Set when the order rested, so it can be cancelled later. */
  std::optional<OrderId> restingId;
};

class OrderBook {
 public:
  /** Submit a limit order. Crosses what it can, rests the remainder. */
  Result limit(Side side, Price price, Quantity quantity);

  /**
   * Submit a market order: take whatever is available at any price.
   * Nothing rests - an unfilled remainder is simply cancelled, which is what
   * an exchange does when the book runs dry.
   */
  Result market(Side side, Quantity quantity);

  /** Remove a resting order. False if it is unknown or already gone. */
  bool cancel(OrderId id);

  std::optional<Price> bestBid() const;
  std::optional<Price> bestAsk() const;
  /** Difference between best ask and best bid; empty if either side is empty. */
  std::optional<Price> spread() const;
  /** Doubled so a half-tick mid stays an integer. */
  std::optional<Price> midPriceDoubled() const;

  std::vector<Level> bidLevels(std::size_t depth) const;
  std::vector<Level> askLevels(std::size_t depth) const;

  /** Total resting quantity on a side; useful for order-book imbalance. */
  Quantity totalQuantity(Side side) const;
  std::size_t restingOrderCount() const { return index_.size(); }
  bool empty() const { return index_.empty(); }
  void clear();

 private:
  using Queue = std::deque<Order>;
  // Best bid is the highest price, best ask the lowest, so the comparators
  // differ and iteration from begin() always starts at the top of the book.
  using Bids = std::map<Price, Queue, std::greater<Price>>;
  using Asks = std::map<Price, Queue, std::less<Price>>;

  struct Locator {
    Side side;
    Price price;
  };

  Result submit(Side side, Price price, Quantity quantity, bool allowResting);

  template <typename Book>
  std::vector<Trade> matchAgainst(Book& opposing, OrderId taker, Side takerSide,
                                  std::optional<Price> limitPrice,
                                  Quantity& remaining);

  template <typename Book>
  std::vector<Level> levelsOf(const Book& side, std::size_t depth) const;

  Bids bids_;
  Asks asks_;
  std::unordered_map<OrderId, Locator> index_;
  OrderId nextId_{1};
  Sequence nextSequence_{1};
};

/* ------------------------------------------------------------- implementation */

inline bool crosses(Side takerSide, Price limitPrice, Price restingPrice) {
  return takerSide == Side::Buy ? restingPrice <= limitPrice
                                : restingPrice >= limitPrice;
}

template <typename Book>
std::vector<Trade> OrderBook::matchAgainst(Book& opposing, OrderId taker,
                                           Side takerSide,
                                           std::optional<Price> limitPrice,
                                           Quantity& remaining) {
  std::vector<Trade> trades;

  while (remaining > 0 && !opposing.empty()) {
    auto level = opposing.begin();                 // price priority
    if (limitPrice && !crosses(takerSide, *limitPrice, level->first)) break;

    Queue& queue = level->second;
    while (remaining > 0 && !queue.empty()) {
      Order& maker = queue.front();                // time priority
      const Quantity traded = std::min(remaining, maker.quantity);

      trades.push_back(
          Trade{taker, maker.id, level->first, traded});
      remaining -= traded;
      maker.quantity -= traded;

      if (maker.quantity == 0) {
        index_.erase(maker.id);
        queue.pop_front();
      }
    }

    if (queue.empty()) opposing.erase(level);
  }

  return trades;
}

inline Result OrderBook::submit(Side side, Price price, Quantity quantity,
                                bool allowResting) {
  Result result;
  if (quantity <= 0) return result;

  const OrderId id = nextId_++;
  Quantity remaining = quantity;
  const std::optional<Price> limitPrice =
      allowResting ? std::optional<Price>{price} : std::nullopt;

  result.trades = side == Side::Buy
                      ? matchAgainst(asks_, id, side, limitPrice, remaining)
                      : matchAgainst(bids_, id, side, limitPrice, remaining);

  if (remaining > 0 && allowResting) {
    const Order resting{id, side, price, remaining, nextSequence_++};
    if (side == Side::Buy) {
      bids_[price].push_back(resting);
    } else {
      asks_[price].push_back(resting);
    }
    index_.emplace(id, Locator{side, price});
    result.resting = remaining;
    result.restingId = id;
  }

  return result;
}

inline Result OrderBook::limit(Side side, Price price, Quantity quantity) {
  return submit(side, price, quantity, true);
}

inline Result OrderBook::market(Side side, Quantity quantity) {
  return submit(side, 0, quantity, false);
}

inline bool OrderBook::cancel(OrderId id) {
  const auto found = index_.find(id);
  if (found == index_.end()) return false;

  const Locator locator = found->second;
  index_.erase(found);

  auto removeFrom = [&](auto& sideBook) {
    const auto level = sideBook.find(locator.price);
    if (level == sideBook.end()) return false;
    Queue& queue = level->second;
    for (auto it = queue.begin(); it != queue.end(); ++it) {
      if (it->id == id) {
        queue.erase(it);
        if (queue.empty()) sideBook.erase(level);
        return true;
      }
    }
    return false;
  };

  return locator.side == Side::Buy ? removeFrom(bids_) : removeFrom(asks_);
}

inline std::optional<Price> OrderBook::bestBid() const {
  if (bids_.empty()) return std::nullopt;
  return bids_.begin()->first;
}

inline std::optional<Price> OrderBook::bestAsk() const {
  if (asks_.empty()) return std::nullopt;
  return asks_.begin()->first;
}

inline std::optional<Price> OrderBook::spread() const {
  const auto bid = bestBid();
  const auto ask = bestAsk();
  if (!bid || !ask) return std::nullopt;
  return *ask - *bid;
}

inline std::optional<Price> OrderBook::midPriceDoubled() const {
  const auto bid = bestBid();
  const auto ask = bestAsk();
  if (!bid || !ask) return std::nullopt;
  return *bid + *ask;
}

template <typename Book>
std::vector<Level> OrderBook::levelsOf(const Book& side,
                                       std::size_t depth) const {
  std::vector<Level> levels;
  levels.reserve(depth);
  for (const auto& [price, queue] : side) {
    if (levels.size() >= depth) break;
    Quantity total = 0;
    for (const Order& order : queue) total += order.quantity;
    levels.push_back(Level{price, total, queue.size()});
  }
  return levels;
}

inline std::vector<Level> OrderBook::bidLevels(std::size_t depth) const {
  return levelsOf(bids_, depth);
}

inline std::vector<Level> OrderBook::askLevels(std::size_t depth) const {
  return levelsOf(asks_, depth);
}

inline Quantity OrderBook::totalQuantity(Side side) const {
  Quantity total = 0;
  auto sum = [&](const auto& sideBook) {
    for (const auto& [price, queue] : sideBook) {
      for (const Order& order : queue) total += order.quantity;
    }
  };
  if (side == Side::Buy) {
    sum(bids_);
  } else {
    sum(asks_);
  }
  return total;
}

inline void OrderBook::clear() {
  bids_.clear();
  asks_.clear();
  index_.clear();
}

}  // namespace book
