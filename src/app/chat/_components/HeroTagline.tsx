"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

import { getMarkets, type MarketEntry } from "@/lib/api";

export function HeroTagline() {
  const [apr, setApr] = useState<number | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const { markets } = await getMarkets(ac.signal);
        const best = markets
          .filter((m: MarketEntry) => m.is_yield_venue && m.status === "live")
          .reduce((max: number, m: MarketEntry) => Math.max(max, m.apr), 0);
        if (best > 0) setApr(best);
      } catch {
        // silent — chip stays in placeholder state
      }
    })();
    return () => ac.abort();
  }, []);

  const aprStr = apr !== null ? `${(apr * 100).toFixed(2)}%` : "—";

  return (
    <h1 className="font-display text-[32px] md:text-[40px] font-semibold tracking-[-0.025em] text-silver-1 m-0 leading-[1.35]">
      Your{" "}
      <span className="inline-flex items-center align-middle gap-3 pl-3 pr-4 py-[8px] rounded-2xl bg-white/[0.05] border border-line-2">
        <img
          src="/icons/usdc.svg"
          alt=""
          aria-hidden
          className="w-[1.5em] h-[1.5em] shrink-0"
        />
        <span className="flex flex-col items-start gap-[2px]">
          <span
            className={clsx(
              "text-[0.92em] font-semibold tracking-[-0.02em] leading-none [font-feature-settings:'tnum'] transition-opacity duration-300",
              apr !== null ? "text-mint opacity-100" : "text-mint/40 opacity-70",
            )}
          >
            {aprStr}
          </span>
          <span className="inline-flex items-center gap-[5px] font-mono text-[0.3em] tracking-[0.12em] uppercase leading-none text-silver-4">
            <span className="w-[5px] h-[5px] rounded-full bg-mint shrink-0" />
            USDC · AAVE
          </span>
        </span>
      </span>
      , always{" "}
      <span className="bg-gradient-to-r from-mint via-[#9FEFCB] to-mint bg-clip-text text-transparent">
        earning.
      </span>
    </h1>
  );
}
