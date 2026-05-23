"use client";

import { useEffect, useState } from "react";

import { useCompassStore } from "@/store/compass";
import { ProgressCard } from "@/components/wizard/ProgressCard";
import { StepHead } from "@/components/wizard/StepHead";
import { ContinueButton } from "@/components/wizard/ContinueButton";
import { HintFooter } from "@/components/wizard/HintFooter";
import { getMarkets, type MarketEntry } from "@/lib/api";

import { CustomPathCard } from "./_components/CustomPathCard";
import { StrategyCard } from "./_components/StrategyCard";
import { STRATEGIES } from "./_components/strategies";

export default function StrategyPage() {
  const strategy = useCompassStore((s) => s.strategy);
  const setStrategy = useCompassStore((s) => s.setStrategy);
  const selected = STRATEGIES.find((s) => s.id === strategy) ?? STRATEGIES[1];

  const [markets, setMarkets] = useState<MarketEntry[]>([]);
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const { markets } = await getMarkets(ac.signal);
        setMarkets(markets);
      } catch {
        // ignore — APR badge falls back to "—"
      }
    })();
    return () => ac.abort();
  }, []);

  const bestApr = markets
    .filter((m) => m.is_yield_venue)
    .reduce((max, m) => Math.max(max, m.apr), 0);
  const liveAprStr =
    markets.length === 0 ? "—" : `${(bestApr * 100).toFixed(2)}%`;
  const liveVenueCount = markets.filter((m) => m.status === "live").length;

  return (
    <>
      <ProgressCard />
      <StepHead
        agentTag="Compass · asks"
        title={
          <>
            How much risk <em>should I take?</em>
          </>
        }
        subtitle="Pick a default. I'll route within the venues you allow — you can override every knob in chat later."
        cta={
          <ContinueButton
            from="strategy"
            label={`Continue with ${selected.title}`}
          />
        }
      />

      <div className="grid grid-cols-3 gap-[14px] max-[1180px]:grid-cols-2 max-[880px]:grid-cols-1">
        {STRATEGIES.map((s) => (
          <StrategyCard
            key={s.id}
            s={s}
            isSelected={s.id === strategy}
            liveAprStr={liveAprStr}
            onSelect={() => setStrategy(s.id)}
          />
        ))}
      </div>

      <CustomPathCard liveVenueCount={liveVenueCount} />

      <HintFooter
        text={
          <>
            Press <b>Enter</b> to continue with the selected profile.
          </>
        }
      />
    </>
  );
}
