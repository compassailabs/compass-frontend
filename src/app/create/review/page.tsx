"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useAccount } from "wagmi";

import { useCompassStore } from "@/store/compass";
import { useUserStateStore } from "@/store/userState";
import { ProgressCard } from "@/components/wizard/ProgressCard";
import { StepHead } from "@/components/wizard/StepHead";
import { ContinueButton } from "@/components/wizard/ContinueButton";
import { HintFooter } from "@/components/wizard/HintFooter";
import {
  compilePolicyFromWizard,
  getMarkets,
  venueKey,
  type MarketEntry,
  type Policy,
} from "@/lib/api";

import { AllocationSection } from "./_components/AllocationSection";
import { GuardrailsSection } from "./_components/GuardrailsSection";
import { IdentitySection } from "./_components/IdentitySection";
import { PositionSection } from "./_components/PositionSection";
import { SignSection } from "./_components/SignSection";

export default function ReviewPage() {
  const { address } = useAccount();
  const strategy = useCompassStore((s) => s.strategy);
  const amount = useCompassStore((s) => s.amount);
  const selectedKeys = useCompassStore((s) => s.markets);
  const balance = useUserStateStore((s) => s.balance);

  const [markets, setMarkets] = useState<MarketEntry[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const { markets } = await getMarkets(ac.signal);
        setMarkets(markets);
      } catch {
        // Fall through — UI will show "—" for APR.
      }
    })();
    return () => ac.abort();
  }, []);

  const policy: Policy | null = useMemo(() => {
    if (!address) return null;
    return compilePolicyFromWizard({ user: address, strategy });
  }, [address, strategy]);

  const selectedMarkets = markets.filter((m) =>
    selectedKeys.includes(venueKey(m)),
  );
  const yieldVenues = selectedMarkets.filter((m) => m.is_yield_venue);
  const blendedApr =
    yieldVenues.length === 0
      ? 0
      : yieldVenues.reduce((s, m) => s + m.apr, 0) / yieldVenues.length;
  const yearlyEarn = amount * blendedApr;

  const allocations = useMemo(() => {
    if (selectedMarkets.length === 0) return [];
    if (yieldVenues.length > 0) {
      const per = 100 / yieldVenues.length;
      return selectedMarkets.map((m) => ({
        venue: m,
        pct: m.is_yield_venue ? per : 0,
      }));
    }
    const per = 100 / selectedMarkets.length;
    return selectedMarkets.map((m) => ({ venue: m, pct: per }));
  }, [selectedMarkets, yieldVenues]);

  const strategyLabel =
    strategy === "conservative"
      ? "Conservative"
      : strategy === "growth"
        ? "Growth"
        : "Balanced";

  const smartAccount = balance?.smart_account ?? null;

  return (
    <>
      <ProgressCard />
      <StepHead
        agentTag="Compass · ready"
        title={
          <>
            Ready to deploy. <em>Take a look.</em>
          </>
        }
        subtitle="This is the policy I'll commit on-chain. Reversible anytime — you can pause or modify in chat."
        cta={
          <ContinueButton
            from="review"
            label="Sign & deploy"
            icon={
              <svg
                viewBox="0 0 24 24"
                className="w-[14px] h-[14px] stroke-current fill-none stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
              >
                <path d="M3 17c4-3 6-6 9-6s5 3 9 0" />
                <path d="M3 21h18" />
              </svg>
            }
          />
        }
      />

      <div
        className={clsx(
          "grid gap-[14px] grid-cols-[1.4fr_1fr]",
          "[grid-template-areas:'identity_identity''position_guardrails''allocation_guardrails''allocation_sign']",
          "max-[1080px]:grid-cols-1",
          "max-[1080px]:[grid-template-areas:'identity''position''allocation''guardrails''sign']",
        )}
      >
        <IdentitySection
          strategyLabel={strategyLabel}
          smartAccount={smartAccount}
          address={address}
        />
        <PositionSection amount={amount} address={address} />
        <GuardrailsSection policy={policy} />
        <AllocationSection
          strategyLabel={strategyLabel}
          blendedApr={blendedApr}
          yearlyEarn={yearlyEarn}
          amount={amount}
          allocations={allocations}
          yieldVenuesCount={yieldVenues.length}
          totalVenuesCount={selectedMarkets.length}
        />
        <SignSection address={address} />
      </div>

      <HintFooter
        text={
          <>
            Press <b>Enter</b> to sign and deploy.
          </>
        }
        kbd="Sign & deploy"
      />
    </>
  );
}
