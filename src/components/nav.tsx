"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Overview", d: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/pipeline", label: "Pipeline", d: "M4 5h4v14H4zM10 5h4v9h-4zM16 5h4v5h-4z" },
  { href: "/activity", label: "Activity", d: "M3 12h4l3-8 4 16 3-8h4" },
  { href: "/leads", label: "Leads", d: "M4 6h16M4 12h16M4 18h10" },
  { href: "/calls", label: "Call list", d: "M4 5h16v11H8l-4 4z" },
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
    href === "/" ? path === "/" : path.startsWith(href) || (href === "/pipeline" && path.startsWith("/prospects"));

  return (
    <>
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-ink text-[13px] font-semibold text-white">
            AA
          </span>
          <span>
            <span className="block text-[14px] font-semibold leading-tight text-ink">Sales Hub</span>
            <span className="block text-[12px] leading-tight text-ink-3">Ammar Ahmed</span>
          </span>
        </Link>
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
      </aside>

      {/* mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {ITEMS.map((it) => (
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
