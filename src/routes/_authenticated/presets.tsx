import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import emptyIllu from "@/assets/illustrations/empty-state.jpg";

export const Route = createFileRoute("/_authenticated/presets")({
  head: () => ({ meta: [{ title: "Presets — DataSeed" }] }),
  component: PresetsPage,
});

function PresetsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Presets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save a generation configuration once — replay it from the API, the CLI or an MCP tool call.
          </p>
        </div>
        <Button asChild className="shadow-glow">
          <Link to="/playground">
            Build a preset <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-10 rounded-2xl border border-border/60 bg-card/40 p-10 text-center">
        <img
          src={emptyIllu}
          alt=""
          loading="lazy"
          className="mx-auto h-40 w-auto [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_92%)]"
        />
        <Bookmark className="mx-auto -mt-6 h-6 w-6 text-primary" />
        <h2 className="mt-4 text-lg font-semibold">No preset yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Presets capture your schema, row counts, locale and seed. Save one from the Playground and it will appear here — replayable, versioned, deterministic.
        </p>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/playground">Open the playground</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
