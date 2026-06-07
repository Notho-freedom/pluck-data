import { useEffect, useState } from "react";

interface TypewriterProps {
  words: string[];
  typingMs?: number;
  pauseMs?: number;
  deletingMs?: number;
  className?: string;
  loop?: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function Typewriter({
  words,
  typingMs = 65,
  pauseMs = 1400,
  deletingMs = 35,
  className = "",
  loop = true,
}: TypewriterProps) {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setSub(words[0] ?? "");
      return;
    }
    const word = words[index % words.length];
    if (!deleting && sub === word) {
      if (!loop && index === words.length - 1) return;
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (deleting && sub === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(
      () => {
        setSub((s) => (deleting ? s.slice(0, -1) : word.slice(0, s.length + 1)));
      },
      deleting ? deletingMs : typingMs
    );
    return () => clearTimeout(t);
  }, [sub, deleting, index, words, typingMs, pauseMs, deletingMs, loop]);

  return (
    <span className={`caret ${className}`}>{sub || "\u00A0"}</span>
  );
}
