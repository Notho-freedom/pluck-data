import { useRouterState, Link } from "@tanstack/react-router";
import { ChevronRight, Command } from "lucide-react";

const TITLES: Record<string, string> = {
  "/dashboard":  "Overview",
  "/playground": "Playground",
  "/presets":    "Presets",
  "/history":    "History",
  "/keys":       "API keys",
};

export function AppTopbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = TITLES[pathname] ?? (pathname.replace(/^\//, "").replace(/-/g, " ") || "Console");

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-[13px]">
        <Link to="/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">
          Console
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="font-medium capitalize text-foreground">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-1.5 rounded-md border border-border/60 bg-card/60 px-2 py-1 text-[11px] text-muted-foreground md:flex">
          <span>Environment</span>
          <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
            dev
          </span>
        </div>
        <button
          className="hidden items-center gap-1.5 rounded-md border border-border/60 bg-card/60 px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
          type="button"
        >
          <Command className="h-3 w-3" />
          <span>K</span>
        </button>
      </div>
    </header>
  );
}
