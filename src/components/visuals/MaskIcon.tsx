import clsx from "clsx";

/**
 * Renders an external SVG as a CSS mask, then fills it with the parent's
 * current text color (`bg-current`). Lets us reuse one SVG file across
 * states that need different colors (e.g. ModeToggle pills which flip
 * between silver-3 and arc-deep, or strategy cards switching to
 * silver-1 when selected) — without inlining the SVG markup per call
 * site or shipping color-baked-in variants.
 *
 * Works for any SVG whose visible pixels live on alpha (stroked outline
 * icons, filled shapes, both). The actual fill / stroke colors in the
 * SVG are ignored — only the alpha channel matters.
 */
export function MaskIcon({
  src,
  className,
  ariaLabel,
}: {
  src: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <span
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={clsx("inline-block shrink-0 bg-current", className)}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
