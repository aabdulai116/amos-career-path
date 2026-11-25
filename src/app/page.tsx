import { Suspense } from "react";
import { Atlas } from "@/components/atlas/Atlas";

export default function AtlasPage() {
  return (
    // Atlas reads ?skill= to open a skill linked from the dashboard, which needs
    // a Suspense boundary for the rest of the page to stay statically rendered.
    <Suspense fallback={<div className="h-full bg-[var(--background)]" />}>
      <Atlas />
    </Suspense>
  );
}
