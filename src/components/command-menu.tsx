"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./ui";

type Item = { title: string; sub: string; href: string; extra?: string };
type Index = { prospects: Item[]; leads: Item[]; calls: Item[]; activity: Item[] };
const GROUPS: (keyof Index)[] = ["prospects", "leads", "activity", "calls"];
const LABELS: Record<keyof Index, string> = {
  prospects: "Prospects",
  leads: "Leads",
  activity: "Activity",
  calls: "Call list",
};

function score(item: Item, q: string): number {
  const hay = `${item.title} ${item.sub} ${item.extra ?? ""}`.toLowerCase();
  if (!q) return 0;
  if (item.title.toLowerCase().startsWith(q)) return 3;
  if (item.title.toLowerCase().includes(q)) return 2;
  if (hay.includes(q)) return 1;
  return -1;
}

export function CommandMenu({ variant = "sidebar" }: { variant?: "sidebar" | "bar" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<Index | null>(null);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    setCursor(0);
    inputRef.current?.focus();
    if (!index) {
      fetch("/api/search-index")
        .then((r) => r.json())
        .then(setIndex)
        .catch(() => setIndex({ prospects: [], leads: [], calls: [], activity: [] }));
    }
  }, [open, index]);

  const needle = q.trim().toLowerCase();
  const results: { group: keyof Index; item: Item }[] = [];
  if (index) {
    for (const g of GROUPS) {
      const hits = index[g]
        .map((item) => ({ item, s: score(item, needle) }))
        .filter((x) => (needle ? x.s > 0 : g === "prospects"))
        .sort((a, b) => b.s - a.s)
        .slice(0, needle ? 6 : 8);
      for (const h of hits) results.push({ group: g, item: h.item });
    }
  }

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQ("");
      router.push(href);
    },
    [router],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "sidebar"
            ? "flex w-full items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] text-ink-3 transition-colors hover:text-ink-2"
            : "flex size-9 items-center justify-center rounded-lg border border-line text-ink-2"
        }
        aria-label="Search"
      >
        <svg viewBox="0 0 24 24" className="size-[15px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" />
        </svg>
        {variant === "sidebar" && (
          <>
            <span className="flex-1 text-left">Search</span>
            <kbd className="rounded border border-line px-1 font-sans text-[11px]">⌘K</kbd>
          </>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="pop-in w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface"
            style={{ boxShadow: "var(--shadow-pop)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <svg viewBox="0 0 24 24" className="size-4 text-ink-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4-4" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCursor((c) => Math.min(c + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCursor((c) => Math.max(c - 1, 0));
                  } else if (e.key === "Enter" && results[cursor]) {
                    go(results[cursor].item.href);
                  }
                }}
                placeholder="Search prospects, leads, activity…"
                className="h-12 w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
              />
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-1.5">
              {!index && <p className="p-4 text-[13px] text-ink-3">Loading…</p>}
              {index && results.length === 0 && (
                <p className="p-4 text-[13px] text-ink-3">
                  {needle ? "Nothing matches." : "Start typing."}
                </p>
              )}
              {GROUPS.map((g) => {
                const rows = results.filter((r) => r.group === g);
                if (!rows.length) return null;
                return (
                  <div key={g} className="mb-1">
                    <p className="px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-ink-3">
                      {LABELS[g]}
                    </p>
                    {rows.map((r) => {
                      const i = results.indexOf(r);
                      return (
                        <button
                          key={`${g}-${i}`}
                          type="button"
                          onMouseEnter={() => setCursor(i)}
                          onClick={() => go(r.item.href)}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left ${
                            i === cursor ? "bg-soft" : ""
                          }`}
                        >
                          <Avatar name={r.item.title} size={26} />
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-[13.5px] text-ink">{r.item.title}</span>
                            <span className="truncate text-[12px] text-ink-3">{r.item.sub}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-[11px] text-ink-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-line px-1 font-sans">↑</kbd>
                <kbd className="rounded border border-line px-1 font-sans">↓</kbd>
                move
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-line px-1 font-sans">↵</kbd>
                open
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-line px-1 font-sans">esc</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
