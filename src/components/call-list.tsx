"use client";

import { useMemo, useState } from "react";
import type { Call } from "@/lib/sheets";
import { CopyButton } from "./copy-button";

const PAGE = 20;

export function CallList({ calls, initialQ = "" }: { calls: Call[]; initialQ?: string }) {
  const [q, setQ] = useState(initialQ);
  const [show, setShow] = useState<"todo" | "done" | "all">("todo");
  const [limit, setLimit] = useState(PAGE);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return calls
      .filter((c) => show === "all" || (show === "todo" ? !c.called && !c.outcome : c.called || !!c.outcome))
      .filter((c) => !needle || `${c.business} ${c.city}`.toLowerCase().includes(needle));
  }, [calls, q, show]);

  const done = calls.filter((c) => c.called || c.outcome).length;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="Search business or city"
          className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3.5 text-[14px] text-ink placeholder:text-ink-3 sm:max-w-sm"
        />
        <div className="flex rounded-xl border border-line bg-surface p-1 text-[13px]">
          {(
            [
              ["todo", `To reach · ${calls.length - done}`],
              ["done", `Reached · ${done}`],
              ["all", "All"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setShow(k);
                setLimit(PAGE);
              }}
              className={`rounded-lg px-3 py-1.5 ${show === k ? "bg-ink text-surface" : "text-ink-2 hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {rows.slice(0, limit).map((c) => {
          const digits = c.phone.replace(/\D/g, "");
          return (
            <article key={c.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[15px] font-medium text-ink">{c.business}</h3>
                  <p className="mt-0.5 text-[13px] text-ink-3">
                    {c.city} · <span className="font-mono">{c.phone}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] text-ink">{c.quote}</p>
                  {(c.called || c.outcome) && (
                    <p className="mt-0.5 text-[12px] text-accent">{c.outcome || "Contacted"}</p>
                  )}
                </div>
              </div>
              <p className="mt-3 text-[13px] text-ink-2">{c.noticed}</p>
              <div className="mt-4 rounded-xl bg-soft p-4">
                <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-ink">{c.message}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton text={c.message} label="Copy message" />
                {digits && (
                  <a
                    href={`https://wa.me/${digits}?text=${encodeURIComponent(c.message)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center rounded-lg bg-accent px-3 text-[13px] font-medium text-[var(--on-accent)] hover:opacity-90"
                  >
                    Open in WhatsApp
                  </a>
                )}
              </div>
              {c.notes && <p className="mt-3 text-[12.5px] text-ink-3">Note: {c.notes}</p>}
            </article>
          );
        })}
        {rows.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line p-8 text-center text-[14px] text-ink-3">
            Nothing here.
          </p>
        )}
      </div>

      {rows.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + PAGE)}
          className="mx-auto mt-5 block rounded-xl border border-line bg-surface px-4 py-2 text-[13.5px] text-ink hover:bg-soft"
        >
          Show more ({(rows.length - limit).toLocaleString("en-US")} left)
        </button>
      )}
    </>
  );
}
