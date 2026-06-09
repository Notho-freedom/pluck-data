import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

interface AnimatedTerminalProps {
  inputTitle?: string;
  outputTitle?: string;
  input: string;
  output: string;
  typeSpeed?: number;
  startDelay?: number;
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function AnimatedTerminal({
  inputTitle = "schema.sql",
  outputTitle = "seed.sql",
  input,
  output,
  typeSpeed = 12,
  startDelay = 400,
}: AnimatedTerminalProps) {
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "running" | "out">("typing");
  const [outLines, setOutLines] = useState<string[]>([]);
  const total = input.length;
  const outputLines = output.split("\n");

  useEffect(() => {
    if (reduced()) {
      setTyped(input);
      setOutLines(outputLines);
      setPhase("out");
      return;
    }
    let i = 0;
    let cancel = false;
    const tick = () => {
      if (cancel) return;
      if (i <= total) {
        setTyped(input.slice(0, i));
        i += Math.max(1, Math.floor(2 + Math.random() * 3));
        setTimeout(tick, typeSpeed + Math.random() * 24);
      } else {
        setPhase("running");
        setTimeout(() => {
          setPhase("out");
          let n = 0;
          const reveal = () => {
            if (cancel) return;
            n += 1;
            setOutLines(outputLines.slice(0, n));
            if (n < outputLines.length) setTimeout(reveal, 55);
          };
          reveal();
        }, 700);
      }
    };
    const startT = setTimeout(tick, startDelay);
    return () => {
      cancel = true;
      clearTimeout(startT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-3 rounded-2xl border border-border/80 bg-card/60 p-3 shadow-elevated backdrop-blur-sm lg:grid-cols-[1fr_auto_1.15fr] lg:items-stretch">
      <Pane title={inputTitle} badge="INPUT" lang="sql">
        <pre className="whitespace-pre-wrap break-words p-5 text-[12px] leading-relaxed font-mono text-foreground/90">
          <code>{typed}</code>
          {phase === "typing" && <span className="caret" />}
        </pre>
      </Pane>
      <div className="hidden items-center justify-center lg:flex">
        <div
          className={`grid h-9 w-9 place-items-center rounded-full border text-primary transition-all ${
            phase === "out"
              ? "border-primary/50 bg-primary/15 animate-glow-pulse"
              : "border-primary/30 bg-primary/10"
          }`}
        >
          <ArrowRight className={`h-4 w-4 ${phase === "running" ? "animate-pulse" : ""}`} />
        </div>
      </div>
      <Pane title={outputTitle} badge="OUTPUT" lang="sql" accent>
        <pre className="whitespace-pre-wrap break-words p-5 text-[12px] leading-relaxed font-mono text-foreground/90 min-h-[220px]">
          {phase === "typing" && (
            <span className="text-muted-foreground/60">// awaiting input…</span>
          )}
          {phase === "running" && (
            <span className="inline-flex items-center gap-2 text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              generating rows…
            </span>
          )}
          {phase === "out" && (
            <code>
              {outLines.map((l, i) => (
                <div
                  key={i}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms`, animationFillMode: "backwards" }}
                >
                  {l || "\u00A0"}
                </div>
              ))}
            </code>
          )}
        </pre>
      </Pane>
    </div>
  );
}

function Pane({
  title,
  badge,
  lang,
  accent,
  children,
}: {
  title: string;
  badge: string;
  lang: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-[oklch(0.115_0.015_250)] ${
        accent ? "border-primary/30 shadow-glow" : "border-border/80"
      }`}
    >
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
          <span
            className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
              accent
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-muted text-muted-foreground"
            }`}
          >
            {badge}
          </span>
          <span className="font-mono text-[10px] uppercase text-muted-foreground/70">{lang}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
