import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  to: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function CountUp({
  to,
  durationMs = 1600,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: CountUpProps) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (reduced()) {
      setV(to);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          let raf = 0;
          const step = (now: number) => {
            const p = Math.min(1, (now - t0) / durationMs);
            setV(to * easeOut(p));
            if (p < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
          io.disconnect();
          return () => cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, durationMs]);

  const formatted = v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
