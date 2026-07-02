import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import { PageHero } from "@/components/marketing/Primitives";
import { CodePanel } from "@/components/code/Code";

export const Route = createFileRoute("/schema-formats")({
  head: () => ({
    meta: [
      { title: "Schema formats - DataSeed" },
      {
        name: "description",
        content:
          "Supported DataSeed schema inputs: SQL, Prisma, Drizzle, Zod, OpenAPI, JSON Schema, and auto detection.",
      },
    ],
  }),
  component: SchemaFormatsPage,
});

const PRISMA = `model User {
  id        String @id @default(uuid())
  email     String @unique
  fullName  String
  posts     Post[]
}

model Post {
  id       String @id @default(uuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
  title    String
}`;

const FORMATS = [
  ["SQL DDL", "CREATE TABLE, primary keys, foreign keys, enums, checks, defaults, nullability."],
  ["Prisma", "Models and relations from schema.prisma, mapped into the same FK graph."],
  ["Drizzle", "pgTable definitions, columns, relations, and common Postgres types."],
  ["Zod", "z.object schemas and refinements where they can map cleanly to data constraints."],
  ["OpenAPI", "3.0 and 3.1 component schemas with examples and required fields."],
  ["JSON Schema", "Draft-style object schemas for contract mocks and API responses."],
];

function SchemaFormatsPage() {
  return (
    <PublicLayout showLogos={false}>
      <PageHero
        eyebrow="Schema formats"
        title="Bring the schema"
        emphasis="you already have."
        sub="Auto-detection lets REST, MCP, and the playground feed the same engine without per-framework adapters in your app."
      >
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/examples">
            See examples <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </PageHero>

      <section>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="divide-y divide-border/45 border-y border-border/45">
            {FORMATS.map(([name, body]) => (
              <div key={name} className="py-5">
                <h2 className="text-lg font-semibold tracking-tight">{name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <CodePanel title="schema.prisma" badge="Input" lang="prisma" code={PRISMA} />
        </div>
      </section>
    </PublicLayout>
  );
}
