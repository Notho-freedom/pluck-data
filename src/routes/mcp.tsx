import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import { PageHero } from "@/components/marketing/Primitives";
import { CodePanel } from "@/components/code/Code";

export const Route = createFileRoute("/mcp")({
  head: () => ({
    meta: [
      { title: "MCP server - DataSeed" },
      {
        name: "description",
        content:
          "Install the DataSeed MCP server in coding agents and generate coherent seed data as a tool call.",
      },
    ],
  }),
  component: McpPage,
});

const CURSOR = `{
  "mcpServers": {
    "dataseed": {
      "url": "https://api.dataseed.dev/api/mcp",
      "headers": { "X-API-Key": "ds_live_..." }
    }
  }
}`;

const CLAUDE = `claude mcp add dataseed \\
  --url https://api.dataseed.dev/api/mcp \\
  --header "X-API-Key: ds_live_..."`;

const TOOLS = `analyze_schema  -> parse tables, columns, foreign keys, inferred domain
generate_seed   -> return SQL, JSON, CSV, TypeScript, or Python
insert_into_db  -> stream rows into Postgres, Supabase, or Neon
list_presets    -> list saved generation configs
run_preset      -> replay a deterministic saved run`;

function McpPage() {
  return (
    <PublicLayout showLogos={false}>
      <PageHero
        eyebrow="MCP"
        title="Give your agent"
        emphasis="a data tool."
        sub="DataSeed exposes schema analysis, generation, direct insert, and presets through a single Model Context Protocol endpoint."
      >
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/playground">
            Test generation <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </PageHero>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid gap-8 lg:grid-cols-2">
            <CodePanel title=".cursor/mcp.json" badge="Cursor" lang="json" code={CURSOR} />
            <CodePanel title="terminal" badge="Claude Code" lang="bash" code={CLAUDE} />
          </div>

          <div className="mt-12 border-t border-border/45 pt-8">
            <h2 className="text-2xl font-semibold tracking-tight">Tool surface</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              The agent does not need a plugin. It discovers these tools from the MCP endpoint and
              calls them with the same account quota and audit trail as REST.
            </p>
            <div className="mt-6">
              <CodePanel title="mcp/tools" badge="Discovery" lang="text" code={TOOLS} wrap />
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
