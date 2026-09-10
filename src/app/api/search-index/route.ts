import { NextResponse } from "next/server";
import { getActivity, getCalls, getLeads, getProspects, safe } from "@/lib/sheets";
import { shortDate } from "@/lib/normalize";

export const revalidate = 60;

/** A slim index the command menu loads once and filters client-side. */
export async function GET() {
  const [pR, lR, cR] = await Promise.all([
    safe(getProspects),
    safe(getLeads),
    safe(getCalls),
  ]);
  const prospects = pR.ok ? pR.data : [];
  const aR = pR.ok ? await safe(() => getActivity(prospects)) : { ok: false as const };

  return NextResponse.json(
    {
      prospects: prospects.map((p) => ({
        title: p.name,
        sub: `${p.type} · ${p.stage}`,
        href: `/prospects/${p.slug}`,
      })),
      leads: (lR.ok ? lR.data : []).map((l) => ({
        title: l.business,
        sub: [l.type, l.city, l.country === "United States" ? "US" : l.country === "Canada" ? "CA" : l.country]
          .filter(Boolean)
          .join(" · "),
        href: `/leads?q=${encodeURIComponent(l.business)}`,
        extra: l.phone,
      })),
      calls: (cR.ok ? cR.data : []).map((c) => ({
        title: c.business,
        sub: ["Call list", c.city].filter(Boolean).join(" · "),
        href: `/calls?q=${encodeURIComponent(c.business)}`,
      })),
      activity: (aR.ok ? aR.data : []).slice(0, 60).map((a) => ({
        title: a.what.slice(0, 80),
        sub: `${a.prospect} · ${shortDate(a.date)}`,
        href: a.prospectSlug ? `/prospects/${a.prospectSlug}` : "/activity",
      })),
    },
    { headers: { "cache-control": "private, max-age=30" } },
  );
}
