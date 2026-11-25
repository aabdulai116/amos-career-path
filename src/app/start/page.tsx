import type { Metadata } from "next";
import { Intake } from "@/components/onboarding/Intake";

export const metadata: Metadata = { title: "Start here" };

export default function StartPage() {
  return (
    <div className="h-full overflow-y-auto">
      <Intake />
    </div>
  );
}
