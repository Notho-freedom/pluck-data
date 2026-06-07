import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Activity, Database, KeyRound, Sparkles } from "lucide-react";
import { getUsageSummary } from "@/lib/keys.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/animations/CountUp";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — DataSeed" }] }),
  component: Dashboard,
});

function Dashboard() {
  const fetchUsage = useServerFn(getUsageSummary);
  const { data, isLoading } = useQuery({ queryKey: ["usage"], queryFn: () => fetchUsage() });

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Usage for the current month.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/keys">Manage keys</Link></Button>
          <Button asChild className="shadow-glow"><Link to="/playground">Open playground</Link></Button>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl">
              <Skeleton className="h-28" />
              <div className="absolute inset-0 animate-shimmer" />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          <OnboardingChecklist hasKey={data.hasKey} hasCall={data.hasCall} hasExport={data.hasCall} />

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <ScrollReveal delay={0}>
              <Stat icon={<Database className="h-4 w-4" />} label="Plan" value={data.plan.toUpperCase()} />
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <StatNum icon={<Activity className="h-4 w-4" />} label="API calls" to={data.totalCalls} sub={`${data.successCalls} successful`} />
            </ScrollReveal>
            <ScrollReveal delay={160}>
              <StatNum icon={<Sparkles className="h-4 w-4" />} label="AI calls" to={data.aiUsed} suffix={` / ${data.monthlyAiCalls}`} />
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <StatNum icon={<KeyRound className="h-4 w-4" />} label="Rate limit" to={data.rateLimitPerMin} suffix="/min" />
            </ScrollReveal>
          </div>

          <ScrollReveal delay={120}>
            <Card className="mt-6">
              <CardHeader><CardTitle>Rows generated this month</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm">
                  <span className="font-mono">
                    <CountUp to={data.rowsUsed} />
                  </span>
                  <span className="text-muted-foreground">/ {data.monthlyRows.toLocaleString()}</span>
                </div>
                <Progress value={Math.min(100, (data.rowsUsed / Math.max(1, data.monthlyRows)) * 100)} className="mt-2" />
              </CardContent>
            </Card>
          </ScrollReveal>
        </>
      ) : null}
    </main>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>{icon}
        </div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function StatNum({ icon, label, to, sub, suffix }: { icon: React.ReactNode; label: string; to: number; sub?: string; suffix?: string }) {
  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{label}</span>{icon}
        </div>
        <div className="mt-2 text-2xl font-semibold">
          <CountUp to={to} suffix={suffix} />
        </div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </CardContent>
    </Card>
  );
}
