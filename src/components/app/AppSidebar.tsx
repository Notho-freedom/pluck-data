import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, FlaskConical, Bookmark, History, KeyRound,
  BookOpen, LogOut, Database,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV: { label: string; to: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Overview",  to: "/dashboard",  icon: LayoutDashboard },
  { label: "Playground", to: "/playground", icon: FlaskConical },
  { label: "Presets",   to: "/presets",    icon: Bookmark },
  { label: "History",   to: "/history",    icon: History },
  { label: "API keys",  to: "/keys",       icon: KeyRound },
];

const SECONDARY: { label: string; to: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Docs", to: "/docs", icon: BookOpen },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border/60 bg-[oklch(0.13_0.012_250)] lg:flex">
      {/* Logo */}
      <Link to="/" className="flex h-14 items-center gap-2.5 border-b border-border/60 px-5">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
          <Database className="h-3.5 w-3.5" />
        </span>
        <span className="text-[14px] font-semibold tracking-tight">DataSeed</span>
        <span className="ml-auto rounded border border-border/60 bg-background/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
          console
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        <div>
          <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
            Workspace
          </p>
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const active =
                pathname === item.to ||
                (item.to !== "/dashboard" && pathname.startsWith(item.to));
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", active ? "text-primary" : "")} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
            Reference
          </p>
          <ul className="space-y-0.5">
            {SECONDARY.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px]">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary text-[11px] font-semibold uppercase">
            {user?.email?.[0] ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-foreground/90">{user?.email}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Free plan</div>
          </div>
          <button
            aria-label="Sign out"
            onClick={async () => { await signOut(); navigate({ to: "/" }); }}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
