import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

export interface Step {
  id: string;
  label: string;
}

interface ProgressStepsProps {
  steps: Step[];
  active?: boolean;
  /** Auto-cycle through steps when `active` is true. */
  autoCycleMs?: number;
}

/**
 * Multi-step progress indicator with an animated linear bar.
 * When `active`, it cycles through `steps` until unmounted or set inactive.
 */
export function ProgressSteps({
  steps,
  active = true,
  autoCycleMs = 650,
}: ProgressStepsProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return;
    setCurrent(0);
    const t = setInterval(() => {
      setCurrent((c) => (c + 1 < steps.length ? c + 1 : c));
    }, autoCycleMs);
    return () => clearInterval(t);
  }, [active, autoCycleMs, steps.length]);

  const pct = ((current + 1) / steps.length) * 100;

  return (
    <div className="space-y-4 p-5">
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-muted/60">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
        <div className="absolute inset-0 animate-shimmer" />
      </div>
      <ul className="space-y-1.5">
        {steps.map((s, i) => {
          const state = i < current ? "done" : i === current ? "active" : "pending";
          return (
            <li
              key={s.id}
              className={`flex items-center gap-2.5 text-xs font-mono transition-colors ${
                state === "pending"
                  ? "text-muted-foreground/50"
                  : state === "active"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <span className="grid h-4 w-4 place-items-center">
                {state === "done" ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : state === "active" ? (
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <span>{s.label}</span>
              {state === "active" && <span className="text-primary">…</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
