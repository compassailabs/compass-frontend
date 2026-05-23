"use client";

import Link from "next/link";
import clsx from "clsx";

import { useUserStateStore } from "@/store/userState";

/**
 * Strategy status pill + "modify in chat" link, designed to sit in the
 * Dashboard header's right side. Replaces the old SummaryCard whose
 * giant "Total allocated" number duplicated the EarningsCard hero.
 */
export function StrategyStatus({
  policy,
}: {
  policy: ReturnType<typeof useUserStateStore.getState>["policy"];
}) {
  if (!policy) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill border border-line-2 text-silver-4 font-mono text-[10px] tracking-[0.14em] uppercase">
          No strategy yet
        </span>
      </div>
    );
  }
  const paused = policy.status === "paused";
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span
        className={clsx(
          "inline-flex items-center gap-[7px] px-3 py-1 rounded-pill border font-mono text-[10px] tracking-[0.14em] uppercase",
          paused
            ? "border-amber/[0.35] bg-amber/[0.08] text-amber"
            : "border-mint/[0.35] bg-mint/[0.08] text-mint",
        )}
      >
        <i
          className={clsx(
            "w-[6px] h-[6px] rounded-full",
            paused
              ? "bg-amber animate-amber-pulse"
              : "bg-mint animate-mint-pulse",
          )}
        />
        Strategy {paused ? "paused" : "active"} · {policy.risk_label} · v1
      </span>
      <Link
        href="/chat"
        className="font-mono text-[11px] tracking-[0.06em] text-silver-3 hover:text-silver-1 transition-colors no-underline"
      >
        modify in chat →
      </Link>
    </div>
  );
}
