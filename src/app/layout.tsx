import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Feedback } from "@/components/Feedback";
import { FirstRun } from "@/components/FirstRun";
import { Nav } from "@/components/Nav";
import { SessionBoundary } from "@/components/account/SessionBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The site is linked into group chats and shared with first-years, so the
 * preview card matters: a bare URL with no title or image reads as something
 * you should not click, let alone sign in to.
 *
 * metadataBase is what turns the generated OG image into the absolute URL
 * that scrapers require. Vercel sets VERCEL_URL on every deployment; the
 * fallback keeps local development working.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3100");

const description =
  "A skill map, a 100 Days of Code tracker, the NeetCode 150 with Python in the browser, and an internship board filtered for students working on CPT. Free, and works without an account.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CareerCompass",
    template: "%s · CareerCompass",
  },
  description,
  applicationName: "CareerCompass",
  // Findable now, rather than hidden: the point of the intake and the course
  // tracker is that other students reach them.
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "CareerCompass",
    title: "Get technically ready for internship recruiting",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Get technically ready for internship recruiting",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0d12",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-full flex-col antialiased`}
      >
        <SessionBoundary>
          <Nav />
          <FirstRun />
          <main className="min-h-0 flex-1">{children}</main>
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--border)] px-4 py-2">
            <Feedback />
            <Link
              href="/privacy"
              className="text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              What gets stored
            </Link>
          </footer>
        </SessionBoundary>
      </body>
    </html>
  );
}
