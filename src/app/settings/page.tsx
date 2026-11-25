import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <SettingsPanel />
    </div>
  );
}
