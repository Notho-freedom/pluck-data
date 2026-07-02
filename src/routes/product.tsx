import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Layers,
  Wand2,
  Sparkles,
  Users,
  Image as ImageIcon,
  Boxes,
  Database,
  Braces,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/marketing/PublicLayout";
import {
  PageHero,
  SectionHead,
  FeatureCard,
  TerminalCard,
} from "@/components/marketing/Primitives";
import { BlendedImage } from "@/components/illustrations/BlendedImage";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import parsers from "@/assets/illustrations/product-parsers.jpg";
import personas from "@/assets/illustrations/product-personas.jpg";
import assets from "@/assets/illustrations/product-assets.jpg";
import types from "@/assets/illustrations/product-types.jpg";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "Product — DataSeed" },
      {
        name: "description",
        content:
          "The DataSeed engine: multi-format parsing, coherent personas, rich types, and asset generation.",
      },
    ],
  }),
  component: ProductPage,
});

const SAMPLE = `{
  "type": "coherent-person",
  "locale": "fr-FR",
  "identity": {
    "firstName": "Léa",
    "lastName": "Martin",
    "email": "lea.martin@proton.me",
    "phone": "+33 6 82 41 09 55",
    "avatar": "https://api.dicebear.com/…/lea.svg"
  },
  "address": {
    "city": "Lyon",
    "postal": "69003",
    "country": "FR",
    "timezone": "Europe/Paris",
    "currency": "EUR"
  }
}`;

function ProductPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Product"
        title="One engine, every schema,"
        emphasis="one honest dataset."
        sub="DataSeed reads any schema, understands its business context, and emits data a designer would be happy to demo with — not the placeholder soup you get from Faker."
      >
        <Button asChild size="lg" className="shadow-glow">
          <Link to="/playground">
            Open the playground <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/docs">Read the technical docs</Link>
        </Button>
      </PageHero>

      {/* Parsers */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="illu-halo order-2 lg:order-1">
              <BlendedImage
                src={parsers}
                alt="Multi-format schema parsers"
                width={1600}
                height={1024}
                fade="all"
                glow={false}
              />
            </div>
            <div className="order-1 lg:order-2">
              <SectionHead
                align="left"
                eyebrow="Parsing"
                title="Every format your team already uses."
                sub="Auto-detected on upload. Same generation pipeline downstream, so switching stacks doesn't mean rewriting fixtures."
              />
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon={<Database className="h-5 w-5" />}
                  title="SQL DDL"
                  tags={["Postgres", "MySQL", "SQLite"]}
                >
                  Full <code>CREATE TABLE</code> parsing including FKs, enums, CHECK, NOT NULL,
                  defaults.
                </FeatureCard>
                <FeatureCard
                  icon={<Layers className="h-5 w-5" />}
                  title="Prisma & Drizzle"
                  tags={["schema.prisma", "pgTable"]}
                >
                  ORM models parsed natively. Relations become topologically ordered inserts.
                </FeatureCard>
                <FeatureCard
                  icon={<Braces className="h-5 w-5" />}
                  title="Zod & TypeScript"
                  tags={["z.object", "runtime"]}
                >
                  Runtime Zod schemas parsed, refined, and mapped to realistic generators.
                </FeatureCard>
                <FeatureCard
                  icon={<Boxes className="h-5 w-5" />}
                  title="OpenAPI 3"
                  tags={["JSON Schema", "YAML"]}
                >
                  Read component schemas, respect examples, produce contract-accurate mocks.
                </FeatureCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="border-b border-border/40 bg-[oklch(0.13_0.012_250)]/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionHead
                align="left"
                eyebrow="Coherence"
                title="A row is a person, not a random cell."
                sub="Every persona keeps its identity across columns: locale, phone country code, city, timezone, currency, even the avatar's face."
              />
              <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                {[
                  "8 country profiles (FR, US, DE, ES, JP, BR, GB, CA) — extend on request",
                  "Cross-column consistency (country ↔ phone ↔ postal ↔ timezone)",
                  "Locale-appropriate names, addresses, and business identifiers",
                  "Seeded — same input reproduces the same persona set",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="illu-halo">
              <BlendedImage
                src={personas}
                alt="Coherent personas"
                width={1600}
                height={1024}
                fade="all"
                glow={false}
              />
            </div>
          </div>

          <ScrollReveal>
            <div className="mx-auto mt-16 max-w-3xl">
              <TerminalCard title="persona.json" badge="OUTPUT" lang="json" accent>
                {SAMPLE}
              </TerminalCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Rich types */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="illu-halo order-2 lg:order-1">
              <BlendedImage
                src={types}
                alt="Rich Postgres types"
                width={1600}
                height={1024}
                fade="all"
                glow={false}
              />
            </div>
            <div className="order-1 lg:order-2">
              <SectionHead
                align="left"
                eyebrow="Rich types"
                title="Real Postgres. All of it."
                sub="Not just int/text/timestamp. Every modern Postgres surface, ready for pgvector, PostGIS, JSONB pipelines and binary payloads."
              />
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon={<Wand2 className="h-5 w-5" />}
                  title="pgvector"
                  tags={["vector(1536)"]}
                >
                  Deterministic vectors, uniform or clustered, with configurable dimensions.
                </FeatureCard>
                <FeatureCard
                  icon={<Wand2 className="h-5 w-5" />}
                  title="PostGIS"
                  tags={["geo-point", "polygon"]}
                >
                  Lat/lng and polygons within a locale's realistic bounding box.
                </FeatureCard>
                <FeatureCard
                  icon={<Wand2 className="h-5 w-5" />}
                  title="JSONB & arrays"
                  tags={["jsonb", "text[]"]}
                >
                  Structured nested payloads matching your inferred domain.
                </FeatureCard>
                <FeatureCard
                  icon={<Wand2 className="h-5 w-5" />}
                  title="Bytea, inet, interval"
                  tags={["bytea", "inet"]}
                >
                  Binary blobs, valid IP ranges, ISO 8601 intervals — no stringly-typed hacks.
                </FeatureCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assets */}
      <section className="border-b border-border/40 bg-[oklch(0.13_0.012_250)]/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionHead
                align="left"
                eyebrow="Assets"
                title="Faces, product shots, banners — sourced automatically."
                sub="Every avatar, image, and asset URL is generated to match the row it belongs to. Deterministic per seed so screenshots never drift."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <FeatureCard
                  icon={<Users className="h-5 w-5" />}
                  title="Avatars"
                  tags={["DiceBear", "Pravatar"]}
                >
                  Personalized to each persona's name, gender, and locale.
                </FeatureCard>
                <FeatureCard
                  icon={<ImageIcon className="h-5 w-5" />}
                  title="Product & cover images"
                  tags={["Unsplash", "Picsum"]}
                >
                  Topic-aware images derived from your table names and column hints.
                </FeatureCard>
              </div>
            </div>
            <div className="illu-halo">
              <BlendedImage
                src={assets}
                alt="Automatic asset generation"
                width={1600}
                height={1024}
                fade="all"
                glow={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Deterministic. Reproducible.{" "}
            <span className="font-display italic text-primary">Yours.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Same schema, same seed, same output — bit-for-bit. Your data never leaves the
            request/response cycle.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/signup">Create a free account</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
