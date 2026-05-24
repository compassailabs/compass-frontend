"use client";

import clsx from "clsx";

export type IconName =
  | "chevron-down"
  | "chevron-right"
  | "check"
  | "copy"
  | "external-link"
  | "disconnect"
  | "lightbulb"
  | "clock"
  | "close"
  | "alert-circle"
  | "plus"
  | "info"
  | "arrow-down"
  | "map-pin"
  | "globe"
  | "router"
  | "search"
  | "menu"
  | "signature"
  | "grid";

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const url = `/icons/${name}.svg`;
  return (
    <span
      aria-hidden
      className={clsx("inline-block bg-current shrink-0", className)}
      style={{
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
