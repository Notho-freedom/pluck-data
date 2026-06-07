import { EXAMPLES, type SchemaExample } from "@/lib/examples";
import { Sparkles } from "lucide-react";

interface ExampleGalleryProps {
  onPick: (ex: SchemaExample) => void;
  activeId?: string;
}

export function ExampleGallery({ onPick, activeId }: ExampleGalleryProps) {
  return (
    <div className="rounded-xl border border-border/80 bg-card/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <h3 className="text-sm font-semibold">Start from an example</h3>
        <span className="text-xs text-muted-foreground">— click to load</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLES.map((ex) => {
          const active = ex.id === activeId;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onPick(ex)}
              className={`group text-left rounded-lg border p-3 transition-all hover:-translate-y-0.5 hover:shadow-glow ${
                active
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/80 bg-background/40 hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-base leading-none">{ex.icon}</span>
                <span>{ex.label}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{ex.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
