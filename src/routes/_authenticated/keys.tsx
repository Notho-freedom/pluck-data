import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { listApiKeys, createApiKey, revokeApiKey } from "@/lib/keys.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/keys")({
  head: () => ({ meta: [{ title: "API keys — DataSeed" }] }),
  component: KeysPage,
});

function KeysPage() {
  const qc = useQueryClient();
  const fetchKeys = useServerFn(listApiKeys);
  const createKey = useServerFn(createApiKey);
  const revoke = useServerFn(revokeApiKey);

  const { data: keys, isLoading } = useQuery({ queryKey: ["keys"], queryFn: () => fetchKeys() });
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => createKey({ data: { name } }),
    onSuccess: (k) => {
      setCreatedKey(k.key);
      setName("");
      qc.invalidateQueries({ queryKey: ["keys"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: () => {
      toast.success("Key revoked");
      qc.invalidateQueries({ queryKey: ["keys"] });
    },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">API keys</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Use the <code>X-API-Key</code> header. Each key is shown once at creation.
      </p>

      <Card className="mt-6">
        <CardHeader><CardTitle>Create a key</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="e.g. production seeds" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={() => create.mutate()} disabled={!name || create.isPending}>
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-1.5 h-4 w-4" />Create</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Your keys</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
          ) : keys && keys.length > 0 ? (
            <ul className="divide-y">
              {keys.map((k: any) => (
                <li key={k.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium">{k.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{k.key_prefix}…{k.revoked_at ? " · revoked" : ""}</div>
                  </div>
                  {!k.revoked_at && (
                    <Button variant="ghost" size="sm" onClick={() => del.mutate(k.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">No keys yet.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!createdKey} onOpenChange={(o) => !o && setCreatedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save your API key</DialogTitle>
            <DialogDescription>This is the only time you'll see this key. Copy it now.</DialogDescription>
          </DialogHeader>
          <pre className="rounded-md border bg-muted p-3 font-mono text-xs break-all">{createdKey}</pre>
          <DialogFooter>
            <Button onClick={async () => {
              if (createdKey) await navigator.clipboard.writeText(createdKey);
              toast.success("Copied");
            }}>
              <Copy className="mr-1.5 h-4 w-4" /> Copy
            </Button>
            <Button variant="outline" onClick={() => setCreatedKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
