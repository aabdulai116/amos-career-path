"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { MessageSquareWarning } from "lucide-react";

const REPO = "https://github.com/aabdulai116/career-compass";

/**
 * A way for someone who is not me to report that something broke.
 *
 * Without one, the failure mode is silence: a first-year hits a bug, assumes
 * the site is broken or that they did something wrong, and leaves. The issue
 * is prefilled with the page and the browser, because "it didn't work" is not
 * a report anyone can act on - and with nothing else, because a bug report
 * should not quietly carry someone's data off their machine.
 *
 * The user agent only exists in the browser, so reading it during render
 * produced a different href on the server than on the client and React
 * reported a hydration mismatch. useSyncExternalStore is the sanctioned way
 * to say "this value is empty on the server and real afterwards": React uses
 * the server snapshot while hydrating, then swaps in the client one.
 */
export function Feedback() {
  const pathname = usePathname();
  const userAgent = useSyncExternalStore(
    () => () => {},
    () => navigator.userAgent,
    () => "",
  );

  const href = (): string => {
    const body = [
      "**What happened?**",
      "",
      "",
      "**What did you expect?**",
      "",
      "",
      "---",
      `Page: \`${pathname}\``,
      `Browser: \`${userAgent || "not captured"}\``,
    ].join("\n");

    return `${REPO}/issues/new?title=${encodeURIComponent(
      `Problem on ${pathname}`,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <a
      href={href()}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
    >
      <MessageSquareWarning className="size-3" aria-hidden />
      Something wrong? Tell me
    </a>
  );
}
