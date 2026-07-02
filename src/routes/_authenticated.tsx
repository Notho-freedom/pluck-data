import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ConsoleShell } from "@/components/console/ConsoleShell";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function AuthGate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Loading console
          </span>
        </div>
      </div>
    );
  }

  return (
    <ConsoleShell>
      <Outlet />
    </ConsoleShell>
  );
}
