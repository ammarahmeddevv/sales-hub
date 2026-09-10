import Link from "next/link";
import type { CalEvent, Comm } from "@/lib/sheets";
import { shortDate } from "@/lib/normalize";
import { hueStyle } from "./ui";

export function UpcomingList({ events, showProspect = true }: { events: CalEvent[]; showProspect?: boolean }) {
  if (!events.length) {
    return <p className="text-[13px] text-ink-3">Nothing scheduled.</p>;
  }
  return (
    <ul className="space-y-3">
      {events.map((e, i) => (
        <li key={i} className="flex gap-3">
          <span
            className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg text-center"
            style={hueStyle("demo", 16)}
          >
            <span className="text-[13px] font-semibold leading-none">
              {e.date ? shortDate(e.date).split(" ")[0] : "–"}
            </span>
            <span className="text-[9px] uppercase leading-tight">
              {e.date ? shortDate(e.date).split(" ")[1] : ""}
            </span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] leading-snug text-ink">{e.title}</p>
            <p className="mt-0.5 text-[12px] text-ink-3">
              {[e.time, e.withWho].filter(Boolean).join(" · ")}
              {showProspect && e.prospectSlug && (
                <>
                  {" · "}
                  <Link href={`/prospects/${e.prospectSlug}`} className="text-accent hover:underline">
                    {e.prospect}
                  </Link>
                </>
              )}
            </p>
            {e.link && (
              <a href={e.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[12px] text-accent hover:underline">
                Join / open ↗
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CommsList({ comms }: { comms: Comm[] }) {
  if (!comms.length) {
    return (
      <p className="text-[13px] leading-relaxed text-ink-3">
        No emails logged. This prospect has been WhatsApp-only so far — anything worth keeping
        gets added to the Comms tab and shows here.
      </p>
    );
  }
  return (
    <ul className="space-y-4">
      {comms.map((c, i) => {
        const out = c.direction.toLowerCase().startsWith("out");
        return (
          <li key={i} className="flex gap-3">
            <span
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
              style={hueStyle(out ? "proposal" : "discussion", 18)}
            >
              {out ? "↑" : "↓"}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 text-[12.5px]">
                <span className="font-medium text-ink">{c.subject || c.channel}</span>
                <span className="text-ink-3">
                  {c.channel} · {shortDate(c.date)}
                </span>
              </div>
              {c.summary && <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{c.summary}</p>}
              {c.link && (
                <a href={c.link} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[12px] text-accent hover:underline">
                  Open ↗
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
