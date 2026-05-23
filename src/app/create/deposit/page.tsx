"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseUnits, formatUnits } from "viem";
import { toast } from "sonner";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { useCompassStore } from "@/store/compass";
import { useUserStateStore } from "@/store/userState";
import { ProgressCard } from "@/components/wizard/ProgressCard";
import { StepHead } from "@/components/wizard/StepHead";
import { HintFooter } from "@/components/wizard/HintFooter";
import { arcTestnet } from "@/lib/wagmi";
import { ARC_USDC_ADDRESS, ERC20_ABI } from "@/lib/tokens";
import { txExplorerUrl } from "@/lib/explorers";
import { stepHref } from "@/lib/path";
import {
  getMarkets,
  recordFunded,
  venueKey,
  type MarketEntry,
} from "@/lib/api";

import { AllocationPreviewPane } from "./_components/AllocationPreviewPane";
import { AmountInputPane } from "./_components/AmountInputPane";
import { DepositCta } from "./_components/DepositCta";
import { MIN_DEPOSIT } from "./_components/constants";

/**
 * Wizard step 3 — **Deposit**. Orchestrator only. Two-pane layout
 * (`AmountInputPane` left, `AllocationPreviewPane` right) + a custom
 * `DepositCta` in the StepHead slot that fires the real on-chain
 * USDC.transfer flow.
 *
 * All numbers shown to the user come from real sources: EOA balance
 * from wagmi, smart account balance from `/balance`, APRs from
 * `/markets`. Continue → signs the transfer → records the funding
 * event server-side → navigates to Review.
 */
