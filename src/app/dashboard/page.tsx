"use client";

import { useAccount } from "wagmi";
import { toast } from "sonner";

import { EarningsCard } from "@/components/account/EarningsCard";
import { SmartAccountCard } from "@/components/account/SmartAccountCard";
import { pausePolicy, resumePolicy } from "@/lib/api";
import { useUserStateStore } from "@/store/userState";

import { AuditFeed } from "./_components/AuditFeed";
import { DistributionCard } from "./_components/DistributionCard";
import { EmptyHoldingsCard } from "./_components/EmptyHoldingsCard";
import { EmptyShell } from "./_components/EmptyShell";
import { HoldingsCard } from "./_components/HoldingsCard";
import { PolicyControlsCard } from "./_components/PolicyControlsCard";
import { StrategyStatus } from "./_components/StrategyStatus";
import { aggregateBy } from "./_components/aggregateBy";

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const position = useUserStateStore((s) => s.position);
  const policy = useUserStateStore((s) => s.policy);
  const session = useUserStateStore((s) => s.session);
  const balance = useUserStateStore((s) => s.balance);
  const audit = useUserStateStore((s) => s.audit);
  const refresh = useUserStateStore((s) => s.refresh);

  if (!isConnected) {
    return (
      <EmptyShell
        title="Connect a wallet"
        body="Connect your wallet to see what Compass is running on your behalf."
      />
    );
  }

  if (session && !session.ready) {
    return (
      <EmptyShell
        title="Finish setup first"
        body="Your Compass account isn't deployed yet. Click the amber Setup pill in the header — it takes one signature."
      />
    );
  }

  async function onPause() {
    if (!address) return;
    try {
      await pausePolicy(address);
      toast.success("Policy paused.");
      void refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Pause failed.");
    }
  }

  async function onResume() {
    if (!address) return;
    try {
      await resumePolicy(address);
      toast.success("Policy resumed.");
      void refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Resume failed.");
    }
  }

  const holdings = (position?.holdings ?? []).filter(
    (h) => BigInt(h.amount) >= 10_000n,
  );
  const total = holdings.reduce((acc, h) => acc + BigInt(h.amount), 0n);
  const empty = holdings.length === 0 || total === 0n;

  const sorted = [...holdings].sort(
    (a, b) => Number(BigInt(b.amount) - BigInt(a.amount)),
  );
  const byChain = aggregateBy(sorted, (h) => h.venue.chain);
  const byProtocol = aggregateBy(sorted, (h) => h.venue.protocol);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 py-10 flex flex-col gap-6">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-1">
              Dashboard
            </div>
            <h1 className="m-0 font-display text-[28px] font-semibold tracking-[-0.022em] text-silver-1 leading-[1.15]">
              Your Compass portfolio
            </h1>
          </div>
          <StrategyStatus policy={policy} />
        </header>

        <EarningsCard />

        <SmartAccountCard />

        {empty ? (
          <EmptyHoldingsCard
            hasPolicy={!!policy}
            hasFunds={balance?.has_funds ?? false}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            <HoldingsCard holdings={sorted} total={total} />
            <div className="flex flex-col gap-6">
              <DistributionCard
                label="By chain"
                parts={byChain}
                total={total}
                kind="chain"
              />
              <DistributionCard
                label="By protocol"
                parts={byProtocol}
                total={total}
                kind="protocol"
              />
            </div>
          </div>
        )}

        {policy && (
          <PolicyControlsCard
            policy={policy}
            onPause={onPause}
            onResume={onResume}
          />
        )}

        <AuditFeed events={audit} />
      </div>
    </div>
  );
}
