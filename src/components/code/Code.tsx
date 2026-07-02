import { useEffect, useRef, useState } from "react";
import type { BundledLanguage } from "shiki/bundle/web";

/**
 * DataSeed syntax highlighter — Shiki-based, SSR-safe.
 * Renders a plain <pre> on the server; hydrates to themed HTML on the client.
 * Custom theme aligned with our mint/noir palette.
 */

type Lang =
  | "sql" | "typescript" | "tsx" | "javascript" | "json"
  | "bash" | "shell" | "python" | "prisma" | "yaml" | "http" | "text";

let highlighterPromise: Promise<any> | null = null;
async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const { createHighlighter } = await import("shiki/bundle/web");
      return createHighlighter({
        themes: [DATASEED_THEME as any],
        langs: [
          "sql", "typescript", "tsx", "javascript", "json",
          "bash", "shell", "python", "yaml", "http",
        ],
      });
    })();
  }
  return highlighterPromise;
}

interface CodeProps {
  code: string;
  lang?: Lang;
  className?: string;
  /** Wrap long lines instead of horizontal scroll */
  wrap?: boolean;
  /** Show line numbers gutter */
  lineNumbers?: boolean;
}

export function Code({ code, lang = "text", className = "", wrap, lineNumbers }: CodeProps) {
  const [html, setHtml] = useState<string | null>(null);
  const raw = useRef(code);

  useEffect(() => {
    let cancelled = false;
    raw.current = code;
    (async () => {
      try {
        const hl = await getHighlighter();
        const shikiLang: BundledLanguage | "text" =
          lang === "prisma" ? "typescript" : (lang as any);
        const out = hl.codeToHtml(code, {
          lang: shikiLang,
          theme: "dataseed",
        });
        if (!cancelled) setHtml(out);
      } catch {
        // fall back silently
      }
    })();
    return () => { cancelled = true; };
  }, [code, lang]);

  const wrapCls = wrap ? "whitespace-pre-wrap break-words" : "overflow-x-auto";

  if (html) {
    return (
      <div
        className={`${wrapCls} ${lineNumbers ? "shiki-lines" : ""} ${className}`}
        // shiki HTML is trusted (we produced it locally)
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  // SSR / pre-hydration fallback
  return (
    <pre className={`${wrapCls} font-mono text-[12.5px] leading-relaxed text-foreground/85 ${className}`}>
      <code>{code}</code>
    </pre>
  );
}

/* --------------------------------------------------------------------------
 * DataSeed custom theme — mint keywords, amber strings, lavender numbers,
 * slate-blue comments. Transparent background so it inherits our surfaces.
 * ------------------------------------------------------------------------ */
const DATASEED_THEME = {
  name: "dataseed",
  type: "dark",
  colors: {
    "editor.background": "#00000000",
    "editor.foreground": "#e5eaef",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment", "string.comment"], settings: { foreground: "#5a6a7a", fontStyle: "italic" } },
    { scope: ["keyword", "storage", "storage.type", "keyword.control", "keyword.operator.new"], settings: { foreground: "#7be3b8" } },
    { scope: ["keyword.other.DML", "keyword.other.DDL", "keyword.other.create"], settings: { foreground: "#7be3b8" } },
    { scope: ["string", "string.quoted", "string.template"], settings: { foreground: "#f4c88a" } },
    { scope: ["constant.numeric", "constant.language.boolean", "constant.language.null"], settings: { foreground: "#c9a8ff" } },
    { scope: ["variable", "variable.other", "meta.definition.variable"], settings: { foreground: "#e5eaef" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: "#8ac6ff" } },
    { scope: ["entity.name.class", "entity.name.type", "support.type", "support.class"], settings: { foreground: "#ffb3c1" } },
    { scope: ["variable.parameter", "meta.function.parameters"], settings: { foreground: "#e5eaef" } },
    { scope: ["punctuation", "meta.brace", "meta.delimiter"], settings: { foreground: "#8892a3" } },
    { scope: ["entity.other.attribute-name", "meta.tag"], settings: { foreground: "#7be3b8" } },
    { scope: ["entity.name.tag"], settings: { foreground: "#8ac6ff" } },
    { scope: ["support.type.property-name", "meta.object-literal.key"], settings: { foreground: "#ffb3c1" } },
    { scope: ["constant.language"], settings: { foreground: "#c9a8ff" } },
    { scope: ["invalid"], settings: { foreground: "#ff8080" } },
  ],
} as const;

/* Convenience wrapper: a full terminal-style panel around the highlighted code */
export function CodePanel({
  title, badge, lang, code, accent, className = "",
}: {
  title: string;
  badge?: string;
  lang: Lang;
  code: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border bg-[oklch(0.115_0.015_250)] ${accent ? "border-primary/30 shadow-glow" : "border-border/60"} ${className}`}>
      <div className="flex items-center justify-between border-b border-border/60 bg-card/50 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.6_0.18_25)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.15_75)]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.16_150)]/70" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${accent ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"}`}>
              {badge}
            </span>
          )}
          <span className="font-mono text-[10px] uppercase text-muted-foreground/70">{lang}</span>
        </div>
      </div>
      <div className="p-5">
        <Code code={code} lang={lang} />
      </div>
    </div>
  );
}
