"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";

import { Icon } from "@/components/visuals/Icon";
import { withdrawAll, type WithdrawResponse } from "@/lib/api";
import { txExplorerUrl } from "@/lib/explorers";
import { formatUsdc } from "@/lib/format";
import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";

export function WithdrawModal() {
  const open = useUIStore((s) => s.withdrawModalOpen);
  const close = useUIStore((s) => s.closeWithdrawModal);
  const balance = useUserStateStore((s) => s.balance);
  const position = useUserStateStore((s) => s.position);
  const refresh = useUserStateStore((s) => s.refresh);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<WithdrawResponse | null>(null);

  useEffect(() => {
    if (open) setResult(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, submitting, close]);

  if (!open) return null;

  const aaveHolding = position?.holdings.find(
    (h) =>
      h.venue.chain === "arbitrum_sepolia" && h.venue.protocol === "aave_v3",
  );
  const aaveAmount = aaveHolding ? BigInt(aaveHolding.amount) : 0n;
  const arbIdle = balance
    ? safeParse6dec(balance.arbitrum_sepolia_usdc_6dec)
    : 0n;
  const totalToBridge = aaveAmount + arbIdle;
  const nothingToWithdraw = totalToBridge === 0n;

  const smartAccount = balance?.smart_account;

  async function onWithdraw() {
    if (!balance?.user) {
      toast.error("Connect a wallet first.");
      return;
    }
    setSubmitting(true);
    try {
      const out = await withdrawAll(balance.user);
      setResult(out);
      const moved = BigInt(out.bridged_6dec);
      if (moved === 0n) {
        toast("Nothing to withdraw — agent is empty on Arbitrum.");
      } else {
        toast.success(`Bridged ${formatUsdc(moved)} USDC back to Arc`);
      }

      void refresh();
      window.setTimeout(() => void refresh(), 2500);
      window.setTimeout(() => void refresh(), 7000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Withdraw failed.";
      toast.error(msg.length > 160 ? `${msg.slice(0, 160)}…` : msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div
        onClick={() => {
          if (!submitting) close();
        }}
        aria-hidden
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-label="Unstake to your Compass account on Arc"
        className={clsx(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70]",
          "w-[560px] max-w-[92vw] rounded-[20px] border border-line-2",
          "bg-gradient-to-b from-[#0E1A33] to-arc-deep p-6 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)]",
        )}
      >
        <header className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-1">
              Unstake
            </div>
            <h2 className="font-display text-[20px] font-semibold text-silver-1 m-0 leading-[1.2]">
              Pull your AAVE position back to Arc
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!submitting) close();
            }}
            disabled={submitting}
            aria-label="Close"
            className="w-7 h-7 rounded-full border border-line-2 text-silver-3 hover:text-silver-1 hover:border-line-3 grid place-items-center disabled:opacity-40"
          >
            <Icon name="close" className="w-3.5 h-3.5" />
          </button>
        </header>

        <div className="mb-3 rounded-[14px] border border-line-2 bg-black/30 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
              <img
                src="/icons/arbitrum.svg"
                alt=""
                aria-hidden
                className="w-4 h-4"
              />
              On Arbitrum Sepolia
            </div>
            <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
              source
            </span>
          </div>
          <PositionRow
            label="AAVE v3"
            sub="lending position"
            value={aaveAmount}
          />
          <PositionRow
            label="Available"
            sub="uninvested"
            value={arbIdle}
          />
        </div>

        <div className="mb-3 flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
          <span>Circle Gateway</span>
          <Icon name="arrow-down" className="w-4 h-4" />
        </div>

        <div className="mb-4 rounded-[14px] border border-mint/[0.25] bg-mint/[0.04] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase text-mint">
              <img
                src="/icons/arc.svg"
                alt=""
                aria-hidden
                className="w-4 h-4"
              />
              On Arc
            </div>
            <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
              destination
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-display text-[13px] font-medium tracking-[-0.01em] text-silver-1">
                Compass account
              </div>
              {smartAccount && (
                <div className="mt-[2px] font-mono text-[10px] tracking-[0.04em] text-silver-4 truncate max-w-[280px]">
                  {smartAccount.slice(0, 10)}…{smartAccount.slice(-8)}
                </div>
              )}
            </div>
            <span className="font-mono [font-feature-settings:'tnum'] text-[16px] font-semibold text-mint">
              + {formatUsdc(totalToBridge)} USDC
            </span>
          </div>
        </div>

        {result ? (
          <ResultPanel result={result} />
        ) : (
          <>
            <div className="mb-4 text-[12.5px] text-silver-3 leading-[1.55]">
              Compass unstakes your AAVE position, bridges the full balance
              via Circle Gateway, and credits it back to your Compass
              account on Arc. Funds stay in your custody the whole time —
              run <b className="text-silver-1">Withdraw</b> after this to
              push them to your wallet.
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                className="px-4 py-2 rounded-pill border border-line-2 text-[13px] text-silver-3 hover:text-silver-1 hover:border-line-3 disabled:opacity-40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onWithdraw}
                disabled={submitting || nothingToWithdraw}
                className={clsx(
                  "inline-flex items-center gap-2 px-4 h-10 rounded-pill text-[13px] font-medium",
                  "transition-all duration-150",
                  "bg-silver-2 text-arc-deep",
                  "hover:bg-silver-1 hover:shadow-[0_6px_18px_-6px_rgba(255,255,255,0.45)]",
                  "active:scale-[0.96] active:shadow-none",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100",
                )}
              >
                {submitting && (
                  <span className="w-3 h-3 rounded-full border-[1.5px] border-arc-deep border-t-transparent animate-spin-fast" />
                )}
                {submitting
                  ? "Unstaking…"
                  : nothingToWithdraw
                    ? "Nothing on Arbitrum"
                    : "Unstake to Arc"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function PositionRow({
  label,
  sub,
  value,
}: {
  label: string;
  sub: string;
  value: bigint;
}) {
  const empty = value === 0n;
  return (
    <div className="flex items-baseline justify-between">
      <div>
        <div
          className={clsx(
            "font-display text-[13px] font-medium tracking-[-0.01em]",
            empty ? "text-silver-4" : "text-silver-1",
          )}
        >
          {label}
        </div>
        <div className="mt-[1px] font-mono text-[10px] tracking-[0.06em] uppercase text-silver-4">
          {sub}
        </div>
      </div>
      <span
        className={clsx(
          "font-mono [font-feature-settings:'tnum'] text-[14px] font-medium",
          empty ? "text-silver-4" : "text-silver-2",
        )}
      >
        {formatUsdc(value)} USDC
      </span>
    </div>
  );
}

function ResultPanel({ result }: { result: WithdrawResponse }) {
  const moved = BigInt(result.bridged_6dec);
  const isEmpty = moved === 0n;
  return (
    <div
      className={clsx(
        "rounded-[14px] border p-4 flex flex-col gap-3",
        isEmpty
          ? "border-line-2 bg-black/20"
          : "border-mint/[0.3] bg-mint/[0.06]",
      )}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
          {isEmpty ? "Nothing moved" : "Landed on Arc"}
        </span>
        <span
          className={clsx(
            "font-mono [font-feature-settings:'tnum'] text-[18px] font-semibold",
            isEmpty ? "text-silver-3" : "text-mint",
          )}
        >
          {formatUsdc(moved)} USDC
        </span>
      </div>
      {result.steps.length > 0 && (
        <ul className="list-none p-0 m-0 flex flex-col gap-2 text-[12px]">
          {result.steps.map((s) => {
            const url = txExplorerUrl(s.chain, s.tx_hash);
            return (
              <li
                key={`${s.label}-${s.tx_hash}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-silver-3 truncate">
                  {prettyStep(s.label)}
                </span>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[11px] text-silver-2 hover:text-silver-1 underline decoration-line-2 underline-offset-2 shrink-0"
                  >
                    {s.tx_hash.slice(0, 10)}… ↗
                  </a>
                ) : (
                  <span className="font-mono text-[11px] text-silver-3 shrink-0">
                    {s.tx_hash.slice(0, 10)}…
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function prettyStep(label: string): string {
  switch (label) {
    case "aave_withdraw":
      return "AAVE withdraw (Arbitrum)";
    case "gateway_delegate_authorized":
      return "Authorize Gateway delegate";
    case "gateway_deposit":
      return "Deposit to Gateway (Arbitrum)";
    case "burn_intent_attested":
      return "Circle attestation";
    case "mint_on_arc":
      return "Mint on Arc";
    default:
      return label;
  }
}

function safeParse6dec(raw: string | undefined): bigint {
  if (!raw) return 0n;
  try {
    return BigInt(raw);
  } catch {
    return 0n;
  }
}
