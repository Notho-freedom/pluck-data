import { Link } from "@tanstack/react-router";
import { Github, Twitter } from "lucide-react";

const COLS: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Playground", to: "/playground" },
      { label: "Documentation", to: "/docs" },
      { label: "API reference", to: "/api-reference" },
      { label: "Changelog", to: "/changelog" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "MCP server", to: "/mcp" },
      { label: "REST API", to: "/rest-api" },
      { label: "Schema formats", to: "/schema-formats" },
      { label: "Examples", to: "/examples" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Pricing", to: "/pricing" },
      { label: "Security", to: "/" },
      { label: "Status", to: "/" },
      { label: "Support", to: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Customers", to: "/" },
      { label: "Contact", to: "/" },
      { label: "Legal", to: "/" },
    ],
  },
];

export function CorporateFooter() {
  return (
    <footer className="relative border-t border-border/60 bg-[oklch(0.12_0.012_250)]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                  <path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6" />
                </svg>
              </span>
              <span className="font-semibold tracking-tight">DataSeed</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The seed-data infrastructure for code agents and engineering teams who care about
              realism.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-mono uppercase tracking-[0.16em] text-foreground/70">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} DataSeed. Built for engineers and agents.</span>
          <div className="flex gap-5">
            <span>Privacy</span>
            <span>Terms</span>
            <span>SOC 2 (in progress)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
