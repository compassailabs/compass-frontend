"use client";

import clsx from "clsx";

import type { MarketEntry } from "@/lib/api";

const cardBase =
  "card-button hover-sheen relative flex flex-col gap-[14px] " +
  "pl-[18px] pr-[18px] pt-[18px] pb-4 rounded-[18px] border backdrop-blur-md " +
  "transition-all duration-[200ms] " +
  "hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-20px_rgba(0,0,0,0.5)]";

const cardUnselected =
  "border-line-2 hover:border-line-3 " +
  "bg-gradient-to-b from-white/[0.035] to-white/[0.01]";

const cardSelected =
  "border-silver-2 " +
  "shadow-[0_16px_40px_-20px_rgba(226,232,240,0.18),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "bg-gradient-to-b from-white/[0.06] to-white/[0.015]";

export function MarketCard({
  m,
  isSelected,
  onToggle,
}: {
  m: MarketEntry;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const highApr = m.apr >= 0.04;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSelected}
      className={clsx(cardBase, isSelected ? cardSelected : cardUnselected)}
    >
      <div className="flex justify-between items-start gap-[10px]">
        <div className="inline-flex items-center gap-[9px]">
          <span className="shrink-0 w-[26px] h-[26px] rounded-full overflow-hidden grid place-items-center bg-arc-deep border border-line-2">
            <img
              src={
                m.chain === "arc"
                  ? "/icons/arc.svg"
                  : "/icons/arbitrum.svg"
              }
              alt=""
              aria-hidden
              className="w-full h-full object-contain"
            />
          </span>
          <div>
            <div className="font-display text-[13.5px] font-semibold tracking-[-0.01em] text-silver-1">
              {m.protocol === "aave_v3" ? "AAVE v3" : "Available"}
            </div>
            <div className="mt-[1px] font-mono text-[10px] tracking-[0.06em] text-silver-4">
              USDC ·{" "}
              {m.chain === "arc" ? "Arc" : "Arbitrum Sepolia"}
            </div>
          </div>
        </div>
        <span
          className={clsx(
            "shrink-0 relative w-[22px] h-[22px] rounded-[7px] border-[1.5px] transition-all",
            isSelected
              ? "bg-silver-1 border-silver-1 check-mark-md"
              : "bg-black/[0.2] border-line-3",
          )}
          aria-hidden
        />
      </div>

      <div className="flex flex-col gap-[3px]">
        <div className="font-display text-[14px] font-medium leading-[1.3] tracking-[-0.012em] text-silver-2">
          {m.label}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.03em] text-silver-4">
          {m.is_yield_venue ? "Lending · variable rate" : "Uninvested cash"}
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 pt-3 mt-auto border-t border-dashed border-line-1">
        <div className="flex flex-col gap-[2px]">
          <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
            APY
          </span>
          <span
            className={clsx(
              "font-mono [font-feature-settings:'tnum'] text-[22px] font-semibold leading-none tracking-[-0.025em]",
              m.is_yield_venue && highApr
                ? "text-mint"
                : m.is_yield_venue
                  ? "text-silver-1"
                  : "text-silver-4",
            )}
          >
            {(m.apr * 100).toFixed(2)}%
          </span>
        </div>
        <span
          className={clsx(
            "inline-flex items-center gap-1 px-2 py-[3px] rounded-pill border font-mono text-[10px] font-semibold tracking-[0.04em]",
            m.status === "live"
              ? "bg-mint/[0.08] border-mint/[0.22] text-mint"
              : "bg-white/[0.04] border-line-2 text-silver-4",
          )}
        >
          {m.status === "live" ? "Live" : "Soon"}
        </span>
      </div>
    </button>
  );
}
