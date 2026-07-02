import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Terminal, Zap, Bot, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import {
  PageHero,
  SectionHead,
  FeatureCard,
  TerminalCard,
} from "@/components/marketing/Primitives";
import { BlendedImage } from "@/components/illustrations/BlendedImage";
import mcp from "@/assets/illustrations/agents-mcp.jpg";

export const Route = createFileRoute("/agents")({
  head: () => ({
    meta: [
      { title: "Agents & MCP — DataSeed" },
      {
        name: "description",
        content:
          "DataSeed ships a Model Context Protocol server so Cursor, Claude Code and Windsurf can seed databases as a tool.",
      },
    ],
  }),
  component: AgentsPage,
});

const INSTALL_CURSOR = `# .cursor/mcp.json
{
  "mcpServers": {
    "dataseed": {
      "url": "https://api.dataseed.dev/api/mcp",
      "headers": { "X-API-Key": "ds_live_..." }
    }
  }
}`;

const INSTALL_CLAUDE = `claude mcp add dataseed \\
  --url  https://api.dataseed.dev/api/mcp \\
  --header "X-API-Key: ds_live_..."`;

const TOOLS = `# Tools exposed by the DataSeed MCP server
analyze_schema  → tables, columns, foreign keys, inferred domain
generate_seed   → SQL / JSON / CSV / TypeScript / Python
insert_into_db  → topological insert (Postgres / Supabase / Neon)
list_presets    → your saved generation configurations
run_preset      → replay a saved run, deterministic by seed`;

function AgentsPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="MCP-native"
        title="Your agent seeds the database,"
        emphasis="not you."
        sub="DataSeed is a first-class MCP server. Add it once — Cursor, Claude Code, Windsurf, and any MCP client can now analyse schemas and seed databases as a tool call."
      >
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/docs">
            Install the MCP server <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/playground">Try the underlying API</Link>
        </Button>
      </PageHero>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="illu-halo mx-auto max-w-4xl">
            <BlendedImage
              src={mcp}
              alt="DataSeed MCP server"
              width={1600}
              height={1024}
              fade="all"
              glow={false}
            />
          </div>
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <SectionHead
            eyebrow="Install once"
            title="Two lines. Any MCP client."
            sub="Drop the config, restart your agent, and it discovers five new tools it can call whenever a database looks empty."
          />
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
            <TerminalCard title="cursor" badge="Cursor" lang="json">
              {INSTALL_CURSOR}
            </TerminalCard>
            <TerminalCard title="claude" badge="Claude Code" lang="bash" accent>
              {INSTALL_CLAUDE}
            </TerminalCard>
          </div>
          <div className="mx-auto mt-10 max-w-5xl">
            <TerminalCard title="mcp/tools" badge="Discovery" lang="text">
              {TOOLS}
            </TerminalCard>
          </div>
        </div>
      </section>

      <section className="border-b border-border/40 bg-[oklch(0.13_0.012_250)]/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <SectionHead
            eyebrow="Why this matters"
            title="Agents were never blocked by code. They were blocked by data."
            sub="Ship a feature-complete branch and your agent still sees empty tables. Give it DataSeed and it fills them in seconds — coherent, FK-safe, reproducible."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <FeatureCard icon={<Bot className="h-5 w-5" />} title="Discovers your schema">
              The agent introspects your Prisma / Drizzle / SQL and infers the domain automatically.
            </FeatureCard>
            <FeatureCard icon={<Zap className="h-5 w-5" />} title="Streams into your DB">
              Insert directly into a local or hosted Postgres. Rate-limited, quota-tracked, logged.
            </FeatureCard>
            <FeatureCard icon={<Layers className="h-5 w-5" />} title="Reproducible presets">
              Save a run as a preset. Any agent can replay it — bit-for-bit — from the tool list.
            </FeatureCard>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <Terminal className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Give your agent <span className="font-display italic text-primary">a data hand.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            A single MCP endpoint is all it takes.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/signup">Get an API key</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
