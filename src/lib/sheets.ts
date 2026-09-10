import { accessToken } from "./google-auth";
import { canonicalStage, parseMoney, sameProspect, slugify, type Stage } from "./normalize";

/* Everything this app shows comes from two Google Sheets, read at request
   time and cached for a minute. The sheets are the source of truth; nothing
   here is stored anywhere else. */

const TRACKER = process.env.TRACKER_SHEET_ID ?? "1m5TPWAcsrHo3sLQ-2luiUXOCNR5RneQg9uTjRyFfWPM";
const LEADFLOW = process.env.LEADFLOW_SHEET_ID ?? "1cQpwhJbhcL5kan1ykxWOeRvAVCwyeEHPTM8peIpMyJg";

export const SHEET_URLS = {
  tracker: `https://docs.google.com/spreadsheets/d/${TRACKER}/edit`,
  leadflow: `https://docs.google.com/spreadsheets/d/${LEADFLOW}/edit`,
};

/** Retries dropped connections and 429/5xx — Google occasionally resets
 *  requests, and some networks (Karachi, notably) drop them often. */
async function readRange(spreadsheetId: string, range: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?majorDimension=ROWS`;
  let lastError: unknown;
  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, Math.min(4000, 500 * 2 ** attempt)));
    try {
      const res = await fetch(url, {
        headers: { authorization: `Bearer ${await accessToken()}` },
        next: { revalidate: 60 },
      });
      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(`Sheets API ${res.status} reading ${range}`);
        continue;
      }
      if (!res.ok) throw new Error(`Sheets API ${res.status} reading ${range}`);
      const body = (await res.json()) as { values?: string[][] };
      return body.values ?? [];
    } catch (e) {
      // only network failures are worth retrying; a 403/404 won't fix itself
      if ((e as Error).message.startsWith("Sheets API")) throw e;
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Could not read ${range}`);
}

/** Rows below `headerRow` as objects keyed by header text, blank rows dropped. */
function table(values: string[][], headerRow: number): Record<string, string>[] {
  const headers = (values[headerRow] ?? []).map((h) => h.trim());
  return values
    .slice(headerRow + 1)
    .filter((r) => r.some((c) => c && c.trim()))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));
}

// ---------------------------------------------------------------- tracker

export interface Prospect {
  slug: string;
  name: string;
  type: string;
  location: string;
  contacts: string;
  phoneEmail: string;
  found: string;
  firstContact: string;
  offering: string;
  price: string;
  stageRaw: string;
  stage: Stage;
  nextStep: string;
  nextDate: string;
  lastUpdate: string;
  notes: string;
  dealValue: number;
  received: number;
  paymentNote: string;
}

export interface Activity {
  date: string;
  prospect: string;
  prospectSlug: string | null;
  channel: string;
  what: string;
  outcome: string;
}

export async function getProspects(): Promise<Prospect[]> {
  const rows = table(await readRange(TRACKER, "'Prospects'!A1:Q500"), 3);
  return rows
    .filter((r) => r["Prospect"])
    .map((r) => ({
      slug: slugify(r["Prospect"]),
      name: r["Prospect"],
      type: r["Type / Industry"],
      location: r["Location"],
      contacts: r["Contact(s)"],
      phoneEmail: r["Phone / Email"],
      found: r["How I found them"],
      firstContact: r["First contact"],
      offering: r["What I'm offering"],
      price: r["Price quoted (PKR)"],
      stageRaw: r["Stage"],
      stage: canonicalStage(r["Stage"] ?? ""),
      nextStep: r["Next step"],
      nextDate: r["Next step date"],
      lastUpdate: r["Last update"],
      notes: r["Notes"],
      dealValue: parseMoney(r["Deal value (PKR)"] ?? ""),
      received: parseMoney(r["Received (PKR)"] ?? ""),
      paymentNote: r["Payment note"] ?? "",
    }));
}

export async function getActivity(prospects?: Prospect[]): Promise<Activity[]> {
  const list = prospects ?? (await getProspects());
  const rows = table(await readRange(TRACKER, "'Activity Log'!A1:E600"), 3);
  return rows.map((r) => ({
    date: r["Date"],
    prospect: r["Prospect"],
    prospectSlug: list.find((p) => sameProspect(r["Prospect"], p.name))?.slug ?? null,
    channel: r["Channel"],
    what: r["What happened"],
    outcome: r["Outcome / next step"],
  }));
}

// ---------------------------------------------------------------- leadflow

export interface Lead {
  id: string;
  tier: string;
  score: number;
  business: string;
  type: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  websiteStatus: string;
  noticed: string;
  quote: string;
  pkr: string;
  stage: string;
  lastUpdate: string;
  notes: string;
}

export interface Call {
  id: string;
  tier: string;
  score: number;
  business: string;
  city: string;
  phone: string;
  noticed: string;
  message: string;
  quote: string;
  called: boolean;
  outcome: string;
  notes: string;
}

export interface Funnel {
  label: string;
  value: number;
}

export async function getLeads(): Promise<Lead[]> {
  const rows = table(await readRange(LEADFLOW, "'Leads'!A1:Q900"), 0).filter((r) => r["Business"]);
  return rows.map((r) => ({
    id: r["ID"],
    tier: r["Tier"],
    score: Number(r["Score"]) || 0,
    business: r["Business"],
    type: r["Type"],
    city: r["City"],
    country: r["Country"],
    phone: r["Phone"],
    email: r["Email"],
    website: r["Website"],
    websiteStatus: r["Website status"],
    noticed: r["What I noticed"],
    quote: r["Suggested quote"],
    pkr: r["≈ PKR / job"],
    stage: r["Stage"],
    lastUpdate: r["Last update"],
    notes: r["Owner notes"],
  }));
}

export async function getCalls(): Promise<Call[]> {
  // the sheet pre-fills the Called? checkbox on empty rows, so key off Business
  const rows = table(await readRange(LEADFLOW, "'Call List'!A1:L900"), 0).filter((r) => r["Business"]);
  return rows.map((r) => ({
    id: r["ID"],
    tier: r["Tier"],
    score: Number(r["Score"]) || 0,
    business: r["Business"],
    city: r["City"],
    phone: r["Phone"],
    noticed: r["What I noticed"],
    message: r["Message to send"],
    quote: r["Suggested quote"],
    called: (r["Called?"] ?? "").toUpperCase() === "TRUE",
    outcome: r["Outcome"],
    notes: r["Notes"],
  }));
}

/** The funnel row on the LeadFlow Dashboard tab: labels on row 5, numbers on row 6. */
export async function getFunnel(): Promise<Funnel[]> {
  const v = await readRange(LEADFLOW, "'Dashboard'!A4:F6");
  // row 4 = "THE FUNNEL", row 5 = labels, row 6 = numbers — but be tolerant of
  // the header row shifting: use whichever pair of rows has 6 numbers below 6 labels.
  const rows = v.map((r) => r.map((c) => (c ?? "").trim()));
  for (let i = 0; i < rows.length - 1; i++) {
    const labels = rows[i];
    const nums = rows[i + 1];
    if (labels.length >= 3 && nums.slice(0, labels.length).every((n) => n === "" || /^\d/.test(n))) {
      return labels
        .filter(Boolean)
        .map((label, j) => ({ label, value: Number(nums[j]) || 0 }));
    }
  }
  return [];
}

// ---------------------------------------------------------------- helpers

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function safe<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
