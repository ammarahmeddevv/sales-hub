import { getProspects, safe } from "@/lib/sheets";
import { STAGES, shortDate } from "@/lib/normalize";
import { Card, ErrorState, PageHeader, StageBadge } from "@/components/ui";

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

  // hide empty "Not contacted" — everyone in the tracker has been contacted
  const columns = STAGES.filter((s) => s !== "Not contacted" || r.data.some((p) => p.stage === s));

  return (
    <>
      <PageHeader title="Pipeline" sub={`${r.data.length} prospects across ${columns.length} stages`} />
      <div className="-mx-5 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
        <div className="flex gap-4" style={{ minWidth: columns.length * 260 }}>
          {columns.map((stage) => {
            const cards = r.data.filter((p) => p.stage === stage);
            return (
              <div key={stage} className="w-[260px] shrink-0">
                <div className="mb-3 flex items-center justify-between px-1">
                  <StageBadge stage={stage} />
                  <span className="font-mono text-[12px] text-ink-3">{cards.length}</span>
                </div>
                <div className="min-h-24 space-y-3 rounded-2xl bg-soft/70 p-2">
                  {cards.map((p) => (
                    <Card key={p.slug} href={`/prospects/${p.slug}`} className="p-4">
                      <p className="text-[14px] font-medium leading-snug text-ink">{p.name}</p>
                      <p className="mt-1 text-[12.5px] text-ink-3">{p.type}</p>
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
