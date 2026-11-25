// Embind surface for the browser.
//
// The engine itself knows nothing about JavaScript - this file is the only
// place the two meet, so order_book.hpp stays testable as plain C++.

#include <emscripten/bind.h>

#include <cstdint>
#include <string>
#include <vector>

#include "order_book.hpp"

namespace {

using namespace emscripten;

// JS numbers are doubles, so int64 crossing the boundary is awkward. The book
// is an in-browser toy: prices in ticks and sizes in lots stay far inside
// double's exact integer range, so narrowing here is safe and keeps the API
// pleasant on the JavaScript side.
struct JsTrade {
  double taker{};
  double maker{};
  double price{};
  double quantity{};
};

struct JsLevel {
  double price{};
  double quantity{};
  double orders{};
};

struct JsResult {
  std::vector<JsTrade> trades;
  double resting{};
  double restingId{};  // 0 when nothing rested
};

struct JsSnapshot {
  std::vector<JsLevel> bids;
  std::vector<JsLevel> asks;
  double bestBid{};     // 0 when the side is empty; hasBid says which
  double bestAsk{};
  bool hasBid{};
  bool hasAsk{};
  double spread{};
  double midDoubled{};
  double bidQuantity{};
  double askQuantity{};
  double restingOrders{};
};

JsResult toJs(const book::Result& result) {
  JsResult out;
  out.trades.reserve(result.trades.size());
  for (const book::Trade& trade : result.trades) {
    out.trades.push_back(JsTrade{static_cast<double>(trade.taker),
                                 static_cast<double>(trade.maker),
                                 static_cast<double>(trade.price),
                                 static_cast<double>(trade.quantity)});
  }
  out.resting = static_cast<double>(result.resting);
  out.restingId = static_cast<double>(result.restingId.value_or(0));
  return out;
}

std::vector<JsLevel> toJs(const std::vector<book::Level>& levels) {
  std::vector<JsLevel> out;
  out.reserve(levels.size());
  for (const book::Level& level : levels) {
    out.push_back(JsLevel{static_cast<double>(level.price),
                          static_cast<double>(level.quantity),
                          static_cast<double>(level.orders)});
  }
  return out;
}

/** Thin wrapper so JavaScript sees doubles and a single snapshot call. */
class Engine {
 public:
  JsResult limit(int side, double price, double quantity) {
    return toJs(book_.limit(asSide(side), static_cast<book::Price>(price),
                            static_cast<book::Quantity>(quantity)));
  }

  JsResult market(int side, double quantity) {
    return toJs(
        book_.market(asSide(side), static_cast<book::Quantity>(quantity)));
  }

  bool cancel(double id) {
    return book_.cancel(static_cast<book::OrderId>(id));
  }

  void clear() { book_.clear(); }

  JsSnapshot snapshot(int depth) {
    const auto levels = static_cast<std::size_t>(depth < 0 ? 0 : depth);
    JsSnapshot snap;
    snap.bids = toJs(book_.bidLevels(levels));
    snap.asks = toJs(book_.askLevels(levels));

    const auto bid = book_.bestBid();
    const auto ask = book_.bestAsk();
    snap.hasBid = bid.has_value();
    snap.hasAsk = ask.has_value();
    snap.bestBid = static_cast<double>(bid.value_or(0));
    snap.bestAsk = static_cast<double>(ask.value_or(0));
    snap.spread = static_cast<double>(book_.spread().value_or(0));
    snap.midDoubled = static_cast<double>(book_.midPriceDoubled().value_or(0));
    snap.bidQuantity = static_cast<double>(book_.totalQuantity(book::Side::Buy));
    snap.askQuantity =
        static_cast<double>(book_.totalQuantity(book::Side::Sell));
    snap.restingOrders = static_cast<double>(book_.restingOrderCount());
    return snap;
  }

 private:
  static book::Side asSide(int side) {
    return side == 0 ? book::Side::Buy : book::Side::Sell;
  }

  book::OrderBook book_;
};

}  // namespace

EMSCRIPTEN_BINDINGS(order_book) {
  value_object<JsTrade>("Trade")
      .field("taker", &JsTrade::taker)
      .field("maker", &JsTrade::maker)
      .field("price", &JsTrade::price)
      .field("quantity", &JsTrade::quantity);

  value_object<JsLevel>("Level")
      .field("price", &JsLevel::price)
      .field("quantity", &JsLevel::quantity)
      .field("orders", &JsLevel::orders);

  value_object<JsResult>("Result")
      .field("trades", &JsResult::trades)
      .field("resting", &JsResult::resting)
      .field("restingId", &JsResult::restingId);

  value_object<JsSnapshot>("Snapshot")
      .field("bids", &JsSnapshot::bids)
      .field("asks", &JsSnapshot::asks)
      .field("bestBid", &JsSnapshot::bestBid)
      .field("bestAsk", &JsSnapshot::bestAsk)
      .field("hasBid", &JsSnapshot::hasBid)
      .field("hasAsk", &JsSnapshot::hasAsk)
      .field("spread", &JsSnapshot::spread)
      .field("midDoubled", &JsSnapshot::midDoubled)
      .field("bidQuantity", &JsSnapshot::bidQuantity)
      .field("askQuantity", &JsSnapshot::askQuantity)
      .field("restingOrders", &JsSnapshot::restingOrders);

  register_vector<JsTrade>("TradeVector");
  register_vector<JsLevel>("LevelVector");

  class_<Engine>("Engine")
      .constructor<>()
      .function("limit", &Engine::limit)
      .function("market", &Engine::market)
      .function("cancel", &Engine::cancel)
      .function("clear", &Engine::clear)
      .function("snapshot", &Engine::snapshot);
}
