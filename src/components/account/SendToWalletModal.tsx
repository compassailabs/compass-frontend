"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import { useAccount } from "wagmi";

import { sendToWallet, type SendToWalletResponse } from "@/lib/api";
import { txExplorerUrl } from "@/lib/explorers";
import { formatUsdc } from "@/lib/format";
import { useUIStore } from "@/store/ui";
import { useUserStateStore } from "@/store/userState";

export function SendToWalletModal() {
  const open = useUIStore((s) => s.sendToWalletModalOpen);
  const close = useUIStore((s) => s.closeSendToWalletModal);
  const balance = useUserStateStore((s) => s.balance);
  const refresh = useUserStateStore((s) => s.refresh);
  const { address: eoa } = useAccount();

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SendToWalletResponse | null>(null);

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

  const arcIdle = balance ? safeParse6dec(balance.arc_usdc_6dec) : 0n;
  const smartAccount = balance?.smart_account;
  const nothingToSend = arcIdle === 0n;

  async function onSend() {
    if (!eoa) {
      toast.error("Connect a wallet first.");
      return;
    }
    setSubmitting(true);
    try {
      const out = await sendToWallet(eoa);
      setResult(out);
      const moved = BigInt(out.sent_6dec);
      if (moved === 0n) {
        toast("Nothing to send — Compass account on Arc is empty.");
      } else {
        toast.success(`Sent ${formatUsdc(moved)} USDC to your wallet`);
      }
      void refresh();
      window.setTimeout(() => void refresh(), 2000);
      window.setTimeout(() => void refresh(), 5000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Send failed.";
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
        aria-label="Withdraw to your wallet"
        className={clsx(
          "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70]",
          "w-[540px] max-w-[92vw] rounded-[20px] border border-line-2",
          "bg-gradient-to-b from-[#0E1A33] to-arc-deep p-6 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)]",
        )}
      >
        <header className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4 mb-1">
              Withdraw
            </div>
            <h2 className="font-display text-[20px] font-semibold text-silver-1 m-0 leading-[1.2]">
              Send USDC to your wallet
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
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round]"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="mb-3 rounded-[14px] border border-line-2 bg-black/30 p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
              <img
                src="/icons/arc.svg"
                alt=""
                aria-hidden
                className="w-4 h-4"
              />
              Compass account on Arc
            </div>
            <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
              source
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-[10px] text-silver-4 truncate max-w-[280px]">
              {smartAccount
                ? `${smartAccount.slice(0, 10)}…${smartAccount.slice(-8)}`
                : "—"}
            </div>
            <span
              className={clsx(
                "font-mono [font-feature-settings:'tnum'] text-[16px] font-semibold",
                nothingToSend ? "text-silver-4" : "text-silver-1",
              )}
            >
              {formatUsdc(arcIdle)} USDC
            </span>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-center text-silver-3">
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5 fill-none stroke-current stroke-[1.6]"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
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
              Your wallet
            </div>
            <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-silver-4">
              destination
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-[10px] text-silver-4 truncate max-w-[280px]">
              {eoa ? `${eoa.slice(0, 10)}…${eoa.slice(-8)}` : "—"}
            </div>
            <span className="font-mono [font-feature-settings:'tnum'] text-[16px] font-semibold text-mint">
              + {formatUsdc(arcIdle)} USDC
            </span>
          </div>
        </div>

        {result ? (
          <ResultPanel result={result} />
        ) : (
          <>
            <div className="mb-4 text-[12.5px] text-silver-3 leading-[1.55]">
              Compass forwards the full Arc balance to your wallet. To pull
              out an AAVE position too, run <b className="text-silver-1">
                Unstake
              </b>{" "}
              first, then come back here.
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
                onClick={onSend}
                disabled={submitting || nothingToSend}
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
                  ? "Withdrawing…"
                  : nothingToSend
                    ? "Nothing on Arc"
                    : "Withdraw to wallet"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ResultPanel({ result }: { result: SendToWalletResponse }) {
  const moved = BigInt(result.sent_6dec);
  const isEmpty = moved === 0n;
  const url = result.tx_hash ? txExplorerUrl("arc", result.tx_hash) : null;
  return (
    <div
      className={clsx(
        "rounded-[14px] border p-4 flex flex-col gap-2",
        isEmpty
          ? "border-line-2 bg-black/20"
          : "border-mint/[0.3] bg-mint/[0.06]",
      )}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-silver-4">
          {isEmpty ? "Nothing moved" : "Landed in your wallet"}
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
      {result.tx_hash && (
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-silver-3">Transaction</span>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-silver-2 hover:text-silver-1 underline decoration-line-2 underline-offset-2"
            >
              {result.tx_hash.slice(0, 10)}… ↗
            </a>
          ) : (
            <span className="font-mono text-[11px] text-silver-3">
              {result.tx_hash.slice(0, 10)}…
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function safeParse6dec(raw: string | undefined): bigint {
  if (!raw) return 0n;
  try {
    return BigInt(raw);
  } catch {
    return 0n;
  }
}
