import { getLeads, safe, SHEET_URLS } from "@/lib/sheets";
import { LeadsTable } from "@/components/leads-table";
import { ErrorState, PageHeader } from "@/components/ui";

export const revalidate = 60;
export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  const r = await safe(getLeads);
  return (
    <>
      <PageHeader
        title="Leads"
        sub="Businesses with no working website, found and scored by LeadFlow"
        action={
          <a href={SHEET_URLS.leadflow} target="_blank" rel="noreferrer" className="text-[13px] text-ink-3 hover:text-ink">
            Open sheet ↗
          </a>
        }
      />
      {r.ok ? <LeadsTable leads={r.data} /> : <ErrorState message={r.error} />}
    </>
  );
}
