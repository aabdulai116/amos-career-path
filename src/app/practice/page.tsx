import type { Metadata } from "next";
import { PracticeTracker } from "@/components/practice/PracticeTracker";

export const metadata: Metadata = { title: "Pattern practice" };

export default function PracticePage() {
  return (
    <div className="h-full overflow-y-auto">
      <PracticeTracker />
    </div>
  );
}
