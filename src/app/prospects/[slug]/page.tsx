import Link from "next/link";
import { notFound } from "next/navigation";
import { getActivity, getCalendar, getComms, getProspects, SHEET_URLS } from "@/lib/sheets";
import { pkr, shortDate } from "@/lib/normalize";
import { ActivityFeed } from "@/components/activity-feed";
import { CommsList, UpcomingList } from "@/components/upcoming";
import { Avatar, Card, SectionTitle, StageBadge, StageStepper } from "@/components/ui";

export const revalidate = 60;

/** "0313 3694904 (Mustafa); 0345 4569090 (Salman)" → dialable numbers with labels. */
function phones(text: string) {
  const out: { raw: string; intl: string; label: string }[] = [];
  for (const m of text.matchAll(/(\+?\d[\d\s-]{8,}\d)\s*(?:\(([^)]*)\))?/g)) {
    let digits = m[1].replace(/\D/g, "");
    if (digits.startsWith("0")) digits = "92" + digits.slice(1);
    out.push({ raw: m[1].trim(), intl: digits, label: (m[2] ?? "").split(/[—-]/)[0].trim() });
  }
  return out;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-[12.5px] text-ink-3">{label}</dt>
      <dd className="mt-1 text-[14px] leading-relaxed text-ink">{children}</dd>
    </div>
  );
}

export default async function ProspectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prospects = await getProspects();
  const p = prospects.find((x) => x.slug === slug);
  if (!p) notFound();
  const [activityAll, calendarAll, commsAll] = await Promise.all([
    getActivity(prospects),
    getCalendar(prospects),
    getComms(prospects),
  ]);
  const activity = activityAll.filter((a) => a.prospectSlug === slug);
  const today = new Date().toISOString().slice(0, 10);
  const scheduled = calendarAll.filter(
    (e) => e.prospectSlug === slug && (!e.date || e.date >= today),
  );
  const comms = commsAll.filter((c) => c.prospectSlug === slug);
  const nums = phones(p.phoneEmail);

  return (
    <>
      <Link href="/pipeline" className="text-[13px] text-ink-3 hover:text-ink">
        ← Pipeline
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3.5">
          <Avatar name={p.name} size={44} className="mt-0.5" />
          <div className="min-w-0">
            <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">{p.name}</h1>
            <p className="mt-1 text-[14px] text-ink-2">
              {p.type} · {p.location}
            </p>
          </div>
        </div>
        <StageBadge stage={p.stage} raw={p.stageRaw} />
      </div>

      <div className="mb-8">
        <StageStepper stage={p.stage} raw={p.stageRaw} />
      </div>

      <div className="grid grid-cols-1 gap-6 [overflow-wrap:anywhere] lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <Card className="p-6">
            <SectionTitle>Where it stands</SectionTitle>
            <p className="text-[15px] leading-relaxed text-ink">{p.nextStep || "No next step recorded."}</p>
            <p className="mt-2 text-[13px] text-ink-3">
              {p.nextDate ? `Next step date · ${shortDate(p.nextDate)}` : "No date set"}
              {p.lastUpdate && ` · updated ${shortDate(p.lastUpdate)}`}
            </p>
          </Card>

          <Card className="p-6">
            <SectionTitle>Offer</SectionTitle>
            <dl className="space-y-4">
              <Field label="What I'm offering">{p.offering}</Field>
              <Field label="Price quoted (PKR)">{p.price}</Field>
            </dl>
            {(p.dealValue > 0 || p.received > 0) && (
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-[13px]">
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
                    style={{
                      color:
                        p.dealValue - p.received > 0 ? "var(--h-hold)" : "var(--h-won)",
                    }}
                  >
                    {p.dealValue ? pkr(Math.max(0, p.dealValue - p.received)) : "—"}
                  </p>
                </div>
                {p.paymentNote && (
                  <p className="col-span-3 text-[12.5px] text-ink-2">{p.paymentNote}</p>
                )}
              </div>
            )}
          </Card>

          {scheduled.length > 0 && (
            <Card className="p-6">
              <SectionTitle>Scheduled</SectionTitle>
              <UpcomingList events={scheduled} showProspect={false} />
            </Card>
          )}

          <Card className="p-6">
            <SectionTitle>Emails &amp; messages</SectionTitle>
            <CommsList comms={comms} />
          </Card>

          <Card className="p-6">
            <SectionTitle>History</SectionTitle>
            {activity.length ? (
              <ActivityFeed items={activity} showProspect={false} />
            ) : (
              <p className="text-[14px] text-ink-3">No activity logged yet.</p>
            )}
          </Card>

          {p.notes && (
            <Card className="p-6">
              <SectionTitle>Notes</SectionTitle>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-2">{p.notes}</p>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="p-6">
            <SectionTitle>Contact</SectionTitle>
            <p className="text-[14px] text-ink">{p.contacts}</p>
            <div className="mt-4 space-y-2">
              {nums.map((n) => (
                <div key={n.intl} className="flex items-center justify-between gap-2 rounded-xl bg-soft px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] text-ink">{n.raw}</p>
                    {n.label && <p className="truncate text-[12px] text-ink-3">{n.label}</p>}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <a href={`tel:+${n.intl}`} className="rounded-lg border border-line bg-surface px-2.5 py-1 text-[12.5px] text-ink hover:bg-canvas">
                      Call
                    </a>
                    <a href={`https://wa.me/${n.intl}`} target="_blank" rel="noreferrer" className="rounded-lg bg-accent px-2.5 py-1 text-[12.5px] text-[var(--on-accent)] hover:opacity-90">
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
              {nums.length === 0 && <p className="text-[13px] text-ink-2">{p.phoneEmail}</p>}
            </div>
          </Card>

          <Card className="p-6">
            <dl className="space-y-4">
              <Field label="How I found them">{p.found}</Field>
              <Field label="First contact">{p.firstContact}</Field>
              <Field label="Stage as written">{p.stageRaw}</Field>
            </dl>
          </Card>

          <a href={SHEET_URLS.tracker} target="_blank" rel="noreferrer" className="block text-center text-[13px] text-ink-3 hover:text-ink">
            Open in Google Sheets ↗
          </a>
        </aside>
      </div>
    </>
  );
}
