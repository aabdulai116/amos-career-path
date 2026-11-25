"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  CandlestickChart,
  Code2,
  GitBranch,
  GraduationCap,
  LayoutGrid,
  Settings,
} from "lucide-react";

const links = [
  { href: "/", label: "Atlas", icon: GitBranch },
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/course", label: "Course", icon: GraduationCap },
  { href: "/practice", label: "Practice", icon: Code2 },
  { href: "/internships", label: "Internships", icon: Briefcase },
  { href: "/orderbook", label: "Order book", icon: CandlestickChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 overflow-hidden border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:gap-6">
      <Link href="/" className="flex min-w-0 items-baseline gap-2">
        <span className="truncate text-sm font-semibold tracking-tight whitespace-nowrap">
          Amos Career Path
        </span>
        <span className="hidden font-mono text-[10px] whitespace-nowrap text-[var(--muted)] lg:inline">
          summer 2028
        </span>
      </Link>

      <nav aria-label="Main" className="ml-auto flex items-center gap-1 lg:ml-0">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors lg:px-3 ${
                active
                  ? "bg-[var(--surface-raised)] text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {/* Label collapses to the icon on narrow screens but stays in the
                  accessibility tree. */}
              <span className="sr-only lg:not-sr-only">{label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
