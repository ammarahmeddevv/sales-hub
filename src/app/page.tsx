import Link from "next/link";
import { getActivity, getCalendar, getFunnel, getProspects, safe } from "@/lib/sheets";
import { CLOSED, findDate, pkrShort, shortDate } from "@/lib/normalize";
import { ActivityFeed } from "@/components/activity-feed";
import { UpcomingList } from "@/components/upcoming";
import { CountUp } from "@/components/count-up";
import { Avatar, Card, ErrorState, PageHeader, SectionTitle, Stat, StageBadge } from "@/components/ui";

export const revalidate = 60;

export default async function Overview() {
  const [prospectsR, funnelR] = await Promise.all([safe(getProspects), safe(getFunnel)]);
  const [activityR, calendarR] = prospectsR.ok
    ? await Promise.all([
        safe(() => getActivity(prospectsR.data)),
        safe(() => getCalendar(prospectsR.data)),
      ])
    : [prospectsR, prospectsR];

  const now = new Date();
  const synced = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" });

  if (!prospectsR.ok) {
    return (
      <>
        <PageHeader title="Overview" />
        <ErrorState message={prospectsR.error} />
      </>
    );
  }

  const prospects = prospectsR.data;
  const open = prospects.filter((p) => !CLOSED.includes(p.stage));
  const won = prospects.filter((p) => p.stage === "Won");
  const collected = prospects.reduce((s, p) => s + p.received, 0);
  const outstanding = prospects
    .filter((p) => p.stage !== "Lost")
    .reduce((s, p) => s + Math.max(0, p.dealValue - p.received), 0);
  const pipelineValue = open.reduce((s, p) => s + p.dealValue, 0);
  const funnel = funnelR.ok ? funnelR.data : [];
  const f = (label: string) => funnel.find((x) => x.label.toLowerCase().startsWith(label))?.value ?? 0;

  const today = now.toISOString().slice(0, 10);
  const upcoming = (calendarR.ok ? calendarR.data : []).filter((e) => !e.date || e.date >= today).slice(0, 4);

  const nextUp = [...open].sort((a, b) => {
    const da = findDate(a.nextDate)?.getTime() ?? Infinity;
    const db = findDate(b.nextDate)?.getTime() ?? Infinity;
    return da - db;
  });

  const maxFunnel = Math.max(1, ...funnel.map((x) => x.value));

  return (
    <>
      <PageHeader
        title="Overview"
        sub={<>Sales Tracker and LeadFlow, read live from Google Sheets · synced {synced}</>}
      />

      <div className="rise grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat hue="contacted" label="Open deals" value={<CountUp value={open.length} />} hint={`${prospects.length} prospects in total`} />
        <Stat hue="won" label="Won" value={<CountUp value={won.length} />} hint={won.length ? won.map((w) => w.name).join(", ") : "first win pending"} />
        <Stat hue="proposal" label="Cold leads" value={<CountUp value={f("qualified")} />} hint={`${f("called")} contacted · ${f("interested")} interested`} />
        <Stat hue="demo" label="On call list" value={<CountUp value={f("on call list") || f("qualified")} />} hint="ready to reach out to" />
      </div>

      <Link
        href="/money"
        className="rise card mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl p-5 transition-[transform,border-color] hover:-translate-y-px hover:border-ink-3/40"
        style={{ animationDelay: "60ms" }}
      >
        <span className="text-[13px] font-semibold text-ink">Money</span>
        <span className="text-[13px] text-ink-2">
          Collected <span className="num font-mono text-ink">{pkrShort(collected)}</span>
        </span>
        <span className="text-[13px] text-ink-2">
          Outstanding <span className="num font-mono" style={{ color: "var(--h-hold)" }}>{pkrShort(outstanding)}</span>
        </span>
        <span className="text-[13px] text-ink-2">
          Open pipeline <span className="num font-mono text-ink">{pkrShort(pipelineValue)}</span>
        </span>
        <span className="ml-auto text-[13px] text-accent">Details →</span>
      </Link>

      <div className="rise mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" style={{ animationDelay: "120ms" }}>
        <section className="min-w-0 space-y-8">
          <div>
            <SectionTitle action={<Link href="/pipeline" className="text-[13px] text-accent hover:underline">Pipeline</Link>}>
              Next up
            </SectionTitle>
            <div className="space-y-3">
              {nextUp.length === 0 && <Card className="p-5 text-[14px] text-ink-3">No open deals.</Card>}
              {nextUp.map((p) => {
                const d = findDate(p.nextDate);
                const overdue = d && d.getTime() < now.getTime() - 86_400_000;
                return (
                  <Card key={p.slug} href={`/prospects/${p.slug}`} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <Avatar name={p.name} size={32} className="mt-0.5" />
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-medium text-ink">{p.name}</p>
                          <p className="mt-0.5 text-[13px] text-ink-3">{p.type}</p>
                        </div>
                      </div>
                      <StageBadge stage={p.stage} raw={p.stageRaw} />
                    </div>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{p.nextStep}</p>
                    <p className={`mt-2 text-[12.5px] font-medium ${overdue ? "text-danger" : "text-ink-3"}`}>
                      {d ? `${overdue ? "Overdue · " : ""}${shortDate(p.nextDate)}` : p.nextDate || "No date set"}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <SectionTitle>Upcoming</SectionTitle>
            <Card className="p-5">
              <UpcomingList events={upcoming} />
            </Card>
          </div>
        </section>

        <section className="min-w-0">
          <SectionTitle action={<Link href="/activity" className="text-[13px] text-accent hover:underline">All activity</Link>}>
            Recent activity
          </SectionTitle>
          <Card className="p-5">
            {activityR.ok ? (
              <ActivityFeed items={activityR.data.slice(0, 6)} />
            ) : (
              <p className="text-[14px] text-ink-3">{activityR.error}</p>
            )}
          </Card>
        </section>
      </div>

      {funnel.length > 0 && (
        <section className="mt-8">
          <SectionTitle action={<Link href="/leads" className="text-[13px] text-accent hover:underline">Leads</Link>}>
            LeadFlow funnel
          </SectionTitle>
          <Card className="p-5">
            <div className="space-y-3">
              {funnel.map((x, i) => (
                <div key={x.label} className="grid grid-cols-[150px_minmax(0,1fr)_56px] items-center gap-3 sm:grid-cols-[190px_minmax(0,1fr)_64px]">
                  <span className="text-[13px] text-ink-2">{x.label}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-soft">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.max(x.value ? 1.5 : 0, (x.value / maxFunnel) * 100)}%`,
                        background: `var(--h-${["notcontacted", "contacted", "discussion", "demo", "proposal", "won"][i] ?? "contacted"})`,
                      }}
                    />
                  </span>
                  <span className="num text-right font-mono text-[13px] text-ink">
                    {x.value.toLocaleString("en-US")}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </>
  );
}
