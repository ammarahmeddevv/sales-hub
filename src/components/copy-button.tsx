"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked */
        }
      }}
      className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors ${
        done ? "border-transparent" : "border-line bg-surface text-ink hover:bg-soft"
      }`}
      style={done ? { background: "var(--st-won-bg)", color: "var(--st-won-fg)" } : undefined}
    >
      {done ? "Copied" : label}
    </button>
  );
}
