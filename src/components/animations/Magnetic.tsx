import { useRef, type ReactNode } from "react";

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function Magnetic({ children, strength = 0.25, className = "" }: MagneticProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    if (reduced()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate3d(0,0,0)";
  };

  return (
    <span
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={`inline-block ${className}`}
    >
      <span
        ref={ref}
        className="inline-block transition-transform duration-300 ease-out will-change-transform"
      >
        {children}
      </span>
    </span>
  );
}
