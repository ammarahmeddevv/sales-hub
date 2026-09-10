import Link from "next/link";
import type { Activity } from "@/lib/sheets";
import { shortDate } from "@/lib/normalize";
import { ChannelIcon } from "./ui";

export function ActivityFeed({
  items,
  showProspect = true,
}: {
  items: Activity[];
  showProspect?: boolean;
}) {
  return (
    <ol className="relative [overflow-wrap:anywhere]">
      {items.map((a, i) => (
        <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
          {i < items.length - 1 && (
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
        </li>
      ))}
    </ol>
  );
}
