"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useAccount } from "wagmi";

import { getEarnings, type EarningsResponse, type MarketEntry, getMarkets } from "@/lib/api";
import { formatUsdc } from "@/lib/format";

/**
 * Giza-style hero card: big "Current value" headline + Net deposited /
 * Net earned / APR stat row. Pulls /earnings (on-chain Transfer log
 * scan) and /markets (live AAVE rate) on mount + every time the
 * userState store's session updates.
 *
 * Tooltips break out the math users care about — Net earned splits
 * into `Earned − Fee = Net`, APR splits into `APR · Performance fee`.
 * Performance fee is locked at 0% on testnet; the schema is in place
 * so flipping it on in production is a one-line Policy change.
 */
export function EarningsCard() {
  // Source of truth for "who is the user" — wagmi's connected EOA.
  // Don't read from session.user: it's stale after a wallet switch
  // and undefined until session setup completes.
  const { address: user } = useAccount();

  const [earnings, setEarnings] = useState<EarningsResponse | null>(null);
  const [aprPct, setAprPct] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const ac = new AbortController();
    (async () => {
      try {
        const [e, m] = await Promise.all([
          getEarnings(user, ac.signal),
          getMarkets(ac.signal),
        ]);
        setEarnings(e);
        // Use the best live yield venue's APR — matches what the
        // engine routes to on rebalance.
        const best = m.markets
          .filter((mk: MarketEntry) => mk.is_yield_venue && mk.status === "live")
          .reduce((max: number, mk: MarketEntry) => Math.max(max, mk.apr), 0);
        if (best > 0) setAprPct(best * 100);
      } catch {
        // Render with placeholders; not blocking the page.
      }
    })();
    return () => ac.abort();
  }, [user]);

  // Loading / no-data: render a quiet shell instead of jumping in.
  if (!user || !earnings) {
    return (
      <section className="rounded-[20px] border border-line-2 bg-gradient-to-b from-white/[0.05] to-white/[0.015] backdrop-blur-xl p-6">
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-3">
          Current value
        </div>
        <div className="font-display text-[42px] font-semibold tracking-[-0.025em] text-silver-3 leading-none">
          —
        </div>
      </section>
    );
  }

  const netDeposited = safeParse(earnings.net_deposited_6dec);
  const currentValue = safeParse(earnings.current_value_6dec);
  const grossEarned = parseSigned(earnings.gross_earned_6dec);
  const fee = safeParse(earnings.fee_6dec);
  const netEarned = parseSigned(earnings.net_earned_6dec);
  const feePct = earnings.performance_fee_pct;

  return (
    <section className="rounded-[20px] border border-line-2 bg-gradient-to-b from-white/[0.05] to-white/[0.015] backdrop-blur-xl p-6 flex flex-col gap-5">
      {/* Hero — current value */}
      <div>
        <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-2">
          Current value
        </div>
        <div className="font-display text-[42px] font-semibold tracking-[-0.025em] text-silver-1 leading-none [font-feature-settings:'tnum']">
          ${formatUsdc(currentValue)}
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-6 pt-5 border-t border-line-1">
        <Stat
          label="Net deposited"
          value={`${formatUsdc(netDeposited)} USDC`}
        />
        <Stat
          label="Net earned"
          value={<SignedValue raw={netEarned} positive="text-mint" />}
          tooltip={
            <FeeTooltip
              gross={grossEarned}
              fee={fee}
              net={netEarned}
              feePct={feePct}
            />
          }
        />
        <Stat
          label="APR"
          value={aprPct !== null ? `${aprPct.toFixed(2)}%` : "—"}
          tooltip={<AprTooltip aprPct={aprPct} feePct={feePct} />}
        />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
}) {
  return (
    <div className="relative group flex flex-col gap-1.5">
      <div className="flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
        {label}
        {tooltip && (
          <InfoDot />
        )}
      </div>
      <div className="font-display text-[18px] font-medium tracking-[-0.018em] text-silver-1 [font-feature-settings:'tnum'] leading-none">
        {value}
      </div>
      {tooltip && (
        <div className="absolute left-0 bottom-full mb-2 z-20 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
          {tooltip}
        </div>
      )}
    </div>
  );
}

function InfoDot() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-3 h-3 text-silver-5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round]"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5M12 8h.01" />
    </svg>
  );
}

function SignedValue({
  raw,
  positive,
}: {
  raw: { sign: 1 | -1; value: bigint };
  positive: string;
}) {
  if (raw.value === 0n) {
    return <span className="text-silver-2">0.00 USDC</span>;
  }
  if (raw.sign === 1) {
    return (
      <span className={positive}>
        +{formatUsdc(raw.value)} USDC
      </span>
    );
  }
  return (
    <span className="text-amber">
      −{formatUsdc(raw.value)} USDC
    </span>
  );
}

function FeeTooltip({
  gross,
  fee,
  net,
  feePct,
}: {
  gross: { sign: 1 | -1; value: bigint };
  fee: bigint;
  net: { sign: 1 | -1; value: bigint };
  feePct: number;
}) {
  return (
    <div className="min-w-[260px] rounded-[12px] border border-line-2 bg-[#0E1A33] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)] p-3 flex flex-col gap-2 text-[12px]">
      <Row k="Earned" v={signedDisplay(gross, "USDC")} />
      <Row k={`Fee (${feePct.toFixed(2)}%)`} v={`−${formatUsdc(fee)} USDC`} />
      <div className="border-t border-line-1 pt-2 mt-0.5 flex items-center justify-between">
        <span className="text-silver-3 font-medium">Net earned</span>
        <span
          className={clsx(
            "font-mono [font-feature-settings:'tnum'] font-semibold",
            net.sign === 1 ? "text-mint" : net.value === 0n ? "text-silver-2" : "text-amber",
          )}
        >
          {signedDisplay(net, "USDC")}
        </span>
      </div>
    </div>
  );
}

function AprTooltip({
  aprPct,
  feePct,
}: {
  aprPct: number | null;
  feePct: number;
}) {
  return (
    <div className="min-w-[220px] rounded-[12px] border border-line-2 bg-[#0E1A33] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.7)] p-3 flex flex-col gap-2 text-[12px]">
      <Row k="APR" v={aprPct !== null ? `${aprPct.toFixed(2)}%` : "—"} />
      <Row k="Performance fee" v={`${feePct.toFixed(2)}%`} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-silver-4">{k}</span>
      <span className="font-mono [font-feature-settings:'tnum'] text-silver-2">
        {v}
      </span>
    </div>
  );
}

function signedDisplay(
  { sign, value }: { sign: 1 | -1; value: bigint },
  unit: string,
): string {
  if (value === 0n) return `0.00 ${unit}`;
  const prefix = sign === 1 ? "" : "−";
  return `${prefix}${formatUsdc(value)} ${unit}`;
}

function safeParse(raw: string | undefined): bigint {
  if (!raw) return 0n;
  try {
    return BigInt(raw);
  } catch {
    return 0n;
  }
}

/** "-12345" → { sign: -1, value: 12345n }. */
function parseSigned(raw: string | undefined): { sign: 1 | -1; value: bigint } {
  if (!raw) return { sign: 1, value: 0n };
  const trimmed = raw.startsWith("-") ? raw.slice(1) : raw;
  const sign: 1 | -1 = raw.startsWith("-") ? -1 : 1;
  try {
    return { sign, value: BigInt(trimmed) };
  } catch {
    return { sign: 1, value: 0n };
  }
}
