import type { Metadata } from "next";
import { OrderBookWorkspace } from "@/components/orderbook/OrderBookWorkspace";

export const metadata: Metadata = { title: "Order book lab" };

export default function OrderBookPage() {
  return (
    <div className="h-full overflow-y-auto">
      <OrderBookWorkspace />
    </div>
  );
}
