import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid, FlaskConical, KeyRound, History, Bookmark, BookOpen,
  Search, LogOut, ExternalLink, Home, Sparkles, Command as CmdIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator,
} from "@/components/ui/command";

/**
 * ConsoleShell — no sidebar panel, no topbar.
 * Just a razor-thin rail on the left (glyphs only) and a floating command bar
 * hovering above the content. Sign-out lives inside ⌘K, never in a corner.
 */

type NavItem = { to: string; label: string; glyph: string; icon: React.ComponentType<{ className?: string }> };

const NAV: NavItem[] = [
  { to: "/dashboard",  label: "Overview",  glyph: "01", icon: LayoutGrid },
  { to: "/playground", label: "Playground", glyph: "02", icon: FlaskConical },
  { to: "/keys",       label: "Keys",      glyph: "03", icon: KeyRound },
  { to: "/history",    label: "History",   glyph: "04", icon: History },
  { to: "/presets",    label: "Presets",   glyph: "05", icon: Bookmark },
];

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [openCmd, setOpenCmd] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // ⌘K binding
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenCmd((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeItem = useMemo(
    () => NAV.find((n) => pathname === n.to || pathname.startsWith(n.to + "/")),
    [pathname],
  );

  return (
    <div className="relative min-h-screen bg-background">
      {/* faint page grid */}
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [mask-image:radial-gradient(80%_60%_at_50%_-10%,black,transparent)]" />

      {/* ---------- Left rail (44 px) ---------- */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-11 flex-col items-center border-r border-border/40 bg-background/70 py-4 backdrop-blur-xl md:flex">
        <Link
          to="/"
          className="grid h-7 w-7 place-items-center rounded-[6px] bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-glow"
          aria-label="Back to marketing site"
        >
          <Home className="h-3.5 w-3.5" />
        </Link>

        <div className="mt-6 flex flex-1 flex-col items-center gap-1">
          {NAV.map((item) => (
            <RailItem key={item.to} item={item} active={activeItem?.to === item.to} />
          ))}
        </div>

        <button
          onClick={() => setOpenCmd(true)}
          className="group grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
          aria-label="Open command bar"
          title="⌘K"
        >
          <CmdIcon className="h-3.5 w-3.5" />
        </button>
      </aside>

      {/* ---------- Floating command bar ---------- */}
      <div className="pointer-events-none sticky top-0 z-30 pt-4 md:pl-11">
        <div className="pointer-events-auto mx-auto flex max-w-4xl items-center gap-3 px-4">
          <button
            onClick={() => setOpenCmd(true)}
            className="group flex flex-1 items-center gap-3 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-left shadow-elevated backdrop-blur-xl transition-colors hover:border-primary/30"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1 truncate text-[13px] text-muted-foreground group-hover:text-foreground">
              {activeItem
                ? `${activeItem.label.toLowerCase()} · search, actions, jump…`
                : "search, actions, jump…"}
            </span>
            <kbd className="hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 sm:inline">
              ⌘ K
            </kbd>
          </button>

          {/* status pill — right of command bar */}
          <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 backdrop-blur-xl sm:flex">
            <span className="relative grid h-1.5 w-1.5 place-items-center">
              <span className="absolute inset-0 animate-pulse-dot rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
              live
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="md:pl-11">
        <div className="pb-24 pt-6">{children}</div>
      </div>

      {/* ---------- Bottom mobile bar ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border/60 bg-background/85 py-2 backdrop-blur-xl md:hidden">
        {NAV.map((n) => {
          const active = pathname === n.to || pathname.startsWith(n.to + "/");
          return (
            <Link key={n.to} to={n.to} className="grid place-items-center px-3 py-1">
              <n.icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("mt-1 font-mono text-[9px] uppercase tracking-wider", active ? "text-foreground" : "text-muted-foreground")}>
                {n.label}
              </span>
            </Link>
          );
        })}
        <button
          onClick={() => setOpenCmd(true)}
          aria-label="Open command bar"
          className="grid place-items-center px-3 py-1"
        >
          <CmdIcon className="h-4 w-4 text-muted-foreground" />
          <span className="mt-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Cmd</span>
        </button>
      </nav>

      {/* ---------- ⌘K dialog ---------- */}
      <CommandDialog open={openCmd} onOpenChange={setOpenCmd}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No result.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {NAV.map((n) => (
              <CommandItem
                key={n.to}
                value={`nav ${n.label}`}
                onSelect={() => { setOpenCmd(false); navigate({ to: n.to }); }}
              >
                <n.icon className="mr-2 h-4 w-4" />
                <span>{n.label}</span>
                <span className="ml-auto font-mono text-[10px] uppercase text-muted-foreground/60">{n.to}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Reference">
            <CommandItem onSelect={() => { setOpenCmd(false); navigate({ to: "/docs" }); }}>
              <BookOpen className="mr-2 h-4 w-4" /> Docs
            </CommandItem>
            <CommandItem onSelect={() => { setOpenCmd(false); navigate({ to: "/rest-api" }); }}>
              <ExternalLink className="mr-2 h-4 w-4" /> REST API reference
            </CommandItem>
            <CommandItem onSelect={() => { setOpenCmd(false); navigate({ to: "/mcp" }); }}>
              <Sparkles className="mr-2 h-4 w-4" /> MCP server
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem className="text-muted-foreground" disabled>
              <span className="truncate">Signed in as {user?.email ?? "—"}</span>
            </CommandItem>
            <CommandItem
              onSelect={async () => {
                setOpenCmd(false);
                await signOut();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

function RailItem({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      to={item.to}
      className="group relative grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
      title={item.label}
    >
      <item.icon className={cn("h-4 w-4 transition-colors", active && "text-primary")} />
      {/* active underline mark */}
      <span
        className={cn(
          "absolute -right-[1px] top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-l-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Hover flyout label */}
      <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-md border border-border/60 bg-popover px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-foreground opacity-0 shadow-elevated transition-opacity group-hover:opacity-100">
        <span className="mr-1.5 text-muted-foreground/70">{item.glyph}</span>
        {item.label}
      </span>
    </Link>
  );
}
