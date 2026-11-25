import type { Metadata } from "next";
import { OpportunityBoard } from "@/components/opportunities/OpportunityBoard";

export const metadata: Metadata = { title: "Opportunities" };

export default function OpportunitiesPage() {
  return (
    <div className="h-full overflow-y-auto">
      <OpportunityBoard />
    </div>
  );
}
