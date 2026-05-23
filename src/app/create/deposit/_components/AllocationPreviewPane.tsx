import clsx from "clsx";

import { venueKey, type MarketEntry } from "@/lib/api";

import { formatMoney, VENUE_DOT_BY_KEY, VENUE_GRAD_BY_KEY } from "./constants";

export type AllocationRow = { venue: MarketEntry; pct: number };

export function AllocationPreviewPane({
  strategyLabel,
  blendedApr,
  earn,
  allocations,
  selectedMarketsCount,
  yieldVenuesCount,
}: {
  strategyLabel: string;
  blendedApr: number;
  earn: number;
  allocations: AllocationRow[];
  selectedMarketsCount: number;
  yieldVenuesCount: number;
}) {
  return (
    <aside
      className={clsx(
        "gradient-border relative flex flex-col gap-[18px] pl-[26px] pr-[26px] pt-6 pb-6",
        "rounded-[22px] border border-line-2 backdrop-blur-xl overflow-hidden",
        "bg-gradient-to-b from-white/[0.03] to-white/[0.008]",
      )}
    >
      <div className="flex justify-between items-center">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-medium tracking-[0.15em] uppercase text-silver-4">
          Proposed allocation ·{" "}
          <b className="text-silver-1 font-semibold">{strategyLabel}</b>
        </span>
        <span className="px-2 py-[3px] rounded-pill bg-gradient-to-b from-silver-1 to-silver-2 text-arc-deep font-mono text-[9px] font-bold tracking-[0.16em] uppercase shadow-[0_0_12px_-2px_rgba(226,232,240,0.4)]">
          Live
        </span>
      </div>

      <div className="flex items-baseline gap-3 pb-[14px] border-b border-dashed border-line-1">
        <span
          className={clsx(
            "font-mono [font-feature-settings:'tnum'] text-[38px] font-semibold leading-none tracking-[-0.03em]",
            blendedApr > 0 ? "text-mint" : "text-silver-3",
          )}
        >
          {(blendedApr * 100).toFixed(2)}%
        </span>
        <span className="text-[12px] text-silver-3">est. blended APR</span>
        <span className="ml-auto text-[12px] text-silver-3">
          ≈ ${formatMoney(earn)} / year
        </span>
      </div>

      <div className="flex flex-col gap-[10px]">
        {allocations.length > 0 ? (
          <div className="flex h-[10px] rounded-pill overflow-hidden bg-white/[0.04] gap-[2px]">
            {allocations.map((a) => {
              const k = venueKey(a.venue);
              return (
                <span
                  key={k}
                  className={clsx(
                    "h-full bg-gradient-to-r transition-[width] duration-[400ms]",
                    VENUE_GRAD_BY_KEY[k] ?? "from-silver-3 to-silver-4",
                  )}
                  style={{ width: `${a.pct}%` }}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex h-[10px] rounded-pill bg-white/[0.04]" />
        )}
        <ul className="list-none p-0 m-0 grid grid-cols-1 gap-y-2 gap-x-[14px]">
          {allocations.map((a) => {
            const k = venueKey(a.venue);
            return (
              <li
                key={k}
                className="flex items-center gap-2 text-[12px] text-silver-3 tracking-[-0.005em]"
              >
                <span
                  className={clsx(
                    "w-2 h-2 rounded-full shrink-0",
                    VENUE_DOT_BY_KEY[k] ?? "bg-silver-3",
                  )}
                />
                <span className="flex-1 truncate">
                  {a.venue.label}
                  <small className="ml-[6px] font-mono text-[10px] text-silver-4">
                    {(a.venue.apr * 100).toFixed(2)}% APR
                  </small>
                </span>
                <em className="not-italic font-mono text-silver-1 font-medium [font-feature-settings:'tnum']">
                  {a.pct.toFixed(0)}%
                </em>
              </li>
            );
          })}
          {allocations.length === 0 && (
            <li className="text-[12px] text-silver-4">
              Pick at least one venue on the previous step.
            </li>
          )}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-y-[10px] gap-x-4 px-4 py-[14px] rounded-[14px] bg-black/[0.22] border border-line-1">
        <Stat k="Venues" v={`${selectedMarketsCount} selected`} />
        <Stat
          k="Earning"
          v={`${yieldVenuesCount} of ${selectedMarketsCount}`}
          mint={yieldVenuesCount > 0}
        />
      </div>

      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.06em] uppercase text-silver-4">
        <span className="w-[6px] h-[6px] rounded-full bg-mint animate-mint-pulse" />
        Live APR
      </div>
    </aside>
  );
}

function Stat({ k, v, mint }: { k: string; v: string; mint?: boolean }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span className="text-silver-4">{k}</span>
      <span
        className={clsx(
          "font-mono font-medium",
          mint ? "text-mint" : "text-silver-1",
        )}
      >
        {v}
      </span>
    </div>
  );
}
