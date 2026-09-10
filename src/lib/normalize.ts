/* Turning the sheets' free text into things the UI can sort and colour. */

export const STAGES = [
  "Not contacted",
  "Contacted",
  "In discussion",
  "Demo done",
  "Proposal sent",
  "Negotiating",
  "Won",
  "On hold",
  "Lost",
] as const;
export type Stage = (typeof STAGES)[number];

/** Map a hand-typed stage ("Likely lost — no reply") onto a canonical one. */
export function canonicalStage(raw: string): Stage {
  const s = raw.toLowerCase();
  if (s.includes("not contacted")) return "Not contacted";
  if (s.includes("lost")) return "Lost";
  if (s.includes("won")) return "Won";
  if (s.includes("hold")) return "On hold";
  if (s.includes("negotiat")) return "Negotiating";
  if (s.includes("proposal")) return "Proposal sent";
  if (s.includes("demo")) return "Demo done";
  if (s.includes("discussion")) return "In discussion";
  if (s.includes("contacted")) return "Contacted";
  return "In discussion";
}

export const CLOSED: Stage[] = ["Won", "Lost"];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const words = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** The activity log uses short names ("F.F Real Estate"); the prospect list
 *  uses full ones ("F.F Real Estate Builder & Developers"). Match on the
 *  normalised leading words. */
export function sameProspect(logName: string, fullName: string): boolean {
  const a = words(logName);
  const b = words(fullName);
  if (!a || !b) return false;
  return b.startsWith(a) || a.startsWith(b);
}

/** First ISO date inside free text ("~2026-09-11 (decision point)"), or null. */
export function findDate(text: string): Date | null {
  const m = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00Z`) : null;
}

/** First money-sized figure in free text ("180,000 build (90k now …)") → 180000. */
export function firstAmount(text: string): number | null {
  for (const m of text.matchAll(/(\d{1,3}(?:,\d{3})+|\d{4,})/g)) {
    const n = Number(m[1].replace(/,/g, ""));
    if (n >= 1000) return n;
  }
  return null;
}

export const pkr = (n: number) => `Rs ${n.toLocaleString("en-US")}`;

/** A number from a cell that might hold "180,000", "Rs 90k", or "" → 0. */
export function parseMoney(text: string): number {
  if (!text) return 0;
  const m = text.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*([km])?/i);
  if (!m) return 0;
  const n = Number(m[1]);
  const mult = m[2]?.toLowerCase() === "k" ? 1000 : m[2]?.toLowerCase() === "m" ? 1_000_000 : 1;
  return Math.round(n * mult);
}

/** "Rs 1,80,000" style short label for big money. */
export function pkrShort(n: number): string {
  if (n >= 100_000) return `Rs ${(n / 100_000).toFixed(n % 100_000 ? 1 : 0)}L`;
  if (n >= 1000) return `Rs ${(n / 1000).toFixed(n % 1000 ? 1 : 0)}k`;
  return `Rs ${n}`;
}

/** "2026-09-07" → "7 Sep"; anything else is returned untouched. */
export function shortDate(text: string): string {
  const d = findDate(text);
  if (!d) return text;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}
