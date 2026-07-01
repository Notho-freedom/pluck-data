import { Link } from "@tanstack/react-router";
import { Database, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const NAV: { label: string; to: string }[] = [
  { label: "Product",      to: "/product" },
  { label: "Agents",       to: "/agents" },
  { label: "Integrations", to: "/integrations" },
  { label: "Docs",         to: "/docs" },
  { label: "Pricing",      to: "/pricing" },
  { label: "Changelog",    to: "/changelog" },
];

export function MarketingNav() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-glow">
              <Database className="h-3.5 w-3.5" />
            </span>
            <span className="text-[14px] font-semibold tracking-tight">DataSeed</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "rounded-md px-2.5 py-1.5 text-[13px] font-medium text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground sm:grid"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          {user ? (
            <Button asChild size="sm" className="shadow-glow">
              <Link to="/dashboard">Open console</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="shadow-glow">
                <Link to="/playground">Open playground</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
