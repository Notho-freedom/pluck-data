import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account — DataSeed" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email to confirm.");
    navigate({ to: "/login" });
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (res?.error) toast.error(res.error.message);
    else navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell title="Create your account" subtitle="Free plan. No credit card. Ship in 30 seconds.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
        </div>
        <Button type="submit" disabled={loading} className="w-full shadow-glow">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>
      <Button variant="outline" className="w-full" onClick={google}>
        Continue with Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a member? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}
