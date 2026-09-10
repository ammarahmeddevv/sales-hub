"use client";

import { Fragment, useMemo, useState } from "react";
import type { Lead } from "@/lib/sheets";

const PAGE = 60;

function Select({
  value,
  onChange,
  options,
  all,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  all: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-xl border border-line bg-surface px-3 text-[13.5px] text-ink"
    >
      <option value="">{all}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [type, setType] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);

  const countries = useMemo(() => [...new Set(leads.map((l) => l.country).filter(Boolean))].sort(), [leads]);
  const types = useMemo(() => [...new Set(leads.map((l) => l.type).filter(Boolean))].sort(), [leads]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads
      .filter((l) => (!country || l.country === country) && (!type || l.type === type))
      .filter((l) => !needle || `${l.business} ${l.city} ${l.phone}`.toLowerCase().includes(needle))
      .sort((a, b) => b.score - a.score);
  }, [leads, q, country, type]);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="Search business, city or phone"
          className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-surface px-3.5 text-[14px] text-ink placeholder:text-ink-3 sm:max-w-sm"
        />
        <Select value={country} onChange={setCountry} options={countries} all="All countries" />
        <Select value={type} onChange={setType} options={types} all="All trades" />
      </div>
      <p className="mb-3 text-[13px] text-ink-3">{rows.length.toLocaleString("en-US")} leads</p>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-[13.5px]">
          <thead className="border-b border-line bg-soft/60 text-[12px] text-ink-3">
            <tr className="[&>th]:px-4 [&>th]:py-2.5 [&>th]:font-medium">
              <th>Business</th>
              <th className="hidden sm:table-cell">Trade</th>
              <th className="hidden md:table-cell">City</th>
              <th className="hidden lg:table-cell">Quote</th>
              <th className="text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map((l) => {
              const isOpen = open === l.id;
              return (
                <Fragment key={l.id}>
                  <tr
                    onClick={() => setOpen(isOpen ? null : l.id)}
                    className={`cursor-pointer border-b border-line last:border-0 hover:bg-soft/50 [&>td]:px-4 [&>td]:py-3 ${isOpen ? "bg-soft/50" : ""}`}
                  >
                    <td>
                      <p className="font-medium text-ink">{l.business}</p>
                      <p className="text-[12px] text-ink-3 sm:hidden">
                        {l.type} · {l.city}
                      </p>
                    </td>
                    <td className="hidden capitalize text-ink-2 sm:table-cell">{l.type}</td>
                    <td className="hidden text-ink-2 md:table-cell">
                      {l.city}
                      <span className="text-ink-3"> · {l.country === "United States" ? "US" : l.country === "Canada" ? "CA" : l.country}</span>
                    </td>
                    <td className="hidden text-ink-2 lg:table-cell">{l.quote}</td>
                    <td className="text-right font-mono tabular-nums text-ink">{l.score}</td>
                  </tr>
                  {isOpen && (
                    <tr className="border-b border-line bg-soft/40">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="grid gap-4 text-[13.5px] sm:grid-cols-2">
                          <div>
                            <p className="text-[12px] text-ink-3">What I noticed</p>
                            <p className="mt-1 text-ink">{l.noticed}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[12px] text-ink-3">Phone</p>
                              <a href={`tel:${l.phone}`} className="mt-1 block font-mono text-accent">{l.phone || "—"}</a>
                            </div>
                            <div>
                              <p className="text-[12px] text-ink-3">Quote</p>
                              <p className="mt-1 text-ink">{l.quote}</p>
                              <p className="text-[12px] text-ink-3">{l.pkr}</p>
                            </div>
                            <div>
                              <p className="text-[12px] text-ink-3">Website</p>
                              <p className="mt-1 text-ink">{l.websiteStatus}</p>
                            </div>
                            <div>
                              <p className="text-[12px] text-ink-3">Stage</p>
                              <p className="mt-1 capitalize text-ink">{l.stage}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + PAGE)}
          className="mx-auto mt-4 block rounded-xl border border-line bg-surface px-4 py-2 text-[13.5px] text-ink hover:bg-soft"
        >
          Show more ({(rows.length - limit).toLocaleString("en-US")} left)
        </button>
      )}
    </>
  );
}
