"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitBranch, LayoutGrid, Settings } from "lucide-react";

const links = [
  { href: "/", label: "Atlas", icon: GitBranch },
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 shrink-0 items-center gap-6 border-b border-[var(--border)] bg-[var(--surface)] px-4">
      <Link href="/" className="flex items-baseline gap-2">
        <span className="text-sm font-semibold tracking-tight">
          Amos Career Path
        </span>
        <span className="hidden font-mono text-[10px] text-[var(--muted)] sm:inline">
          summer 2028
        </span>
      </Link>

      <nav aria-label="Main" className="flex items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-[var(--surface-raised)] text-[var(--foreground)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
