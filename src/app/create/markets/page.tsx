"use client";

import { useEffect, useMemo, useState } from "react";

import { useCompassStore } from "@/store/compass";
import { ProgressCard } from "@/components/wizard/ProgressCard";
import { StepHead } from "@/components/wizard/StepHead";
import { ContinueButton } from "@/components/wizard/ContinueButton";
import { HintFooter } from "@/components/wizard/HintFooter";
import { getMarkets, venueKey, type MarketEntry } from "@/lib/api";

import { Filters } from "./_components/Filters";
import { MarketCard } from "./_components/MarketCard";
import { SelectionBar } from "./_components/SelectionBar";
import {
  MIN_MARKETS,
  type ChainFilter,
  type ProtocolFilter,
} from "./_components/types";

/**
 * Wizard step 2 — venue picker. The engine only routes to the three
 * venues compass-rs `Snapshot.venues` knows about; we fetch the list
 * (with live APR) from `/markets` so what the user sees here is
 * exactly what the evaluator considers on each tick.
 *
 * Page logic only — `Filters`, `SelectionBar`, and `MarketCard` live
 * in `_components/`.
 */
export default function MarketsPage() {
  const selected = useCompassStore((s) => s.markets);
  const setMarkets = useCompassStore((s) => s.setMarkets);
  const toggle = useCompassStore((s) => s.toggleMarket);

  const [markets, setMarketsList] = useState<MarketEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [chainFilter, setChainFilter] = useState<ChainFilter>("all");
  const [protocolFilter, setProtocolFilter] = useState<ProtocolFilter>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const { markets } = await getMarkets(ac.signal);
        setMarketsList(markets);
      } catch (e) {
        if (ac.signal.aborted) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load markets");
      }
    })();
    return () => ac.abort();
  }, []);

  // Default-select all yield venues the first time the wizard sees the
  // markets list. Re-selecting on every visit would clobber the user's
  // pruning, so only fill if `selected` is genuinely empty.
  useEffect(() => {
    if (selected.length === 0 && markets.length > 0) {
      const defaults = markets
        .filter((m) => m.is_yield_venue && m.status === "live")
        .map(venueKey);
      if (defaults.length > 0) setMarkets(defaults);
    }
  }, [markets, selected.length, setMarkets]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return markets.filter((m) => {
      if (chainFilter !== "all" && m.chain !== chainFilter) return false;
      if (protocolFilter === "aave" && m.protocol !== "aave_v3") return false;
      if (protocolFilter === "idle" && m.protocol !== "idle") return false;
      if (q && !m.label.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [markets, chainFilter, protocolFilter, search]);

  const selectedMarkets = markets.filter((m) => selected.includes(venueKey(m)));
  const yieldSelected = selectedMarkets.filter((m) => m.is_yield_venue);
  const blendedApr =
    yieldSelected.length === 0
      ? 0
      : yieldSelected.reduce((sum, m) => sum + m.apr, 0) / yieldSelected.length;

  const enough = selected.length >= MIN_MARKETS;
  const continueLabel = enough
    ? `Review with ${selected.length} venue${selected.length === 1 ? "" : "s"}`
    : `Pick at least ${MIN_MARKETS} venue`;

  return (
    <>
      <ProgressCard />
      <StepHead
        agentTag="Compass · asks"
        title={
          <>
            Which markets <em>can I use?</em>
          </>
        }
        subtitle="These are the venues the engine knows how to route to today. Pick at least one — I'll diversify across the ones you allow."
        cta={
          <ContinueButton
            from="markets"
            label={continueLabel}
            disabled={!enough}
          />
        }
      />

      <Filters
        chainFilter={chainFilter}
        setChainFilter={setChainFilter}
        protocolFilter={protocolFilter}
        setProtocolFilter={setProtocolFilter}
        search={search}
        setSearch={setSearch}
      />

      <SelectionBar
        selectedCount={selected.length}
        blendedApr={blendedApr}
      />

      {loadError && (
        <div className="mb-[14px] px-4 py-3 rounded-[12px] border border-amber/[0.3] bg-amber/[0.06] text-[12.5px] text-amber">
          Couldn&apos;t load markets — {loadError}. Showing nothing.
        </div>
      )}

      {markets.length === 0 && !loadError && (
        <div className="text-center py-12 text-silver-4 text-[13px]">
          Loading venues from the engine…
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 max-[1080px]:grid-cols-2 max-[880px]:grid-cols-1">
        {visible.map((m) => {
          const key = venueKey(m);
          return (
            <MarketCard
              key={key}
              m={m}
              isSelected={selected.includes(key)}
              onToggle={() => toggle(key)}
            />
          );
        })}
      </div>

      <HintFooter
        text={
          <>
            Tap cards to add or remove. Press <b>Enter</b> when ready.
          </>
        }
      />
    </>
  );
}
