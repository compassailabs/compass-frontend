"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

import { getMarkets, type MarketEntry, type ProtocolId } from "@/lib/api";

function ProtocolIcon({ protocol }: { protocol: ProtocolId | undefined }) {
  if (protocol === "aave_v3") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/icons/aave.svg"
        alt=""
        aria-hidden
        className="w-[1em] h-[1em] shrink-0 rounded-[3px]"
      />
    );
  }
  return <span className="w-[5px] h-[5px] rounded-full bg-mint shrink-0" />;
}

function protocolLabel(protocol: ProtocolId | undefined): string {
  switch (protocol) {
    case "aave_v3":
      return "AAVE V3";
    case "idle":
      return "Wallet";
    default:
      return "—";
  }
}

function venueUrl(m: MarketEntry): string | null {
  if (m.protocol === "aave_v3" && m.chain === "arbitrum_sepolia") {
    return "https://app.aave.com/reserve-overview/?underlyingAsset=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d&marketName=proto_arbitrum_sepolia_v3";
  }
  return null;
}

export function HeroTagline() {
  const [best, setBest] = useState<MarketEntry | null>(null);
  const [rotations, setRotations] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const { markets } = await getMarkets(ac.signal);
        const winner = markets
          .filter((m) => m.is_yield_venue && m.status === "live")
          .reduce<MarketEntry | null>(
            (acc, m) => (acc === null || m.apr > acc.apr ? m : acc),
            null,
          );
        if (winner) setBest(winner);
      } catch {
        // silent — pill stays in placeholder state
      }
    })();
    return () => ac.abort();
  }, []);

  const apr = best?.apr ?? null;
  const aprStr = apr !== null ? `${(apr * 100).toFixed(2)}%` : "—";
  const href = best ? venueUrl(best) : null;

  const onEnter = () => setRotations((r) => r + 1);

  const pillClass = clsx(
    "group inline-flex items-center align-middle gap-3 pl-3 pr-4 py-[8px] rounded-2xl border transition-colors duration-200",
    href
      ? "bg-white/[0.05] border-line-2 hover:bg-mint/[0.10] hover:border-mint hover:shadow-[0_0_0_1px_rgba(110,231,183,0.5),0_0_24px_-4px_rgba(110,231,183,0.35)] cursor-pointer"
      : "bg-white/[0.05] border-line-2",
  );

  const pillContent = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/usdc.svg"
        alt=""
        aria-hidden
        className="w-[1.5em] h-[1.5em] shrink-0"
        style={{
          transform: `rotate(${rotations * 360}deg)`,
          transition: "transform 700ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
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
          <ProtocolIcon protocol={best?.protocol} />
          {protocolLabel(best?.protocol)}
        </span>
      </span>
    </>
  );

  return (
    <h1 className="font-display text-[32px] md:text-[40px] font-semibold tracking-[-0.025em] text-silver-1 m-0 leading-[1.35]">
      Your{" "}
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={onEnter}
          className={pillClass}
          aria-label={`Open ${protocolLabel(best?.protocol)} USDC reserve on AAVE`}
        >
          {pillContent}
        </a>
      ) : (
        <span onMouseEnter={onEnter} className={pillClass}>
          {pillContent}
        </span>
      )}
      , always{" "}
      <span className="bg-gradient-to-r from-mint via-[#9FEFCB] to-mint bg-clip-text text-transparent">
        earning.
      </span>
    </h1>
  );
}
