import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Trash2, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { listApiKeys, createApiKey, revokeApiKey } from "@/lib/keys.functions";
import { Input } from "@/components/ui/input";

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
    onSuccess: () => { toast.success("Key revoked"); qc.invalidateQueries({ queryKey: ["keys"] }); },
  });

  const active = (keys ?? []).filter((k: any) => !k.revoked_at);
  const revoked = (keys ?? []).filter((k: any) => k.revoked_at);

  return (
    <main className="mx-auto max-w-5xl px-6">
      <header className="flex items-baseline justify-between border-b border-border/40 pb-6">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">Console / Keys</p>
          <h1 className="mt-3 font-display text-[52px] leading-none tracking-tight sm:text-[72px]">
            {active.length}<span className="ml-3 align-top font-sans text-[13px] uppercase tracking-[0.14em] text-muted-foreground">active</span>
          </h1>
          <p className="mt-4 max-w-xl text-[13.5px] text-muted-foreground">
            Each key is hashed with SHA-256, scoped to this workspace, rate-limited by plan, revocable in one click. Shown once at creation.
          </p>
        </div>
      </header>

      {/* inline create — no card */}
      <section className="mt-10 flex items-end gap-3 border-b border-border/40 pb-8">
        <div className="flex-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">Name this key</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. production seeds, staging fixtures, cursor-agent"
            className="mt-2 h-10 border-0 border-b border-border/60 bg-transparent px-0 text-[15px] focus-visible:border-primary focus-visible:ring-0"
          />
        </div>
        <button
          onClick={() => create.mutate()}
          disabled={!name || create.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[13px] font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {create.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Mint key
        </button>
      </section>

      {/* keys list */}
      <section className="mt-10">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">Your keys</h2>
        {isLoading ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-sm bg-muted/30" />
            ))}
          </div>
        ) : (keys ?? []).length === 0 ? (
          <p className="mt-6 font-mono text-[12.5px] text-muted-foreground">No keys yet. Mint one above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border/40">
            {active.map((k: any) => (
              <KeyRow key={k.id} k={k} onRevoke={() => del.mutate(k.id)} />
            ))}
            {revoked.length > 0 && (
              <>
                <li className="pt-6 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/60">Revoked</li>
                {revoked.map((k: any) => (
                  <KeyRow key={k.id} k={k} muted />
                ))}
              </>
            )}
          </ul>
        )}
      </section>

      {/* Slide-in overlay from top when key is created */}
      {createdKey && (
        <div className="fixed inset-x-0 top-0 z-40 animate-[slide-in-right_.35s_ease-out] border-b border-primary/40 bg-[oklch(0.14_0.02_155)]/95 shadow-elevated backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-6">
            <div className="flex-1">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-primary">Save this key — one-time reveal</p>
              <code className="mt-2 block overflow-x-auto font-mono text-[13px] text-foreground">{createdKey}</code>
            </div>
            <button
              onClick={async () => { await navigator.clipboard.writeText(createdKey); toast.success("Copied"); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
            <button
              onClick={() => setCreatedKey(null)}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function KeyRow({ k, onRevoke, muted }: { k: any; onRevoke?: () => void; muted?: boolean }) {
  return (
    <li className={`flex items-center gap-4 py-4 ${muted ? "opacity-50" : ""}`}>
      <div className="flex-1">
        <div className="text-[14px] font-medium">{k.name}</div>
        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
          {k.key_prefix}…  ·  minted {new Date(k.created_at).toLocaleDateString()}
        </div>
      </div>
      {onRevoke && (
        <button
          onClick={onRevoke}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" /> revoke
        </button>
      )}
    </li>
  );
}
