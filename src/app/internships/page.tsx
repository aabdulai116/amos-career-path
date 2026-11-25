import type { Metadata } from "next";
import { InternshipBoard } from "@/components/internships/InternshipBoard";

export const metadata: Metadata = { title: "Internships" };

export default function InternshipsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <InternshipBoard />
    </div>
  );
}
