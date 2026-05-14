import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRecentLogs } from "@/lib/keys.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — DataSeed" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const fn = useServerFn(getRecentLogs);
  const { data, isLoading } = useQuery({ queryKey: ["logs"], queryFn: () => fn() });

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">History</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last 50 API calls.</p>

      <Card className="mt-6">
        <CardHeader><CardTitle>Recent calls</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : data && data.length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">When</th>
                    <th className="px-3 py-2 text-left">Endpoint</th>
                    <th className="px-3 py-2 text-right">Status</th>
                    <th className="px-3 py-2 text-right">Rows</th>
                    <th className="px-3 py-2 text-right">AI</th>
                    <th className="px-3 py-2 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.map((l: any) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2 text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono">{l.endpoint}</td>
                      <td className={`px-3 py-2 text-right font-mono ${l.status >= 400 ? "text-destructive" : ""}`}>{l.status}</td>
                      <td className="px-3 py-2 text-right">{l.rows_generated}</td>
                      <td className="px-3 py-2 text-right">{l.ai_calls}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{l.duration_ms}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">No calls yet. Try the playground or send a request with your key.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
