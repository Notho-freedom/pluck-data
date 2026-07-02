import { Code, type CodeLang } from "./Code";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  lang?: CodeLang;
  label: string;
  placeholder?: string;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  lang = "sql",
  label,
  placeholder,
  className,
}: CodeEditorProps) {
  const display = value || placeholder || "";

  return (
    <div
      className={cn(
        "relative min-h-[460px] overflow-hidden bg-[oklch(0.105_0.012_250)]",
        className,
      )}
    >
      <div className="flex h-9 items-center justify-between border-b border-border/35 px-4">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary/80">
          {lang}
        </span>
      </div>
      <div className="relative min-h-[421px]">
        <Code
          code={`${display}${display.endsWith("\n") ? "" : "\n"}`}
          lang={lang}
          wrap
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 p-5 text-[12.5px]",
            !value && "opacity-45",
          )}
        />
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          placeholder={placeholder}
          aria-label={label}
          className="absolute inset-0 min-h-full w-full resize-none bg-transparent p-5 font-mono text-[12.5px] leading-relaxed text-transparent caret-primary outline-none selection:bg-primary/25"
        />
      </div>
    </div>
  );
}
