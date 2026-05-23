"use client";

import clsx from "clsx";

import { useUserStateStore } from "@/store/userState";

export function PolicyControlsCard({
  policy,
  onPause,
  onResume,
}: {
  policy: NonNullable<ReturnType<typeof useUserStateStore.getState>["policy"]>;
  onPause: () => void;
  onResume: () => void;
}) {
  const paused = policy.status === "paused";
  return (
    <section className="rounded-[18px] border border-line-2 bg-white/[0.03] backdrop-blur-xl p-5 flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
          Policy v1
        </span>
        <button
          type="button"
          onClick={paused ? onResume : onPause}
          className={clsx(
            "px-3 py-1.5 rounded-pill border text-[11.5px] font-medium transition-colors",
            paused
              ? "border-mint/[0.35] text-mint hover:bg-mint/[0.08]"
              : "border-line-2 text-silver-3 hover:text-silver-1 hover:border-line-3",
          )}
        >
          {paused ? "Resume engine" : "Pause engine"}
        </button>
      </header>
      <dl className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-[12px]">
        <Kv k="cap / venue" v={`${policy.protocols.per_protocol_cap_pct}%`} />
        <Kv k="apr Δ trigger" v={`${policy.triggers.apr_delta_bps} bps`} />
        <Kv k="max actions / day" v={String(policy.caps.max_actions_per_day)} />
        <Kv k="min profit" v={`$${policy.caps.min_net_profit_usd}`} />
        <Kv k="max gas / action" v={`$${policy.gas.max_gas_usd_per_action}`} />
        <Kv k="peg floor" v={`$${policy.circuit_breakers.usdc_peg_min}`} />
      </dl>
    </section>
  );
}

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col">
      <dt className="font-mono text-[9px] tracking-[0.12em] uppercase text-silver-4">
        {k}
      </dt>
      <dd className="font-mono text-[12px] text-silver-1 [font-feature-settings:'tnum']">
        {v}
      </dd>
    </div>
  );
}
