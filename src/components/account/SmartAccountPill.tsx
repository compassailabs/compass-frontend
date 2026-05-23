"use client";

import clsx from "clsx";

import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";

/**
 * Header pill showing the user's Compass smart-account at a glance:
 *   `Compass · 0x9b09…3c09 · 1.0 USDC`
 *
 * Click → opens FundModal so user can copy the address, hit a faucet,
 * or transfer USDC from their EOA without leaving the current page.
 *
 * Hidden until `session.ready` so it doesn't compete visually with the
 * "Setup session" amber pill during the bootstrap step.
 */
export function SmartAccountPill() {
  const openFundModal = useUIStore((s) => s.openFundModal);
  const balance = useUserStateStore((s) => s.balance);
  const session = useUserStateStore((s) => s.session);

  // `/balance` alone is enough to render the pill — it returns the
  // CREATE2 smart-account address + both chain balances. `/session` is
  // a separate endpoint that does ~8 RPC calls and can lag behind on
  // cold start; gating the pill on `session.ready` made the pill
  // disappear whenever session was still loading even though balance
  // had landed. Now session is only used as an address fallback if
  // /balance hasn't responded yet.
  const addr = balance?.smart_account ?? session?.arc.address;
  if (!addr) return null;
  const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const balanceKnown = balance !== null;
  const total = balanceKnown
    ? parseFloat(balance.arc_usdc || "0") +
      parseFloat(balance.arbitrum_sepolia_usdc || "0")
    : 0;
  const empty = balanceKnown && !balance.has_funds;

  return (
    <button
      type="button"
      onClick={openFundModal}
      title={`Compass smart account ${addr} — click to fund`}
      className={clsx(
        "inline-flex items-center gap-2 px-3 py-[7px] rounded-pill border text-[12.5px] transition-colors",
        empty
          ? "border-amber/[0.4] bg-amber/[0.08] text-amber hover:bg-amber/[0.14]"
          : "border-line-2 text-silver-3 hover:text-silver-1 hover:border-line-3",
      )}
      aria-label="Open Compass account funding panel"
    >
      <i
        className={clsx(
          "w-[6px] h-[6px] rounded-full",
          empty ? "bg-amber animate-amber-pulse" : "bg-mint animate-mint-pulse",
        )}
      />
      <span className="hidden sm:inline font-mono">{short}</span>
      <span
        className={clsx(
          "font-mono text-[11.5px]",
          empty ? "text-amber" : "text-silver-2",
        )}
      >
        {!balanceKnown
          ? "…"
          : empty
            ? "0 USDC · Fund"
            : `${total.toFixed(total >= 1 ? 2 : 4)} USDC`}
      </span>
    </button>
  );
}
