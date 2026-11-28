import type { NextConfig } from "next";

/**
 * Sent on every response.
 *
 * Vercel already adds HSTS, so the gap was the rest: without frame-ancestors
 * anyone can put this app in an iframe on their own page, which is how a
 * student gets tricked into clicking something they cannot see. The others
 * are one line each and close the usual MIME-sniffing and referrer leaks.
 *
 * The CSP here is deliberately only frame-ancestors. A full content policy
 * needs a nonce on Next's inline scripts and a source list for the Pyodide
 * CDN the practice runner loads from, and a half-written one that breaks the
 * Python runner would be worse than none. That is a separate job, noted in
 * the roadmap rather than guessed at here.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
