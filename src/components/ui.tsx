import Link from "next/link";
import type { ReactNode } from "react";
import type { Stage } from "@/lib/normalize";

const STAGE_TONE: Record<Stage, "won" | "active" | "open" | "hold" | "lost"> = {
  "Not contacted": "lost",
  Contacted: "open",
  "In discussion": "open",
  "Demo done": "active",
  "Proposal sent": "active",
  Negotiating: "active",
  Won: "won",
  "On hold": "hold",
  Lost: "lost",
};

export function StageBadge({ stage, raw }: { stage: Stage; raw?: string }) {
  const showRaw = raw && raw.toLowerCase() !== stage.toLowerCase();
  const tone = STAGE_TONE[stage];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium"
      style={{ background: `var(--st-${tone}-bg)`, color: `var(--st-${tone}-fg)` }}
      title={showRaw ? raw : undefined}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {stage}
    </span>
  );
}

export function PageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink">{title}</h1>
        {sub && <p className="mt-1 text-[14px] text-ink-2">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
  href,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const cls = `block rounded-2xl border border-line bg-surface ${className}`;
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:border-ink-3/50`}>
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <p className="text-[13px] text-ink-2">{label}</p>
      <p className="mt-2 whitespace-nowrap font-mono text-[21px] leading-none tracking-tight text-ink tabular-nums sm:text-[28px]">
        {value}
      </p>
      {hint && <p className="mt-2 text-[12.5px] text-ink-3">{hint}</p>}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ background: "var(--warn-bg)", borderColor: "var(--warn-line)" }}
    >
      <p className="text-[14px] font-medium" style={{ color: "var(--warn-fg)" }}>
        Couldn&apos;t reach Google Sheets
      </p>
      <p className="mt-1 text-[13px]" style={{ color: "var(--warn-fg)" }}>
        Nothing is shown rather than out-of-date data. {message}
      </p>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-8 text-center text-[14px] text-ink-3">
      {children}
    </div>
  );
}

const CHANNEL_ICON: Record<string, string> = {
  whatsapp: "M3 21l1.6-4.6A8.5 8.5 0 1 1 7.7 19.4L3 21z",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2",
  meet: "M4 6h11v12H4zM15 10l5-3v10l-5-3",
  meeting: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6M2 20a6 6 0 0 1 12 0M14 20a6 6 0 0 1 8-5.6",
  build: "M14 7l3 3-8 8H6v-3zM13 4l7 7",
  deploy: "M12 3l9 16H3z",
  research: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",
  email: "M3 6h18v12H3zM3 6l9 7 9-7",
};

export function ChannelIcon({ channel }: { channel: string }) {
  const c = channel.toLowerCase();
  const key =
    Object.keys(CHANNEL_ICON).find((k) => c.includes(k)) ??
    (c.includes("person") ? "meeting" : "email");
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-2">
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={CHANNEL_ICON[key]} />
      </svg>
    </span>
  );
}
