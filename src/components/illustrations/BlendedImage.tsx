import { cn } from "@/lib/utils";

interface BlendedImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  width?: number;
  height?: number;
  /** Direction the image fades into the background */
  fade?: "all" | "bottom" | "edges" | "left" | "right" | "none";
  /** Add a soft colored halo behind the image */
  glow?: boolean;
  priority?: boolean;
}

const FADE_MASK: Record<NonNullable<BlendedImageProps["fade"]>, string> = {
  all: "[mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_92%)]",
  edges: "[mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent),linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [mask-composite:intersect]",
  bottom: "[mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]",
  left: "[mask-image:linear-gradient(to_left,black_55%,transparent_100%)]",
  right: "[mask-image:linear-gradient(to_right,black_55%,transparent_100%)]",
  none: "",
};

export function BlendedImage({
  src,
  alt,
  className,
  imgClassName,
  width,
  height,
  fade = "all",
  glow = true,
  priority = false,
}: BlendedImageProps) {
  return (
    <div className={cn("relative", className)}>
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-10 -z-10 rounded-full opacity-60 blur-3xl bg-[radial-gradient(closest-side,oklch(0.84_0.18_155/.22),transparent_70%)]"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "w-full h-auto select-none",
          FADE_MASK[fade],
          imgClassName,
        )}
      />
    </div>
  );
}
