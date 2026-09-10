import Link from "next/link";
import type { Activity } from "@/lib/sheets";
import { findDate, shortDate } from "@/lib/normalize";
import { ChannelIcon } from "./ui";

/** Relative bucket for a free-text date, newest-first friendly. */
function bucket(text: string): string {
  const d = findDate(text);
  if (!d) return "Undated";
  const now = new Date();
  const day = 86_400_000;
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diff = midnight - d.getTime();
  if (diff < day) return "Today";
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return "This week";
  if (diff < 30 * day) return "This month";
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function ActivityFeed({
  items,
  showProspect = true,
}: {
  items: Activity[];
  showProspect?: boolean;
}) {
  let lastBucket = "";

  return (
    <ol className="relative [overflow-wrap:anywhere]">
      {items.map((a, i) => {
        const b = bucket(a.date);
        const newGroup = b !== lastBucket;
        lastBucket = b;
        const last = i === items.length - 1;
        return (
          <li key={i} className="relative">
            {newGroup && (
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3 ${
                  i === 0 ? "" : "mt-3"
                } mb-3`}
              >
                {b}
              </p>
            )}
            <div className="relative flex gap-4 pb-6 last:pb-0">
              {!last && (
                <span className="absolute left-4 top-9 bottom-0 w-px bg-line" aria-hidden />
              )}
              <ChannelIcon channel={a.channel} />
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[13px]">
                  <span className="font-medium text-ink">{a.channel}</span>
                  {showProspect &&
                    (a.prospectSlug ? (
                      <Link
                        href={`/prospects/${a.prospectSlug}`}
                        className="text-accent hover:underline"
                      >
                        {a.prospect}
                      </Link>
                    ) : (
                      <span className="text-ink-2">{a.prospect}</span>
                    ))}
                  <span className="text-ink-3">· {shortDate(a.date)}</span>
                </div>
                <p className="mt-1 text-[14px] leading-relaxed text-ink">{a.what}</p>
                {a.outcome && (
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">
                    <span className="text-ink-3">→ </span>
                    {a.outcome}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
