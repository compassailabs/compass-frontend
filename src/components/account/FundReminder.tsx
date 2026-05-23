"use client";

import clsx from "clsx";

import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";

export function FundReminder({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const session = useUserStateStore((s) => s.session);
  const balance = useUserStateStore((s) => s.balance);
  const openFundModal = useUIStore((s) => s.openFundModal);

  if (!session?.ready) return null;
  if (!balance) return null;
  if (balance.has_funds) return null;

  if (variant === "full") {
    return (
      <div className="rounded-[14px] border border-amber/[0.4] bg-amber/[0.08] px-4 py-3 flex items-center justify-between gap-3">
        <div className="text-[13px] text-amber leading-[1.5]">
          Your smart account has{" "}
          <b className="font-mono">0 USDC</b> on both chains. Deposit before
          Compass can act on your behalf.
        </div>
        <button
          type="button"
          onClick={openFundModal}
          className={clsx(
            "shrink-0 px-3 py-1.5 rounded-pill text-[12.5px] font-medium",
            "bg-amber text-arc-deep hover:bg-amber/90 transition-colors",
          )}
        >
          Deposit now
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={openFundModal}
      className={clsx(
        "w-full inline-flex items-center justify-between gap-3 px-3 py-2 rounded-pill",
        "border border-amber/[0.4] bg-amber/[0.08] text-amber text-[12px] hover:bg-amber/[0.14] transition-colors",
      )}
    >
      <span className="inline-flex items-center gap-2">
        <i className="w-[6px] h-[6px] rounded-full bg-amber animate-amber-pulse" />
        Smart account holds 0 USDC — deposit before sending intents.
      </span>
      <span className="font-medium">Deposit →</span>
    </button>
  );
}
