"use client";

import clsx from "clsx";

import type { StrategyDef } from "./strategies";

const cardBase =
  "card-button hover-sheen relative flex flex-col gap-5 min-h-[480px] " +
  "pl-6 pr-6 pt-[26px] pb-[22px] rounded-[22px] border backdrop-blur-xl " +
  "transition-all duration-[250ms] " +
  "hover:-translate-y-[3px] hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]";

const cardUnselected =
  "border-line-2 hover:border-line-3 " +
  "bg-gradient-to-b from-white/[0.04] to-white/[0.012]";

const cardSelected =
  "border-silver-2 " +
  "shadow-[0_24px_60px_-20px_rgba(226,232,240,0.18),inset_0_1px_0_rgba(255,255,255,0.08)] " +
  "bg-[radial-gradient(ellipse_100%_100%_at_0%_0%,rgba(255,255,255,0.08),transparent_70%),rgba(255,255,255,0.04)]";

/**
 * One profile card on the Strategy step. Same shape for all three
 * (Conservative / Balanced / Growth); the per-profile content comes
 * from `STRATEGIES` so the visual stays consistent.
 *
 * `liveAprStr` is shared across cards — same number, different framing
 * (mint highlight on the recommended one).
 */
export function StrategyCard({
  s,
  isSelected,
  liveAprStr,
  onSelect,
}: {
  s: StrategyDef;
  isSelected: boolean;
  liveAprStr: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={clsx(cardBase, isSelected ? cardSelected : cardUnselected)}
    >
      <div className="flex justify-between items-start gap-3 pr-9">
        <div className="flex items-center gap-[14px]">
          <div
            className={clsx(
              "w-11 h-11 rounded-xl grid place-items-center border",
              "text-silver-1",
              isSelected
                ? "border-silver-2 bg-white/[0.08]"
                : "border-line-2 bg-white/[0.03]",
            )}
          >
            {s.glyph}
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-1">
              {s.label}
            </div>
            <h3 className="m-0 font-display text-[20px] font-semibold leading-none tracking-[-0.022em] text-silver-1">
              {s.title}
            </h3>
          </div>
        </div>
        <span
          className={clsx(
            "font-mono text-[9px] tracking-[0.14em] uppercase font-medium",
            "px-[9px] py-1 rounded-pill border",
            isSelected && s.tagVariant === "rec"
              ? "text-silver-1 border-silver-2 bg-white/[0.06]"
              : "text-silver-3 border-line-2",
          )}
        >
          {s.tag}
        </span>
      </div>

      <p className="m-0 text-[13.5px] text-silver-3 leading-[1.55] [&_strong]:text-silver-1 [&_strong]:font-medium">
        {s.desc}
      </p>

      <ul className="list-none p-0 m-0 flex flex-col gap-[9px]">
        {s.features.map((f, i) => (
          <li
            key={i}
            className="grid grid-cols-[14px_1fr] gap-[10px] items-start text-[13px] text-silver-3 leading-[1.45] [&_b]:text-silver-1 [&_b]:font-medium"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-[14px] h-[14px] mt-[3px] fill-none stroke-silver-3 stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex justify-between items-center gap-3 px-4 py-[14px] rounded-[14px] bg-black/[0.22] border border-line-1">
        <div className="flex flex-col gap-[3px]">
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
            Live yield venue
          </div>
          <div
            className={clsx(
              "font-mono [font-feature-settings:'tnum'] text-[22px] font-medium leading-none tracking-[-0.025em]",
              s.tagVariant === "rec" ? "text-mint" : "text-silver-1",
            )}
          >
            {liveAprStr}
          </div>
          <div className="font-mono text-[9.5px] tracking-[0.04em] text-silver-4">
            AAVE v3 · Arbitrum Sepolia
          </div>
        </div>
        <span className="inline-flex items-center gap-[7px] font-mono text-[10px] tracking-[0.1em] uppercase text-mint">
          <i className="w-[6px] h-[6px] rounded-full bg-mint animate-mint-pulse" />
          Live
        </span>
      </div>

      <span
        className={clsx(
          "absolute top-[22px] right-[22px] w-[22px] h-[22px] rounded-full border-[1.5px] transition-all",
          isSelected
            ? "bg-silver-1 border-silver-1 check-mark-sm"
            : "border-line-2",
        )}
        aria-hidden
      />
    </button>
  );
}
