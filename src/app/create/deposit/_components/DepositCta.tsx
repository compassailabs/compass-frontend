"use client";

import clsx from "clsx";

export function DepositCta({
  label,
  disabled,
  spinning,
  showArrow,
  onClick,
}: {
  label: string;
  disabled: boolean;
  spinning: boolean;
  showArrow: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "group inline-flex items-center gap-[9px] px-6 py-[13px] rounded-pill",
        "no-underline whitespace-nowrap font-semibold text-[14px] tracking-[-0.005em]",
        "transition-all duration-[180ms]",
        !disabled
          ? "bg-gradient-to-b from-white to-silver-2 text-arc-deep shadow-[0_10px_30px_-10px_rgba(226,232,240,0.45),inset_0_1px_0_rgba(255,255,255,0.6)] hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-10px_rgba(226,232,240,0.65),inset_0_1px_0_rgba(255,255,255,0.7)] active:scale-[0.98]"
          : "bg-white/[0.06] text-silver-4 cursor-not-allowed",
      )}
    >
      {spinning && (
        <span className="w-3 h-3 rounded-full border-[1.5px] border-arc-deep border-t-transparent animate-spin-fast" />
      )}
      {label}
      {showArrow && (
        <span className="inline-block transition-transform group-hover:translate-x-[3px]">
          →
        </span>
      )}
    </button>
  );
}
