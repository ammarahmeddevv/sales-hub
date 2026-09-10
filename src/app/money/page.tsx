import Link from "next/link";
import { getProspects, safe } from "@/lib/sheets";
import { pkr } from "@/lib/normalize";
import { CountUp } from "@/components/count-up";
import { Avatar, Card, ErrorState, PageHeader, Stat, StageBadge, Empty } from "@/components/ui";

export const revalidate = 60;
export const metadata = { title: "Money" };

export default async function MoneyPage() {
  const r = await safe(getProspects);
  if (!r.ok) {
    return (
      <>
        <PageHeader title="Money" />
        <ErrorState message={r.error} />
      </>
    );
  }

  const deals = r.data.filter((p) => p.dealValue > 0 || p.received > 0 || p.stage === "Won");
  const collected = r.data.reduce((s, p) => s + p.received, 0);
  const outstanding = r.data
    .filter((p) => p.stage !== "Lost")
    .reduce((s, p) => s + Math.max(0, p.dealValue - p.received), 0);
  const pipeline = r.data
    .filter((p) => !["Won", "Lost"].includes(p.stage))
    .reduce((s, p) => s + p.dealValue, 0);
  const won = r.data.filter((p) => p.stage === "Won");
  const lost = r.data.filter((p) => p.stage === "Lost");
  const decided = won.length + lost.length;
  const winRate = decided ? Math.round((won.length / decided) * 100) : null;

  return (
    <>
      <PageHeader
        title="Money"
        sub="What's agreed, what's in, and what's still owed. Add deal values in the tracker's new columns."
      />

      <div className="rise grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat hue="won" label="Collected" value={<CountUp value={collected} prefix="Rs " />} hint="received across all deals" />
        <Stat hue="hold" label="Outstanding" value={<CountUp value={outstanding} prefix="Rs " />} hint="agreed but not yet paid" />
        <Stat hue="discussion" label="Open pipeline" value={<CountUp value={pipeline} prefix="Rs " />} hint="deal value of live deals" />
        <Stat
          hue="proposal"
          label="Win rate"
          value={winRate === null ? "—" : `${winRate}%`}
          hint={decided ? `${won.length} won · ${lost.length} lost` : "no closed deals yet"}
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-[15px] font-semibold text-ink">Deals</h2>
        {deals.length === 0 ? (
          <Empty>
            No deal values recorded yet. Fill in “Deal value (PKR)” and “Received (PKR)” on the
            Prospects tab and they’ll show here.
          </Empty>
        ) : (
          <Card className="divide-y divide-line">
            {deals.map((p) => {
              const bal = Math.max(0, p.dealValue - p.received);
              const pct = p.dealValue ? Math.min(100, (p.received / p.dealValue) * 100) : 0;
              return (
                <Link
                  key={p.slug}
                  href={`/prospects/${p.slug}`}
                  className="block p-5 transition-colors hover:bg-soft/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar name={p.name} size={32} className="mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium text-ink">{p.name}</p>
                        <p className="mt-0.5 text-[13px] text-ink-3">{p.type}</p>
                      </div>
                    </div>
                    <StageBadge stage={p.stage} raw={p.stageRaw} />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-[13px]">
                    <div>
                      <p className="text-ink-3">Deal value</p>
                      <p className="mt-0.5 font-mono text-ink">{p.dealValue ? pkr(p.dealValue) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-ink-3">Received</p>
                      <p className="mt-0.5 font-mono text-ink">{pkr(p.received)}</p>
                    </div>
                    <div>
                      <p className="text-ink-3">Balance</p>
                      <p
                        className="mt-0.5 font-mono"
                        style={{ color: bal > 0 ? "var(--h-hold)" : "var(--h-won)" }}
                      >
                        {p.dealValue ? pkr(bal) : "—"}
                      </p>
                    </div>
                  </div>

                  {p.dealValue > 0 && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: "var(--h-won)" }}
                      />
                    </div>
                  )}
                  {p.paymentNote && (
                    <p className="mt-3 text-[12.5px] text-ink-2">{p.paymentNote}</p>
                  )}
                </Link>
              );
            })}
          </Card>
        )}
      </div>
    </>
  );
}
