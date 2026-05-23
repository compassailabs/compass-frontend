import clsx from "clsx";

import type { ChainId } from "@/lib/api";

/**
 * Uniswap-style stacked asset icon: token logo with a small chain badge
 * overlaid bottom-right (ring-arc-deep gives the "punched out" look so
 * the badge reads cleanly against any underlying background).
 */
export function AssetIcon({
  chain,
  size = "md",
  className,
}: {
  chain: ChainId;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = SIZE[size];
  return (
    <div className={clsx("relative shrink-0", dims.outer, className)}>
      <UsdcLogo className={dims.token} />
      <ChainBadge
        chain={chain}
        className={clsx(
          "absolute -bottom-0.5 -right-0.5 ring-2 ring-arc-deep",
          dims.badge,
        )}
      />
    </div>
  );
}

const SIZE = {
  sm: { outer: "w-7 h-7", token: "w-7 h-7", badge: "w-3 h-3 text-[7px]" },
  md: { outer: "w-10 h-10", token: "w-10 h-10", badge: "w-4 h-4 text-[8px]" },
  lg: { outer: "w-14 h-14", token: "w-14 h-14", badge: "w-5 h-5 text-[10px]" },
};

// ── USDC token logo ───────────────────────────────────────────────
// Uses Circle's official mark from /icons/usdc.svg so the token chip
// matches what the user sees in wallets, explorers, and Circle's app.

function UsdcLogo({ className }: { className?: string }) {
  return (
    <img
      src="/icons/usdc.svg"
      alt=""
      aria-label="USDC"
      className={className}
    />
  );
}

// ── Chain badge ────────────────────────────────────────────────────

function ChainBadge({
  chain,
  className,
}: {
  chain: ChainId;
  className?: string;
}) {
  const isArc = chain === "arc";
  return (
    <span
      className={clsx(
        "rounded-full overflow-hidden grid place-items-center bg-arc-deep",
        className,
      )}
      aria-label={isArc ? "Arc" : "Arbitrum Sepolia"}
    >
      <img
        src={isArc ? "/icons/arc.svg" : "/icons/arbitrum.svg"}
        alt=""
        aria-hidden
        className="w-full h-full object-contain"
      />
    </span>
  );
}
