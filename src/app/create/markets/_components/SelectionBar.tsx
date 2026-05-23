import clsx from "clsx";

import { MIN_MARKETS } from "./types";

/**
 * Strip above the cards: selected count pill (mint vs amber based on
 * whether the user hit the minimum) + blended APR pill + a small
 * "Live rates" label on the right.
 */
export function SelectionBar({
  selectedCount,
  blendedApr,
}: {
  selectedCount: number;
  blendedApr: number;
}) {
  const enough = selectedCount >= MIN_MARKETS;
  return (
    <div className="flex justify-between items-center mb-[14px] font-mono text-[11px] uppercase tracking-[0.08em] text-silver-4">
      <div className="inline-flex items-center gap-3">
        <span
          className={clsx(
            "inline-flex items-center gap-2 px-3 py-[6px] rounded-pill border font-semibold",
            enough
              ? "bg-mint/[0.08] border-mint/[0.25] text-mint"
              : "bg-amber/[0.08] border-amber/[0.25] text-amber",
          )}
        >
          <b className={enough ? "text-mint" : "text-amber"}>
            {selectedCount}
          </b>
          selected · min {MIN_MARKETS}
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-[6px] rounded-pill bg-white/[0.04] border border-line-2 text-silver-2">
          Blended APR ·{" "}
          <b className="text-silver-1 font-semibold">
            {(blendedApr * 100).toFixed(2)}%
          </b>
        </span>
      </div>
      <span className="text-silver-4">Live rates</span>
    </div>
  );
}
