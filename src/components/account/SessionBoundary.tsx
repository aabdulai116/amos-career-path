"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

/** Auth.js's provider, isolated so the root layout stays a server component. */
export function SessionBoundary({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
