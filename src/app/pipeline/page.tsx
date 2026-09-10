import { getProspects, safe } from "@/lib/sheets";
import { STAGES, shortDate } from "@/lib/normalize";
import { Avatar, Card, ErrorState, PageHeader, StageBadge, STAGE_HUE } from "@/components/ui";

export const revalidate = 60;
export const metadata = { title: "Pipeline" };

export default async function Pipeline() {
  const r = await safe(getProspects);
  if (!r.ok) {
    return (
      <>
        <PageHeader title="Pipeline" />
        <ErrorState message={r.error} />
      </>
    );
  }

  const count = (s: string) => r.data.filter((p) => p.stage === s).length;
  // "Not contacted" only appears if someone is actually there
  const stages = STAGES.filter((s) => s !== "Not contacted" || count(s) > 0);
  const active = stages.filter((s) => count(s) > 0);
  const empty = stages.filter((s) => count(s) === 0);
  const width = active.length * 264 + empty.length * 52;

  return (
    <>
      <PageHeader
        title="Pipeline"
        sub={`${r.data.length} prospects · ${active.length} active ${
          active.length === 1 ? "stage" : "stages"
        }`}
      />
      <div className="-mx-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
        <div className="flex gap-4" style={{ minWidth: width }}>
          {stages.map((stage) => {
            const cards = r.data.filter((p) => p.stage === stage);
            const hue = STAGE_HUE[stage];

            if (cards.length === 0) {
              return (
                <div
                  key={stage}
                  className="flex w-[44px] shrink-0 flex-col items-center rounded-2xl bg-soft/50 py-3"
                  title={`${stage} — none`}
                >
                  <span
                    className="mb-3 size-1.5 rounded-full"
                    style={{ background: `var(--h-${hue})`, opacity: 0.5 }}
                  />
                  <span
                    className="text-[12px] font-medium text-ink-3"
                    style={{ writingMode: "vertical-rl" }}
                  >
                    {stage}
                  </span>
                </div>
              );
            }

            return (
              <div key={stage} className="w-[264px] shrink-0">
                <div className="mb-3 flex items-center justify-between px-1">
                  <StageBadge stage={stage} />
                  <span className="font-mono text-[12px] text-ink-3">{cards.length}</span>
                </div>
                <div
                  className="min-h-24 space-y-3 rounded-2xl p-2"
                  style={{ background: `color-mix(in oklab, var(--h-${hue}) 7%, var(--soft))` }}
                >
                  {cards.map((p) => (
                    <Card key={p.slug} href={`/prospects/${p.slug}`} className="p-4">
                      <div className="flex items-start gap-2.5">
                        <Avatar name={p.name} size={28} className="mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[14px] font-medium leading-snug text-ink">{p.name}</p>
                          <p className="mt-0.5 text-[12.5px] text-ink-3">{p.type}</p>
                        </div>
                      </div>
                      {p.price && (
                        <p className="mt-3 line-clamp-2 text-[12.5px] text-ink-2">{p.price}</p>
                      )}
                      {p.stageRaw && p.stageRaw.toLowerCase() !== stage.toLowerCase() && (
                        <p className="mt-2 text-[12px] italic text-ink-3">“{p.stageRaw}”</p>
                      )}
                      {p.nextDate && (
                        <p className="mt-3 border-t border-line pt-2 text-[12px] text-ink-3">
                          Next · {shortDate(p.nextDate)}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
