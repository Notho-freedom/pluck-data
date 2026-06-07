import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  as?: ElementType;
  className?: string;
  once?: boolean;
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  as: Tag = "div",
  className = "",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced()) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const translate =
    direction === "up"
      ? "translate3d(0,18px,0)"
      : direction === "down"
      ? "translate3d(0,-18px,0)"
      : direction === "left"
      ? "translate3d(18px,0,0)"
      : direction === "right"
      ? "translate3d(-18px,0,0)"
      : "none";

  return (
    <Tag
      ref={ref as any}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0)" : "blur(6px)",
        transform: visible ? "translate3d(0,0,0)" : translate,
        transition: `opacity 0.7s cubic-bezier(0.22,0.61,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,0.61,0.36,1) ${delay}ms, filter 0.7s ease ${delay}ms`,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </Tag>
  );
}
