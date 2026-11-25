import type { Metadata } from "next";
import { OrderBookLab } from "@/components/orderbook/OrderBookLab";

export const metadata: Metadata = { title: "Order book lab" };

export default function OrderBookPage() {
  return (
    <div className="h-full overflow-y-auto">
      <OrderBookLab />
    </div>
  );
}
