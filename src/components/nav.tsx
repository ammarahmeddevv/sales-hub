"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Wordmark } from "./wordmark";
import { CommandMenu } from "./command-menu";

const ITEMS = [
  { href: "/", label: "Overview", d: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10", bar: true },
  { href: "/pipeline", label: "Pipeline", d: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v5h-4z", bar: true },
  { href: "/money", label: "Money", d: "M3 6h18v12H3zM3 10h18M7 15h3", bar: true },
  { href: "/activity", label: "Activity", d: "M3 12h4l3-8 4 16 3-8h4", bar: false },
  { href: "/leads", label: "Leads", d: "M4 6h16M4 12h16M4 18h10", bar: true },
  { href: "/calls", label: "Call list", d: "M4 5h16v11H8l-4 4z", bar: true },
];

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export function Nav() {
  const path = usePathname();
  const active = (href: string) =>
    href === "/"
      ? path === "/"
      : path.startsWith(href) || (href === "/pipeline" && path.startsWith("/prospects"));

  return (
    <>
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href="/" className="mb-5 px-2">
          <Wordmark />
        </Link>
        <div className="mb-4 px-1">
          <CommandMenu variant="sidebar" />
        </div>
        <nav className="space-y-0.5">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-colors ${
                active(it.href) ? "bg-soft font-medium text-ink" : "text-ink-2 hover:bg-soft hover:text-ink"
              }`}
            >
              <Icon d={it.d} />
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex items-center justify-between px-2 pt-4">
          <span className="text-[12px] text-ink-3">Theme</span>
          <ThemeToggle />
        </div>
      </aside>

      {/* mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {ITEMS.filter((it) => it.bar).map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] ${
              active(it.href) ? "text-accent" : "text-ink-3"
            }`}
          >
            <Icon d={it.d} />
            {it.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
