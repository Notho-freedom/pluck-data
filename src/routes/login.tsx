import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — DataSeed" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    navigate({ to: "/dashboard" });
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (res?.error) toast.error(res.error.message);
    else navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your keys and quotas.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
        </div>
        <Button type="submit" disabled={loading} className="w-full shadow-glow">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
      </form>
      <Divider />
      <Button variant="outline" className="w-full" onClick={google}>
        Continue with Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account? <Link to="/signup" className="text-primary hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_50%_at_50%_40%,black,transparent)]" />
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <div className="relative w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-glow">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
              <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
            </svg>
          </span>
          <span>DataSeed</span>
        </Link>
        <div className="rounded-2xl border border-border/80 bg-card/70 p-7 shadow-elevated backdrop-blur-xl">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
      <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
    </div>
  );
}
