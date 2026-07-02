import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Braces, Cable, FileCode2, Workflow } from "lucide-react";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import { PageHero } from "@/components/marketing/Primitives";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs - DataSeed" },
      {
        name: "description",
        content:
          "Guides and references for DataSeed REST, MCP, schema formats, examples, and API contracts.",
      },
    ],
  }),
  component: DocsHub,
});

const DOCS = [
  {
    to: "/mcp",
    title: "MCP server",
    body: "Wire DataSeed into Cursor, Claude Code, Windsurf, and any MCP client.",
    icon: Cable,
  },
  {
    to: "/rest-api",
    title: "REST API",
    body: "Generate, analyze, insert, and inspect usage from one HTTP contract.",
    icon: Workflow,
  },
  {
    to: "/schema-formats",
    title: "Schema formats",
    body: "SQL, Prisma, Drizzle, Zod, OpenAPI, JSON Schema, and format detection.",
    icon: Braces,
  },
  {
    to: "/examples",
    title: "Examples",
    body: "Real request payloads for common app domains and output formats.",
    icon: FileCode2,
  },
  {
    to: "/api-reference",
    title: "API reference",
    body: "Endpoint shapes, auth, limits, responses, and error semantics.",
    icon: BookOpen,
  },
] as const;

function DocsHub() {
  return (
    <PublicLayout showLogos={false}>
      <PageHero
        eyebrow="Docs"
        title="Everything useful,"
        emphasis="without the maze."
        sub="Pick the surface you are integrating with. Each page includes the contract, a working snippet, and the failure cases that matter."
      />

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="divide-y divide-border/45 border-y border-border/45">
            {DOCS.map((doc, index) => (
              <Link
                key={doc.to}
                to={doc.to}
                className="group grid gap-4 py-7 transition-colors hover:bg-muted/10 sm:grid-cols-[72px_1fr_32px]"
              >
                <div className="font-display text-[42px] leading-none text-primary/90">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <doc.icon className="h-4 w-4 text-primary" />
                    <h2 className="text-xl font-semibold tracking-tight">{doc.title}</h2>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {doc.body}
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 self-center text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
