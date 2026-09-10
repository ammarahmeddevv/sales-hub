import { getActivity, safe } from "@/lib/sheets";
import { ActivityFeed } from "@/components/activity-feed";
import { Card, ErrorState, PageHeader } from "@/components/ui";

export const revalidate = 60;
export const metadata = { title: "Activity" };

export default async function ActivityPage() {
  const r = await safe(() => getActivity());
  if (!r.ok) {
    return (
      <>
        <PageHeader title="Activity" />
        <ErrorState message={r.error} />
      </>
    );
  }
  const counts = new Map<string, number>();
  for (const a of r.data) counts.set(a.prospect, (counts.get(a.prospect) ?? 0) + 1);

  return (
    <>
      <PageHeader
        title="Activity"
        sub={`Every call, message and meeting, newest first · ${r.data.length} entries`}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {[...counts].map(([name, n]) => (
          <span key={name} className="rounded-full border border-line bg-surface px-3 py-1 text-[12.5px] text-ink-2">
            {name} <span className="text-ink-3">· {n}</span>
          </span>
        ))}
      </div>
      <Card className="p-6">
        <ActivityFeed items={r.data} />
      </Card>
    </>
  );
}
