import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/animations/ScrollReveal";

export function PageHero({
  eyebrow,
  title,
  emphasis,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  emphasis?: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_50%_at_50%_10%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl bg-[radial-gradient(closest-side,oklch(0.84_0.18_155/.35),transparent_70%)]" />
      <div className="mx-auto max-w-4xl px-6 py-24 text-center sm:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary/90">{eyebrow}</p>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-[54px] sm:leading-[1.05]">
          {title}
          {emphasis && (
            <>
              <br />
              <span className="font-display italic text-primary">{emphasis}</span>
            </>
          )}
        </h1>
        {sub && (
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">
            {sub}
          </p>
        )}
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow, title, sub, align = "center",
}: { eyebrow: string; title: string; sub?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/90">{eyebrow}</p>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-[38px] sm:leading-[1.1]">
        {title}
      </h2>
      {sub && (
        <p className={cn("mt-4 text-[15px] leading-relaxed text-muted-foreground", align === "center" && "mx-auto max-w-xl")}>
          {sub}
        </p>
      )}
    </div>
  );
}

export function FeatureCard({
  icon, title, children, tags,
}: { icon: React.ReactNode; title: string; children: React.ReactNode; tags?: string[] }) {
  return (
    <ScrollReveal>
      <div className="group relative h-full overflow-hidden rounded-xl border border-border/60 bg-card/40 p-6 transition-all hover:border-primary/30 hover:bg-card/60">
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="mt-5 text-[15px] font-semibold tracking-tight">{title}</h3>
        <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
        {tags && tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}

export function TerminalCard({
  title, badge, lang, children, accent,
}: { title: string; badge: string; lang?: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border bg-[oklch(0.115_0.015_250)]",
      accent ? "border-primary/30 shadow-glow" : "border-border/60",
    )}>
      <div className="flex items-center justify-between border-b border-border/60 bg-card/60 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.6_0.18_25)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.15_75)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.16_150)]/70" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            accent ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground",
          )}>{badge}</span>
          {lang && <span className="font-mono text-[10px] uppercase text-muted-foreground/70">{lang}</span>}
        </div>
      </div>
      <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed font-mono text-foreground/90">
        <code>{children}</code>
      </pre>
    </div>
  );
}
