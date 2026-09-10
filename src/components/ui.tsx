import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { Stage } from "@/lib/normalize";

/* Each stage maps to a hue on the pipeline spectrum. */
export const STAGE_HUE: Record<Stage, string> = {
  "Not contacted": "notcontacted",
  Contacted: "contacted",
  "In discussion": "discussion",
  "Demo done": "demo",
  "Proposal sent": "proposal",
  Negotiating: "negotiating",
  Won: "won",
  "On hold": "hold",
  Lost: "lost",
};

export function hueStyle(hue: string, strength = 15): CSSProperties {
  return {
    background: `color-mix(in oklab, var(--h-${hue}) ${strength}%, var(--surface))`,
    color: `var(--h-${hue})`,
  };
}

/* ---- deterministic name avatar ---------------------------------- */
const AVATAR_HUES = [
  "contacted",
  "discussion",
  "demo",
  "proposal",
  "negotiating",
  "won",
  "hold",
] as const;

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\p{N} ]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({
  name,
  size = 36,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const h = hash(name);
  const a = AVATAR_HUES[h % AVATAR_HUES.length];
  const b = AVATAR_HUES[(h >> 3) % AVATAR_HUES.length];
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        letterSpacing: "0.02em",
        background: `linear-gradient(135deg, var(--h-${a}), var(--h-${b}))`,
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)",
      }}
    >
      {initials(name)}
    </span>
  );
}

/* ---- linear stage progress ------------------------------------- */
const STEP_PATH: Stage[] = [
  "Not contacted",
  "Contacted",
  "In discussion",
  "Demo done",
  "Proposal sent",
  "Negotiating",
  "Won",
];

export function StageStepper({ stage, raw }: { stage: Stage; raw?: string }) {
  const aside = stage === "Lost" || stage === "On hold";
  const currentIdx = aside
    ? STEP_PATH.length - 1
    : Math.max(0, STEP_PATH.indexOf(stage));

  return (
    <div>
      <ol className="flex items-center gap-1.5">
        {STEP_PATH.map((s, i) => {
          const done = !aside && i < currentIdx;
          const here = !aside && i === currentIdx;
          const hue = STAGE_HUE[s];
          return (
            <li key={s} className="flex flex-1 items-center gap-1.5" title={s}>
              <span
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{
                  background:
                    done || here
                      ? `var(--h-${hue})`
                      : "color-mix(in oklab, var(--ink-3) 22%, transparent)",
                  opacity: aside ? 0.4 : done ? 0.55 : 1,
                }}
              />
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-[12.5px] text-ink-3">
        {aside ? (
          <>
            <span style={{ color: `var(--h-${STAGE_HUE[stage]})` }}>{stage}</span>
            {raw && raw.toLowerCase() !== stage.toLowerCase() && <> · “{raw}”</>}
          </>
        ) : (
          <>
            Step {currentIdx + 1} of {STEP_PATH.length} ·{" "}
            <span style={{ color: `var(--h-${STAGE_HUE[stage]})` }}>{stage}</span>
          </>
        )}
      </p>
    </div>
  );
}

export function StageBadge({ stage, raw }: { stage: Stage; raw?: string }) {
  const showRaw = raw && raw.toLowerCase() !== stage.toLowerCase();
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium"
      style={hueStyle(STAGE_HUE[stage])}
      title={showRaw ? raw : undefined}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: `var(--h-${STAGE_HUE[stage]})` }}
      />
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
    <div className="relative mb-8">
      <div
        className="pointer-events-none absolute -inset-x-6 -top-8 -bottom-4 -z-10"
        style={{ background: "var(--glow)" }}
      />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-semibold tracking-[-0.025em] text-ink">{title}</h1>
          {sub && <p className="mt-1.5 text-[14px] text-ink-2">{sub}</p>}
        </div>
        {action}
      </div>
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
  const cls = `card block rounded-2xl ${className}`;
  return href ? (
    <Link href={href} className={`${cls} transition-[transform,border-color] hover:-translate-y-px hover:border-ink-3/40`}>
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
  hue,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  hue?: string;
}) {
  return (
    <div className="card min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5">
      {hue && (
        <span
          className="mb-3 block h-0.5 w-8 rounded-full"
          style={{ background: `var(--h-${hue})` }}
        />
      )}
      <p className="text-[13px] text-ink-2">{label}</p>
      <p className="num mt-1.5 whitespace-nowrap font-mono text-[21px] leading-none text-ink sm:text-[27px]">
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

const CHANNEL_HUE: Record<string, string> = {
  whatsapp: "won",
  phone: "contacted",
  meet: "demo",
  meeting: "demo",
  build: "proposal",
  deploy: "negotiating",
  research: "notcontacted",
  email: "discussion",
};

export function ChannelIcon({ channel }: { channel: string }) {
  const c = channel.toLowerCase();
  const key =
    Object.keys(CHANNEL_ICON).find((k) => c.includes(k)) ??
    (c.includes("person") ? "meeting" : "email");
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full"
      style={hueStyle(CHANNEL_HUE[key], 18)}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d={CHANNEL_ICON[key]} />
      </svg>
    </span>
  );
}
