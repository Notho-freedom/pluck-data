import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Github } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  variant?: "marketing" | "app";
}

function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5 font-semibold tracking-tight">
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
          <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
        </svg>
      </span>
      <span className="text-[15px]">DataSeed</span>
      <span className="hidden rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-primary sm:inline">
        v1
      </span>
    </Link>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      activeProps={{ className: "rounded-md px-3 py-1.5 text-[13px] font-medium text-foreground" }}
    >
      {children}
    </Link>
  );
}

export function Navbar({ variant = "marketing" }: NavbarProps) {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-0.5 md:flex">
            <NavLink to="/playground">Playground</NavLink>
            <NavLink to="/docs">Docs</NavLink>
            {user && (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/keys">Keys</NavLink>
                <NavLink to="/history">History</NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : user ? (
            <>
              <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              >
                <LogOut className="mr-1.5 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-8 w-8 place-items-center rounded-md text-muted-foreground hover:text-foreground sm:grid"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="shadow-glow">
                <Link to="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
