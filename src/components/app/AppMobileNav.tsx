import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FlaskConical, Bookmark, History, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview",  to: "/dashboard",  icon: LayoutDashboard },
  { label: "Playground", to: "/playground", icon: FlaskConical },
  { label: "Presets",   to: "/presets",    icon: Bookmark },
  { label: "History",   to: "/history",    icon: History },
  { label: "Keys",      to: "/keys",       icon: KeyRound },
];

export function AppMobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-border/60 bg-[oklch(0.13_0.012_250)]/95 backdrop-blur lg:hidden">
      {NAV.map((item) => {
        const active =
          pathname === item.to ||
          (item.to !== "/dashboard" && pathname.startsWith(item.to));
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
