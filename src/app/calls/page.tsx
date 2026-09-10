import { getCalls, safe } from "@/lib/sheets";
import { CallList } from "@/components/call-list";
import { ErrorState, PageHeader } from "@/components/ui";

export const revalidate = 60;
export const metadata = { title: "Call list" };

export default async function CallsPage() {
  const r = await safe(getCalls);
  return (
    <>
      <PageHeader
        title="Call list"
        sub="Best leads first, each with a message already written for their size"
      />
      {r.ok ? <CallList calls={r.data} /> : <ErrorState message={r.error} />}
    </>
  );
}
