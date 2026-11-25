import type { Metadata } from "next";
import { AccountPanel } from "@/components/account/AccountPanel";
import { authProviderNames } from "@/auth";

export const metadata: Metadata = { title: "Account" };

/**
 * Which providers exist is a server fact - it depends on environment
 * variables - so it is resolved here and handed down rather than guessed at
 * in the browser.
 */
export default function AccountPage() {
  return (
    <div className="h-full overflow-y-auto">
      <AccountPanel providers={authProviderNames()} />
    </div>
  );
}
