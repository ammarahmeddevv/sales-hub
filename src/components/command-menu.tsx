"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./ui";

type Item = { title: string; sub: string; href: string; extra?: string; avatar?: string };
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
  if (item.title.toLowerCase().startsWith(q)) return 4;
  if (item.title.toLowerCase().includes(q)) return 3;
  if (item.sub.toLowerCase().includes(q)) return 2;
  if (hay.includes(q)) return 1;
  return -1;
}

export function CommandMenu({ variant = "sidebar" }: { variant?: "sidebar" | "bar" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<Index | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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

  // lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setCursor(0);
    inputRef.current?.focus();
    if (!index && !loadError) {
      fetch("/api/search-index")
        .then((r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        })
        .then(setIndex)
        .catch(() => setLoadError(true));
    }
  }, [open, index, loadError]);

  const needle = q.trim().toLowerCase();

  const results = useMemo(() => {
    const out: { group: keyof Index; item: Item }[] = [];
    if (!index) return out;
    for (const g of GROUPS) {
      const hits = index[g]
        .map((item) => ({ item, s: score(item, needle) }))
        .filter((x) => (needle ? x.s > 0 : g === "prospects"))
        .sort((a, b) => b.s - a.s)
        .slice(0, needle ? 6 : 8);
      for (const h of hits) out.push({ group: g, item: h.item });
    }
    return out;
  }, [index, needle]);

  // keep the highlighted row in view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

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
            ? "flex w-full items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2 text-[13px] text-ink-3 transition-colors hover:border-ink-3/40 hover:text-ink-2"
            : "flex size-9 items-center justify-center rounded-lg border border-line text-ink-2 transition-colors hover:border-ink-3/40"
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
          className="fade-in fixed inset-0 z-50 flex items-start justify-center bg-black/45 p-4 pt-[10vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="pop-in flex max-h-[76vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface"
            style={{ boxShadow: "var(--shadow-pop)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center gap-3 border-b border-line px-4">
              <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-ink-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
                    setCursor((c) => (results.length ? (c + 1) % results.length : 0));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
                  } else if (e.key === "Enter" && results[cursor]) {
                    e.preventDefault();
                    go(results[cursor].item.href);
                  }
                }}
                placeholder="Search prospects, leads, activity…"
                className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-sans text-[11px] text-ink-3 sm:block">
                esc
              </kbd>
            </div>

            <div ref={listRef} className="min-h-[240px] flex-1 overflow-y-auto overscroll-contain p-2">
              {!index && !loadError && (
                <div className="space-y-1.5 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2.5 px-1 py-1.5">
                      <div className="size-[26px] shrink-0 animate-pulse rounded-full bg-soft" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-1/2 animate-pulse rounded bg-soft" />
                        <div className="h-2.5 w-1/3 animate-pulse rounded bg-soft" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {loadError && (
                <p className="p-4 text-[13px] text-ink-3">
                  Couldn&apos;t load the search index. Close and try again.
                </p>
              )}
              {index && results.length === 0 && (
                <p className="p-4 text-[13px] text-ink-3">
                  {needle ? (
                    <>
                      No match for “<span className="text-ink-2">{q.trim()}</span>”.
                    </>
                  ) : (
                    "Start typing to search everything."
                  )}
                </p>
              )}
              {GROUPS.map((g) => {
                const rows = results
                  .map((r, idx) => ({ ...r, idx }))
                  .filter((r) => r.group === g);
                if (!rows.length) return null;
                return (
                  <div key={g} className="mb-1 last:mb-0">
                    <p className="px-3 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-3">
                      {LABELS[g]}
                    </p>
                    {rows.map((r) => {
                      const active = r.idx === cursor;
                      return (
                        <button
                          key={`${g}-${r.idx}`}
                          type="button"
                          data-idx={r.idx}
                          onMouseMove={() => setCursor(r.idx)}
                          onClick={() => go(r.item.href)}
                          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors ${
                            active ? "bg-accent-soft" : "hover:bg-soft"
                          }`}
                        >
                          <Avatar name={r.item.avatar || r.item.title} size={26} />
                          <span className="flex min-w-0 flex-col gap-0.5">
                            <span className={`truncate text-[13.5px] ${active ? "text-accent" : "text-ink"}`}>
                              {r.item.title}
                            </span>
                            <span className="truncate text-[12px] text-ink-3">{r.item.sub}</span>
                          </span>
                          <span
                            className={`ml-auto shrink-0 text-[12px] text-accent transition-opacity ${
                              active ? "opacity-100" : "opacity-0"
                            }`}
                            aria-hidden
                          >
                            ↵
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-ink-3">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-line px-1 font-sans">↑</kbd>
                <kbd className="rounded border border-line px-1 font-sans">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-line px-1 font-sans">↵</kbd>
                open
              </span>
              <span className="ml-auto hidden sm:block">
                {results.length} result{results.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