export default function DepositPage() {
  const router = useRouter();
  const amount = useCompassStore((s) => s.amount);
  const setAmount = useCompassStore((s) => s.setAmount);
  const strategy = useCompassStore((s) => s.strategy);
  const selectedKeys = useCompassStore((s) => s.markets);
  const setSelectedKeys = useCompassStore((s) => s.setMarkets);
  const refresh = useUserStateStore((s) => s.refresh);
  const balance = useUserStateStore((s) => s.balance);

  const { address: eoa, isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const [markets, setMarkets] = useState<MarketEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pendingHash, setPendingHash] = useState<`0x${string}` | null>(null);
  // Raw 6-dec amount captured at submit so the receipt handler can
  // POST `/funded` with the right number.
  const [pendingAmount6dec, setPendingAmount6dec] = useState<string | null>(
    null,
  );

  // ── EOA USDC balance on Arc (source of funds). /balance reports
  //    the smart-account balance, not the EOA, so we read direct. ──
  const { data: eoaUsdcRaw, refetch: refetchEoaBalance } = useReadContract({
    chainId: arcTestnet.id,
    address: ARC_USDC_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: eoa ? [eoa] : undefined,
    query: { enabled: !!eoa },
  });
  const eoaUsdc = eoaUsdcRaw
    ? parseFloat(formatUnits(eoaUsdcRaw as bigint, 6))
    : 0;
  const alreadyInSmartAccount = balance ? parseFloat(balance.arc_usdc) : 0;

  const { data: receipt, isLoading: confirming } =
    useWaitForTransactionReceipt({
      hash: pendingHash ?? undefined,
      chainId: arcTestnet.id,
    });

  // ── Live markets for APR / allocation preview ──
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const { markets } = await getMarkets(ac.signal);
        setMarkets(markets);
      } catch {
        // header falls back to "—" if this fails
      }
    })();
    return () => ac.abort();
  }, []);

  // Default-fill markets so the preset path (which skips Markets) still
  // gets an allocation preview + a valid policy.
  useEffect(() => {
    if (selectedKeys.length === 0 && markets.length > 0) {
      const defaults = markets
        .filter((m) => m.is_yield_venue && m.status === "live")
        .map(venueKey);
      if (defaults.length > 0) setSelectedKeys(defaults);
    }
  }, [markets, selectedKeys.length, setSelectedKeys]);

  // Refresh smart-account balance on entry so the "already deposited"
  // line reflects what just landed from a previous Fund or session
  // setup.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // ── Once the deposit transfer confirms, refresh both balances and
  //   navigate to Review. The 2s/5s reruns defeat RPC index lag (Arc
  //   sometimes shows stale balances 1-3s after the block confirms);
  //   fire-and-forget so navigating away from Deposit doesn't cancel
  //   them — both refresh fns just update the global zustand store. ──
  useEffect(() => {
    if (!receipt || !pendingHash) return;
    if (receipt.status === "success") {
      toast.success("Deposit confirmed");
      // Record the deposit in the DB so /earnings picks it up. Fire
      // and forget — failure is non-blocking; idempotent on tx_hash.
      if (eoa && pendingAmount6dec) {
        void recordFunded(eoa, {
          chain: "arc",
          kind: "deposit",
          amount_6dec: pendingAmount6dec,
          tx_hash: pendingHash,
        }).catch(() => {});
      }
      void refresh();
      void refetchEoaBalance();
      window.setTimeout(() => {
        void refresh();
        void refetchEoaBalance();
      }, 2000);
      window.setTimeout(() => {
        void refresh();
        void refetchEoaBalance();
      }, 5000);
      setPendingHash(null);
      setPendingAmount6dec(null);
      router.push(stepHref("review", useCompassStore.getState().path));
      return;
    }
    toast.error("Deposit reverted on-chain.");
    setPendingHash(null);
    setPendingAmount6dec(null);
  }, [
    receipt,
    pendingHash,
    pendingAmount6dec,
    eoa,
    refresh,
    refetchEoaBalance,
    router,
  ]);

  const selectedMarkets = useMemo(
    () => markets.filter((m) => selectedKeys.includes(venueKey(m))),
    [markets, selectedKeys],
  );
  const yieldVenues = selectedMarkets.filter((m) => m.is_yield_venue);
  // Blended APR = simple average of yield venues; matches the engine's
  // diversification heuristic (it splits evenly across non-capped
  // candidates). For one yield venue this is just that venue's rate.
  const blendedApr =
    yieldVenues.length === 0
      ? 0
      : yieldVenues.reduce((s, m) => s + m.apr, 0) / yieldVenues.length;
  const earn = amount * blendedApr;

  const inputValid =
    amount > MIN_DEPOSIT && amount <= eoaUsdc && selectedMarkets.length > 0;
  const canSubmit =
    inputValid &&
    isConnected &&
    !submitting &&
    !confirming &&
    !!balance?.smart_account;

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d.]/g, "");
    const n = raw === "" ? 0 : parseFloat(raw);
    if (Number.isFinite(n)) setAmount(n);
  };

  async function onDeposit() {
    if (!isConnected || !eoa) {
      toast.error("Connect a wallet first.");
      return;
    }
    const smartAccount = balance?.smart_account;
    if (!smartAccount) {
      toast.error("Smart account not ready. Try again in a moment.");
      return;
    }
    let raw: bigint;
    try {
      raw = parseUnits(String(amount), 6);
    } catch {
      toast.error("Invalid amount.");
      return;
    }
    if (raw === 0n) {
      toast.error("Amount must be greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      if (currentChainId !== arcTestnet.id) {
        await switchChainAsync({ chainId: arcTestnet.id });
      }
      const hash = await writeContractAsync({
        chainId: arcTestnet.id,
        address: ARC_USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [smartAccount as `0x${string}`, raw],
      });
      const txUrl = txExplorerUrl("arc", hash);
      toast.success(`Deposit sent · ${hash.slice(0, 10)}…`, {
        action: txUrl
          ? {
              label: "View",
              onClick: () => window.open(txUrl, "_blank", "noopener"),
            }
          : undefined,
      });
      setPendingHash(hash);
      setPendingAmount6dec(raw.toString());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Deposit failed.";
      toast.error(msg.length > 140 ? `${msg.slice(0, 140)}…` : msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Allocation = 100% to AAVE v3 if it's in the selection. If only
  // Wallet venues are selected, split evenly so the bar isn't empty.
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

  const ctaLabel = !isConnected
    ? "Connect wallet"
    : submitting
      ? "Confirm in wallet…"
      : confirming
        ? "Settling on-chain…"
        : amount > eoaUsdc
          ? "Insufficient balance"
          : amount <= 0
            ? "Enter an amount"
            : "Deposit & continue";

  return (
    <>
      <ProgressCard />
      <StepHead
        agentTag="Compass · proposes"
        title={
          <>
            How much USDC <em>should I manage?</em>
          </>
        }
        subtitle="Pick how much to move from your wallet into your Compass account. After this transfer I can route it for yield."
        cta={
          <DepositCta
            label={ctaLabel}
            disabled={!canSubmit}
            spinning={submitting || confirming}
            showArrow={canSubmit}
            onClick={onDeposit}
          />
        }
      />

      <div className="grid grid-cols-[1.2fr_1fr] gap-4 items-stretch max-[1080px]:grid-cols-1">
        <AmountInputPane
          amount={amount}
          onAmountChange={onAmountChange}
          setAmount={setAmount}
          eoaUsdc={eoaUsdc}
          alreadyInSmartAccount={alreadyInSmartAccount}
          eoa={eoa}
          isConnected={isConnected}
          submitting={submitting}
          confirming={confirming}
        />
        <AllocationPreviewPane
          strategyLabel={strategyLabel}
          blendedApr={blendedApr}
          earn={earn}
          allocations={allocations}
          selectedMarketsCount={selectedMarkets.length}
          yieldVenuesCount={yieldVenues.length}
        />
      </div>

      <HintFooter
        text={
          <>
            Type or pick a preset, then click{" "}
            <b>Deposit &amp; continue</b> to sign the transfer.
          </>
        }
      />
    </>
  );
}
