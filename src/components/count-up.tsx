"use client";

import { useEffect, useRef, useState } from "react";

/** Counts once from 0 to `value` on mount, then shows `prefix + value + suffix`
 *  with a thousands-separated number. Respects reduced-motion. */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 750,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [n, setN] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (
      typeof window === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      value === 0
    ) {
      setN(value);
      return;
    }
    setN(0);
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <>
      {prefix}
      {n.toLocaleString("en-US")}
      {suffix}
    </>
  );
}
