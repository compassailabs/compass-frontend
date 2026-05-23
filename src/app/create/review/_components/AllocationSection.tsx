import clsx from "clsx";

import { venueKey, type MarketEntry } from "@/lib/api";

import { SectionHead } from "./atoms";
import { sectionBase, sectionNeutral, VENUE_DOT, VENUE_GRAD } from "./styles";

export type AllocationRow = { venue: MarketEntry; pct: number };

/**
 * Allocation panel — headline blended APR, stacked bar across venues,
 * per-venue legend with APR + share. Cut-off footer with engine cadence
 * and an "N earning · M uninvested" counter pill.
 */
export function AllocationSection({
  strategyLabel,
  blendedApr,
  yearlyEarn,
  amount,
  allocations,
  yieldVenuesCount,
  totalVenuesCount,
}: {
  strategyLabel: string;
  blendedApr: number;
  yearlyEarn: number;
  amount: number;
  allocations: AllocationRow[];
  yieldVenuesCount: number;
  totalVenuesCount: number;
}) {
  return (
    <section
      className={clsx(sectionBase, sectionNeutral, "[grid-area:allocation]")}
    >
      <SectionHead
        n="03"
        label="Allocation"
        tag={`${strategyLabel} · live APR`}
      />
      <div className="flex items-end justify-between gap-4 pb-4 border-b border-dashed border-line-1">
        <span
          className={clsx(
            "font-mono [font-feature-settings:'tnum'] text-[44px] font-semibold leading-none tracking-[-0.035em]",
            blendedApr > 0 ? "text-mint" : "text-silver-3",
          )}
        >
          {(blendedApr * 100).toFixed(2)}%
        </span>
        <div className="flex flex-col gap-[3px] text-right">
          <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
            est. blended APR
          </span>
          <span
            className={clsx(
              "font-mono text-[14px] font-medium",
              yearlyEarn > 0 ? "text-mint" : "text-silver-3",
            )}
          >
            ≈ ${yearlyEarn.toFixed(2)} / yr on {amount.toFixed(2)} USDC
          </span>
        </div>
      </div>
      {allocations.length > 0 ? (
        <>
          <div className="flex h-3 rounded-pill overflow-hidden bg-white/[0.04] gap-[2px]">
            {allocations.map((a) => {
              const k = venueKey(a.venue);
              return (
                <span
                  key={k}
                  className={clsx(
                    "h-full bg-gradient-to-r",
                    VENUE_GRAD[k] ?? "from-silver-3 to-silver-4",
                  )}
                  style={{ width: `${a.pct}%` }}
                />
              );
            })}
          </div>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {allocations.map((a) => {
              const k = venueKey(a.venue);
              return (
                <li
                  key={k}
                  className="grid grid-cols-[10px_1fr_auto_auto] gap-3 items-center text-[13px]"
                >
                  <span
                    className={clsx(
                      "w-2 h-2 rounded-full",
                      VENUE_DOT[k] ?? "bg-silver-3",
                    )}
                  />
                  <span className="font-display font-medium tracking-[-0.01em] text-silver-1 truncate">
                    {a.venue.label}
                  </span>
                  <span className="font-mono [font-feature-settings:'tnum'] font-medium text-silver-2 min-w-[64px] text-right">
                    {(a.venue.apr * 100).toFixed(2)}%
                  </span>
                  <span className="font-mono [font-feature-settings:'tnum'] font-semibold text-silver-1 min-w-[38px] text-right">
                    {a.pct.toFixed(0)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="text-[12.5px] text-silver-4">
          No venues selected. Go back to step 2.
        </div>
      )}
      <div className="flex justify-between items-center mt-auto pt-[14px] border-t border-dashed border-line-1 font-mono text-[11px] tracking-[0.06em] text-silver-4">
        <span>
          Engine ticks every{" "}
          <b className="text-mint font-semibold">15 minutes</b>
        </span>
        <span className="inline-flex items-center gap-[6px] px-[9px] py-[3px] rounded-pill bg-mint/[0.08] border border-mint/[0.22] text-mint font-semibold">
          {yieldVenuesCount} earning ·{" "}
          {totalVenuesCount - yieldVenuesCount} uninvested
        </span>
      </div>
    </section>
  );
}
