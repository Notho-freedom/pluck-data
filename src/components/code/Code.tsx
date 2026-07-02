import { useEffect, useState } from "react";
import type { BundledLanguage } from "shiki/bundle/web";

/**
 * DataSeed syntax highlighter — Shiki-based, SSR-safe.
 * Renders a plain <pre> on the server; hydrates to themed HTML on the client.
 * Custom theme aligned with our mint/noir palette.
 */

export type CodeLang =
  | "sql"
  | "typescript"
  | "ts"
  | "tsx"
  | "javascript"
  | "js"
  | "json"
  | "bash"
  | "shell"
  | "python"
  | "py"
  | "prisma"
  | "yaml"
  | "yml"
  | "http"
  | "csv"
  | "text";

const SHIKI_LANGS = [
  "sql",
  "typescript",
  "tsx",
  "javascript",
  "json",
  "bash",
  "shell",
  "python",
  "yaml",
  "http",
] as const;

type DataSeedHighlighter = {
  codeToHtml: (code: string, options: { lang: BundledLanguage | "text"; theme: string }) => string;
};

let highlighterPromise: Promise<DataSeedHighlighter> | null = null;
async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const { createHighlighter } = await import("shiki/bundle/web");
      const highlighter = await createHighlighter({
        themes: [DATASEED_THEME],
        langs: SHIKI_LANGS,
      });
      return highlighter as DataSeedHighlighter;
    })();
  }
  return highlighterPromise;
}

function normalizeLang(lang: CodeLang): BundledLanguage | "text" {
  if (lang === "ts" || lang === "prisma") return "typescript";
  if (lang === "js") return "javascript";
  if (lang === "py") return "python";
  if (lang === "yml") return "yaml";
  if (lang === "csv" || lang === "text") return "text";
  return lang as BundledLanguage;
}

interface CodeProps {
  code: string;
  lang?: CodeLang;
  className?: string;
  /** Wrap long lines instead of horizontal scroll */
  wrap?: boolean;
  /** Show line numbers gutter */
  lineNumbers?: boolean;
  "aria-hidden"?: boolean;
}

export function Code({
  code,
  lang = "text",
  className = "",
  wrap,
  lineNumbers,
  "aria-hidden": ariaHidden,
}: CodeProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hl = await getHighlighter();
        const shikiLang = normalizeLang(lang);
        const out = hl.codeToHtml(code, {
          lang: shikiLang,
          theme: "dataseed",
        });
        if (!cancelled) setHtml(out);
      } catch {
        // fall back silently
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  const wrapCls = wrap ? "whitespace-pre-wrap break-words" : "overflow-x-auto";
  const baseCls = `code-shiki ${wrapCls} font-mono text-[12.5px] leading-relaxed ${lineNumbers ? "shiki-lines" : ""} ${className}`;

  if (html) {
    return (
      <div
        className={baseCls}
        aria-hidden={ariaHidden}
        // shiki HTML is trusted (we produced it locally)
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  // SSR / pre-hydration fallback
  return (
    <pre className={`${baseCls} text-foreground/85`} aria-hidden={ariaHidden}>
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
    {
      scope: ["comment", "punctuation.definition.comment", "string.comment"],
      settings: { foreground: "#5a6a7a", fontStyle: "italic" },
    },
    {
      scope: ["keyword", "storage", "storage.type", "keyword.control", "keyword.operator.new"],
      settings: { foreground: "#7be3b8" },
    },
    {
      scope: ["keyword.other.DML", "keyword.other.DDL", "keyword.other.create"],
      settings: { foreground: "#7be3b8" },
    },
    { scope: ["string", "string.quoted", "string.template"], settings: { foreground: "#f4c88a" } },
    {
      scope: ["constant.numeric", "constant.language.boolean", "constant.language.null"],
      settings: { foreground: "#c9a8ff" },
    },
    {
      scope: ["variable", "variable.other", "meta.definition.variable"],
      settings: { foreground: "#e5eaef" },
    },
    {
      scope: ["entity.name.function", "support.function", "meta.function-call"],
      settings: { foreground: "#8ac6ff" },
    },
    {
      scope: ["entity.name.class", "entity.name.type", "support.type", "support.class"],
      settings: { foreground: "#ffb3c1" },
    },
    {
      scope: ["variable.parameter", "meta.function.parameters"],
      settings: { foreground: "#e5eaef" },
    },
    { scope: ["punctuation", "meta.brace", "meta.delimiter"], settings: { foreground: "#8892a3" } },
    { scope: ["entity.other.attribute-name", "meta.tag"], settings: { foreground: "#7be3b8" } },
    { scope: ["entity.name.tag"], settings: { foreground: "#8ac6ff" } },
    {
      scope: ["support.type.property-name", "meta.object-literal.key"],
      settings: { foreground: "#ffb3c1" },
    },
    { scope: ["constant.language"], settings: { foreground: "#c9a8ff" } },
    { scope: ["invalid"], settings: { foreground: "#ff8080" } },
  ],
} as const;

/* Convenience wrapper: a full terminal-style panel around the highlighted code */
export function CodePanel({
  title,
  badge,
  lang,
  code,
  accent,
  className = "",
  wrap,
}: {
  title: string;
  badge?: string;
  lang: CodeLang;
  code: string;
  accent?: boolean;
  className?: string;
  wrap?: boolean;
}) {
  return (
    <figure
      className={`relative overflow-hidden border-y border-border/50 bg-[oklch(0.115_0.015_250)] ${accent ? "shadow-glow" : ""} ${className}`}
    >
      <figcaption className="flex items-center justify-between border-b border-border/40 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="font-mono text-[11px] text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span
              className={`font-mono text-[10px] uppercase tracking-wider ${accent ? "text-primary" : "text-muted-foreground"}`}
            >
              {badge}
            </span>
          )}
          <span className="font-mono text-[10px] uppercase text-muted-foreground/70">{lang}</span>
        </div>
      </figcaption>
      <div className="p-5">
        <Code code={code} lang={lang} wrap={wrap} />
      </div>
    </figure>
  );
}
