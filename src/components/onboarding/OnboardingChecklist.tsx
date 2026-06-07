import { Link } from "@tanstack/react-router";
import { Check, Circle, ArrowRight, KeyRound, Zap, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface OnboardingChecklistProps {
  hasKey: boolean;
  hasCall: boolean;
  hasExport?: boolean;
}

export function OnboardingChecklist({ hasKey, hasCall, hasExport = false }: OnboardingChecklistProps) {
  const items = [
    {
      id: "key",
      done: hasKey,
      icon: <KeyRound className="h-4 w-4" />,
      title: "Create an API key",
      desc: "You'll use it to authenticate /v1 requests.",
      cta: "Manage keys",
      to: "/keys",
    },
    {
      id: "call",
      done: hasCall,
      icon: <Zap className="h-4 w-4" />,
      title: "Make your first call",
      desc: "Generate some seed data from the playground.",
      cta: "Open playground",
      to: "/playground",
    },
    {
      id: "export",
      done: hasExport,
      icon: <Download className="h-4 w-4" />,
      title: "Export a file",
      desc: "Copy or download SQL, JSON, CSV, TS, or Python.",
      cta: "Try it",
      to: "/playground",
    },
  ];
  const completed = items.filter((i) => i.done).length;
  if (completed === items.length) return null;
  const pct = (completed / items.length) * 100;

  return (
    <Card className="mt-6 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Get started with DataSeed</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {completed} of {items.length} steps complete
            </p>
          </div>
          <span className="font-mono text-xs text-primary">{Math.round(pct)}%</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ul className="mt-5 space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                it.done
                  ? "border-border/60 bg-background/30 opacity-70"
                  : "border-border/80 bg-background/60 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-md border ${
                    it.done
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {it.done ? <Check className="h-3.5 w-3.5" /> : it.icon}
                </span>
                <div>
                  <div className={`text-sm font-medium ${it.done ? "line-through" : ""}`}>
                    {it.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{it.desc}</div>
                </div>
              </div>
              {!it.done && (
                <Link
                  to={it.to}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium hover:border-primary/40 hover:text-primary"
                >
                  {it.cta} <ArrowRight className="h-3 w-3" />
                </Link>
              )}
              {it.done && <Circle className="h-3 w-3 fill-primary text-primary" />}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
